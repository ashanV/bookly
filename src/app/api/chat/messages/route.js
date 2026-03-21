import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/app/models/ChatMessage";
import Conversation from "@/app/models/Conversation";
import User from "@/app/models/User";
import Business from "@/app/models/Business";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// GET - Get messages from conversation
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!conversationId) {
      return NextResponse.json({ error: "Brak conversationId" }, { status: 400 });
    }

    const role = searchParams.get('role'); // 'admin' or 'user'
    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;

    // Check permissions
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Konwersacja nie znaleziona" }, { status: 404 });
    }

    if (role === 'user') {
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (conversation.userId && conversation.userId !== decoded.id) {
            return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
          }
        } catch (error) {
          // Anonymous user - check if it's their conversation (without userId)
          if (conversation.userId) {
            return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
          }
        }
      } else if (conversation.userId) {
        return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
      }
    }

    const query = { conversationId };

    // Hide internal notes for users
    if (role !== 'admin') {
      query.type = { $ne: 'note' };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Auto-assign if admin opens unassigned conversation
    if (role === 'admin' && !conversation.supportId && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);
        if (adminUser) {
          const name = adminUser.name || `${adminUser.firstName} ${adminUser.lastName}`;
          await Conversation.findByIdAndUpdate(conversationId, {
            supportId: adminUser._id,
            supportName: name,
            status: conversation.status === 'open' ? 'in_progress' : conversation.status
          });

          // Trigger Pusher
          try {
            const { pusherServer } = await import("@/lib/pusher");
            await pusherServer.trigger("admin-support", "conversation-updated", {
              id: conversationId,
              supportId: adminUser._id,
              supportName: name,
              status: conversation.status === 'open' ? 'in_progress' : conversation.status
            });
            await pusherServer.trigger(`chat-${conversationId}`, "conversation-updated", {
              id: conversationId,
              supportId: adminUser._id,
              supportName: name,
              status: conversation.status === 'open' ? 'in_progress' : conversation.status
            });
          } catch (pErr) { }
        }
      } catch (err) { }
    }

    return NextResponse.json({
      messages: messages.reverse() // Reverse to show oldest first
    }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania wiadomości:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

// POST - Send message
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      conversationId,
      message,
      senderName,
      senderEmail,
      type = 'message',
      fileUrl = null,
      fileName = null,
      fileSize = null,
      gifUrl = null
    } = body;

    // Validation: conversationId and content OR media required
    if (!conversationId || (!message && !fileUrl && !gifUrl)) {
      return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
    }

    const role = body.role || 'user'; // 'admin' or 'user'

    // Priority for adminToken if role is admin
    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;

    let senderId = 'anonymous';
    let senderType = 'anonymous';
    let finalSenderName = senderName || 'Użytkownik nie zalogowany';
    let finalSenderEmail = senderEmail || null;

    // Check authorization and set sender data
    if (role === 'admin') {
      if (!token) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
          return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
        }
        senderId = 'support';
        senderType = 'support';

        // Try to get admin name from database
        const adminUser = await User.findById(decoded.id);
        finalSenderName = adminUser ? (adminUser.name || `${adminUser.firstName} ${adminUser.lastName}`) : (decoded.name || 'Support');
        finalSenderEmail = decoded.email || (adminUser?.email);
      } catch (error) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
      }
    } else {
      // User
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          senderId = decoded.id;
          senderType = decoded.role === 'client' ? 'client' : decoded.role === 'business' ? 'business' : 'user';

          // Get data from database
          let dbUser = null;
          if (senderType === 'business') {
            dbUser = await Business.findById(senderId);
          } else {
            dbUser = await User.findById(senderId);
          }

          if (dbUser) {
            finalSenderName = dbUser.name || (dbUser.firstName && dbUser.lastName ? `${dbUser.firstName} ${dbUser.lastName}` : dbUser.firstName || dbUser.lastName || finalSenderName);
            finalSenderEmail = dbUser.email || finalSenderEmail;
          }
        } catch (error) {
          // Anonymous user
        }
      }
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Konwersacja nie znaleziona" }, { status: 404 });
    }

    // Create message
    const chatMessage = new ChatMessage({
      conversationId,
      senderId,
      senderType,
      senderName: finalSenderName,
      senderEmail: finalSenderEmail,
      message: message || '',
      type,
      fileUrl,
      fileName,
      fileSize,
      gifUrl,
      read: role === 'admin' ? false : true // Admin does not automatically read his messages
    });

    await chatMessage.save();

    // Update conversation
    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();
    conversation.lastMessageBy = senderId;

    if (role === 'admin') {
      conversation.status = conversation.status === 'open' ? 'in_progress' : conversation.status;
      if (!conversation.supportId) {
        // Assign admin to conversation
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          conversation.supportId = decoded.id;
          conversation.supportName = finalSenderName;

          // Trigger Pusher immediately for assignment
          try {
            const { pusherServer } = await import("@/lib/pusher");
            await pusherServer.trigger("admin-support", "conversation-updated", {
              id: conversationId,
              supportId: conversation.supportId,
              supportName: conversation.supportName,
              status: conversation.status
            });
          } catch (pErr) { }
        } catch (error) { }
      }
    } else {
      conversation.unreadCount += 1;
    }

    await conversation.save();

    try {
      const { pusherServer } = await import("@/lib/pusher");

      // If it's a note, send only to admin channel
      if (type === 'note') {
        await pusherServer.trigger(`admin-chat-${conversationId}`, "new-message", {
          id: chatMessage._id.toString(),
          ...chatMessage.toObject()
        });
      } else {
        // Normal message - send to public chat channel
        await pusherServer.trigger(`chat-${conversationId}`, "new-message", {
          id: chatMessage._id.toString(),
          ...chatMessage.toObject()
        });
      }

      // Notify admin list (update counter/status)
      await pusherServer.trigger("admin-support", "message-received", {
        conversationId,
        lastMessageAt: conversation.lastMessageAt,
        lastMessageBy: senderId,
        status: conversation.status,
        unreadCount: conversation.unreadCount
      });
    } catch (error) {
      console.error("Błąd triggera Pusher:", error);
    }

    return NextResponse.json({
      success: true,
      message: {
        id: chatMessage._id.toString(),
        ...chatMessage.toObject()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Błąd wysyłania wiadomości:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


import { connectDB } from "@/lib/mongodb";
import Conversation from "@/app/models/Conversation";
import ChatMessage from "@/app/models/ChatMessage";
import jwt from "jsonwebtoken";
import User from "@/app/models/User";
import Business from "@/app/models/Business";
import { NextResponse } from "next/server";

// GET - Get list of conversations
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'admin' or 'user'
    const status = searchParams.get('status'); // 'open', 'closed', etc.

    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;

    let query = {};

    if (role === 'admin') {
      // Admin sees all conversations (including deleted) so the frontend can filter them
      if (status) {
        query.status = status;
      }
    } else if ((role === 'user' || role === 'business') && token) {
      // User/Business sees only their conversations
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) throw new Error('Invalid token payload');

        query.userId = decoded.id;

        // If it's a business, also filter by userType
        if (role === 'business') {
          query.userType = 'business';
        }

        if (status) {
          query.status = status;
        } else {
          // Don't show conversations deleted by admin
          query.status = { $ne: 'deleted' };
        }
      } catch (error) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
      }
    } else {
      // Anonymous user - no conversations or wrong role
      return NextResponse.json({ conversations: [] }, { status: 200 });
    }

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(role === 'admin' ? 200 : 50)
      .lean();

    // Get the number of unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await ChatMessage.countDocuments({
          conversationId: conv._id,
          read: false,
          senderType: { $ne: role === 'admin' ? 'support' : 'user' }
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania konwersacji:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

// POST - Create a new conversation
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { subject, category, userName, userEmail, message, userId, userType, messageType, fileUrl, fileName, fileSize } = body;
    const role = body.role || 'user';

    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;
    let finalUserId = userId;
    let finalUserType = userType || 'anonymous';
    let finalUserName = userName || 'Użytkownik nie zalogowany';
    let finalUserEmail = userEmail || null;
    let finalUserAvatar = null;

    // If the user is logged in, use data from the database
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        finalUserId = decoded.id;
        finalUserType = decoded.role === 'client' ? 'client' : decoded.role === 'business' ? 'business' : 'user';

        // Get data from database because the token may not contain it
        let dbUser = null;
        if (finalUserType === 'business') {
          dbUser = await Business.findById(finalUserId);
        } else {
          dbUser = await User.findById(finalUserId);
        }

        if (dbUser) {
          if (finalUserType === 'business') {
            finalUserName = dbUser.companyName || dbUser.name || finalUserName;
            finalUserAvatar = dbUser.profileImage || null;
          } else {
            finalUserName = dbUser.name || (dbUser.firstName && dbUser.lastName ? `${dbUser.firstName} ${dbUser.lastName}` : finalUserName);
            finalUserAvatar = dbUser.profileImage || null; // Assuming User model has profileImage too, or avatar
          }
          finalUserEmail = dbUser.email || finalUserEmail;
        }
      } catch (error) {
        // Invalid token, continue as anonymous
      }
    }

    // Create conversation
    const conversation = new Conversation({
      userId: finalUserId,
      userType: finalUserType,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userAvatar: finalUserAvatar,
      subject: subject || 'Zgłoszenie',
      category: category || 'other',
      status: 'open',
      priority: category === 'blocked' ? 'high' : 'medium',
      messageCount: 0,
      unreadCount: 0
    });

    await conversation.save();

    // Create the first message
    if (message || fileUrl) {
      const firstMessage = new ChatMessage({
        conversationId: conversation._id,
        senderId: finalUserId || 'anonymous',
        senderType: finalUserType,
        senderName: finalUserName,
        senderEmail: finalUserEmail,
        message: message || '',
        type: messageType || 'message',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: fileSize,
        read: false
      });

      await firstMessage.save();

      // Update conversation statistics
      conversation.messageCount = 1;
      conversation.lastMessageAt = new Date();
      conversation.lastMessageBy = finalUserId || 'anonymous';
      await conversation.save();

      // Trigger Pusher for Admin List
      try {
        const { pusherServer } = await import("@/lib/pusher");
        await pusherServer.trigger("admin-support", "new-conversation", {
          conversation: {
            ...conversation.toObject(),
            unreadCount: 1
          }
        });
      } catch (err) {
        console.error("Błąd triggera Pusher (Admin List):", err);
      }
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        ...conversation.toObject()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Błąd tworzenia konwersacji:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


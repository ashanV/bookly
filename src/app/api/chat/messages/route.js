import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/app/models/ChatMessage";
import Conversation from "@/app/models/Conversation";
import User from "@/app/models/User";
import Business from "@/app/models/Business";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// GET - Pobierz wiadomości z konwersacji
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

    const role = searchParams.get('role'); // 'admin' lub 'user'
    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;

    // Sprawdź uprawnienia
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
          // Anonimowy użytkownik - sprawdź czy to jego konwersacja (bez userId)
          if (conversation.userId) {
            return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
          }
        }
      } else if (conversation.userId) {
        return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
      }
    }

    const query = { conversationId };

    // Ukryj notatki wewnętrzne dla użytkowników
    if (role !== 'admin') {
      query.type = { $ne: 'note' };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Auto-przypisanie jeśli admin otwiera nieprzypisaną konwersację
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
      messages: messages.reverse() // Odwróć, aby najstarsze były pierwsze
    }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania wiadomości:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

// POST - Wyślij wiadomość
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

    // Walidacja: wymagane conversationId oraz treść LUB multimedia
    if (!conversationId || (!message && !fileUrl && !gifUrl)) {
      return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
    }

    const role = body.role || 'user'; // 'admin' lub 'user'

    // Priorytet dla adminToken jeśli rola to admin
    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;

    let senderId = 'anonymous';
    let senderType = 'anonymous';
    let finalSenderName = senderName || 'Użytkownik nie zalogowany';
    let finalSenderEmail = senderEmail || null;

    // Sprawdź autoryzację i ustaw dane nadawcy
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

        // Spróbuj pobrać imię admina z bazy
        const adminUser = await User.findById(decoded.id);
        finalSenderName = adminUser ? (adminUser.name || `${adminUser.firstName} ${adminUser.lastName}`) : (decoded.name || 'Support');
        finalSenderEmail = decoded.email || (adminUser?.email);
      } catch (error) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
      }
    } else {
      // Użytkownik
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          senderId = decoded.id;
          senderType = decoded.role === 'client' ? 'client' : decoded.role === 'business' ? 'business' : 'user';

          // Pobierz dane z bazy
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
          // Anonimowy użytkownik
        }
      }
    }

    // Sprawdź czy konwersacja istnieje
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Konwersacja nie znaleziona" }, { status: 404 });
    }

    // Utwórz wiadomość
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
      read: role === 'admin' ? false : true // Admin nie czyta automatycznie swoich wiadomości
    });

    await chatMessage.save();

    // Zaktualizuj konwersację
    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();
    conversation.lastMessageBy = senderId;

    if (role === 'admin') {
      conversation.status = conversation.status === 'open' ? 'in_progress' : conversation.status;
      if (!conversation.supportId) {
        // Przypisz admina do konwersacji
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

      // Jeśli to notatka, wyślij tylko na kanał admina
      if (type === 'note') {
        await pusherServer.trigger(`admin-chat-${conversationId}`, "new-message", {
          id: chatMessage._id.toString(),
          ...chatMessage.toObject()
        });
      } else {
        // Normalna wiadomość - wyślij na publiczny kanał czatu
        await pusherServer.trigger(`chat-${conversationId}`, "new-message", {
          id: chatMessage._id.toString(),
          ...chatMessage.toObject()
        });
      }

      // Powiadom listę admina (update licznika/statusu)
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


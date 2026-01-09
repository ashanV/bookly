import { connectDB } from "@/lib/mongodb";
import Conversation from "@/app/models/Conversation";
import ChatMessage from "@/app/models/ChatMessage";
import jwt from "jsonwebtoken";
import User from "@/app/models/User";
import Business from "@/app/models/Business";
import { NextResponse } from "next/server";

// GET - Pobierz listę konwersacji
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'admin' lub 'user'
    const status = searchParams.get('status'); // 'open', 'closed', etc.

    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;

    let query = {};

    if (role === 'admin') {
      // Admin widzi wszystkie konwersacje (również deleted), aby frontend mógł je filtrować
      if (status) {
        query.status = status;
      }
    } else if (role === 'user' && token) {
      // Użytkownik widzi tylko swoje konwersacje
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        query.userId = decoded.id;
        if (status) {
          query.status = status;
        } else {
          // Użytkownik nigdy nie widzi usuniętych przez admina (kosza)
          query.status = { $ne: 'deleted' };
        }
      } catch (error) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
      }
    } else {
      // Anonimowy użytkownik - brak konwersacji
      return NextResponse.json({ conversations: [] }, { status: 200 });
    }

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(role === 'admin' ? 200 : 50)
      .lean();

    // Pobierz liczbę nieprzeczytanych wiadomości dla każdej konwersacji
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

// POST - Utwórz nową konwersację
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { subject, category, userName, userEmail, message, userId, userType } = body;
    const role = body.role || 'user';

    const token = role === 'admin'
      ? req.cookies.get('adminToken')?.value
      : req.cookies.get('token')?.value;
    let finalUserId = userId;
    let finalUserType = userType || 'anonymous';
    let finalUserName = userName || 'Użytkownik nie zalogowany';
    let finalUserEmail = userEmail || null;

    // Jeśli użytkownik jest zalogowany, użyj danych z bazy danych
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        finalUserId = decoded.id;
        finalUserType = decoded.role === 'client' ? 'client' : decoded.role === 'business' ? 'business' : 'user';

        // Pobierz dane z bazy, bo token może ich nie zawierać
        let dbUser = null;
        if (finalUserType === 'business') {
          dbUser = await Business.findById(finalUserId);
        } else {
          dbUser = await User.findById(finalUserId);
        }

        if (dbUser) {
          finalUserName = dbUser.name || (dbUser.firstName && dbUser.lastName ? `${dbUser.firstName} ${dbUser.lastName}` : dbUser.firstName || dbUser.lastName || finalUserName);
          finalUserEmail = dbUser.email || finalUserEmail;
        }
      } catch (error) {
        // Token nieprawidłowy, kontynuuj jako anonimowy
      }
    }

    // Utwórz konwersację
    const conversation = new Conversation({
      userId: finalUserId,
      userType: finalUserType,
      userName: finalUserName,
      userEmail: finalUserEmail,
      subject: subject || 'Zgłoszenie',
      category: category || 'other',
      status: 'open',
      priority: 'medium',
      messageCount: 0,
      unreadCount: 0
    });

    await conversation.save();

    // Utwórz pierwszą wiadomość
    if (message) {
      const firstMessage = new ChatMessage({
        conversationId: conversation._id,
        senderId: finalUserId || 'anonymous',
        senderType: finalUserType,
        senderName: finalUserName,
        senderEmail: finalUserEmail,
        message: message,
        type: 'message',
        read: false
      });

      await firstMessage.save();

      // Zaktualizuj statystyki konwersacji
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


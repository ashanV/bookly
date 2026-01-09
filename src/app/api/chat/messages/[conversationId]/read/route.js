import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/app/models/ChatMessage";
import Conversation from "@/app/models/Conversation";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// POST - Oznacz wiadomości jako przeczytane
export async function POST(req, { params }) {
  try {
    await connectDB();

    const { conversationId } = await params;
    const body = await req.json();
    const role = body.role || 'user';
    const token = role === 'admin'
      ? (req.cookies.get('adminToken')?.value || req.cookies.get('token')?.value)
      : (req.cookies.get('token')?.value || req.cookies.get('adminToken')?.value);

    if (!token && role !== 'anonymous') {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Sprawdź uprawnienia
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Konwersacja nie znaleziona" }, { status: 404 });
    }

    if (role === 'user') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (conversation.userId && conversation.userId !== decoded.id) {
          return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
        }
      } catch (error) {
        if (conversation.userId) {
          return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
        }
      }
    } else if (role === 'admin') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
          return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
        }
      } catch (error) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
      }
    }

    // Oznacz wiadomości jako przeczytane
    const senderTypeFilter = role === 'admin' ? { $ne: 'support' } : { $ne: 'user' };

    await ChatMessage.updateMany(
      {
        conversationId,
        read: false,
        senderType: senderTypeFilter
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    // Zaktualizuj licznik nieprzeczytanych
    if (role === 'admin') {
      conversation.unreadCount = 0;
    } else {
      const unreadCount = await ChatMessage.countDocuments({
        conversationId,
        read: false,
        senderType: { $ne: 'user' }
      });
      conversation.unreadCount = unreadCount;
    }

    await conversation.save();

    // Trigger Pusher event
    try {
      const { pusherServer } = await import("@/lib/pusher");
      await pusherServer.trigger(`chat-${conversationId}`, "message-read", {
        conversationId,
        role,
        readAt: new Date()
      });
    } catch (error) {
      console.error("Błąd triggera Pusher (read):", error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Błąd oznaczania wiadomości:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/app/models/ChatMessage";
import Conversation from "@/app/models/Conversation";

// POST - Emit event (Pusher)
export async function POST(req) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (!event || !data || !data.conversationId) {
      return NextResponse.json({ error: "Brak danych zdarzenia" }, { status: 400 });
    }

    const { pusherServer } = await import("@/lib/pusher");

    // Rozgłoś zdarzenie przez Pusher
    await pusherServer.trigger(`chat-${data.conversationId}`, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd eventu:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

// GET - Sprawdź nowe eventy (polling)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event');
    const conversationId = searchParams.get('conversationId');
    const lastMessageId = searchParams.get('lastMessageId');

    if (event === 'new-message' && conversationId) {
      // Sprawdź czy są nowe wiadomości
      const query = { conversationId };
      if (lastMessageId) {
        query._id = { $gt: lastMessageId };
      }

      const newMessages = await ChatMessage.find(query)
        .sort({ createdAt: 1 })
        .limit(10)
        .lean();

      if (newMessages.length > 0) {
        return NextResponse.json({
          hasNewEvents: true,
          messages: newMessages
        });
      }
    }

    return NextResponse.json({ hasNewEvents: false });
  } catch (error) {
    console.error("Błąd pobierania eventów:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


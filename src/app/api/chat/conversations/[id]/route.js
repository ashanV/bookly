import { connectDB } from "@/lib/mongodb";
import Conversation from "@/app/models/Conversation";
import ChatMessage from "@/app/models/ChatMessage";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// PATCH - Aktualizuj konwersację (np. status)
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        await connectDB();
        const body = await req.json();
        const { status } = body;

        const token = req.cookies.get('adminToken')?.value || req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                // Tylko admin może zamykać konwersacje
                return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
            }
        } catch (error) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return NextResponse.json({ error: "Konwersacja nie znaleziona" }, { status: 404 });
        }

        if (status) {
            const updateData = { status };
            if (status === 'closed') {
                updateData.closedAt = new Date();
            } else if (status !== 'closed') {
                updateData.closedAt = null;
            }

            // Czyścimy deletedAt jeśli przywracamy
            if (conversation.status === 'deleted' && status !== 'deleted') {
                updateData.deletedAt = null;
            }

            await Conversation.findByIdAndUpdate(id, updateData);
        }

        // Obsługa przypisywania supportu
        if (body.supportId !== undefined) {
            await Conversation.findByIdAndUpdate(id, {
                supportId: body.supportId,
                supportName: body.supportName
            });
        }

        // Trigger Pusher events
        try {
            const { pusherServer } = await import("@/lib/pusher");
            // Powiadom konkretny chat
            await pusherServer.trigger(`chat-${id}`, "conversation-updated", {
                id,
                status: status
            });
            // Powiadom listę admina
            await pusherServer.trigger("admin-support", "conversation-updated", {
                id,
                status: status,
                supportId: body.supportId,
                supportName: body.supportName
            });
        } catch (error) {
            console.error("Błąd triggera Pusher:", error);
        }

        return NextResponse.json({ success: true, conversation }, { status: 200 });
    } catch (error) {
        console.error("Błąd aktualizacji konwersacji:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// DELETE - Usuń konwersację
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        await connectDB();

        const token = req.cookies.get('adminToken')?.value || req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
            }
        } catch (error) {
            return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return NextResponse.json({ error: "Konwersacja nie znaleziona" }, { status: 404 });
        }

        if (conversation.status === 'deleted') {
            // Jeśli już jest w koszu - usuń trwale
            await ChatMessage.deleteMany({ conversationId: id });
            await Conversation.findByIdAndDelete(id);

            // Powiadom listę admina o trwałym usunięciu
            try {
                const { pusherServer } = await import("@/lib/pusher");
                await pusherServer.trigger("admin-support", "conversation-deleted", { id });
            } catch (err) { }

            return NextResponse.json({ success: true, message: "Konwersacja usunięta trwale" }, { status: 200 });
        } else {
            // Przenieś do kosza
            await Conversation.findByIdAndUpdate(id, {
                status: 'deleted',
                deletedAt: new Date()
            });

            // Powiadom Pushera o zmianie statusu na 'deleted'
            try {
                const { pusherServer } = await import("@/lib/pusher");
                await pusherServer.trigger(`chat-${id}`, "conversation-updated", {
                    id,
                    status: 'deleted'
                });
                await pusherServer.trigger("admin-support", "conversation-updated", {
                    id,
                    status: 'deleted'
                });
            } catch (err) { }

            return NextResponse.json({ success: true, message: "Konwersacja przeniesiona do kosza" }, { status: 200 });
        }
    } catch (error) {
        console.error("Błąd usuwania konwersacji:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

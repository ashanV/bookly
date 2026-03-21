import { connectDB } from "@/lib/mongodb";
import Conversation from "@/app/models/Conversation";
import ChatMessage from "@/app/models/ChatMessage";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// PATCH - Update conversation (e.g. status)
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
                // Only admin can close conversations
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

            // Clear deletedAt if restoring
            if (conversation.status === 'deleted' && status !== 'deleted') {
                updateData.deletedAt = null;
            }

            await Conversation.findByIdAndUpdate(id, updateData);
        }

        // Handle support assignment
        if (body.supportId !== undefined) {
            await Conversation.findByIdAndUpdate(id, {
                supportId: body.supportId,
                supportName: body.supportName
            });
        }

        // Trigger Pusher events
        try {
            const { pusherServer } = await import("@/lib/pusher");
            // Notify specific chat
            await pusherServer.trigger(`chat-${id}`, "conversation-updated", {
                id,
                status: status
            });
            // Notify admin list
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

// DELETE - Delete conversation
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
            // If already in trash - delete permanently
            await ChatMessage.deleteMany({ conversationId: id });
            await Conversation.findByIdAndDelete(id);

            // Notify admin list about permanent deletion
            try {
                const { pusherServer } = await import("@/lib/pusher");
                await pusherServer.trigger("admin-support", "conversation-deleted", { id });
            } catch (err) { }

            return NextResponse.json({ success: true, message: "Konwersacja usunięta trwale" }, { status: 200 });
        } else {
            // Move to trash
            await Conversation.findByIdAndUpdate(id, {
                status: 'deleted',
                deletedAt: new Date()
            });

            // Notify Pusher about status change to 'deleted'
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

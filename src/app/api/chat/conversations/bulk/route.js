import { connectDB } from "@/lib/mongodb";
import Conversation from "@/app/models/Conversation";
import ChatMessage from "@/app/models/ChatMessage";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { action, ids, updateData } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Brak ID do przetworzenia" }, { status: 400 });
        }

        // Autoryzacja
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

        let result;
        const { pusherServer } = await import("@/lib/pusher");

        switch (action) {
            case 'update_status':
                const { status } = updateData;
                const updateQuery = { status };

                if (status === 'closed') {
                    updateQuery.closedAt = new Date();
                } else if (status !== 'closed') {
                    updateQuery.closedAt = null;
                }

                if (status !== 'deleted') {
                    updateQuery.deletedAt = null;
                }

                result = await Conversation.updateMany(
                    { _id: { $in: ids } },
                    { $set: updateQuery }
                );

                // Notify Pusher logic here (simplified loop for now or broadcast to list)
                // For bulk, updating the list channel is most important.
                // We'd ideally loop to update individual chat channels too if needed, but for now let's update admin list.
                // To be robust, let's iterate to notify properly if count is low, or just generic update.
                for (const id of ids) {
                    await pusherServer.trigger("admin-support", "conversation-updated", { id, status });
                    await pusherServer.trigger(`chat-${id}`, "conversation-updated", { id, status });
                }
                break;

            case 'move_to_trash':
                result = await Conversation.updateMany(
                    { _id: { $in: ids } },
                    {
                        $set: {
                            status: 'deleted',
                            deletedAt: new Date()
                        }
                    }
                );

                for (const id of ids) {
                    await pusherServer.trigger("admin-support", "conversation-updated", { id, status: 'deleted' });
                    await pusherServer.trigger(`chat-${id}`, "conversation-updated", { id, status: 'deleted' });
                }
                break;

            case 'delete_permanently':
                // DANGER: Usuwanie wiadomości
                await ChatMessage.deleteMany({ conversationId: { $in: ids } });
                result = await Conversation.deleteMany({ _id: { $in: ids } });

                for (const id of ids) {
                    await pusherServer.trigger("admin-support", "conversation-deleted", { id });
                }
                break;

            default:
                return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 });
        }

        return NextResponse.json({ success: true, count: ids.length });

    } catch (error) {
        console.error("Błąd operacji masowej:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

import { connectDB } from "@/lib/mongodb";
import Client from "../../../models/Client";
import { NextResponse } from "next/server";

// DELETE - Delete a client by ID
export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Brak ID klienta" },
                { status: 400 }
            );
        }

        await connectDB();

        const deletedClient = await Client.findByIdAndDelete(id);

        if (!deletedClient) {
            return NextResponse.json(
                { error: "Klient nie został znaleziony" },
                { status: 404 }
            );
        }

        // Invalidate cache for this business list
        if (deletedClient.businessId) {
            const { invalidateCache } = await import('@/lib/cache');
            await invalidateCache(`clients:list:businessId:${deletedClient.businessId}*`);
        }

        return NextResponse.json({
            message: "Klient został usunięty",
            id: id
        }, { status: 200 });
    } catch (error) {
        console.error("Błąd usuwania klienta:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

// GET - Get a single client by ID
export async function GET(req, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Brak ID klienta" },
                { status: 400 }
            );
        }

        await connectDB();

        const client = await Client.findById(id).lean();

        if (!client) {
            return NextResponse.json(
                { error: "Klient nie został znaleziony" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            client: {
                id: client._id.toString(),
                firstName: client.firstName,
                lastName: client.lastName,
                email: client.email || '',
                phone: client.phone ? `${client.phonePrefix || '+48'} ${client.phone}` : '',
                avatar: client.avatar,
                tags: client.tags || [],
                notes: client.notes || '',
                status: client.status || 'active',
                totalSpent: client.totalSpent || 0,
                visits: client.visits || 0,
                rating: client.rating || 0,
                pronouns: client.pronouns || '',
                birthDate: client.birthDate || '',
                birthYear: client.birthYear || '',
                createdAt: client.createdAt
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Błąd pobierania klienta:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

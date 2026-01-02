import { connectDB } from "@/lib/mongodb";
import Client from "../../models/Client";
import { NextResponse } from "next/server";

// GET - List clients for a business
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const tag = searchParams.get('tag') || '';

        if (!businessId) {
            return NextResponse.json(
                { error: "Brak businessId" },
                { status: 400 }
            );
        }

        await connectDB();

        // Build query
        const query = { businessId };

        // Status filter
        if (status !== 'all') {
            query.status = status;
        }

        // Tag filter
        if (tag) {
            query.tags = tag;
        }

        // Search filter
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const clients = await Client.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Transform for frontend
        const transformedClients = clients.map(client => ({
            id: client._id.toString(),
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email || '',
            phone: client.phone ? `${client.phonePrefix || '+48'} ${client.phone}` : '',
            avatar: client.avatar || `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase(),
            tags: client.tags || [],
            lastVisit: client.lastVisit ? new Date(client.lastVisit).toISOString().split('T')[0] : null,
            totalSpent: client.totalSpent || 0,
            visits: client.visits || 0,
            rating: client.rating || 0,
            notes: client.notes || '',
            status: client.status || 'active',
            createdAt: client.createdAt
        }));

        return NextResponse.json({ clients: transformedClients }, { status: 200 });
    } catch (error) {
        console.error("Błąd pobierania klientów:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

// POST - Create new client
export async function POST(req) {
    try {
        const body = await req.json();

        const {
            businessId,
            firstName,
            lastName,
            email,
            phone,
            phonePrefix,
            birthDate,
            birthYear,
            gender,
            pronouns,
            referralSource,
            referredBy,
            preferredLanguage,
            occupation,
            country,
            additionalEmail,
            additionalPhone,
            additionalPhonePrefix,
            addresses,
            emergencyContacts,
            consent,
            tags,
            notes
        } = body;

        // Validate required fields
        if (!businessId) {
            return NextResponse.json(
                { error: "Brak businessId" },
                { status: 400 }
            );
        }

        if (!firstName || !lastName) {
            return NextResponse.json(
                { error: "Imię i nazwisko są wymagane" },
                { status: 400 }
            );
        }

        await connectDB();

        // Create new client
        const client = new Client({
            businessId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email?.trim() || '',
            phone: phone?.trim() || '',
            phonePrefix: phonePrefix || '+48',
            birthDate: birthDate || '',
            birthYear: birthYear || '',
            gender: gender || '',
            pronouns: pronouns || '',
            referralSource: referralSource || 'Bez rezerwacji',
            referredBy: referredBy || '',
            preferredLanguage: preferredLanguage || '',
            occupation: occupation || '',
            country: country || '',
            additionalEmail: additionalEmail?.trim() || '',
            additionalPhone: additionalPhone?.trim() || '',
            additionalPhonePrefix: additionalPhonePrefix || '+48',
            addresses: addresses || [],
            emergencyContacts: emergencyContacts || [],
            consent: consent || {
                notifications: { email: true, sms: true, whatsapp: true },
                marketing: { email: false, sms: false, whatsapp: false }
            },
            tags: tags || [],
            notes: notes || '',
            status: 'active'
        });

        await client.save();

        return NextResponse.json({
            message: "Klient został dodany",
            client: {
                id: client._id.toString(),
                firstName: client.firstName,
                lastName: client.lastName,
                email: client.email,
                avatar: client.avatar
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Błąd dodawania klienta:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

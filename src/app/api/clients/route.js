import { connectDB } from "@/lib/mongodb";
import Client from "../../models/Client";
import { NextResponse } from "next/server";
import { createClientSchema, validateInput } from "@/lib/validations";

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

        const { getCache, setCache, CACHE_TTL, generateCacheKey } = await import('@/lib/cache');

        // Only cache if no search filters are applied (basic list)
        // or we could cache specific queries, but filters are dynamic.
        // Let's cache the full list for a business if no filters, or specific filters.
        // To be safe and effective: Cache based on full query params.
        const cacheKey = generateCacheKey('clients:list', {
            businessId, search, status, tag
        });

        const cachedClients = await getCache(cacheKey);
        if (cachedClients) {
            return NextResponse.json({ clients: cachedClients }, { status: 200 });
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
            pronouns: client.pronouns || '',
            birthDate: client.birthDate || '',
            birthYear: client.birthYear || '',
            createdAt: client.createdAt
        }));

        // Cache for 5 minutes
        await setCache(cacheKey, transformedClients, CACHE_TTL.BUSINESS_LIST);

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

        // Walidacja przez Zod
        const validation = validateInput(createClientSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

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
        } = validation.data;

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

        // Log to AdminLog
        try {
            // Dynamic import
            const AdminLog = require("@/app/models/AdminLog").default;
            const Business = require("@/app/models/Business").default;

            // Fetch business to get email for log
            const business = await Business.findById(businessId).select('email companyName');

            await AdminLog.create({
                userId: businessId, // Business is the 'user' here
                userEmail: business ? business.email : 'unknown',
                userRole: 'business',
                action: 'client_created',
                targetType: 'client',
                targetId: client._id,
                details: {
                    clientName: `${client.firstName} ${client.lastName}`,
                    businessName: business ? business.companyName : 'Unknown'
                },
                ip: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown'
            });
        } catch (logError) {
            console.error("Failed to create admin log for client creation:", logError);
        }

        // Invalidate cache for this business list
        const { invalidateCache } = await import('@/lib/cache');
        // Invalidate any list query related to this business
        await invalidateCache(`clients:list:businessId:${businessId}*`);

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

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemConfig from '@/app/models/SystemConfig';
import { getCache, setCache, invalidateCache, CACHE_TTL } from '@/lib/cache';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const PUBLIC_CACHE_KEY = 'system:config:public';

// Helper to check if user is admin
async function isAdmin(req) {
    try {
        const token = req.cookies.get('adminToken')?.value;
        if (!token) return false;

        if (!process.env.JWT_SECRET) return false;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded && decoded.role === 'admin';
    } catch (e) {
        return false;
    }
}

export async function GET(req) {
    try {
        await connectDB();

        // 1. Check if Admin
        const isUserAdmin = await isAdmin(req);

        // 2. If Admin, return FULL config
        if (isUserAdmin) {
            const config = await SystemConfig.getConfig();
            return NextResponse.json(config);
        }

        // 3. If Public, use Cache
        const cachedConfig = await getCache(PUBLIC_CACHE_KEY);
        if (cachedConfig) {
            return NextResponse.json(cachedConfig);
        }

        const config = await SystemConfig.getConfig();

        const responseData = {
            siteName: config.siteName,
            contactEmail: config.contactEmail,
            socialLinks: config.socialLinks,
            logoUrl: config.logoUrl,
            faviconUrl: config.faviconUrl,
            announcement: {
                enabled: config.announcementEnabled,
                text: config.announcementText,
                type: config.announcementType
            },
            maintenance: config.maintenanceMode
        };

        // Cache for 30 minutes
        await setCache(PUBLIC_CACHE_KEY, responseData, CACHE_TTL.LONG);

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Config Error:', error);
        return NextResponse.json(
            { error: 'Nie udało się pobrać konfiguracji' },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        // 1. Verify Authentication
        if (!await isAdmin(req)) {
            return NextResponse.json({ error: 'Brak uprawnień' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        // 2. Validate input (basic)
        // Mongoose validation will handle types, but we can check specific rules if needed.

        // 3. Update Config
        const updatedConfig = await SystemConfig.updateConfig(body);

        // 4. Invalidate Public Cache
        await invalidateCache(PUBLIC_CACHE_KEY);

        return NextResponse.json(updatedConfig);

    } catch (error) {
        console.error('Config Update Error:', error);
        return NextResponse.json(
            { error: error.message || 'Nie udało się zapisać konfiguracji' },
            { status: 500 }
        );
    }
}

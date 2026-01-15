import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemConfig from '@/app/models/SystemConfig';
import { getCache, setCache, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cacheKey = 'system:config:public';

        // Try to get from cache first
        const cachedConfig = await getCache(cacheKey);
        if (cachedConfig) {
            return NextResponse.json(cachedConfig);
        }

        await connectDB();
        const config = await SystemConfig.getConfig();

        const responseData = {
            announcement: {
                enabled: config.announcementEnabled,
                text: config.announcementText,
                type: config.announcementType
            },
            maintenance: config.maintenanceMode
        };

        // Cache for 30 minutes (LONG) since this changes rarely
        await setCache(cacheKey, responseData, CACHE_TTL.LONG);

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Public Config Error:', error);
        return NextResponse.json(
            { error: 'Nie udało się pobrać konfiguracji' },
            { status: 500 }
        );
    }
}

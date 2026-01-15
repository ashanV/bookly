import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemConfig from '@/app/models/SystemConfig';
import { getCache, setCache, invalidateCache, CACHE_TTL } from '@/lib/cache';

// GET - Fetch current feature flags
export async function GET() {
    try {
        const cacheKey = 'system:config:admin';

        // Try to get from cache first
        const cachedConfig = await getCache(cacheKey);
        if (cachedConfig) {
            return NextResponse.json(cachedConfig);
        }

        await connectDB();
        const config = await SystemConfig.getConfig();

        const responseData = {
            flags: {
                // Boolean flags
                maintenanceMode: config.maintenanceMode,
                paymentsEnabled: config.paymentsEnabled,
                bookingsEnabled: config.bookingsEnabled,
                registrationEnabled: config.registrationEnabled,
                chatEnabled: config.chatEnabled,
                // Text flags
                announcementEnabled: config.announcementEnabled,
                announcementText: config.announcementText,
                announcementType: config.announcementType,
                // Numeric flags
                maxBookingsEnabled: config.maxBookingsEnabled,
                maxBookingsPerDay: config.maxBookingsPerDay,
                sessionTimeoutMinutes: config.sessionTimeoutMinutes
            },
            updatedAt: config.updatedAt
        };

        // Cache for 30 minutes
        await setCache(cacheKey, responseData, CACHE_TTL.LONG);

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Feature Flags GET Error:', error);
        return NextResponse.json(
            { error: 'Nie udało się pobrać flag' },
            { status: 500 }
        );
    }
}

// PUT - Update feature flags
export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();

        // Validate and sanitize input
        const allowedFields = [
            'maintenanceMode', 'paymentsEnabled', 'bookingsEnabled',
            'registrationEnabled', 'chatEnabled', 'announcementText',
            'announcementType', 'maxBookingsPerDay', 'sessionTimeoutMinutes',
            'maxBookingsEnabled', 'announcementEnabled'
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'Brak danych do aktualizacji' },
                { status: 400 }
            );
        }

        const config = await SystemConfig.updateConfig(updates);

        // 1. Invalidate Cache (both public and admin)
        await invalidateCache('system:config:*');

        // 2. Trigger Pusher event
        try {
            const { pusherServer } = await import('@/lib/pusher');
            await pusherServer.trigger('system-updates', 'config-updated', {
                announcement: {
                    enabled: config.announcementEnabled,
                    text: config.announcementText,
                    type: config.announcementType
                },
                maintenance: config.maintenanceMode
            });
        } catch (error) {
            console.error('Pusher Trigger Error:', error);
        }

        return NextResponse.json({
            message: 'Flagi zaktualizowane',
            flags: {
                maintenanceMode: config.maintenanceMode,
                paymentsEnabled: config.paymentsEnabled,
                bookingsEnabled: config.bookingsEnabled,
                registrationEnabled: config.registrationEnabled,
                chatEnabled: config.chatEnabled,
                announcementEnabled: config.announcementEnabled,
                announcementText: config.announcementText,
                announcementType: config.announcementType,
                maxBookingsEnabled: config.maxBookingsEnabled,
                maxBookingsPerDay: config.maxBookingsPerDay,
                sessionTimeoutMinutes: config.sessionTimeoutMinutes
            },
            updatedAt: config.updatedAt
        });
    } catch (error) {
        console.error('Feature Flags PUT Error:', error);
        return NextResponse.json(
            { error: 'Nie udało się zaktualizować flag' },
            { status: 500 }
        );
    }
}

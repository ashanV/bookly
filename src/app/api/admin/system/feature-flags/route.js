import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemConfig from '@/app/models/SystemConfig';

// GET - Fetch current feature flags
export async function GET() {
    try {
        await connectDB();
        const config = await SystemConfig.getConfig();

        return NextResponse.json({
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
        });
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

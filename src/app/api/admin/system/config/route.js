import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SystemConfig from '@/app/models/SystemConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const config = await SystemConfig.getConfig();

        return NextResponse.json({
            announcement: {
                enabled: config.announcementEnabled,
                text: config.announcementText,
                type: config.announcementType
            },
            maintenance: config.maintenanceMode
        });
    } catch (error) {
        console.error('Public Config Error:', error);
        return NextResponse.json(
            { error: 'Nie udało się pobrać konfiguracji' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminLog from '@/app/models/AdminLog';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDB();

        const timelineActions = [
            'business_created',
            'business_deleted',
            'subscription_cancelled',
            'payment_success',
            'payment_failed'
        ];

        // Fetch logs with specific actions, sorted by newest first
        const timelineEvents = await AdminLog.find({
            action: { $in: timelineActions }
        })
            .sort({ timestamp: -1 })
            .limit(100) // Limit to last 100 events for now
            .lean();

        return NextResponse.json({
            success: true,
            data: timelineEvents
        });

    } catch (error) {
        console.error('Error fetching business timeline:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch timeline' },
            { status: 500 }
        );
    }
}

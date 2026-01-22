import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import Business from '@/app/models/Business';
import Reservation from '@/app/models/Reservation';
import Conversation from '@/app/models/Conversation';
import AdminLog from '@/app/models/AdminLog';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Execute queries in parallel
        const [
            usersCount,
            businessesCount,
            reservationsCount,
            openTicketsCount,
            recentActivity
        ] = await Promise.all([
            User.countDocuments({}),
            Business.countDocuments({}),
            Reservation.countDocuments({
                date: { $gte: startOfMonth, $lte: endOfMonth }
            }),
            Conversation.countDocuments({ status: 'open' }),
            AdminLog.find({})
                .sort({ timestamp: -1 })
                .limit(5)
                .lean()
        ]);

        return NextResponse.json({
            stats: {
                users: usersCount,
                businesses: businessesCount,
                reservations: reservationsCount,
                tickets: openTicketsCount
            },
            recentActivity
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}

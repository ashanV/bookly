
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/app/models/Reservation';

export async function GET(request) {
    try {
        await connectDB();

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Execute queries in parallel
        const [
            total,
            today,
            pending,
            confirmed,
            completed,
            cancelled,
            revenueData
        ] = await Promise.all([
            Reservation.countDocuments({}),
            Reservation.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } }),
            Reservation.countDocuments({ status: 'pending' }),
            Reservation.countDocuments({ status: 'confirmed' }),
            Reservation.countDocuments({ status: 'completed' }),
            Reservation.countDocuments({ status: 'cancelled' }),
            Reservation.aggregate([
                {
                    $match: {
                        status: 'completed',
                        date: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$price' }
                    }
                }
            ])
        ]);

        return NextResponse.json({
            total,
            today,
            pending,
            confirmed,
            completed,
            cancelled,
            revenueMonth: revenueData[0]?.totalRevenue || 0
        });

    } catch (error) {
        console.error('Error fetching reservation stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reservation stats' },
            { status: 500 }
        );
    }
}

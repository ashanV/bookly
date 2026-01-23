import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/app/models/Reservation';
import SystemConfig from '@/app/models/SystemConfig';
import Business from '@/app/models/Business';

export async function GET() {
    try {
        await connectDB();

        // 1. Get Commission Rate
        const config = await SystemConfig.getConfig();
        const commissionRate = config.commissionRate || 10;

        // 2. Find completed reservations without a payout
        const unsettledStats = await Reservation.aggregate([
            {
                $match: {
                    status: 'completed',
                    payoutId: null
                }
            },
            {
                $group: {
                    _id: '$businessId',
                    totalGMV: { $sum: '$price' },
                    reservationsCount: { $sum: 1 },
                    firstReservationDate: { $min: '$date' },
                    lastReservationDate: { $max: '$date' }
                }
            }
        ]);

        // 3. Populate Business Details
        const populatedStats = await Business.populate(unsettledStats, {
            path: '_id',
            select: 'companyName email phone'
        });

        // 4. Calculate Payout Amounts
        const result = populatedStats.map(stat => {
            const business = stat._id;
            if (!business) return null; // Skip if business deleted

            const commissionAmount = stat.totalGMV * (commissionRate / 100);
            const payoutAmount = stat.totalGMV - commissionAmount;

            return {
                businessId: business._id,
                companyName: business.companyName,
                email: business.email,
                totalGMV: stat.totalGMV,
                reservationsCount: stat.reservationsCount,
                periodStart: stat.firstReservationDate,
                periodEnd: stat.lastReservationDate,
                commissionAmount,
                payoutAmount
            };
        }).filter(Boolean); // Remove nulls

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching unsettled stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unsettled stats' },
            { status: 500 }
        );
    }
}

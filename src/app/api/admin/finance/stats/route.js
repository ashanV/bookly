import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/app/models/Reservation';
import SystemConfig from '@/app/models/SystemConfig';
import Business from '@/app/models/Business'; // Needed for population if used, though we might just use aggregate

export async function GET(request) {
    try {
        await connectDB();

        // 1. Get Commission Rate
        const config = await SystemConfig.getConfig();
        const commissionRate = config.commissionRate || 10; // Default to 10% if missing

        // 2. Aggregate Stats
        const statsAggregation = await Reservation.aggregate([
            {
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' }, // GMV
                    avgTicket: { $avg: '$price' },    // Average Basket
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = statsAggregation[0] || { totalRevenue: 0, avgTicket: 0, count: 0 };
        const totalRevenue = stats.totalRevenue;
        const platformRevenue = totalRevenue * (commissionRate / 100);
        const avgTicket = stats.avgTicket;

        // 3. Payment Methods Distribution
        const paymentStats = await Reservation.aggregate([
            {
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    amount: { $sum: '$price' }
                }
            }
        ]);

        // 4. Recent Completed Transactions (Simulating Payouts/Transactions log)
        const recentTransactions = await Reservation.find({ status: 'completed' })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('businessId', 'companyName') // Get business name
            .select('price paymentMethod updatedAt businessId');

        // Format transactions for frontend
        const formattedTransactions = recentTransactions.map(tx => ({
            id: tx._id,
            business: tx.businessId?.companyName || 'Nieznany biznes',
            amount: tx.price,
            type: 'reservation', // Just a label
            date: tx.updatedAt,
            method: tx.paymentMethod
        }));

        // 5. Chart Data
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30days';

        const now = new Date();
        const startDate = new Date();

        if (range === '12months') {
            startDate.setMonth(startDate.getMonth() - 11); // Current month + previous 11
            startDate.setDate(1); // Start from beginning of that month
        } else {
            startDate.setDate(startDate.getDate() - 29); // Current day + previous 29
        }

        const dailyRevenue = await Reservation.aggregate([
            {
                $match: {
                    status: 'completed',
                    updatedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: range === '12months'
                        ? { $dateToString: { format: "%Y-%m", date: "$updatedAt" } }
                        : { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    dailyGMV: { $sum: '$price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill missing intervals
        const chartData = [];

        if (range === '12months') {
            for (let i = 0; i < 12; i++) {
                const d = new Date(startDate);
                d.setMonth(d.getMonth() + i);
                const dateStr = d.toISOString().slice(0, 7); // YYYY-MM

                const monthData = dailyRevenue.find(item => item._id === dateStr);
                const gmv = monthData ? monthData.dailyGMV : 0;

                chartData.push({
                    date: dateStr,
                    gmv: gmv,
                    commission: gmv * (commissionRate / 100)
                });
            }
        } else {
            for (let i = 0; i < 30; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];

                const dayData = dailyRevenue.find(item => item._id === dateStr);
                const gmv = dayData ? dayData.dailyGMV : 0;

                chartData.push({
                    date: dateStr,
                    gmv: gmv,
                    commission: gmv * (commissionRate / 100)
                });
            }
        }

        return NextResponse.json({
            stats: {
                totalRevenue,
                platformRevenue,
                avgTicket,
                commissionRate
            },
            paymentMethods: paymentStats,
            recentTransactions: formattedTransactions,
            chartData
        });
    }

    catch (error) {
        console.error('Error fetching finance stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch finance statistics' },
            { status: 500 }
        );
    }
}

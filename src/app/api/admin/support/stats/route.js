import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Conversation from '@/app/models/Conversation';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        // 1. Auth Check (Admin only)
        const cookieStore = await cookies();
        const token = cookieStore.get('adminToken')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') throw new Error('Not admin');
        } catch (e) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Summary Stats
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const summary = await Conversation.aggregate([
            {
                $facet: {
                    totalOpen: [
                        { $match: { status: 'open' } },
                        { $count: 'count' }
                    ],
                    newToday: [
                        { $match: { createdAt: { $gte: startOfDay } } },
                        { $count: 'count' }
                    ],
                    unassigned: [
                        { $match: { status: 'open', supportId: null } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        // 2. Tickets Over Time (Last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const ticketsOverTime = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: fourteenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Category Distribution
        const categoryDistribution = await Conversation.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Format data for frontend
        const stats = {
            summary: {
                totalOpen: summary[0].totalOpen[0]?.count || 0,
                newToday: summary[0].newToday[0]?.count || 0,
                unassigned: summary[0].unassigned[0]?.count || 0
            },
            ticketsOverTime: ticketsOverTime.map(item => ({
                date: item._id,
                count: item.count
            })),
            categoryDistribution: categoryDistribution.map(item => ({
                name: item._id || 'other', // Handle potential nulls
                value: item.count
            }))
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching support stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

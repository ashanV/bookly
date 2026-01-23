import Conversation from '@/app/models/Conversation';
import redis from '@/lib/redis';
import { pusherServer } from '@/lib/pusher';
import { connectDB } from '@/lib/mongodb';

export const CACHE_KEY = 'admin:support:stats';

export async function getSupportStats() {
    // 1. Try Redis first
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
        // Redis returns parsed JSON object automatically if using Upstash REST client depending on method, 
        // but typically it returns the object/string. 
        // If stored as JSON string, we might need to parse, but Upstash SDK usually handles it if passed as object to set.
        // In previous step I stringified it. So here I suspect it comes back as string or object?
        // Let's assume it might be a string if I did JSON.stringify.
        // Actually Upstash redis `get` returns the value. If it was stringified, it returns string.
        try {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        } catch (e) {
            return cached;
        }
    }

    // 2. If miss, calculate
    return await updateSupportStats();
}

export async function updateSupportStats() {
    try {
        await connectDB();

        // --- CALCULATION LOGIC COPIED FROM OLD ROUTE (Optimized with indexes ideally) ---

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

        // Tickets Over Time (Last 14 days)
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

        // Category Distribution
        const categoryDistribution = await Conversation.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

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
                name: item._id || 'other',
                value: item.count
            }))
        };

        // 3. Save to Redis (TTL 1 hour just in case, but we update on events)
        await redis.set(CACHE_KEY, JSON.stringify(stats), { ex: 3600 });

        // 4. Push to Pusher
        await pusherServer.trigger('admin-stats', 'stats-update', stats);

        return stats;

    } catch (error) {
        console.error('Error updating support stats:', error);
        throw error;
    }
}

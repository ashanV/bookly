import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const db = mongoose.connection.db;

        // Get list of collections
        const collections = await db.listCollections().toArray();

        // Get stats for each collection
        const stats = await Promise.all(collections.map(async (c) => {
            try {
                const stats = await db.command({ collStats: c.name });
                return {
                    name: c.name,
                    count: stats.count || 0,
                    size: stats.size || 0,
                    avgObjSize: stats.avgObjSize || 0,
                    indexes: stats.nindexes || 0,
                    storageSize: stats.storageSize || 0
                };
            } catch (e) {
                // Fallback if collStats fails
                const count = await db.collection(c.name).countDocuments();
                return {
                    name: c.name,
                    count,
                    size: 0,
                    avgObjSize: 0,
                    indexes: 0,
                    error: 'Stats unavailable'
                };
            }
        }));

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Database stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch database stats' },
            { status: 500 }
        );
    }
}

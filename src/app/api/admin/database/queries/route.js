import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const db = mongoose.connection.db;

        try {
            // Try to access system.profile
            // Note: Profiling must be enabled on the database for this to work
            // db.setProfilingLevel('all') or 'slow_only'

            const queries = await db.collection('system.profile')
                .find({ op: { $in: ['query', 'command'] }, millis: { $gt: 10 } }) // Filter queries > 10ms (just an example threshold)
                .sort({ ts: -1 })
                .limit(50)
                .toArray();

            return NextResponse.json({
                queries: queries.map(q => ({
                    ts: q.ts,
                    op: q.op,
                    ns: q.ns,
                    millis: q.millis,
                    query: q.query || q.command,
                    client: q.client
                }))
            });
        } catch (e) {
            // If system.profile is not accessible or doesn't exist
            return NextResponse.json({
                queries: [],
                message: 'Profiling not enabled or not accessible'
            });
        }
    } catch (error) {
        console.error('Query monitor error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch queries' },
            { status: 500 }
        );
    }
}

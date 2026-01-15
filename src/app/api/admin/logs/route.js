import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminLog from '@/app/models/AdminLog';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDB();

        // Optional: Simple pagination
        // Pagination
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AdminLog.find({})
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AdminLog.countDocuments({})
        ]);

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching admin logs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDB();

        // Find users with an admin role (not null)
        const admins = await User.find({
            adminRole: { $in: ['admin', 'moderator', 'developer'] }
        })
            .select('firstName lastName email adminRole lastAdminLogin lastIp lastUserAgent tokenVersion isAdminActive')
            .sort({ lastAdminLogin: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: admins
        });

    } catch (error) {
        console.error('Error fetching admin sessions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminLog from '@/app/models/AdminLog';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // 1. Failed Logins Map (Group by IP)
        const failedLogins = await AdminLog.aggregate([
            { $match: { action: 'admin_login_failed' } },
            {
                $group: {
                    _id: "$ip",
                    count: { $sum: 1 },
                    lastAttempt: { $max: "$timestamp" },
                    emails: { $addToSet: "$userEmail" } // Collect emails attempted
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // 2. PIN Audit (Recent sent PINs)
        const pinAudit = await AdminLog.find({ action: 'pin_sent' })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        // 3. Permission Changes
        const permissionChanges = await AdminLog.find({
            action: { $in: ['role_granted', 'role_revoked'] }
        })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                failedLogins,
                pinAudit,
                permissionChanges
            }
        });

    } catch (error) {
        console.error('Security stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch security stats' },
            { status: 500 }
        );
    }
}

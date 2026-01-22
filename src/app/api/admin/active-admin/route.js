import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/app/models/Session';
import User from '@/app/models/User'; // Ensure User model is registered

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // Define "active" as activity within the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const activeSessions = await Session.find({
            lastActiveAt: { $gte: fiveMinutesAgo },
            isActive: true
        })
            .populate('userId', 'firstName lastName adminRole email')
            .lean();

        // Deduplicate users (in case of multiple sessions per user)
        const uniqueUsers = {};
        activeSessions.forEach(session => {
            if (session.userId && (session.userId.adminRole || session.userId.role === 'admin')) {
                const uid = session.userId._id.toString();
                if (!uniqueUsers[uid]) {
                    uniqueUsers[uid] = {
                        _id: uid,
                        firstName: session.userId.firstName,
                        lastName: session.userId.lastName,
                        email: session.userId.email,
                        role: session.userId.adminRole || 'admin', // Fallback
                        lastActive: session.lastActiveAt
                    };
                } else {
                    // Update if this session is more recent
                    if (new Date(session.lastActiveAt) > new Date(uniqueUsers[uid].lastActive)) {
                        uniqueUsers[uid].lastActive = session.lastActiveAt;
                    }
                }
            }
        });

        const activeAdmins = Object.values(uniqueUsers);

        return NextResponse.json({
            count: activeAdmins.length,
            users: activeAdmins
        });

    } catch (error) {
        console.error('Error fetching active admins:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active admins' },
            { status: 500 }
        );
    }
}

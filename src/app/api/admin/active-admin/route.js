import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all active admin keys
        // Keys are stored as "admin:active:{userId}"
        const keys = await redis.keys('admin:active:*');

        if (!keys || keys.length === 0) {
            return NextResponse.json({ count: 0, users: [] });
        }

        // Fetch values for all found keys
        // MGET returns an array of values (which are JSON strings)
        const sessions = await redis.mget(keys);

        // Filter out nulls and parse JSON if needed (Upstash SDK auto-parses)
        const activeAdmins = sessions
            .filter(s => s)
            .map(s => (typeof s === 'string' ? JSON.parse(s) : s))
            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive)); // Sort by most recent

        return NextResponse.json({
            count: activeAdmins.length,
            users: activeAdmins
        });

    } catch (error) {
        console.error('Error fetching active admins from Redis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active admins' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('adminToken')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        const { _id, firstName, lastName, email, adminRole, role } = decoded;
        const userId = _id || decoded.id; // Handle possible ID field variations

        const adminData = {
            _id: userId,
            firstName,
            lastName,
            email,
            role: adminRole || role || 'admin',
            lastActive: new Date().toISOString()
        };

        // Store in Redis with 5 minute TTL (300 seconds)
        // Key format: admin:active:{userId}
        await redis.set(`admin:active:${userId}`, JSON.stringify(adminData), { ex: 300 });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating active heartbeat:', error);
        return NextResponse.json(
            { error: 'Failed to update heartbeat' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSupportStats } from '@/lib/supportStats';

export const dynamic = 'force-dynamic';

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

        // 2. Get Stats (Cached or Fresh)
        const stats = await getSupportStats();

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching support stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

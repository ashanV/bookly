import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BlockedIp from '@/app/models/BlockedIp';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const blockedIps = await BlockedIp.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: blockedIps });
    } catch (error) {
        console.error('Failed to fetch blocked IPs:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch blacklist' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { ip, reason } = body;

        if (!ip) {
            return NextResponse.json({ success: false, error: 'IP address is required' }, { status: 400 });
        }

        // Check if already blocked
        const existing = await BlockedIp.findOne({ ip });
        if (existing) {
            return NextResponse.json({ success: false, error: 'IP is already blocked' }, { status: 400 });
        }

        const newBlock = await BlockedIp.create({
            ip,
            reason: reason || 'Ręczna blokada',
            blockedBy: 'Admin' // Simplified for now as full auth context is missing
        });

        return NextResponse.json({ success: true, data: newBlock });
    } catch (error) {
        console.error('Failed to block IP:', error);
        return NextResponse.json({ success: false, error: 'Failed to block IP' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const ip = searchParams.get('ip');

        if (!ip) {
            return NextResponse.json({ success: false, error: 'IP address is required' }, { status: 400 });
        }

        const result = await BlockedIp.findOneAndDelete({ ip });

        if (!result) {
            return NextResponse.json({ success: false, error: 'IP not found in blacklist' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'IP unblocked successfully' });
    } catch (error) {
        console.error('Failed to unblock IP:', error);
        return NextResponse.json({ success: false, error: 'Failed to unblock IP' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Session from '@/app/models/Session';
import User from '@/app/models/User';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // Verify User exists
        const user = await User.findById(id).select('_id');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch user sessions
        const sessions = await Session.find({ userId: id }).sort({ createdAt: -1 }).lean();

        const activeSessions = sessions.filter(s => s.isActive && new Date(s.expiresAt) > new Date());
        const history = sessions; // Entire history including active, or filtered? Usually history implies list of all logins.

        return NextResponse.json({
            activeSessions,
            history
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params; // userId (from URL)

        // We need sessionId from body or query? URL is /users/[id]/sessions. 
        // Standard REST would be /users/[id]/sessions/[sessionId].
        // But Next.js App Router dynamic routes for nested IDs can be tricky if not set up as separate folder.
        // Let's use Query Param or Body. 
        // Wait, I can make a folder `[sessionId]` inside `sessions`?
        // Or just `sessions` accepts body `{ sessionId }`. Let's do body.

        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const session = await Session.findOne({ _id: sessionId, userId: id });
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        session.isActive = false;
        session.revokedAt = new Date();
        session.revokedBy = 'admin'; // We could get admin email from token if we decoded it
        await session.save();

        return NextResponse.json({ success: true, message: 'Session revoked' });

    } catch (error) {
        console.error('Error revoking session:', error);
        return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
    }
}

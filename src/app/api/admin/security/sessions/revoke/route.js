import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        // Authorization Check
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Only allow if user is an admin
        const requester = await User.findById(decoded.id);
        if (!requester || !requester.adminRole) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        await connectDB();

        // Increment tokenVersion to invalidate all existing tokens
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { tokenVersion: 1 } },
            { new: true }
        ).select('email tokenVersion');

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log(`✅ Revoked sessions for user ${updatedUser.email} (New Version: ${updatedUser.tokenVersion})`);

        return NextResponse.json({
            success: true,
            message: "Sessions revoked successfully"
        });

    } catch (error) {
        console.error('Error revoking session:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to revoke session' },
            { status: 500 }
        );
    }
}

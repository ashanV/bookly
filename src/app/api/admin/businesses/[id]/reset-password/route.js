import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';
import bcrypt from 'bcryptjs';

export async function POST(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // Generate a temporary password
        const tempPassword = `Bookly${Math.floor(Math.random() * 9000) + 1000}!`;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const business = await Business.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        );

        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Return the temp password to the admin so they can share it
        return NextResponse.json({
            message: 'Password reset successfully',
            tempPassword
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}

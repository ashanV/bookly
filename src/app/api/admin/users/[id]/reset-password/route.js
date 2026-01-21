import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

export async function POST(req, { params }) {
    try {
        // Authorization Check
        const cookieStore = await cookies();
        const token = cookieStore.get("adminToken")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const requester = await User.findById(decoded.id);
        if (!requester || !requester.adminRole) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const { action } = await req.json(); // 'link', 'force', 'temp'

        if (!id || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let responseData = { success: true, message: "Action completed" };

        if (action === 'link') {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            user.resetPasswordToken = resetTokenHash;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

            const emailText = `Twoje hasło zostało zresetowane przez administratora. Kliknij w link, aby ustawić nowe hasło: ${resetUrl}`;
            const emailHtml = `
                <h2>Reset Hasła</h2>
                <p>Twoje hasło zostało zresetowane przez administratora.</p>
                <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">Zmień Hasło</a>
                <p>Link wygaśnie za 1 godzinę.</p>
            `;

            await sendEmail({
                to: user.email,
                subject: 'Reset Hasła - Bookly',
                text: emailText,
                html: emailHtml
            });

            await user.save();
            responseData.message = "Reset link sent";

        } else if (action === 'force') {
            user.forcePasswordReset = true;
            user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate sessions

            // Optionally send email about forced change next time
            await user.save();
            responseData.message = "User forced to reset password on next login";

        } else if (action === 'temp') {
            const tempPassword = `Bookly${Math.floor(Math.random() * 9000) + 1000}!`;
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(tempPassword, salt);
            user.forcePasswordReset = true; // Force them to change it after using temp
            user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate old sessions

            const emailText = `Twoje hasło zostało zresetowane przez administratora. Twoje nowe hasło tymczasowe to: ${tempPassword}. Zaloguj się i zmień je niezwłocznie.`;
            const emailHtml = `
                <h2>Reset Hasła</h2>
                <p>Twoje hasło zostało zresetowane przez administratora.</p>
                <p>Twoje nowe hasło tymczasowe:</p>
                <h3 style="background: #f3f4f6; padding: 10px; display: inline-block;">${tempPassword}</h3>
                <p>Zaloguj się i zmień je niezwłocznie.</p>
            `;

            await sendEmail({
                to: user.email,
                subject: 'Nowe Hasło Tymczasowe - Bookly',
                text: emailText,
                html: emailHtml
            });

            await user.save();
            responseData.message = "Temporary password generated";
            responseData.tempPassword = tempPassword;
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error in password reset:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

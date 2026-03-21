import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';
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

        let action = 'temp'; // Default for backward compatibility if body is empty
        try {
            const body = await req.json();
            if (body.action) action = body.action;
        } catch (e) {
            // Body might be empty, default to temp
        }

        await connectDB();
        const business = await Business.findById(id);

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        let responseData = { success: true, message: "Action completed" };

        if (action === 'link') {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            business.resetPasswordToken = resetTokenHash;
            business.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/business/${resetToken}`;

            const emailText = `Hasło do konta firmowego zostało zresetowane przez administratora. Kliknij w link, aby ustawić nowe hasło: ${resetUrl}`;
            const emailHtml = `
                <h2>Reset Hasła Firmowego</h2>
                <p>Hasło do Twojego konta firmowego <strong>${business.companyName}</strong> zostało zresetowane przez administratora.</p>
                <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">Zmień Hasło</a>
                <p>Link wygaśnie za 1 godzinę.</p>
            `;

            await sendEmail({
                to: business.email,
                subject: 'Reset Hasła Firmowego - Bookly',
                text: emailText,
                html: emailHtml
            });

            await business.save();
            responseData.message = "Reset link sent";

        } else if (action === 'force') {
            business.forcePasswordReset = true;
            await business.save();
            responseData.message = "Business forced to reset password on next login";

        } else if (action === 'temp') {
            const tempPassword = `Bookly${Math.floor(Math.random() * 9000) + 1000}!`;
            const salt = await bcrypt.genSalt(10);
            business.password = await bcrypt.hash(tempPassword, salt);
            business.forcePasswordReset = true; // Force change after first login

            const emailText = `Hasło do konta firmowego zostało zresetowane przez administratora. Twoje nowe hasło tymczasowe to: ${tempPassword}. Zaloguj się i zmień je niezwłocznie.`;
            const emailHtml = `
                <h2>Reset Hasła Firmowego</h2>
                <p>Hasło do konta firmowego <strong>${business.companyName}</strong> zostało zresetowane przez administratora.</p>
                <p>Twoje nowe hasło tymczasowe:</p>
                <h3 style="background: #f3f4f6; padding: 10px; display: inline-block;">${tempPassword}</h3>
                <p>Zaloguj się i zmień je niezwłocznie.</p>
            `;

            await sendEmail({
                to: business.email,
                subject: 'Nowe Hasło Tymczasowe - Bookly',
                text: emailText,
                html: emailHtml
            });

            await business.save();
            responseData.message = "Temporary password generated";
            responseData.tempPassword = tempPassword;
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error in business password reset:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

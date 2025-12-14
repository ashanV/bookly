import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import bcrypt from "bcryptjs";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { validatePassword } from "@/lib/passwordValidation";
import { csrfMiddleware } from "@/lib/csrf";

export async function PUT(req) {
    // Rate limiting check
    const rateLimit = checkRateLimit(req, 'changePassword');
    if (!rateLimit.success) {
        return rateLimitResponse(rateLimit.resetIn);
    }

    // CSRF validation
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
        return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Brak tokenu autoryzacyjnego" }, { status: 401 });
        }

        let decoded;
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: "Nieprawidłowy token" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Wymagane jest podanie aktualnego i nowego hasła" },
                { status: 400 }
            );
        }

        // Use the same password validation as registration
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.message },
                { status: 400 }
            );
        }

        await connectDB();

        const role = decoded.role || 'client';
        let user = null;

        if (role === 'business') {
            user = await Business.findById(decoded.id);
        } else {
            user = await User.findById(decoded.id);
        }

        if (!user) {
            return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: "Podano nieprawidłowe aktualne hasło" },
                { status: 400 }
            );
        }

        // Hashing the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Password update
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            message: "Hasło zostało pomyślnie zmienione"
        });

    } catch (error) {
        console.error("Błąd zmiany hasła:", error);
        return NextResponse.json(
            { error: "Wystąpił błąd serwera podczas zmiany hasła" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import bcrypt from "bcryptjs";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";
import { changePasswordSchema, validateInput } from "@/lib/validations";

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

        const body = await req.json();

        // Input validation
        const validation = validateInput(changePasswordSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { currentPassword, newPassword } = validation.data;

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

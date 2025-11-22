import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import bcrypt from "bcryptjs";

export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Brak tokenu autoryzacyjnego" }, { status: 401 });
        }

        let decoded;
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

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Nowe hasło musi mieć co najmniej 6 znaków" },
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

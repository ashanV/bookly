import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req) {
  // Rate limiting check
  const rateLimit = checkRateLimit(req, 'login');
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const { email, password } = await req.json();
    await connectDB();

    // Tylko sprawdź w kolekcji User (klienci)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Nieprawidłowy email lub konto biznesowe" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 400 });
    }

    const token = jwt.sign({ id: user._id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      message: "Zalogowano",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: 'client'
      }
    });

    // Ustaw cookie używając NextResponse
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dni w sekundach
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Wystąpił błąd serwera" }, { status: 500 });
  }
}


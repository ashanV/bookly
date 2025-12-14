import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";
import { loginSchema, validateInput } from "@/lib/validations";

export async function POST(req) {
  // Rate limiting check
  const rateLimit = checkRateLimit(req, 'login');
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  // CSRF validation
  const csrfError = await csrfMiddleware(req);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  try {
    const body = await req.json();

    // Input validation
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = validation.data;
    await connectDB();

    // Tylko sprawdź w kolekcji Business
    const business = await Business.findOne({ email });
    if (!business) {
      return NextResponse.json({ error: "Nieprawidłowy email lub konto klienta" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ id: business._id, role: 'business' }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      message: "Zalogowano",
      user: {
        id: business._id,
        email: business.email,
        firstName: business.firstName,
        lastName: business.lastName,
        fullName: `${business.firstName} ${business.lastName}`,
        role: 'business',
        companyName: business.companyName
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


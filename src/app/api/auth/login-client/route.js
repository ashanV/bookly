import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import SystemConfig from "../../../models/SystemConfig";
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
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const body = await req.json();

    // Input validation
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = validation.data;
    await connectDB();

    // Pobranie konfiguracji systemu
    const config = await SystemConfig.getConfig();
    const timeoutMinutes = config.sessionTimeoutMinutes || 1440;

    // Tylko sprawdź w kolekcji User (klienci)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Nieprawidłowy email lub konto biznesowe" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 400 });
    }

    // Update Session Info
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    user.lastIp = ip;
    user.lastUserAgent = userAgent;
    if (user.adminRole) {
      user.lastAdminLogin = new Date();
    }
    await user.save();

    // Create Session
    const Session = (await import("@/app/models/Session")).default;
    const { parseUserAgent } = await import("@/lib/userAgent");
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    const session = await Session.create({
      userId: user._id,
      token: "jwt", // Placeholder, or we can store hash of the actual token later if needed. For now "jwt" is fine as we rely on _id.
      ip,
      userAgent,
      browser,
      os,
      deviceType,
      expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000)
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: 'client',
        tokenVersion: user.tokenVersion || 0,
        sessionId: session._id // Include Session ID
      },
      process.env.JWT_SECRET,
      { expiresIn: `${timeoutMinutes}m` }
    );

    // Update session with token hash if we wanted to, but for now skipping to keep it simple.


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
      maxAge: timeoutMinutes * 60, // konwersja na sekundy
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Wystąpił błąd serwera" }, { status: 500 });
  }
}


import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";
import { registerSchema, validateInput } from "@/lib/validations";

export async function POST(req) {
  // Rate limiting check (stricter for registration)
  const rateLimit = checkRateLimit(req, 'register');
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  // CSRF validation
  const csrfError = await csrfMiddleware(req);
  if (csrfError) {
    return NextResponse.json(
      { error: csrfError.error },
      { status: csrfError.status }
    );
  }

  try {
    const body = await req.json();

    // Input validation with Zod
    const validation = validateInput(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, phone, birthDate } = validation.data;

    // Connect to database
    await connectDB();

    // Check if user with the given email already exists (in User or Business)
    const existingUser = await User.findOne({ email });
    const existingBusiness = await Business.findOne({ email });

    if (existingUser || existingBusiness) {
      return NextResponse.json(
        { error: "Użytkownik o tym adresie email już istnieje" },
        { status: 400 }
      );
    }

    // Create new user in database
    // Password will be hashed by middleware in User model
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      birthDate,
    });

    await newUser.save();

    console.log(`✅ Użytkownik ${email} został pomyślnie zarejestrowany.`);

    // Log to AdminLog
    try {
      // Dynamic import to avoid circular dependency if any
      const AdminLog = require("@/app/models/AdminLog").default;
      await AdminLog.create({
        userId: newUser._id,
        userEmail: email,
        userRole: 'user',
        action: 'user_registered',
        targetType: 'user',
        targetId: newUser._id,
        details: {
          firstName,
          lastName,
          phone
        },
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
    } catch (logError) {
      console.error("Failed to create admin log for user registration:", logError);
    }

    // Send success response
    return NextResponse.json(
      { message: "Rejestracja przebiegła pomyślnie!" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera podczas rejestracji." },
      { status: 500 }
    );
  }
}
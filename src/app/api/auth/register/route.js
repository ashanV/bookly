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

    // Podłączenie do bazy danych
    await connectDB();

    // Sprawdzenie, czy użytkownik o podanym emailu już istnieje (w User lub Business)
    const existingUser = await User.findOne({ email });
    const existingBusiness = await Business.findOne({ email });

    if (existingUser || existingBusiness) {
      return NextResponse.json(
        { error: "Użytkownik o tym adresie email już istnieje" },
        { status: 400 }
      );
    }

    // Stworzenie nowego użytkownika w bazie danych
    // Hasło zostanie zahashowane przez middleware w modelu User
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

    // Wysłanie odpowiedzi o sukcesie
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
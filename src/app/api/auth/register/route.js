import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import { NextResponse } from "next/server";
import { validatePassword } from "@/lib/passwordValidation";

export async function POST(req) {
  try {
    // Pobranie danych z formularza rejestracji
    const { firstName, lastName, email, password, phone, birthDate } = await req.json();

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

    // Walidacja hasła
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
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
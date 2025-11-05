import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Pobranie danych z formularza rejestracji biznesu
    const {
      companyName,
      companyType,
      category,
      description,
      firstName,
      lastName,
      email,
      password,
      phone,
      city,
      address,
      postalCode,
      services,
      workingHours,
      pricing,
      teamSize,
      website,
      instagram,
      facebook,
      newsletter
    } = await req.json();

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

    // Walidacja wymaganych pól
    if (!companyName || !companyType || !category || !firstName || !lastName || !email || !password || !phone || !city || !address || !postalCode) {
      return NextResponse.json(
        { error: "Wszystkie wymagane pola muszą być wypełnione" },
        { status: 400 }
      );
    }

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: "Musisz wybrać co najmniej jedną usługę" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 6 znaków" },
        { status: 400 }
      );
    }

    // Hashowanie hasła
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Stworzenie nowego biznesu w bazie danych
    const newBusiness = new Business({
      companyName,
      companyType,
      category,
      description: description || '',
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      city,
      address,
      postalCode,
      services: services || [],
      workingHours: workingHours || {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      pricing: pricing || '',
      teamSize: teamSize || '',
      website: website || '',
      instagram: instagram || '',
      facebook: facebook || '',
      newsletter: newsletter || false
    });

    await newBusiness.save();
    
    console.log(`✅ Użytkownik biznesowy ${email} (${companyName}) został pomyślnie zarejestrowany.`);

    // Wysłanie odpowiedzi o sukcesie
    return NextResponse.json(
      { message: "Rejestracja biznesu przebiegła pomyślnie!" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Błąd podczas rejestracji biznesu:", error);
    
    // Obsługa błędów unikalności email
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { error: "Użytkownik o tym adresie email już istnieje" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Wystąpił błąd serwera podczas rejestracji." },
      { status: 500 }
    );
  }
}


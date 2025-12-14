import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import User from "../../../models/User";
import { NextResponse } from "next/server";
import { validatePassword } from "@/lib/passwordValidation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";

export async function POST(req) {
  // Rate limiting check (stricter for registration)
  const rateLimit = checkRateLimit(req, 'register');
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  // CSRF validation
  const csrfError = await csrfMiddleware(req);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

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

    // Walidacja hasła
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Mapowanie usług (jeśli są stringami) na obiekty
    const serviceDefaults = {
      'haircut': { name: 'Strzyżenie', duration: 60, price: 100 },
      'coloring': { name: 'Koloryzacja', duration: 120, price: 200 },
      'styling': { name: 'Stylizacja', duration: 45, price: 80 },
      'facial': { name: 'Zabiegi na twarz', duration: 60, price: 150 },
      'manicure': { name: 'Manicure', duration: 60, price: 80 },
      'pedicure': { name: 'Pedicure', duration: 60, price: 100 },
      'massage': { name: 'Masaż', duration: 60, price: 150 },
      'waxing': { name: 'Depilacja', duration: 30, price: 50 },
      'makeup': { name: 'Makijaż', duration: 60, price: 150 },
      'lashes': { name: 'Rzęsy', duration: 90, price: 120 },
      'brows': { name: 'Brwi', duration: 30, price: 40 },
      'spa': { name: 'SPA', duration: 120, price: 300 }
    };

    const formattedServices = (services || []).map(service => {
      if (typeof service === 'string') {
        const defaults = serviceDefaults[service] || { name: service, duration: 60, price: 100 };
        return {
          id: service, // Use the string ID as the service ID
          name: defaults.name,
          duration: defaults.duration,
          price: defaults.price,
          description: `Usługa ${defaults.name}`
        };
      }
      return service; // Already an object
    });

    // Stworzenie nowego biznesu w bazie danych
    // Hasło zostanie zahashowane przez middleware w modelu Business
    const newBusiness = new Business({
      companyName,
      companyType,
      category,
      description: description || '',
      firstName,
      lastName,
      email,
      password, // Przekazujemy plain text, middleware zahashuje
      phone,
      city,
      address,
      postalCode,
      services: formattedServices,
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

import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import User from "../../../models/User";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";
import { registerBusinessSchema, validateInput } from "@/lib/validations";

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
    const body = await req.json();

    // Input validation with Zod
    const validation = validateInput(registerBusinessSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Pobranie danych z walidacji
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
    } = validation.data;

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

    // Log to AdminLog
    try {
      const AdminLog = require("@/app/models/AdminLog").default;
      await AdminLog.create({
        userId: newBusiness._id, // Using business ID as userId for the log context
        userEmail: email,
        userRole: 'business',
        action: 'business_created',
        targetType: 'business',
        targetId: newBusiness._id,
        details: {
          companyName,
          city,
          category
        },
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
    } catch (logError) {
      console.error("Failed to create admin log for business registration:", logError);
      // Don't fail the registration if logging fails
    }

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

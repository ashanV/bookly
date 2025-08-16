import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { firstName, lastName, email, phone, birthDate, password } = await req.json();

    // Debugowanie - sprawdź co otrzymujemy
    console.log("Otrzymane dane:", { firstName, lastName, email, phone, birthDate });

    // Walidacja po stronie serwera
    if (!firstName || !lastName || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Imię, nazwisko, email i hasło są wymagane" }), 
        { status: 400 }
      );
    }

    // Sprawdź czy email nie istnieje
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email już istnieje" }), 
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Przygotuj dane dokładnie zgodnie ze schematem
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || "",
      birthDate: birthDate || "",
      password: hashedPassword,
    };

    console.log("Dane do zapisania:", userData);

    const user = await User.create(userData);

    // Usuń hasło z odpowiedzi
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      createdAt: user.createdAt
    };

    return new Response(
      JSON.stringify({ message: "Rejestracja udana", user: userResponse }), 
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    
    // Sprawdź czy to błąd walidacji Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ 
          error: "Błąd walidacji", 
          details: validationErrors 
        }), 
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Wewnętrzny błąd serwera" }), 
      { status: 500 }
    );
  }
}
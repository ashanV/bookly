import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";

export async function PUT(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Brak tokenu" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();
    const { firstName, lastName, phone, birthDate } = body;

    await connectDB();
    
    const role = decoded.role || 'client';
    let user = null;

    // Sprawdź w odpowiedniej kolekcji
    if (role === 'business') {
      user = await Business.findById(decoded.id);
      if (!user) {
        return NextResponse.json({ error: "Biznes nie istnieje" }, { status: 404 });
      }
      
      // Aktualizuj pola biznesowe
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      await user.save();

      return NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          role: 'business',
          companyName: user.companyName,
          phone: user.phone,
        },
      });
    } else {
      // Dla klientów
      user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (birthDate !== undefined) user.birthDate = birthDate;
      await user.save();

      return NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          role: 'client',
          phone: user.phone,
          birthDate: user.birthDate,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || "Błąd" }, { status: 500 });
  }
}
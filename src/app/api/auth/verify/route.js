import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak tokenu" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    let user = null;
    let role = decoded.role || 'client';

    // Sprawdź w odpowiedniej kolekcji na podstawie roli w tokenie
    if (role === 'business') {
      user = await Business.findById(decoded.id).select("-password");
      if (user) {
        return NextResponse.json({
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            role: 'business',
            phone: user.phone,
            companyName: user.companyName,
            companyType: user.companyType,
            category: user.category,
            description: user.description,
            city: user.city,
            address: user.address,
            postalCode: user.postalCode,
            services: user.services,
            workingHours: user.workingHours,
            pricing: user.pricing,
            teamSize: user.teamSize,
            website: user.website,
            instagram: user.instagram,
            facebook: user.facebook,
            isActive: user.isActive,
            isVerified: user.isVerified,
          },
        });
      }
    } else {
      // Domyślnie sprawdź w User (klienci)
      user = await User.findById(decoded.id).select("-password");

      // Check token version for Users (including Admins)
      if (user) {
        if (decoded.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
          return NextResponse.json({ error: "Sesja wygasła (token invalid)" }, { status: 401 });
        }

        return NextResponse.json({
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            role: 'client',
            // Admin fields
            adminRole: user.adminRole || null,
            isAdminActive: user.isAdminActive || false,
            // Dodaj inne pola jeśli potrzebne
          },
        });
      }
    }

    // Jeśli nie znaleziono w żadnej kolekcji, zwróć błąd
    return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Nieprawidłowy token" }, { status: 401 });
  }
}

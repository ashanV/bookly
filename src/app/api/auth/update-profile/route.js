import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import Business from "../../../models/Business";
import { csrfMiddleware } from "@/lib/csrf";

export async function PUT(req) {
  // CSRF validation
  const csrfError = await csrfMiddleware(req);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Brak tokenu" }, { status: 401 });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();
    const { firstName, lastName, phone, birthDate, email } = body;

    await connectDB();

    const role = decoded.role || 'client';
    let user = null;

    // Check the appropriate collection
    if (role === 'business') {
      user = await Business.findById(decoded.id);
      if (!user) {
        return NextResponse.json({ error: "Biznes nie istnieje" }, { status: 404 });
      }

      // Update business fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (email !== undefined) user.email = email;
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
      // Update client fields
      user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (email !== undefined) user.email = email;
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
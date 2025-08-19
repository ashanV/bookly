// pages/api/auth/verify.js
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      req.headers.get("x-auth-token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Brak tokenu" }), {
        status: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Użytkownik nie istnieje" }),
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        // Dodaj inne pola jeśli potrzebne
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Nieprawidłowy token" }), {
      status: 401,
    });
  }
}

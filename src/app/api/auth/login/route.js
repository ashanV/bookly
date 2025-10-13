import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return new Response(JSON.stringify({ error: "Nieprawidłowy email" }), { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return new Response(JSON.stringify({ error: "Nieprawidłowe hasło" }), { status: 400 });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    const response = NextResponse.json({ 
      message: "Zalogowano", 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName, 
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
      }
    });

    // Ustaw cookie używając NextResponse
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dni w sekundach
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
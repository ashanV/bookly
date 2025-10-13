import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Reservation from "../../models/Reservation";

function requireAuth() {
  const token = cookies().get("token")?.value;
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function GET() {
  try {
    const decoded = requireAuth();
    await connectDB();
    const reservations = await Reservation.find({ userId: decoded.id }).sort({ createdAt: -1 });
    return NextResponse.json({ reservations });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Błąd" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = requireAuth();
    const body = await req.json();
    const { studioId, serviceId, staffId, date, time, duration, price, notes } = body;

    if (!studioId || !serviceId || !date || !time || !duration || !price) {
      return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
    }

    await connectDB();
    const reservation = await Reservation.create({
      userId: decoded.id,
      studioId,
      serviceId,
      staffId,
      date,
      time,
      duration,
      price,
      notes,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Błąd" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const decoded = requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Brak id" }, { status: 400 });

    await connectDB();
    const result = await Reservation.deleteOne({ _id: id, userId: decoded.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Błąd" }, { status: 500 });
  }
}

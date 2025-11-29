import { connectDB } from "@/lib/mongodb";
import Reservation from "../../../models/Reservation";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    await connectDB();

    // Pobranie tokenu z cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Weryfikacja tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'business') {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await req.json();
    const { reservationId, service, date, time, duration, price, status, notes } = body;

    if (!reservationId) {
      return NextResponse.json({ error: "Brak ID rezerwacji" }, { status: 400 });
    }

    // Pobranie rezerwacji
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return NextResponse.json({ error: "Rezerwacja nie została znaleziona" }, { status: 404 });
    }

    // Sprawdzenie, czy rezerwacja należy do biznesu
    if (reservation.businessId.toString() !== decoded.id) {
      return NextResponse.json({ error: "Brak uprawnień do tej rezerwacji" }, { status: 403 });
    }

    // Aktualizacja pól
    if (service !== undefined) reservation.service = service;
    if (date !== undefined) reservation.date = new Date(date);
    if (time !== undefined) reservation.time = time;
    if (duration !== undefined) reservation.duration = duration;
    if (price !== undefined) reservation.price = price;
    if (status !== undefined) reservation.status = status;
    if (notes !== undefined) reservation.notes = notes;

    await reservation.save();

    return NextResponse.json({
      success: true,
      reservation
    }, { status: 200 });
  } catch (error) {
    console.error("Błąd aktualizacji rezerwacji:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


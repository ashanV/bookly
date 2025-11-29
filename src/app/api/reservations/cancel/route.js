import { connectDB } from "@/lib/mongodb";
import Reservation from "../../../models/Reservation";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    await connectDB();

    // Pobranie tokenu z cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Weryfikacja tokenu
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'business') {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    // Pobranie ID rezerwacji z URL
    const { searchParams } = new URL(req.url);
    const reservationId = searchParams.get('id');

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

    // Usunięcie rezerwacji
    await Reservation.findByIdAndDelete(reservationId);

    return NextResponse.json({
      success: true,
      message: "Rezerwacja została usunięta"
    }, { status: 200 });
  } catch (error) {
    console.error("Błąd usuwania rezerwacji:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


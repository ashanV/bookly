import { connectDB } from "@/lib/mongodb";
import Reservation from "../../../models/Reservation";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { csrfMiddleware } from "@/lib/csrf";
import { format, addMinutes, parseISO } from "date-fns";

export async function PUT(req) {
  try {
    // CSRF validation
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
      return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    await connectDB();

    // Retrieving token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'business') {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await req.json();
    const { reservationId, service, date, time, duration, price, status, notes, employeeId } = body;

    if (!reservationId) {
      return NextResponse.json({ error: "Brak ID rezerwacji" }, { status: 400 });
    }

    // Retrieving reservation
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return NextResponse.json({ error: "Rezerwacja nie została znaleziona" }, { status: 404 });
    }

    // Checking if reservation belongs to business
    if (reservation.businessId.toString() !== decoded.id) {
      return NextResponse.json({ error: "Brak uprawnień do tej rezerwacji" }, { status: 403 });
    }

    // --- OVERLAP CHECK ---
    const finalEmployeeId = employeeId !== undefined ? employeeId : reservation.employeeId;
    const finalDate = date !== undefined ? new Date(date) : new Date(reservation.date);
    const finalTime = time !== undefined ? time : reservation.time;
    const finalDuration = duration !== undefined ? duration : reservation.duration;

    if (finalEmployeeId) {
      const selectedDate = new Date(finalDate);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingReservations = await Reservation.find({
        _id: { $ne: reservationId },
        businessId: reservation.businessId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed'] },
        employeeId: finalEmployeeId.toString()
      }).lean();

      const newStart = parseISO(`${format(selectedDate, 'yyyy-MM-dd')}T${finalTime}`);
      const newEnd = addMinutes(newStart, parseInt(finalDuration));

      const hasOverlap = existingReservations.some(res => {
        const resStart = parseISO(`${format(new Date(res.date), 'yyyy-MM-dd')}T${res.time}`);
        const resEnd = addMinutes(resStart, res.duration);
        return newStart < resEnd && newEnd > resStart;
      });

      if (hasOverlap) {
        return NextResponse.json({ error: "Wybrany termin u tego pracownika jest już częściowo lub w całości zajęty." }, { status: 409 });
      }
    }

    // Updating fields
    if (service !== undefined) reservation.service = service;
    if (date !== undefined) reservation.date = new Date(date);
    if (time !== undefined) reservation.time = time;
    if (duration !== undefined) reservation.duration = duration;
    if (price !== undefined) reservation.price = price;
    if (status !== undefined) reservation.status = status;
    if (notes !== undefined) reservation.notes = notes;
    if (employeeId !== undefined) reservation.employeeId = employeeId;

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


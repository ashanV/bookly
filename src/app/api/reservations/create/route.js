import { connectDB } from "@/lib/mongodb";
import Reservation from "@/app/models/Reservation";
import Business from "@/app/models/Business";
import SystemConfig from "@/app/models/SystemConfig";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { csrfMiddleware } from "@/lib/csrf";
import { createReservationSchema, validateInput } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/generateReferenceNumber";
import { format, addMinutes, parseISO } from "date-fns";

export async function POST(req) {
  try {
    // CSRF validation for state-changing request
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
      return NextResponse.json(
        { error: csrfError.error },
        { status: csrfError.status }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    await connectDB();

    // Checking global reservation limits
    const config = await SystemConfig.getConfig();
    if (config.maxBookingsEnabled) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const count = await Reservation.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      if (count >= config.maxBookingsPerDay) {
        return NextResponse.json(
          { error: "Dzienny limit rezerwacji został wyczerpany." },
          { status: 403 }
        );
      }
    }

    // Retrieving token from cookies (optional for clients)
    const token = req.cookies.get('token')?.value;
    let clientId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'client') {
          clientId = decoded.id;
        }
      } catch (error) {
        // Invalid or missing token - continue without clientId
      }
    }

    const body = await req.json();

    // Input validation with Zod
    const validation = validateInput(createReservationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const {
      businessId,
      employeeId,
      service,
      serviceId,
      date,
      time,
      duration,
      price,
      clientName,
      clientEmail,
      clientPhone,
      notes = ''
    } = validation.data;
    if (!businessId || !service || !date || !time || !duration || !price || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      );
    }

    // Checking if business exists  
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json(
        { error: "Biznes nie znaleziony" },
        { status: 404 }
      );
    }

    // Checking if business is blocked
    if (business.isBlocked) {
      return NextResponse.json(
        { error: "Ten biznes został zablokowany i nie może przyjmować rezerwacji." },
        { status: 403 } // Forbidden
      );
    }

    // Checking if employee exists (if provided)
    if (employeeId) {
      const employee = business.employees?.find(emp => emp._id.toString() === employeeId.toString());
      if (!employee) {
        return NextResponse.json(
          { error: "Pracownik nie znaleziony" },
          { status: 404 }
        );
      }
    }

    // Generating unique reference number
    const referenceNumber = await generateReferenceNumber(Reservation);

    // Checking for overlapping reservations
    if (employeeId) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingReservations = await Reservation.find({
        businessId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed'] },
        employeeId: employeeId.toString()
      }).lean();

      // Creating Date() objects with combined time to calculate overlap
      const newStart = parseISO(`${format(selectedDate, 'yyyy-MM-dd')}T${time}`);
      const newEnd = addMinutes(newStart, parseInt(duration));

      const hasOverlap = existingReservations.some(res => {
        const resStart = parseISO(`${format(new Date(res.date), 'yyyy-MM-dd')}T${res.time}`);
        const resEnd = addMinutes(resStart, res.duration);
        
        // Collision condition: StartA < EndB AND EndA > StartB
        return newStart < resEnd && newEnd > resStart;
      });

      if (hasOverlap) {
        return NextResponse.json(
          { error: "Wybrany termin u tego pracownika jest już częściowo lub w całości zajęty." },
          { status: 409 }
        );
      }
    }

    // Creating reservation
    const reservation = new Reservation({
      businessId,
      clientId,
      employeeId: employeeId ? employeeId.toString() : null,
      service,
      serviceId: serviceId || null,
      date: new Date(date),
      time,
      duration: parseInt(duration),
      price: parseFloat(price),
      clientName,
      clientEmail,
      clientPhone,
      notes,
      status: 'pending',
      referenceNumber
    });

    await reservation.save();

    return NextResponse.json(
      {
        success: true,
        reservation: {
          id: reservation._id.toString(),
          businessId: reservation.businessId.toString(),
          employeeId: reservation.employeeId,
          service: reservation.service,
          date: reservation.date,
          time: reservation.time,
          duration: reservation.duration,
          price: reservation.price,
          status: reservation.status,
          referenceNumber: reservation.referenceNumber
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd tworzenia rezerwacji:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


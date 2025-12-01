import { connectDB } from "@/lib/mongodb";
import Reservation from "@/app/models/Reservation";
import Business from "@/app/models/Business";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    await connectDB();

    // Pobranie tokenu z cookies (opcjonalne dla klientów)
    const token = req.cookies.get('token')?.value;
    let clientId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'client') {
          clientId = decoded.id;
        }
      } catch (error) {
        // Token nieprawidłowy lub brak - kontynuujemy bez clientId
      }
    }

    const body = await req.json();
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
    } = body;

    // Walidacja wymaganych pól
    if (!businessId || !service || !date || !time || !duration || !price || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      );
    }

    // Sprawdzenie, czy biznes istnieje
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json(
        { error: "Biznes nie znaleziony" },
        { status: 404 }
      );
    }

    // Sprawdzenie, czy pracownik istnieje (jeśli podano)
    if (employeeId) {
      const employee = business.employees?.find(emp => emp.id === parseInt(employeeId));
      if (!employee) {
        return NextResponse.json(
          { error: "Pracownik nie znaleziony" },
          { status: 404 }
        );
      }
    }

    // Utworzenie rezerwacji
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
      status: 'pending'
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
          status: reservation.status
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


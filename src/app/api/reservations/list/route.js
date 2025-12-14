import { connectDB } from "@/lib/mongodb";
import Reservation from "../../../models/Reservation";
import Business from "@/app/models/Business";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
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

    // Pobranie parametrów z URL
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const service = searchParams.get('service');
    const employeeId = searchParams.get('employeeId');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Budowanie zapytania
    const query = { businessId: decoded.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      // Obsługa wielu statusów oddzielonych przecinkiem
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map(s => s.trim()) };
      } else {
        query.status = status;
      }
    }

    // Wyszukiwanie tekstowe - przeszukuje nazwę klienta, email i telefon
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrowanie po usłudze
    if (service) {
      query.service = { $regex: service, $options: 'i' };
    }

    // Filtrowanie po pracowniku
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Budowanie sortowania
    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'clientName':
        sortOptions.clientName = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'date':
      default:
        sortOptions.date = sortOrder === 'asc' ? 1 : -1;
        sortOptions.time = sortOrder === 'asc' ? 1 : -1;
        break;
    }

    // Pobranie rezerwacji
    const reservations = await Reservation.find(query)
      .sort(sortOptions)
      .lean();

    // Pobranie danych biznesu, aby uzyskać informacje o pracownikach
    const business = await Business.findById(decoded.id).lean();
    const employees = business?.employees || [];

    // Dodanie informacji o pracowniku do każdej rezerwacji
    const reservationsWithEmployee = reservations.map(reservation => {
      const employeeInfo = reservation.employeeId
        ? employees.find(emp => emp.id?.toString() === reservation.employeeId?.toString() || emp.id === parseInt(reservation.employeeId))
        : null;

      return {
        ...reservation,
        employee: employeeInfo ? {
          id: employeeInfo.id,
          name: employeeInfo.name,
          position: employeeInfo.position,
          avatar: employeeInfo.avatarImage || employeeInfo.avatar
        } : null
      };
    });

    return NextResponse.json({ reservations: reservationsWithEmployee }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania rezerwacji:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}








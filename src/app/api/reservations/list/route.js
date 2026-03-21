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

    // Retrieving the token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'business') {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    // Retrieving parameters from URL
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const service = searchParams.get('service');
    const employeeId = searchParams.get('employeeId');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Building a query 
    const query = { businessId: decoded.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      // Handling multiple statuses separated by a comma
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map(s => s.trim()) };
      } else {
        query.status = status;
      }
    }

    // Text search - searches for the client's name, email, phone number and reference number
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search.replace('#', ''), $options: 'i' } } // Remove # if it is in the search
      ];
    }

    // Filtering by service
    if (service) {
      query.service = { $regex: service, $options: 'i' };
    }

    // Filtering by employee
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Building sorting
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

    // Retrieving reservations
    const reservations = await Reservation.find(query)
      .sort(sortOptions)
      .lean();

    // Retrieving business data to get employee information
    const business = await Business.findById(decoded.id).lean();
    const employees = business?.employees || [];

    // Adding employee information to each reservation
    const reservationsWithEmployee = reservations.map(reservation => {
      const employeeInfo = reservation.employeeId
        ? employees.find(emp => 
            emp._id?.toString() === reservation.employeeId?.toString() ||
            emp.id?.toString() === reservation.employeeId?.toString() || 
            emp.id === parseInt(reservation.employeeId)
          )
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








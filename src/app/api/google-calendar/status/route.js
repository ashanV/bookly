import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Business from '../../../models/Business';

export async function GET(req) {
  try {
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

    await connectDB();

    const business = await Business.findById(decoded.id);
    if (!business) {
      return NextResponse.json({ error: "Biznes nie znaleziony" }, { status: 404 });
    }

    return NextResponse.json({
      connected: business.googleCalendarConnected || false,
      hasTokens: !!(business.googleCalendarTokens?.accessToken)
    });
  } catch (error) {
    console.error('Błąd sprawdzania statusu Google Calendar:', error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd" },
      { status: 500 }
    );
  }
}








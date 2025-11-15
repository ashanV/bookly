import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Business from '../../../models/Business';
import Reservation from '../../../models/Reservation';
import { format, parseISO, addMinutes } from 'date-fns';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-calendar/callback`
);

async function getAuthenticatedClient(businessId) {
  await connectDB();
  const business = await Business.findById(businessId);
  
  if (!business || !business.googleCalendarConnected || !business.googleCalendarTokens?.accessToken) {
    throw new Error('Google Calendar nie jest połączony');
  }

  oauth2Client.setCredentials({
    access_token: business.googleCalendarTokens.accessToken,
    refresh_token: business.googleCalendarTokens.refreshToken,
    expiry_date: business.googleCalendarTokens.expiryDate?.getTime()
  });

  // Sprawdzenie czy token wygasł i odświeżenie jeśli potrzeba
  if (business.googleCalendarTokens.expiryDate && new Date() >= business.googleCalendarTokens.expiryDate) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    business.googleCalendarTokens = {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || business.googleCalendarTokens.refreshToken,
      expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null
    };
    await business.save();
    
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export async function POST(req) {
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

    // Pobranie autoryzowanego klienta
    const auth = await getAuthenticatedClient(decoded.id);
    const calendar = google.calendar({ version: 'v3', auth });

    // Pobranie biznesu
    const business = await Business.findById(decoded.id);
    if (!business) {
      return NextResponse.json({ error: "Biznes nie znaleziony" }, { status: 404 });
    }

    // Pobranie rezerwacji, które nie są jeszcze zsynchronizowane
    const reservations = await Reservation.find({
      businessId: decoded.id,
      status: { $in: ['pending', 'confirmed'] },
      googleCalendarSynced: { $ne: true }
    });

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const reservation of reservations) {
      try {
        const startDate = parseISO(`${format(new Date(reservation.date), 'yyyy-MM-dd')}T${reservation.time}`);
        const endDate = addMinutes(startDate, reservation.duration || 60);

        const event = {
          summary: `${reservation.service} - ${reservation.clientName}`,
          description: `Rezerwacja: ${reservation.service}\nKlient: ${reservation.clientName}\nTelefon: ${reservation.clientPhone}\nEmail: ${reservation.clientEmail}${reservation.notes ? `\nNotatki: ${reservation.notes}` : ''}`,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Europe/Warsaw',
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Europe/Warsaw',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 godziny wcześniej
              { method: 'popup', minutes: 60 }, // 1 godzina wcześniej
            ],
          },
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });

        // Zapisanie ID wydarzenia w rezerwacji
        reservation.googleCalendarEventId = response.data.id;
        reservation.googleCalendarSynced = true;
        reservation.googleCalendarSyncedAt = new Date();
        await reservation.save();

        created++;
      } catch (error) {
        console.error(`Błąd synchronizacji rezerwacji ${reservation._id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      errors,
      total: reservations.length
    });
  } catch (error) {
    console.error('Błąd synchronizacji z Google Calendar:', error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd podczas synchronizacji" },
      { status: 500 }
    );
  }
}






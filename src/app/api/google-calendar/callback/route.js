import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { connectDB } from '@/lib/mongodb';
import Business from '../../../models/Business';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-calendar/callback`
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // ID biznesu

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/business/calendar?error=auth_failed`);
    }

    // Wymiana kodu na tokeny
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    await connectDB();

    // Zapisanie tokenów w bazie danych
    const business = await Business.findById(state);
    if (!business) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/business/calendar?error=business_not_found`);
    }

    business.googleCalendarTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    };
    business.googleCalendarConnected = true;
    await business.save();

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/business/calendar?success=connected`);
  } catch (error) {
    console.error('Błąd callback Google Calendar:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/business/calendar?error=callback_failed`);
  }
}





import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Business from '../../../models/Business';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-calendar/callback`
);

export async function GET(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'business') {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    // Generate authorization URL
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: decoded.id, // Pass business ID in state
      prompt: 'consent'
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Błąd autoryzacji Google Calendar:', error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd podczas autoryzacji" },
      { status: 500 }
    );
  }
}








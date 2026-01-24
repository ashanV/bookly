import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/mongodb';
import { stripe } from '@/lib/stripe';
import Business from '../../../models/Business';

export async function POST(req) {
    try {
        // Get token from cookies
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Musisz być zalogowany' },
                { status: 401 }
            );
        }

        // Verify JWT token
        let decoded;
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);
            decoded = payload;
        } catch {
            return NextResponse.json(
                { error: 'Sesja wygasła' },
                { status: 401 }
            );
        }

        await connectDB();

        const business = await Business.findById(decoded.id);
        if (!business) {
            return NextResponse.json(
                { error: 'Nie znaleziono konta' },
                { status: 404 }
            );
        }

        const stripeCustomerId = business.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json(
                { error: 'Brak aktywnej subskrypcji' },
                { status: 400 }
            );
        }

        // Create Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/dashboard/settings`
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: error.message || 'Wystąpił błąd' },
            { status: 500 }
        );
    }
}

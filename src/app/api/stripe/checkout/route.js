import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/mongodb';
import { stripe, getPriceId, PLAN_NAMES } from '@/lib/stripe';
import Business from '../../../models/Business';

export async function POST(req) {
    try {
        // Get token from cookies
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Musisz być zalogowany', requiresLogin: true },
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
                { error: 'Sesja wygasła, zaloguj się ponownie', requiresLogin: true },
                { status: 401 }
            );
        }

        // Check if user is a business
        if (decoded.role !== 'business') {
            return NextResponse.json(
                { error: 'Tylko konta firmowe mogą wykupić subskrypcję' },
                { status: 403 }
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

        const { planId, billingCycle } = await req.json();

        if (!planId || !billingCycle) {
            return NextResponse.json(
                { error: 'Brak wymaganych parametrów' },
                { status: 400 }
            );
        }

        // Get or create Stripe customer
        let stripeCustomerId = business.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: business.email,
                name: business.companyName,
                metadata: {
                    businessId: business._id.toString()
                }
            });
            stripeCustomerId = customer.id;

            // Save customer ID to database
            await Business.findByIdAndUpdate(business._id, {
                'subscription.stripeCustomerId': stripeCustomerId
            });
        }

        // Get price ID for the selected plan
        const priceId = getPriceId(planId, billingCycle);
        const planName = PLAN_NAMES[planId];

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/pricing/cancel`,
            subscription_data: {
                trial_period_days: 14,
                metadata: {
                    businessId: business._id.toString(),
                    planId: planId,
                    planName: planName
                }
            },
            metadata: {
                businessId: business._id.toString(),
                planId: planId
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            locale: 'pl'
        });

        return NextResponse.json({
            url: session.url,
            sessionId: session.id
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Wystąpił błąd podczas tworzenia sesji płatności' },
            { status: 500 }
        );
    }
}

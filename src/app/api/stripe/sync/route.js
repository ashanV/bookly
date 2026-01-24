import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/mongodb';
import { stripe } from '@/lib/stripe';
import Business from '../../../models/Business';

/**
 * POST /api/stripe/sync
 * Syncs subscription status from Stripe to database
 * Called from success page after checkout completion
 */
export async function POST(req) {
    try {
        // Get token from cookies
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify JWT token
        let decoded;
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);
            decoded = payload;
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        await connectDB();

        const business = await Business.findById(decoded.id);
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Retrieve checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription']
        });

        // Verify this session belongs to this business
        if (session.metadata?.businessId !== business._id.toString()) {
            return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
        }

        // Get subscription details
        const subscription = session.subscription;
        if (!subscription) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
        }

        // Determine plan from metadata or price
        const planId = session.metadata?.planId || 'professional';

        // Update business subscription
        await Business.findByIdAndUpdate(business._id, {
            'subscription.stripeCustomerId': session.customer,
            'subscription.stripeSubscriptionId': subscription.id,
            'subscription.plan': planId,
            'subscription.status': subscription.status === 'trialing' ? 'trialing' : 'active',
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
        });

        console.log(`✅ Subscription synced for business ${business._id}, plan: ${planId}`);

        return NextResponse.json({
            success: true,
            plan: planId,
            status: subscription.status
        });
    } catch (error) {
        console.error('Sync subscription error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to sync subscription' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/mongodb';
import Business from '../../../models/Business';

// Disable body parsing, we need raw body for webhook signature verification
export const dynamic = 'force-dynamic';

export async function POST(req) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    // For testing without webhook secret, skip verification
    // In production, set STRIPE_WEBHOOK_SECRET in .env.local
    let event;

    if (process.env.STRIPE_WEBHOOK_SECRET) {
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json(
                { error: `Webhook Error: ${err.message}` },
                { status: 400 }
            );
        }
    } else {
        // For testing - parse event directly (NOT SECURE FOR PRODUCTION)
        try {
            event = JSON.parse(body);
            console.warn('⚠️ Webhook running without signature verification (test mode)');
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid JSON' },
                { status: 400 }
            );
        }
    }

    await connectDB();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const businessId = session.metadata?.businessId;
                const planId = session.metadata?.planId;

                if (businessId && session.subscription) {
                    // Get subscription details
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);

                    await Business.findByIdAndUpdate(businessId, {
                        'subscription.stripeSubscriptionId': subscription.id,
                        'subscription.stripeCustomerId': session.customer,
                        'subscription.plan': planId || 'professional',
                        'subscription.status': subscription.status === 'trialing' ? 'trialing' : 'active',
                        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
                    });

                    console.log(`✅ Subscription activated for business ${businessId}, plan: ${planId}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                // Find business by Stripe customer ID
                const business = await Business.findOne({
                    'subscription.stripeCustomerId': customerId
                });

                if (business) {
                    let status = subscription.status;
                    if (status === 'trialing') status = 'trialing';
                    else if (status === 'active') status = 'active';
                    else if (status === 'past_due') status = 'past_due';
                    else if (status === 'canceled' || status === 'unpaid') status = 'canceled';

                    await Business.findByIdAndUpdate(business._id, {
                        'subscription.status': status,
                        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
                    });

                    console.log(`📝 Subscription updated for business ${business._id}, status: ${status}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                const business = await Business.findOne({
                    'subscription.stripeCustomerId': customerId
                });

                if (business) {
                    await Business.findByIdAndUpdate(business._id, {
                        'subscription.status': 'canceled',
                        'subscription.plan': 'free',
                        'subscription.stripeSubscriptionId': null,
                        'subscription.cancelAtPeriodEnd': false
                    });

                    console.log(`❌ Subscription canceled for business ${business._id}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = invoice.customer;

                const business = await Business.findOne({
                    'subscription.stripeCustomerId': customerId
                });

                if (business) {
                    await Business.findByIdAndUpdate(business._id, {
                        'subscription.status': 'past_due'
                    });

                    console.log(`⚠️ Payment failed for business ${business._id}`);
                    // TODO: Send email notification about failed payment
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

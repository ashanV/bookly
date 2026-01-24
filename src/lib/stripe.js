import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY, {
    apiVersion: '2024-12-18.acacia'
});

// Price IDs mapping - te ID należy uzupełnić po utworzeniu produktów w Stripe Dashboard
// Przejdź do Products -> kliknij produkt -> skopiuj Price ID
export const PRICE_IDS = {
    starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
        yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly'
    },
    professional: {
        monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || 'price_professional_monthly',
        yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || 'price_professional_yearly'
    },
    enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly'
    }
};

// Plan names mapping for display
export const PLAN_NAMES = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
};

// Helper to get price ID by plan and billing cycle
export function getPriceId(planId, billingCycle) {
    const plan = PRICE_IDS[planId];
    if (!plan) {
        throw new Error(`Unknown plan: ${planId}`);
    }
    return plan[billingCycle] || plan.monthly;
}

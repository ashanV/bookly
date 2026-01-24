/**
 * Subscription Plan Limits & Feature Access
 * 
 * This file defines limits and available features for each subscription plan.
 * Use these functions to check permissions in API routes and UI components.
 */

// Plan limits definition
export const PLAN_LIMITS = {
    free: {
        // Quantity limits
        staff: 1,
        bookingsPerMonth: 10,
        locations: 1,
        services: 5,

        // Basic features
        onlineCalendar: true,
        basicReports: true,
        emailNotifications: true,

        // Premium features - unavailable
        smsNotifications: false,
        smsMarketing: false,
        emailMarketing: false,
        onlinePayments: false,
        advancedReports: false,
        crm: false,
        googleCalendarSync: false,
        zoomIntegration: false,
        apiAccess: false,
        customIntegrations: false,
        whiteLabel: false,
        loyaltyProgram: false,
        marketingAutomation: false,
        prioritySupport: false,
        dedicatedManager: false,
        teamTraining: false
    },

    starter: {
        // Quantity limits
        staff: 2,
        bookingsPerMonth: 100,
        locations: 1,
        services: 20,

        // Basic features
        onlineCalendar: true,
        basicReports: true,
        emailNotifications: true,
        smsNotifications: true,
        onlinePayments: true,
        googleCalendarSync: true,

        // Unavailable in Starter
        smsMarketing: false,
        emailMarketing: false,
        advancedReports: false,
        crm: false,
        zoomIntegration: false,
        apiAccess: false,
        customIntegrations: false,
        whiteLabel: false,
        loyaltyProgram: false,
        marketingAutomation: false,
        prioritySupport: false,
        dedicatedManager: false,
        teamTraining: false
    },

    professional: {
        // Quantity limits
        staff: 10,
        bookingsPerMonth: Infinity, // Unlimited
        locations: 3,
        services: Infinity,

        // All Professional features
        onlineCalendar: true,
        basicReports: true,
        emailNotifications: true,
        smsNotifications: true,
        onlinePayments: true,
        googleCalendarSync: true,
        advancedReports: true,
        crm: true,
        smsMarketing: true,
        emailMarketing: true,
        zoomIntegration: true,
        loyaltyProgram: true,
        marketingAutomation: true,
        prioritySupport: true,
        apiAccess: 'limited', // Limited access

        // Unavailable in Professional
        customIntegrations: false,
        whiteLabel: false,
        dedicatedManager: false,
        teamTraining: false
    },

    enterprise: {
        // Quantity limits - all unlimited
        staff: Infinity,
        bookingsPerMonth: Infinity,
        locations: Infinity,
        services: Infinity,

        // All features available
        onlineCalendar: true,
        basicReports: true,
        emailNotifications: true,
        smsNotifications: true,
        onlinePayments: true,
        googleCalendarSync: true,
        advancedReports: true,
        crm: true,
        smsMarketing: true,
        emailMarketing: true,
        zoomIntegration: true,
        loyaltyProgram: true,
        marketingAutomation: true,
        prioritySupport: true,
        apiAccess: 'full',
        customIntegrations: true,
        whiteLabel: true,
        dedicatedManager: true,
        teamTraining: true
    }
};

// Plan names in Polish (for UI display)
export const PLAN_NAMES = {
    free: 'Darmowy',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
};

/**
 * Gets the current plan for a business (defaults to 'free')
 * @param {Object} business - The business object from database
 * @returns {string} - Plan name: 'free', 'starter', 'professional', or 'enterprise'
 */
export function getCurrentPlan(business) {
    const subscription = business?.subscription;

    // Check if subscription is active
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
        return 'free';
    }

    return subscription.plan || 'free';
}

/**
 * Gets the limits configuration for a business based on their plan
 * @param {Object} business - The business object from database
 * @returns {Object} - Plan limits object
 */
export function getPlanLimits(business) {
    const plan = getCurrentPlan(business);
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

/**
 * Checks if a business can add more employees
 * @param {Object} business - The business object from database
 * @param {number} currentCount - Current number of employees
 * @returns {boolean} - True if can add more employees
 */
export function canAddEmployee(business, currentCount) {
    const limits = getPlanLimits(business);
    return currentCount < limits.staff;
}

/**
 * Checks if a business can add more locations
 * @param {Object} business - The business object from database
 * @param {number} currentCount - Current number of locations
 * @returns {boolean} - True if can add more locations
 */
export function canAddLocation(business, currentCount) {
    const limits = getPlanLimits(business);
    return currentCount < limits.locations;
}

/**
 * Checks if a business can create more bookings this month
 * @param {Object} business - The business object from database
 * @param {number} monthlyCount - Number of bookings created this month
 * @returns {boolean} - True if can create more bookings
 */
export function canCreateBooking(business, monthlyCount) {
    const limits = getPlanLimits(business);
    return monthlyCount < limits.bookingsPerMonth;
}

/**
 * Checks if a business can add more services
 * @param {Object} business - The business object from database
 * @param {number} currentCount - Current number of services
 * @returns {boolean} - True if can add more services
 */
export function canAddService(business, currentCount) {
    const limits = getPlanLimits(business);
    return currentCount < limits.services;
}

/**
 * Checks if a business has access to a specific feature
 * @param {Object} business - The business object from database
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - True if feature is available
 */
export function hasFeature(business, featureName) {
    const limits = getPlanLimits(business);
    const value = limits[featureName];

    // For boolean - return directly
    if (typeof value === 'boolean') {
        return value;
    }

    // For string (e.g., 'limited', 'full') - return true if not undefined/null
    return value != null;
}

/**
 * Gets the API access level for a business
 * @param {Object} business - The business object from database
 * @returns {string|boolean} - 'full', 'limited', or false
 */
export function getApiAccessLevel(business) {
    const limits = getPlanLimits(business);
    return limits.apiAccess || false;
}

/**
 * Returns information about remaining limits
 * @param {Object} business - The business object from database
 * @param {Object} usage - Current usage counts { staff, bookings, locations, services }
 * @returns {Object} - Remaining limits for each resource
 */
export function getRemainingLimits(business, usage = {}) {
    const limits = getPlanLimits(business);

    return {
        staff: limits.staff === Infinity ? 'Unlimited' : Math.max(0, limits.staff - (usage.staff || 0)),
        bookings: limits.bookingsPerMonth === Infinity ? 'Unlimited' : Math.max(0, limits.bookingsPerMonth - (usage.bookings || 0)),
        locations: limits.locations === Infinity ? 'Unlimited' : Math.max(0, limits.locations - (usage.locations || 0)),
        services: limits.services === Infinity ? 'Unlimited' : Math.max(0, limits.services - (usage.services || 0))
    };
}

/**
 * Checks if subscription is active (paid or trial)
 * @param {Object} business - The business object from database
 * @returns {boolean} - True if subscription is active
 */
export function hasActiveSubscription(business) {
    const status = business?.subscription?.status;
    return ['active', 'trialing'].includes(status);
}

/**
 * Checks if subscription is in trial period
 * @param {Object} business - The business object from database
 * @returns {boolean} - True if in trial
 */
export function isTrialing(business) {
    return business?.subscription?.status === 'trialing';
}

/**
 * Checks if payment is past due
 * @param {Object} business - The business object from database
 * @returns {boolean} - True if payment is overdue
 */
export function isPastDue(business) {
    return business?.subscription?.status === 'past_due';
}

/**
 * Returns a localized error message for reaching a limit
 * @param {string} limitType - Type of limit: 'staff', 'bookings', 'locations', 'services'
 * @param {Object} business - The business object from database
 * @returns {string} - Error message in Polish
 */
export function getLimitErrorMessage(limitType, business) {
    const plan = getCurrentPlan(business);
    const planName = PLAN_NAMES[plan];

    const messages = {
        staff: `Osiągnięto limit pracowników dla planu ${planName}. Ulepsz plan, aby dodać więcej.`,
        bookings: `Osiągnięto miesięczny limit rezerwacji dla planu ${planName}. Ulepsz plan, aby kontynuować.`,
        locations: `Osiągnięto limit lokalizacji dla planu ${planName}. Ulepsz plan, aby dodać więcej.`,
        services: `Osiągnięto limit usług dla planu ${planName}. Ulepsz plan, aby dodać więcej.`
    };

    return messages[limitType] || 'Osiągnięto limit dla Twojego planu.';
}

/**
 * Returns a localized error message for unavailable feature
 * @param {string} featureName - Name of the feature
 * @param {Object} business - The business object from database
 * @returns {string} - Error message in Polish
 */
export function getFeatureErrorMessage(featureName, business) {
    const plan = getCurrentPlan(business);
    const planName = PLAN_NAMES[plan];

    return `Funkcja "${featureName}" nie jest dostępna w planie ${planName}. Ulepsz plan, aby odblokować.`;
}

// Store for rate limit data: Map<key, { count: number, resetTime: number }>
const rateLimitStore = new Map();

// Cleanup expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (data.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, CLEANUP_INTERVAL);

/**
 * Rate limit configurations for different endpoint types
 */
export const rateLimitConfigs = {
    login: {
        limit: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    register: {
        limit: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    changePassword: {
        limit: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    contact: {
        limit: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
    default: {
        limit: 100,
        windowMs: 60 * 1000, // 1 minute
    },
};

/**
 * Get client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIp(request) {
    // Check X-Forwarded-For header (common for proxies/load balancers)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP (original client)
        return forwardedFor.split(',')[0].trim();
    }

    // Check X-Real-IP header
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to connection remote address (may not work in all environments)
    return 'unknown';
}

/**
 * Check if a request is rate limited
 * @param {Request} request - The incoming request
 * @param {string} endpointType - Type of endpoint (login, register, contact, etc.)
 * @returns {{ success: boolean, remaining: number, resetIn: number }} Rate limit result
 */
export function checkRateLimit(request, endpointType = 'default') {
    const config = rateLimitConfigs[endpointType] || rateLimitConfigs.default;
    const ip = getClientIp(request);
    const key = `${endpointType}:${ip}`;
    const now = Date.now();

    const data = rateLimitStore.get(key);

    if (!data || data.resetTime < now) {
        // First request or window has expired
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            success: true,
            remaining: config.limit - 1,
            resetIn: config.windowMs,
        };
    }

    if (data.count >= config.limit) {
        // Rate limit exceeded
        return {
            success: false,
            remaining: 0,
            resetIn: data.resetTime - now,
        };
    }

    // Increment counter
    data.count++;
    rateLimitStore.set(key, data);

    return {
        success: true,
        remaining: config.limit - data.count,
        resetIn: data.resetTime - now,
    };
}

/**
 * Create a rate limit response with proper headers
 * @param {number} resetIn - Time until rate limit resets (ms)
 * @returns {Response} 429 Too Many Requests response
 */
export function rateLimitResponse(resetIn) {
    const retryAfter = Math.ceil(resetIn / 1000);
    const minutes = Math.ceil(retryAfter / 60);

    return new Response(
        JSON.stringify({
            error: `Zbyt wiele żądań. Spróbuj ponownie za ${minutes} minut.`,
            retryAfter: retryAfter,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(retryAfter),
                'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfter),
            },
        }
    );
}

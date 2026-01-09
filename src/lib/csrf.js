import { randomBytes } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken() {
    return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Validate CSRF token from request
 * Compares token from header with token from cookie
 */
export function validateCsrfToken(request) {
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = request.headers.get(CSRF_HEADER_NAME);

    if (!cookieToken || !headerToken) {
        console.warn('CSRF Validation Failed: Missing token.', {
            hasCookie: !!cookieToken,
            hasHeader: !!headerToken
        });
        return {
            valid: false,
            error: 'Missing CSRF token'
        };
    }

    // Timing-safe comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
        console.warn('CSRF Validation Failed: Length mismatch.', {
            cookieLen: cookieToken.length,
            headerLen: headerToken.length
        });
        return {
            valid: false,
            error: 'Invalid CSRF token'
        };
    }

    // Simple timing-safe comparison
    let isValid = true;
    for (let i = 0; i < cookieToken.length; i++) {
        if (cookieToken[i] !== headerToken[i]) {
            isValid = false;
        }
    }

    if (!isValid) {
        console.warn('CSRF Validation Failed: Token mismatch.');
        return {
            valid: false,
            error: 'Invalid CSRF token'
        };
    }

    return { valid: true };
}

/**
 * Create CSRF token cookie options
 */
export function getCsrfCookieOptions(isProduction = process.env.NODE_ENV === 'production') {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    };
}

/**
 * Middleware helper to validate CSRF for API routes
 * Returns null if valid, or NextResponse with error if invalid
 */
export async function csrfMiddleware(request) {
    // Skip CSRF check for GET, HEAD, OPTIONS requests (safe methods)
    const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    if (safeMethod) {
        return null;
    }

    const validation = validateCsrfToken(request);
    if (!validation.valid) {
        return {
            error: validation.error,
            status: 403
        };
    }

    return null;
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };

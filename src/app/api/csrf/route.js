import { NextResponse } from 'next/server';
import { generateCsrfToken, getCsrfCookieOptions, CSRF_COOKIE_NAME } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Generates a new CSRF token and sets it in a cookie
 * Returns the token for use in X-CSRF-Token header
 */
export async function GET(request) {
    try {
        const token = generateCsrfToken();
        const cookieOptions = getCsrfCookieOptions();

        const response = NextResponse.json({
            csrfToken: token
        });

        // Set the CSRF token cookie
        response.cookies.set(CSRF_COOKIE_NAME, token, cookieOptions);

        return response;
    } catch (error) {
        console.error('Error generating CSRF token:', error);
        return NextResponse.json(
            { error: 'Failed to generate CSRF token' },
            { status: 500 }
        );
    }
}

'use client';

import { useState, useEffect, useCallback } from 'react';

const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Hook to manage CSRF tokens for secure form submissions
 * Fetches a token on mount and provides a secureFetch function
 */
export function useCsrf() {
    const [csrfToken, setCsrfToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchToken = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/csrf', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            setCsrfToken(data.csrfToken);
        } catch (err) {
            console.error('Failed to fetch CSRF token:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchToken();
    }, [fetchToken]);

    /**
     * Wrapper around fetch that automatically includes CSRF token
     * Use this for POST, PUT, DELETE requests
     */
    const secureFetch = useCallback(async (url, options = {}, tryCount = 0) => {
        // Ensure we have a token before making the request
        let tokenToUse = csrfToken;

        if (!tokenToUse) {
            // Try to fetch a new token if we don't have one
            const tokenResponse = await fetch('/api/csrf', { credentials: 'include' });
            if (tokenResponse.ok) {
                const data = await tokenResponse.json();
                tokenToUse = data.csrfToken;
                setCsrfToken(tokenToUse);
            }
        }

        const headers = new Headers(options.headers || {});

        // Zawsze używamy małych liter dla spójności, choć fetch i tak je normalizuje
        const HEADER_NAME = 'x-csrf-token';

        if (tokenToUse) {
            headers.set(HEADER_NAME, tokenToUse);
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: options.credentials || 'include'
        });

        // If we get a 403 Forbidden, it might be an invalid CSRF token
        // Try refreshing the token and retrying the request once
        if (response.status === 403 && tryCount < 1) {
            console.log('CSRF error (403) detected, refreshing token and retrying...');
            const tokenResponse = await fetch('/api/csrf', { credentials: 'include' });
            if (tokenResponse.ok) {
                const data = await tokenResponse.json();
                const newToken = data.csrfToken;
                setCsrfToken(newToken);

                // Retry with the NEW token immediately, don't rely on state update
                const retryHeaders = new Headers(options.headers || {});
                retryHeaders.set('x-csrf-token', newToken);

                return fetch(url, {
                    ...options,
                    headers: retryHeaders,
                    credentials: options.credentials || 'include'
                });
            }
        }

        return response;
    }, [csrfToken]);

    return {
        csrfToken,
        isLoading,
        error,
        refreshToken: fetchToken,
        secureFetch
    };
}

/**
 * Simple utility to get CSRF token for one-off requests
 * Returns the token string
 */
export async function getCsrfToken() {
    try {
        const response = await fetch('/api/csrf', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        return null;
    }
}

/**
 * Utility function for making secure POST/PUT/DELETE requests
 * Automatically fetches and includes CSRF token
 */
export async function secureFetch(url, options = {}) {
    const csrfToken = await getCsrfToken();
    const headers = new Headers(options.headers || {});
    const HEADER_NAME = 'x-csrf-token';

    if (csrfToken) {
        headers.set(HEADER_NAME, csrfToken);
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || 'include'
    });
}

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
    const secureFetch = useCallback(async (url, options = {}) => {
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

        if (tokenToUse) {
            headers.set(CSRF_HEADER_NAME, tokenToUse);
        }

        return fetch(url, {
            ...options,
            headers,
            credentials: options.credentials || 'include'
        });
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

    if (csrfToken) {
        headers.set(CSRF_HEADER_NAME, csrfToken);
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || 'include'
    });
}

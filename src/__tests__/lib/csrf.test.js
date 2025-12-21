import { describe, it, expect } from 'vitest';
import { generateCsrfToken, validateCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf';

describe('CSRF Library', () => {
    describe('generateCsrfToken', () => {
        it('should generate a token of correct length', () => {
            const token = generateCsrfToken();
            expect(token).toBeDefined();
            // 32 bytes hex encoded = 64 characters
            expect(token.length).toBe(64);
        });

        it('should generate random tokens', () => {
            const token1 = generateCsrfToken();
            const token2 = generateCsrfToken();
            expect(token1).not.toBe(token2);
        });
    });

    describe('validateCsrfToken', () => {
        const createMockRequest = (cookieValue, headerValue) => {
            return {
                cookies: {
                    get: (name) => name === CSRF_COOKIE_NAME ? { value: cookieValue } : undefined
                },
                headers: {
                    get: (name) => name === CSRF_HEADER_NAME ? headerValue : undefined
                }
            };
        };

        it('should return valid true for matching tokens', () => {
            const token = 'valid-token';
            const req = createMockRequest(token, token);
            const result = validateCsrfToken(req);
            expect(result.valid).toBe(true);
        });

        it('should fail if cookie token is missing', () => {
            const req = createMockRequest(undefined, 'token');
            const result = validateCsrfToken(req);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Missing CSRF token');
        });

        it('should fail if header token is missing', () => {
            const req = createMockRequest('token', undefined);
            const result = validateCsrfToken(req);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Missing CSRF token');
        });

        it('should fail if tokens do not match', () => {
            const req = createMockRequest('token-a', 'token-b');
            const result = validateCsrfToken(req);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid CSRF token');
        });

        it('should fail if lengths mismatch', () => {
            const req = createMockRequest('short', 'longer-token');
            const result = validateCsrfToken(req);
            expect(result.valid).toBe(false);
        });
    });
});

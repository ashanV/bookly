import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, getClientIp, rateLimitConfigs } from '@/lib/rateLimit';

describe('Rate Limit Library', () => {
    let mockRequest;
    let counter = 0;

    beforeEach(() => {
        // Reset time before each test
        vi.useFakeTimers();
        counter++;
        const ip = `127.0.0.${counter}`;
        mockRequest = {
            headers: {
                get: vi.fn((key) => {
                    if (key === 'x-forwarded-for') return ip;
                    return null;
                }),
            },
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('getClientIp', () => {
        it('should extract IP from x-forwarded-for', () => {
            expect(getClientIp(mockRequest)).toBe('127.0.0.1');
        });

        it('should handle comma separated IPs in x-forwarded-for', () => {
            mockRequest.headers.get.mockReturnValue('10.0.0.1, 192.168.1.1');
            expect(getClientIp(mockRequest)).toBe('10.0.0.1');
        });

        it('should fallback to unknown if no headers', () => {
            mockRequest.headers.get.mockReturnValue(null);
            expect(getClientIp(mockRequest)).toBe('unknown');
        });
    });

    describe('checkRateLimit', () => {
        it('should allow first request', () => {
            const result = checkRateLimit(mockRequest, 'default');
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(rateLimitConfigs.default.limit - 1);
        });

        it('should decrease remaining requests', () => {
            checkRateLimit(mockRequest, 'default'); // 1
            const result = checkRateLimit(mockRequest, 'default'); // 2
            expect(result.remaining).toBe(rateLimitConfigs.default.limit - 2);
        });

        it('should block requests when limit exceeded', () => {
            const limit = rateLimitConfigs.default.limit;
            // Exhaust limit
            for (let i = 0; i < limit; i++) {
                checkRateLimit(mockRequest, 'default');
            }

            // Next request should fail
            const result = checkRateLimit(mockRequest, 'default');
            expect(result.success).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should reset limit after window expires', () => {
            // Use a short fake window for testing or rely on the implemented config
            const config = rateLimitConfigs.default;

            // Exhaust limit
            for (let i = 0; i < config.limit; i++) {
                checkRateLimit(mockRequest, 'default');
            }

            expect(checkRateLimit(mockRequest, 'default').success).toBe(false);

            // Advance time past window
            vi.advanceTimersByTime(config.windowMs + 100);

            // Should be allowed again
            const result = checkRateLimit(mockRequest, 'default');
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(config.limit - 1);
        });

        it('should differentiate between IPs', () => {
            // Request from IP 1
            checkRateLimit(mockRequest, 'default');

            // Request from IP 2
            const mockRequest2 = {
                headers: {
                    get: () => '192.168.0.1'
                }
            };
            const result2 = checkRateLimit(mockRequest2, 'default');

            // Should be fresh for new IP
            expect(result2.remaining).toBe(rateLimitConfigs.default.limit - 1);
        });
    });
});

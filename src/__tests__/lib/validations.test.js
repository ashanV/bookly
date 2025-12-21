import { describe, it, expect } from 'vitest';
import { emailSchema, passwordSchema, validateInput } from '@/lib/validations';

describe('Validations', () => {
    describe('emailSchema', () => {
        it('should validate a correct email', () => {
            const result = emailSchema.safeParse('test@example.com');
            expect(result.success).toBe(true);
        });

        it('should reject an invalid email', () => {
            const result = emailSchema.safeParse('invalid-email');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe('Nieprawidłowy format email');
            }
        });
    });

    describe('passwordSchema', () => {
        it('should validate a strong password', () => {
            const result = passwordSchema.safeParse('StrongPass1!');
            expect(result.success).toBe(true);
        });

        it('should reject a short password', () => {
            const result = passwordSchema.safeParse('Short1!');
            expect(result.success).toBe(false);
        });

        it('should reject a password without uppercase', () => {
            const result = passwordSchema.safeParse('weakpass1!');
            expect(result.success).toBe(false);
        });
    });

    describe('validateInput', () => {
        it('should return success for valid input', () => {
            const result = validateInput(emailSchema, 'test@example.com');
            expect(result).toEqual({ success: true, data: 'test@example.com' });
        });

        it('should return formatted errors for invalid input', () => {
            const result = validateInput(emailSchema, 'invalid-email');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Nieprawidłowy format email');
            expect(result.errors).toHaveLength(1);
        });
    });
});

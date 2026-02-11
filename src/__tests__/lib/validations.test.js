import { describe, it, expect } from 'vitest';
import {
    emailSchema,
    passwordSchema,
    validateInput,
    adminLoginSchema,
    adminRoleSchema,
    adminUserUpdateSchema,
    createClientSchema
} from '@/lib/validations';

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

    describe('adminLoginSchema', () => {
        it('should validate correct admin login data', () => {
            const result = validateInput(adminLoginSchema, {
                email: 'admin@example.com',
                password: 'secret',
                pin: '123456',
            });
            expect(result.success).toBe(true);
        });

        it('should reject missing pin', () => {
            const result = validateInput(adminLoginSchema, {
                email: 'admin@example.com',
                password: 'secret',
            });
            expect(result.success).toBe(false);
        });

        it('should reject non-6-digit pin', () => {
            const result = validateInput(adminLoginSchema, {
                email: 'admin@example.com',
                password: 'secret',
                pin: '12345',
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('PIN musi składać się z 6 cyfr');
        });

        it('should reject invalid email', () => {
            const result = validateInput(adminLoginSchema, {
                email: 'not-an-email',
                password: 'secret',
                pin: '123456',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('adminRoleSchema', () => {
        it('should validate correct role assignment', () => {
            const result = validateInput(adminRoleSchema, {
                email: 'user@example.com',
                role: 'moderator',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid role', () => {
            const result = validateInput(adminRoleSchema, {
                email: 'user@example.com',
                role: 'superadmin',
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Nieprawidłowa rola');
        });

        it('should reject missing email', () => {
            const result = validateInput(adminRoleSchema, { role: 'admin' });
            expect(result.success).toBe(false);
        });
    });

    describe('adminUserUpdateSchema', () => {
        it('should validate partial update with firstName only', () => {
            const result = validateInput(adminUserUpdateSchema, { firstName: 'Jan' });
            expect(result.success).toBe(true);
        });

        it('should reject empty firstName', () => {
            const result = validateInput(adminUserUpdateSchema, { firstName: '' });
            expect(result.success).toBe(false);
        });

        it('should validate boolean fields', () => {
            const result = validateInput(adminUserUpdateSchema, {
                isActive: false,
                forcePasswordReset: true,
            });
            expect(result.success).toBe(true);
        });

        it('should reject too-short newPassword', () => {
            const result = validateInput(adminUserUpdateSchema, { newPassword: '123' });
            expect(result.success).toBe(false);
        });
    });

    describe('createClientSchema', () => {
        it('should validate correct client data', () => {
            const result = validateInput(createClientSchema, {
                businessId: 'biz123',
                firstName: 'Anna',
                lastName: 'Kowalska',
            });
            expect(result.success).toBe(true);
        });

        it('should reject missing businessId', () => {
            const result = validateInput(createClientSchema, {
                firstName: 'Anna',
                lastName: 'Kowalska',
            });
            expect(result.success).toBe(false);
        });

        it('should reject missing firstName', () => {
            const result = validateInput(createClientSchema, {
                businessId: 'biz123',
                lastName: 'Kowalska',
            });
            expect(result.success).toBe(false);
        });

        it('should allow empty email string', () => {
            const result = validateInput(createClientSchema, {
                businessId: 'biz123',
                firstName: 'Anna',
                lastName: 'Kowalska',
                email: '',
            });
            expect(result.success).toBe(true);
        });
    });
});

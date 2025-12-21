import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '@/lib/crypto';

// Setup environment variable for testing
process.env.ENCRYPTION_KEY = 'test-secret-key-must-be-long-enough';

describe('Crypto Library', () => {
    describe('encrypt', () => {
        it('should encrypt text correctly', () => {
            const original = 'secret-message';
            const encrypted = encrypt(original);

            expect(encrypted).not.toBe(original);
            expect(encrypted).toContain(':'); // IV and content separator
        });

        it('should return null/undefined/empty as is', () => {
            expect(encrypt('')).toBe('');
            expect(encrypt(null)).toBe(null);
            expect(encrypt(undefined)).toBe(undefined);
        });

        it('should return different outputs for same input (random IV)', () => {
            const text = 'same-text';
            const enc1 = encrypt(text);
            const enc2 = encrypt(text);
            expect(enc1).not.toBe(enc2);
        });
    });

    describe('decrypt', () => {
        it('should decrypt encrypted text correctly', () => {
            const original = 'my-super-secret';
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(original);
        });

        it('should return original text if format is invalid (fallback)', () => {
            const invalid = 'not-encrypted';
            // Mock console.error to avoid noise in test output
            // const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = decrypt(invalid);
            expect(result).toBe(invalid);
            // consoleSpy.mockRestore();
        });

        it('should return null/undefined/empty as is', () => {
            expect(decrypt('')).toBe('');
            expect(decrypt(null)).toBe(null);
        });
    });

    describe('Integration (Round Trip)', () => {
        it('should successfully encrypt and decrypt complex strings', () => {
            const complex = 'Complex String with symbols! @#$%^&*()';
            expect(decrypt(encrypt(complex))).toBe(complex);
        });
    });
});

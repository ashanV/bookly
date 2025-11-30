import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Helper to get a 32-byte key from the environment variable
const getKey = () => {
    const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-secret-key-change-me';
    return crypto.createHash('sha256').update(String(key)).digest();
};

export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = getKey();
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // Return original if encryption fails (fallback)
    }
};

export const decrypt = (text) => {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) return text; // Not encrypted or invalid format

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const key = getKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return text; // Return original if decryption fails
    }
};

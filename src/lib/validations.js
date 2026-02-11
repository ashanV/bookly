import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z.string()
    .email('Nieprawidłowy format email')
    .min(1, 'Email jest wymagany');

export const passwordSchema = z.string()
    .min(8, 'Hasło musi mieć minimum 8 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać dużą literę')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Hasło musi zawierać znak specjalny');

export const phoneSchema = z.string()
    .regex(/^\+?[0-9\s\-\(\)]{9,}$/, 'Nieprawidłowy format numeru telefonu')
    .optional();

export const postalCodeSchema = z.string()
    .regex(/^\d{2}-\d{3}$/, 'Nieprawidłowy kod pocztowy (format: XX-XXX)');

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Hasło jest wymagane'),
});

export const registerSchema = z.object({
    firstName: z.string().min(2, 'Imię musi mieć minimum 2 znaki'),
    lastName: z.string().min(2, 'Nazwisko musi mieć minimum 2 znaki'),
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    birthDate: z.string().optional(),
});

export const registerBusinessSchema = z.object({
    companyName: z.string().min(2, 'Nazwa firmy musi mieć minimum 2 znaki'),
    companyType: z.string().min(1, 'Typ firmy jest wymagany'),
    category: z.string().min(1, 'Kategoria jest wymagana'),
    description: z.string().optional(),
    firstName: z.string().min(2, 'Imię musi mieć minimum 2 znaki'),
    lastName: z.string().min(2, 'Nazwisko musi mieć minimum 2 znaki'),
    email: emailSchema,
    password: passwordSchema,
    phone: z.string().regex(/^\+?[0-9\s\-\(\)]{9,}$/, 'Nieprawidłowy numer telefonu'),
    city: z.string().min(2, 'Miasto jest wymagane'),
    address: z.string().min(5, 'Adres jest wymagany'),
    postalCode: postalCodeSchema,
    services: z.array(z.any()).min(1, 'Wybierz przynajmniej jedną usługę'),
    workingHours: z.record(z.any()).optional(),
    pricing: z.string().optional(),
    teamSize: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    newsletter: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Aktualne hasło jest wymagane'),
    newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
    firstName: z.string().min(2, 'Imię musi mieć minimum 2 znaki').optional(),
    lastName: z.string().min(2, 'Nazwisko musi mieć minimum 2 znaki').optional(),
    email: emailSchema.optional(),
    phone: phoneSchema,
    birthDate: z.string().optional(),
});

// ============================================
// Reservation Schemas
// ============================================

export const createReservationSchema = z.object({
    businessId: z.string().min(1, 'ID biznesu jest wymagane'),
    employeeId: z.string().optional(),
    service: z.string().min(1, 'Usługa jest wymagana'),
    serviceId: z.string().optional(),
    date: z.string().min(1, 'Data jest wymagana'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Nieprawidłowy format godziny'),
    duration: z.number().min(15, 'Minimalny czas to 15 minut'),
    price: z.number().min(0, 'Cena nie może być ujemna'),
    clientName: z.string().min(2, 'Imię klienta jest wymagane'),
    clientEmail: emailSchema,
    clientPhone: z.string().regex(/^\+?[0-9\s\-\(\)]{9,}$/, 'Nieprawidłowy numer telefonu'),
    notes: z.string().optional(),
});

export const updateReservationSchema = z.object({
    reservationId: z.string().min(1, 'ID rezerwacji jest wymagane'),
    service: z.string().optional(),
    date: z.string().optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Nieprawidłowy format').optional(),
    duration: z.number().min(15).optional(),
    price: z.number().min(0).optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    notes: z.string().optional(),
});

// ============================================
// Contact Schema
// ============================================

export const contactSchema = z.object({
    name: z.string().min(2, 'Imię i nazwisko jest wymagane'),
    email: emailSchema,
    company: z.string().optional(),
    phone: phoneSchema,
    businessType: z.string().optional(),
    subject: z.string().min(3, 'Temat jest wymagany'),
    message: z.string().min(10, 'Wiadomość musi mieć minimum 10 znaków'),
});

// ============================================
// Admin Schemas
// ============================================

export const adminLoginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Hasło jest wymagane'),
    pin: z.string().regex(/^\d{6}$/, 'PIN musi składać się z 6 cyfr'),
});

export const adminRoleSchema = z.object({
    email: emailSchema,
    role: z.enum(['admin', 'moderator', 'developer'], {
        errorMap: () => ({ message: 'Nieprawidłowa rola' }),
    }),
});

export const adminUserUpdateSchema = z.object({
    firstName: z.string().min(1, 'Imię nie może być puste').optional(),
    lastName: z.string().min(1, 'Nazwisko nie może być puste').optional(),
    email: emailSchema.optional(),
    phone: phoneSchema,
    birthDate: z.string().optional(),
    isActive: z.boolean().optional(),
    adminRole: z.string().optional(),
    forcePasswordReset: z.boolean().optional(),
    newPassword: z.string().min(6, 'Hasło musi mieć minimum 6 znaków').optional(),
    blockReason: z.string().optional(),
    invalidateSessions: z.boolean().optional(),
});

// ============================================
// Client Schema
// ============================================

export const createClientSchema = z.object({
    businessId: z.string().min(1, 'ID biznesu jest wymagane'),
    firstName: z.string().min(1, 'Imię jest wymagane'),
    lastName: z.string().min(1, 'Nazwisko jest wymagane'),
    email: z.string().email('Nieprawidłowy format email').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    phonePrefix: z.string().optional(),
    birthDate: z.string().optional().or(z.literal('')),
    birthYear: z.string().optional().or(z.literal('')),
    gender: z.string().optional().or(z.literal('')),
    pronouns: z.string().optional().or(z.literal('')),
    referralSource: z.string().optional(),
    referredBy: z.string().optional().or(z.literal('')),
    preferredLanguage: z.string().optional().or(z.literal('')),
    occupation: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    additionalEmail: z.string().optional().or(z.literal('')),
    additionalPhone: z.string().optional().or(z.literal('')),
    additionalPhonePrefix: z.string().optional(),
    addresses: z.array(z.any()).optional(),
    emergencyContacts: z.array(z.any()).optional(),
    consent: z.any().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional().or(z.literal('')),
});

// ============================================
// Business Update Schema
// ============================================

export const updateBusinessSchema = z.object({
    companyName: z.string().min(2).optional(),
    description: z.string().optional(),
    phone: phoneSchema,
    city: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    postalCode: postalCodeSchema.optional(),
    services: z.array(z.any()).optional(),
    workingHours: z.record(z.any()).optional(),
    employees: z.array(z.any()).optional(),
    website: z.string().url().optional().or(z.literal('')),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    profileImage: z.string().optional(),
    bannerImage: z.string().optional(),
    portfolioImages: z.array(z.string()).optional(),
});

export const addressDetailsSchema = z.object({
    street: z.string().min(1, 'Adres jest wymagany'),
    apartmentNumber: z.string().optional(),
    district: z.string().optional(),
    city: z.string().min(1, 'Miasto jest wymagane'),
    region: z.string().optional(),
    province: z.string().optional(),
    postCode: postalCodeSchema,
    country: z.string().min(1, 'Kraj jest wymagany'),
});

// ============================================
// Validation Helper
// ============================================

/**
 * Validate data against a Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validateInput(schema, data) {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Format errors nicely
    const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
    }));

    return {
        success: false,
        error: errors[0]?.message || 'Błąd walidacji',
        errors,
    };
}

/**
 * Create a validation middleware for API routes
 * Usage: const validation = await validateRequest(req, schema);
 */
export async function validateRequest(request, schema) {
    try {
        const body = await request.json();
        return validateInput(schema, body);
    } catch (error) {
        return {
            success: false,
            error: 'Nieprawidłowy format JSON',
            errors: [],
        };
    }
}

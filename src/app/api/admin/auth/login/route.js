import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";
import AdminLog from "@/app/models/AdminLog";
import SystemConfig from "@/app/models/SystemConfig";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { csrfMiddleware } from "@/lib/csrf";

export async function POST(req) {
    // Strict rate limiting for admin login (5 attempts per 15 min)
    const rateLimit = checkRateLimit(req, 'admin-login', { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.success) {
        return rateLimitResponse(rateLimit.resetIn);
    }

    // CSRF validation
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
        return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    try {
        const body = await req.json();
        const { email, password, pin } = body;

        // Walidacja podstawowa
        if (!email || !password || !pin) {
            return NextResponse.json({ error: "Email, hasło i PIN są wymagane" }, { status: 400 });
        }

        if (!/^\d{6}$/.test(pin)) {
            return NextResponse.json({ error: "PIN musi składać się z 6 cyfr" }, { status: 400 });
        }

        await connectDB();

        // Pobranie konfiguracji systemu
        const config = await SystemConfig.getConfig();
        const timeoutMinutes = config.sessionTimeoutMinutes || 1440;

        // Znajdź użytkownika z rolą admin
        const user = await User.findOne({
            email,
            adminRole: { $in: ['admin', 'moderator', 'developer'] }
        });

        if (!user) {
            // Log failed attempt
            await logAdminAction(null, email, 'admin_login_failed', 'auth', null, { reason: 'user_not_found' }, req);
            return NextResponse.json({ error: "Nieprawidłowe dane logowania" }, { status: 401 });
        }

        if (!user.isAdminActive) {
            await logAdminAction(user._id, email, 'admin_login_failed', 'auth', null, { reason: 'admin_inactive' }, req);
            return NextResponse.json({ error: "Konto administratora jest nieaktywne" }, { status: 403 });
        }

        // Sprawdź hasło
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            await logAdminAction(user._id, email, 'admin_login_failed', 'auth', null, { reason: 'invalid_password' }, req);
            return NextResponse.json({ error: "Nieprawidłowe dane logowania" }, { status: 401 });
        }

        // Sprawdź PIN
        const isPinMatch = await bcrypt.compare(pin, user.adminPin);
        if (!isPinMatch) {
            await logAdminAction(user._id, email, 'admin_login_failed', 'auth', null, { reason: 'invalid_pin' }, req);
            return NextResponse.json({ error: "Nieprawidłowe dane logowania" }, { status: 401 });
        }

        // Update last login
        user.lastAdminLogin = new Date();
        await user.save();

        // Log successful login
        await logAdminAction(user._id, email, 'admin_login', 'auth', user._id, { role: user.adminRole }, req);

        // Create admin JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const adminToken = jwt.sign(
            {
                id: user._id,
                role: 'admin',
                adminRole: user.adminRole
            },
            process.env.JWT_SECRET,
            { expiresIn: `${timeoutMinutes}m` }
        );

        const response = NextResponse.json({
            message: "Zalogowano do panelu administracyjnego",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                adminRole: user.adminRole,
                permissions: user.adminPermissions || [],
                lastLogin: user.lastAdminLogin
            }
        });

        // Set admin cookie (separate from regular user cookie)
        response.cookies.set('adminToken', adminToken, {
            httpOnly: true,
            path: '/',
            maxAge: timeoutMinutes * 60, // konwersja na sekundy
            sameSite: 'strict', // Stricter for admin
            secure: process.env.NODE_ENV === 'production'
        });

        return response;
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}

// Helper function to log admin actions
async function logAdminAction(userId, userEmail, action, targetType, targetId, details, req) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        await AdminLog.create({
            userId,
            userEmail,
            userRole: 'unknown',
            action,
            targetType,
            targetId,
            details,
            ip,
            userAgent
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}

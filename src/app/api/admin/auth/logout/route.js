import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";
import AdminLog from "@/app/models/AdminLog";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { csrfMiddleware } from "@/lib/csrf";

export async function POST(req) {
    // CSRF validation
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
        return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    try {
        const adminToken = req.cookies.get('adminToken')?.value;

        if (adminToken) {
            try {
                const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
                await connectDB();

                const user = await User.findById(decoded.id);
                if (user) {
                    // Log logout
                    await AdminLog.create({
                        userId: user._id,
                        userEmail: user.email,
                        userRole: user.adminRole,
                        action: 'admin_logout',
                        targetType: 'auth',
                        ip: req.headers.get('x-forwarded-for') || 'unknown',
                        userAgent: req.headers.get('user-agent') || 'unknown'
                    });
                }
            } catch (e) {
                // Token invalid, still proceed with logout
            }
        }

        const response = NextResponse.json({ message: "Wylogowano z panelu administracyjnego" });

        // Clear admin cookie
        response.cookies.set('adminToken', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        return response;
    } catch (error) {
        console.error('Admin logout error:', error);
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}

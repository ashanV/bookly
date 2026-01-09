import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ROLE_PERMISSIONS } from "@/lib/adminPermissions";

export async function GET(req) {
    try {
        const adminToken = req.cookies.get('adminToken')?.value;

        if (!adminToken) {
            return NextResponse.json({ error: "Brak sesji administratora" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                const response = NextResponse.json({ error: "Sesja wygasła" }, { status: 401 });
                response.cookies.set('adminToken', '', { maxAge: 0, path: '/' });
                return response;
            }
            return NextResponse.json({ error: "Nieprawidłowy token" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(decoded.id).select('-password -adminPin');

        if (!user) {
            return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
        }

        if (!user.adminRole || !user.isAdminActive) {
            return NextResponse.json({ error: "Brak uprawnień administratora" }, { status: 403 });
        }

        // Get permissions for role
        const permissions = ROLE_PERMISSIONS[user.adminRole] || [];

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                adminRole: user.adminRole,
                permissions,
                lastLogin: user.lastAdminLogin
            }
        });
    } catch (error) {
        console.error('Admin verify error:', error);
        return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
    }
}

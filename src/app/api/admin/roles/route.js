import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";
import AdminLog from "@/app/models/AdminLog";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { csrfMiddleware } from "@/lib/csrf";
import { sendEmail } from "@/lib/mail";
import { ROLE_PERMISSIONS, generatePin } from "@/lib/adminPermissions";

// GET - List all admin users
export async function GET(req) {
    try {
        const adminToken = req.cookies.get('adminToken')?.value;
        if (!adminToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (decoded.adminRole !== 'admin') {
            return NextResponse.json({ error: "Only admins can view roles" }, { status: 403 });
        }

        await connectDB();

        const admins = await User.find({
            adminRole: { $in: ['admin', 'moderator', 'developer'] }
        }).select('-password -adminPin');

        return NextResponse.json({ admins });
    } catch (error) {
        console.error('Get roles error:', error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST - Add new admin/mod/dev
export async function POST(req) {
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
        return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    try {
        const adminToken = req.cookies.get('adminToken')?.value;
        if (!adminToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (decoded.adminRole !== 'admin') {
            return NextResponse.json({ error: "Only admins can add roles" }, { status: 403 });
        }

        const body = await req.json();
        const { email, role } = body;

        if (!email || !role) {
            return NextResponse.json({ error: "Email i rola są wymagane" }, { status: 400 });
        }

        if (!['admin', 'moderator', 'developer'].includes(role)) {
            return NextResponse.json({ error: "Nieprawidłowa rola" }, { status: 400 });
        }

        await connectDB();

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Użytkownik o tym emailu nie istnieje" }, { status: 404 });
        }

        if (user.adminRole) {
            return NextResponse.json({ error: "Ten użytkownik już ma rolę administracyjną" }, { status: 400 });
        }

        // Generate PIN
        const pin = generatePin();
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        // Update user
        user.adminRole = role;
        user.adminPin = hashedPin;
        user.isAdminActive = true;
        user.updatedAt = new Date();
        await user.save();

        // Get admin who made this change
        const adminUser = await User.findById(decoded.id);

        // Log action
        await AdminLog.create({
            userId: decoded.id,
            userEmail: adminUser?.email || 'unknown',
            userRole: decoded.adminRole,
            action: 'role_granted',
            targetType: 'user',
            targetId: user._id,
            details: { role, targetEmail: email },
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
        });

        // Send email with PIN
        const roleLabels = {
            admin: 'Administrator',
            moderator: 'Moderator',
            developer: 'Developer'
        };

        try {
            await sendEmail({
                to: email,
                subject: `Bookly - Otrzymałeś uprawnienia ${roleLabels[role]}`,
                html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .pin-box { background: #2d2d44; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .pin { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a78bfa; font-family: monospace; }
    .warning { background: #7c3aed20; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    ul { padding-left: 20px; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Bookly Admin Panel</h1>
    </div>
    <div class="content">
      <p>Cześć <strong>${user.firstName}</strong>,</p>
      <p>Zostałeś dodany do panelu administracyjnego Bookly z rolą:</p>
      <h2 style="text-align: center; color: #a78bfa;">${roleLabels[role]}</h2>
      
      <p>Twój PIN do logowania:</p>
      <div class="pin-box">
        <div class="pin">${pin}</div>
      </div>
      
      <div class="warning">
        <strong>⚠️ WAŻNE:</strong> Zapisz ten PIN w bezpiecznym miejscu! Nie będzie on więcej wysłany.
      </div>
      
      <p><strong>Jak się zalogować:</strong></p>
      <ul>
        <li>Wejdź na stronę Bookly</li>
        <li>Naciśnij <code>Ctrl+Shift+A</code> lub wejdź na <code>/admin/login</code></li>
        <li>Podaj swój email, hasło konta i PIN</li>
      </ul>
    </div>
    <div class="footer">
      <p>Ten email został wysłany automatycznie. Nie odpowiadaj na niego.</p>
    </div>
  </div>
</body>
</html>
        `
            });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Continue even if email fails - role was already granted
        }

        return NextResponse.json({
            message: "Rola została nadana pomyślnie",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                adminRole: user.adminRole
            }
        });
    } catch (error) {
        console.error('Add role error:', error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE - Remove admin role
export async function DELETE(req) {
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
        return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    try {
        const adminToken = req.cookies.get('adminToken')?.value;
        if (!adminToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (decoded.adminRole !== 'admin') {
            console.log('403: Not an admin. Decoded role:', decoded.adminRole);
            return NextResponse.json({ error: "Only admins can remove roles" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Prevent self-removal
        if (userId === decoded.id) {
            return NextResponse.json({ error: "Nie możesz usunąć swojej własnej roli" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const previousRole = user.adminRole;

        // Remove admin role
        user.adminRole = null;
        user.adminPin = null;
        user.adminPermissions = [];
        user.isAdminActive = false;
        user.updatedAt = new Date();
        await user.save();

        // Get admin who made this change
        const adminUser = await User.findById(decoded.id);

        // Log action
        await AdminLog.create({
            userId: decoded.id,
            userEmail: adminUser?.email || 'unknown',
            userRole: decoded.adminRole,
            action: 'role_revoked',
            targetType: 'user',
            targetId: user._id,
            details: { previousRole, targetEmail: user.email },
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
        });

        return NextResponse.json({ message: "Rola została usunięta" });
    } catch (error) {
        console.error('Remove role error:', error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

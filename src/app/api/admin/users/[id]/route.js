import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import Business from '@/app/models/Business';
import Reservation from '@/app/models/Reservation';
import { sendEmail } from '@/lib/mail';
import { adminUserUpdateSchema, validateInput } from '@/lib/validations';

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        // Fetch User and basic details
        const user = await User.findById(id).select('-password -adminPin').lean();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Parallel fetch for related data
        const [userBusiness, reservationCount, lastReservationsRaw] = await Promise.all([
            // Check if user owns a business (by email)
            Business.findOne({ email: user.email }).select('companyName').lean(),
            // Count reservations made by this user
            Reservation.countDocuments({ clientId: user._id }),
            // Fetch last 5 reservations
            Reservation.find({ clientId: user._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('businessId', 'companyName employees') // we need employees to map ID to Name
                .lean()
        ]);

        // Process reservations to include employee name
        const lastReservations = lastReservationsRaw.map(res => {
            const business = res.businessId;
            let employeeName = 'Nieznany';
            if (business && business.employees) {
                const emp = business.employees.find(e => e.id.toString() === res.employeeId?.toString());
                if (emp) employeeName = emp.name;
            }

            return {
                ...res,
                businessName: business ? business.companyName : 'Nieznana Firma',
                employeeName: employeeName,
                businessId: undefined // Cleanup if desired, or keep it
            };
        });

        const fullProfile = {
            ...user,
            id: user._id, // Ensure consistent ID access
            businessName: userBusiness?.companyName || null,
            stats: {
                reservations: reservationCount,
                isBusinessOwner: !!userBusiness
            },
            lastReservations // Add to response
        };

        return NextResponse.json(fullProfile);

    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // Walidacja przez Zod
        const validation = validateInput(adminUserUpdateSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // 1. Get Admin Info from Token directly (for logging)
        const token = request.cookies.get('adminToken')?.value;
        let adminUser = null;
        if (token) {
            try {
                // Decode token without verification just to get ID (Middleware verifies validity)
                const decoded = JSON.parse(atob(token.split('.')[1]));
                adminUser = { id: decoded.id, email: decoded.email || 'unknown' };
            } catch (e) {
                console.error('Failed to decode admin token', e);
            }
        }

        // 2. Find User (needed before update logic)
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Update Fields (Partial Updates)
        const { firstName, lastName, email, phone, birthDate, isActive, adminRole, forcePasswordReset, newPassword, blockReason, invalidateSessions } = validation.data;

        const changes = [];

        if (firstName !== undefined) {
            if (user.firstName !== firstName) changes.push(`firstName: ${user.firstName} -> ${firstName}`);
            user.firstName = firstName;
        }

        if (lastName !== undefined) {
            if (user.lastName !== lastName) changes.push(`lastName: ${user.lastName} -> ${lastName}`);
            user.lastName = lastName;
        }

        if (email !== undefined) {

            if (email !== user.email) {
                const exists = await User.findOne({ email });
                if (exists) {
                    return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
                }
                changes.push(`email: ${user.email} -> ${email}`);
                user.email = email;
            }
        }

        if (phone !== undefined) {
            if (user.phone !== phone) changes.push(`phone: ${user.phone} -> ${phone}`);
            user.phone = phone;
        }

        if (birthDate !== undefined) user.birthDate = birthDate;

        if (isActive !== undefined) {
            if (user.isActive !== isActive) {
                changes.push(`isActive: ${user.isActive} -> ${isActive}`);
                if (isActive === false) {
                    user.tokenVersion = (user.tokenVersion || 0) + 1;
                    changes.push('sessions invalidated (user blocked)');

                    // Send Block Email
                    try {
                        await sendEmail({
                            to: user.email,
                            subject: 'Twoje konto zostało zablokowane - Bookly',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #ef4444;">Twoje konto zostało zablokowane</h2>
                                    <p>Witaj ${user.firstName},</p>
                                    <p>Twoje konto w serwisie Bookly zostało zablokowane przez administratora.</p>
                                    ${blockReason ? `<p><strong>Powód blokady:</strong><br>${blockReason}</p>` : ''}
                                    <p>Jeśli uważasz, że to pomyłka, skontaktuj się z naszym działem wsparcia.</p>
                                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                                    <p style="font-size: 12px; color: #888;">To jest wiadomość automatyczna, prosimy na nią nie odpowiadać.</p>
                                </div>
                            `
                        });
                    } catch (emailError) {
                        console.error('Failed to send block email:', emailError);
                    }

                } else {
                    // Send Unblock Email
                    try {
                        await sendEmail({
                            to: user.email,
                            subject: 'Twoje konto zostało odblokowane - Bookly',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #10b981;">Twoje konto jest znów aktywne</h2>
                                    <p>Witaj ${user.firstName},</p>
                                    <p>Twoje konto w serwisie Bookly zostało odblokowane. Możesz się już zalogować.</p>
                                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bookly.pl'}/login" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Zaloguj się</a>
                                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                                    <p style="font-size: 12px; color: #888;">To jest wiadomość automatyczna, prosimy na nią nie odpowiadać.</p>
                                </div>
                            `
                        });
                    } catch (emailError) {
                        console.error('Failed to send unblock email:', emailError);
                    }
                }
            }
            user.isActive = isActive;
        }

        if (invalidateSessions) {
            user.tokenVersion = (user.tokenVersion || 0) + 1;
            changes.push('sessions invalidated (manual)');

            // Mark all DB sessions as revoked
            try {
                const Session = (await import("@/app/models/Session")).default;
                await Session.updateMany(
                    { userId: user._id, isActive: true },
                    {
                        $set: {
                            isActive: false,
                            revokedAt: new Date(),
                            revokedBy: 'admin'
                        }
                    }
                );
            } catch (e) {
                console.error('Failed to update sessions in DB', e);
            }
        }

        if (adminRole !== undefined) {
            if (user.adminRole !== adminRole) changes.push(`adminRole: ${user.adminRole} -> ${adminRole}`);
            user.adminRole = adminRole === 'none' ? null : adminRole;
        }

        if (forcePasswordReset !== undefined) {
            if (user.forcePasswordReset !== forcePasswordReset) changes.push(`forcePassword: ${user.forcePasswordReset} -> ${forcePasswordReset}`);
            user.forcePasswordReset = forcePasswordReset;
        }

        let passwordChanged = false;
        if (newPassword && newPassword.trim().length >= 6) {
            user.password = newPassword;
            passwordChanged = true;
            changes.push('password changed');
        }

        await user.save();

        // 6. Audit Log
        if (changes.length > 0) {
            try {
                // Dynamic import to avoid circular dep issues if any, though Models are safe usually
                const AdminLog = (await import('@/app/models/AdminLog')).default;

                const logDetails = { changes };
                if (blockReason) {
                    logDetails.reason = blockReason;
                }

                await AdminLog.create({
                    userId: adminUser?.id || user._id, // Fallback if admin ID not found
                    userEmail: adminUser?.email || 'system',
                    userRole: 'admin', // Presumed
                    action: 'user_edited',
                    targetType: 'user',
                    targetId: user._id,
                    details: logDetails,
                    ip: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown'
                });
            } catch (logError) {
                console.error('Failed to create audit log:', logError);
            }
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'soft'; // soft, anonymize, hard

        // Admin Auth & Logging Context
        const token = request.cookies.get('adminToken')?.value;
        let adminUser = { email: 'unknown' };
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                adminUser = { id: decoded.id, email: decoded.email };
            } catch (e) { }
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Check Conflicts (Business, Reservations) - Basic safeguard
        // If anonymizing or hard deleting, we must be careful.
        // For soft delete, it's safer but still good to know.
        const activeBusiness = await Business.findOne({ email: user.email });
        const activeReservations = await Reservation.countDocuments({ clientId: user._id, status: 'confirmed' });

        if (activeBusiness && type !== 'soft') {
            return NextResponse.json({
                error: 'Cannot delete/anonymize: User owns an active business. Delete the business first.'
            }, { status: 409 });
        }

        // Send Deletion Email (Before action, as hard delete removes data)
        try {
            await sendEmail({
                to: user.email,
                subject: 'Twoje konto zostało usunięte - Bookly',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ef4444;">Twoje konto zostało usunięte</h2>
                        <p>Witaj ${user.firstName},</p>
                        <p>Informujemy, że Twoje konto w serwisie Bookly zostało usunięte przez administratora.</p>
                        ${type === 'anonymize' ? '<p>Twoje dane osobowe zostały zanonimizowane zgodnie z RODO.</p>' : ''}
                        <p>Jeśli uważasz, że to pomyłka, skontaktuj się z nami.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888;">To jest wiadomość automatyczna.</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send deletion email:', emailError);
            // Continue with deletion even if email fails
        }

        let actionDetails = {};

        if (type === 'hard') {
            // Hard Delete
            await User.findByIdAndDelete(id);
            actionDetails = { type: 'hard_delete' };

        } else if (type === 'anonymize') {
            // Anonymize
            user.firstName = 'Użytkownik';
            user.lastName = 'Usunięty';
            user.email = `deleted_${user._id}@deleted.local`;
            user.phone = null;
            user.password = 'DELETED';
            user.birthDate = null;
            user.isActive = false;
            user.deletedAt = new Date();
            user.tokenVersion = (user.tokenVersion || 0) + 1; // Kill sessions
            user.adminRole = null;
            user.adminPermissions = [];

            await user.save();
            actionDetails = { type: 'anonymize' };

        } else {
            // Soft Delete (Default)
            user.isActive = false;
            user.deletedAt = new Date();
            user.tokenVersion = (user.tokenVersion || 0) + 1; // Kill sessions
            await user.save();
            actionDetails = { type: 'soft_delete' };
        }

        // Audit Log
        try {
            const AdminLog = (await import('@/app/models/AdminLog')).default;
            await AdminLog.create({
                userId: adminUser.id || 'system',
                userEmail: adminUser.email,
                userRole: 'admin',
                action: 'user_deleted',
                targetType: 'user',
                targetId: id,
                details: actionDetails,
                ip: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            });
        } catch (e) {
            console.error('Audit log failed', e);
        }

        return NextResponse.json({ success: true, message: `User deleted (${type})` });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

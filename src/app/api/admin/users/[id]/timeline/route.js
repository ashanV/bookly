import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/app/models/User';
import AdminLog from '@/app/models/AdminLog';
import Reservation from '@/app/models/Reservation';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // 1. Fetch User (Creation Date)
        const user = await User.findById(id).select('createdAt firstName lastName').lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Fetch Admin Logs (Profile Changes, etc.)
        // We look for logs where targetId is the user ID and targetType is 'user'
        const logs = await AdminLog.find({
            targetType: 'user',
            targetId: id
        }).sort({ timestamp: -1 }).lean();

        // 3. Fetch Reservations
        const reservations = await Reservation.find({
            clientId: id
        }).sort({ createdAt: -1 }).lean();


        // 4. Aggregate Events
        let events = [];

        // Event: Account Created
        events.push({
            id: `create-${user._id}`,
            date: user.createdAt,
            type: 'account_created',
            title: 'Założenie konta',
            description: `Użytkownik ${user.firstName} ${user.lastName} dołączył do platformy.`,
            icon: 'UserPlus'
        });

        // Event: Profile Changes (from Logs)
        logs.forEach(log => {
            let title = 'Aktywność administratora';
            let description = 'Wykonano akcję na profilu.';
            let icon = 'Shield';

            if (log.action === 'user_edited') {
                title = 'Edycja profilu';
                // Parse details changes
                if (log.details && log.details.changes && Array.isArray(log.details.changes)) {
                    description = 'Zmieniono: ' + log.details.changes.map(c => {
                        // Simplify "firstName: old -> new" to just "Imię"
                        if (c.startsWith('firstName')) return 'Imię';
                        if (c.startsWith('lastName')) return 'Nazwisko';
                        if (c.startsWith('email')) return 'Email';
                        if (c.startsWith('phone')) return 'Telefon';
                        if (c.startsWith('password')) return 'Hasło';
                        if (c.startsWith('isActive')) return 'Status konta';
                        if (c.startsWith('adminRole')) return 'Rola';
                        return c.split(':')[0];
                    }).filter((v, i, a) => a.indexOf(v) === i).join(', '); // unique
                }
                icon = 'Edit';
            } else if (log.action === 'user_banned' || (log.action === 'user_edited' && log.details?.changes?.some(c => c.includes('isActive: true -> false')))) {
                title = 'Zablokowanie konta';
                description = log.details?.reason ? `Powód: ${log.details.reason}` : 'Konto zostało zablokowane.';
                icon = 'Ban';
            } else if (log.action === 'user_unbanned' || (log.action === 'user_edited' && log.details?.changes?.some(c => c.includes('isActive: false -> true')))) {
                title = 'Odblokowanie konta';
                description = 'Konto zostało przywrócone.';
                icon = 'CheckCircle';
            } else if (log.action === 'role_granted') {
                title = 'Nadano uprawnienia';
                description = `Nadano rolę: ${log.details?.role}`;
                icon = 'Shield';
            }

            events.push({
                id: log._id,
                date: log.timestamp,
                type: 'log',
                subType: log.action,
                title,
                description,
                by: log.userEmail,
                icon
            });
        });

        // Event: Reservations
        reservations.forEach(res => {
            let title = 'Nowa Rezerwacja';
            if (res.status === 'cancelled') title = 'Anulowana Rezerwacja';
            if (res.status === 'completed') title = 'Zakończona Rezerwacja';

            events.push({
                id: res._id,
                date: res.createdAt, // Or res.date if we want appt time? Usually "Activity Timeline" shows when it happened (booking made)
                type: 'reservation',
                title: title,
                description: `Rezerwacja: ${res.service} (${res.time}, ${res.duration} min). Status: ${res.status}`,
                price: res.price,
                icon: 'Calendar'
            });
        });

        // Sort descending
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
    }
}

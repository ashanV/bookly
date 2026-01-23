import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/app/models/Reservation';
import SystemConfig from '@/app/models/SystemConfig';
import Business from '@/app/models/Business'; // Ensure Business model is registered
import User from '@/app/models/User'; // Ensure User model is registered

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const businessId = searchParams.get('businessId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const paymentMethod = searchParams.get('paymentMethod');

        // Build query
        const query = {
            status: 'completed'
        };

        if (businessId) {
            query.businessId = businessId;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        if (paymentMethod && paymentMethod !== 'all') {
            query.paymentMethod = paymentMethod;
        }

        // Get global commission rate
        const config = await SystemConfig.getConfig();
        const commissionRate = config.commissionRate || 10;

        // Fetch data
        const [transactions, total] = await Promise.all([
            Reservation.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .populate('businessId', 'companyName')
                .populate('clientId', 'firstName lastName email')
                .lean(),
            Reservation.countDocuments(query)
        ]);

        // Transform data
        const transformedTransactions = transactions.map(tx => {
            const amount = tx.price || 0;
            const commission = amount * (commissionRate / 100);

            return {
                id: tx._id,
                date: tx.date,
                client: tx.clientName || (tx.clientId ? `${tx.clientId.firstName} ${tx.clientId.lastName}` : 'Nieznany'),
                clientEmail: tx.clientEmail || (tx.clientId ? tx.clientId.email : ''),
                business: tx.businessId?.companyName || 'Usunięty biznes',
                amount: amount,
                commission: commission,
                status: tx.payoutId ? 'Rozliczono' : 'Oczekuje',
                paymentMethod: tx.paymentMethod
            };
        });

        return NextResponse.json({
            data: transformedTransactions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

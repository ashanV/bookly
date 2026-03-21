import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payout from '@/app/models/Payout';
import Reservation from '@/app/models/Reservation';

export async function GET() {
    try {
        await connectDB();
        const payouts = await Payout.find()
            .sort({ createdAt: -1 })
            .populate('businessId', 'companyName email')
            .limit(50); // Limit for now

        return NextResponse.json(payouts);
    } catch (error) {
        console.error('Error fetching payouts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payouts' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { businessId, amount, commissionAmount, periodStart, periodEnd, reservationsCount, notes } = body;

        if (!businessId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Create Payout Record
        const payout = await Payout.create({
            businessId,
            amount,
            commissionAmount,
            periodStart,
            periodEnd,
            reservationsCount,
            notes,
            status: 'completed'
        });

        // 2. Update Reservations
        await Reservation.updateMany(
            {
                businessId: businessId,
                status: 'completed',
                payoutId: null
            },
            {
                $set: { payoutId: payout._id }
            }
        );

        return NextResponse.json(payout);

    } catch (error) {
        console.error('Error creating payout:', error);
        return NextResponse.json(
            { error: 'Failed to create payout' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        await connectDB();
        const { businessId } = await request.json();

        if (!businessId) {
            return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
        }

        const business = await Business.findById(businessId);
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Generate a JWT token *as* the business (Impersonation)
        // We use the same payload structure as normal login
        const token = jwt.sign(
            {
                id: business._id,
                role: 'business',
                email: business.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Short expiry for security
        );

        // Return the token. Frontend will store it and redirect.
        return NextResponse.json({
            message: 'Impersonation successful',
            token
        });

    } catch (error) {
        console.error('Error impersonating:', error);
        return NextResponse.json({ error: 'Failed to impersonate' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        // Need to populate or aggregate if we want calculated fields matching the list view
        // Using aggregation to ensure consistency with list view stats if needed, 
        // or just findById and calculate in JS like the list view fallback.
        // Let's use simple findById first to keep it simple, similar to list view fallback.
        const business = await Business.findById(id).lean();

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        // Add calculated fields
        const reviewsCount = business.reviews?.length || 0;
        const totalRating = business.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0;
        const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 0;

        const enhancedBusiness = {
            ...business,
            averageRating,
            reviewsCount
        };

        return NextResponse.json(enhancedBusiness);

    } catch (error) {
        console.error('Error fetching business:', error);
        return NextResponse.json(
            { error: 'Failed to fetch business' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await request.json();
        const { isActive, isVerified, isBlocked, blockReason, companyName, category, firstName, lastName, email } = body;

        console.log('DEBUG: PATCH /api/admin/businesses/[id]', { id, body });

        const updateData = {};

        if (typeof isActive !== 'undefined') updateData.isActive = isActive;
        if (typeof isVerified !== 'undefined') updateData.isVerified = isVerified;
        if (typeof isBlocked !== 'undefined') updateData.isBlocked = isBlocked;
        if (typeof blockReason !== 'undefined') updateData.blockReason = blockReason;
        if (companyName) updateData.companyName = companyName;
        if (category) updateData.category = category;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update provided' },
                { status: 400 }
            );
        }

        const business = await Business.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(business);

    } catch (error) {
        console.error('Error updating business:', error);
        return NextResponse.json(
            { error: 'Failed to update business' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const business = await Business.findByIdAndDelete(id);

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Business deleted successfully' });

    } catch (error) {
        console.error('Error deleting business:', error);
        return NextResponse.json(
            { error: 'Failed to delete business' },
            { status: 500 }
        );
    }
}

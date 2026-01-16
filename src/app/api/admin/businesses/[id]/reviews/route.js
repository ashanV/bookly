import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { reviewId } = await request.json();

        if (!reviewId) {
            return NextResponse.json(
                { error: 'Review ID is required' },
                { status: 400 }
            );
        }

        const business = await Business.findByIdAndUpdate(
            id,
            { $pull: { reviews: { _id: reviewId } } },
            { new: true }
        );

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Review deleted successfully', reviews: business.reviews });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            );
        }

        const business = await Business.findByIdAndUpdate(
            id,
            { $pull: { portfolioImages: imageUrl } },
            { new: true }
        );

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Image deleted successfully', portfolioImages: business.portfolioImages });

    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}

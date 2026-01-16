import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';

// Helper to find service index
const findServiceIndex = (business, serviceId) => {
    return business.services.findIndex(s => s.id === serviceId);
};

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { serviceId } = await request.json();

        if (!serviceId) {
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        const business = await Business.findById(id);
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Filter out the service
        const initialLength = business.services.length;
        business.services = business.services.filter(s => s.id !== serviceId);

        if (business.services.length === initialLength) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        await business.save();

        return NextResponse.json({
            message: 'Service deleted successfully',
            services: business.services
        });

    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { serviceId, name, description } = await request.json();

        if (!serviceId) {
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        const business = await Business.findById(id);
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        const index = findServiceIndex(business, serviceId);
        if (index === -1) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Update fields if provided
        if (name) business.services[index].name = name;
        if (description) business.services[index].description = description;

        await business.save();

        return NextResponse.json({
            message: 'Service updated successfully',
            services: business.services
        });

    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

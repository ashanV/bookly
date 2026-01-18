import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Business from '@/app/models/Business';
import { sendEmail } from '@/lib/mail';

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

        // Send email if business is blocked
        if (updateData.isBlocked === true && business) {
            await sendEmail({
                to: business.email,
                subject: 'Twoje konto w Bookly zostało zablokowane',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #d32f2f;">Konto Zablokowane</h2>
                        <p>Witaj ${business.firstName || 'Użytkowniku'},</p>
                        <p>Informujemy, że Twoje konto biznesowe <strong>${business.companyName}</strong> zostało zablokowane przez administratora.</p>
                        <p><strong>Powód blokady:</strong> ${updateData.blockReason || 'Naruszenie regulaminu'}</p>
                        <p>Jeśli uważasz, że to pomyłka, skontaktuj się z nami odpowiedając na ten email.</p>
                        <br>
                        <p>Zespół Bookly</p>
                    </div>
                `
            });
        }

        // Send email if business is UNBLOCKED
        if (updateData.isBlocked === false && business) {
            await sendEmail({
                to: business.email,
                subject: 'Twoje konto w Bookly zostało odblokowane',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #388e3c;">Konto Odblokowane</h2>
                        <p>Witaj ${business.firstName || 'Użytkowniku'},</p>
                        <p>Informujemy, że blokada Twojego konta biznesowego <strong>${business.companyName}</strong> została zdjęta.</p>
                        <p>Możesz teraz ponownie logować się i przyjmować rezerwacje.</p>
                        <br>
                        <p>Zespół Bookly</p>
                    </div>
                `
            });
        }

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

        // Create explicit fetch before delete to get email
        const businessToDelete = await Business.findById(id);

        if (!businessToDelete) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        const business = await Business.findByIdAndDelete(id);

        // Send email about deletion
        if (businessToDelete.email) {
            await sendEmail({
                to: businessToDelete.email,
                subject: 'Twoje konto w Bookly zostało usunięte',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2>Konto Usunięte</h2>
                        <p>Witaj ${businessToDelete.firstName || 'Użytkowniku'},</p>
                        <p>Informujemy, że Twoje konto biznesowe <strong>${businessToDelete.companyName}</strong> zostało trwale usunięte z naszej platformy przez administratora.</p>
                        <p>Wszystkie dane związane z kontem zostały usunięte.</p>
                        <br>
                        <p>Zespół Bookly</p>
                    </div>
                `
            });
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

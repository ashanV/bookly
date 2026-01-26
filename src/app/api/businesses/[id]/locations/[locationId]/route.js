import { connectDB } from "@/lib/mongodb";
import Business from "@/app/models/Business";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { csrfMiddleware } from "@/lib/csrf";
import { invalidateBusinessCache } from "@/lib/cache";

/**
 * DELETE /api/businesses/[id]/locations/[locationId]
 * Delete a specific location
 */
export async function DELETE(req, { params }) {
    try {
        // CSRF validation
        const csrfError = await csrfMiddleware(req);
        if (csrfError) {
            return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
        }

        // Authorization check
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Brak autoryzacji - zaloguj się" },
                { status: 401 }
            );
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json(
                { error: "Nieprawidłowy lub wygasły token" },
                { status: 401 }
            );
        }

        if (decoded.role !== 'business') {
            return NextResponse.json(
                { error: "Brak uprawnień" },
                { status: 403 }
            );
        }

        await connectDB();
        const { id: paramId, locationId } = await params;
        const businessId = paramId === 'current' ? decoded.id : paramId;

        // Prevent modification of primary location via this route
        if (locationId === 'primary') {
            return NextResponse.json(
                { error: "Nie można modyfikować głównej lokalizacji przez ten endpoint" },
                { status: 400 }
            );
        }

        // Ownership check
        if (decoded.id !== businessId) {
            return NextResponse.json(
                { error: "Brak uprawnień - możesz edytować tylko własny biznes" },
                { status: 403 }
            );
        }

        const business = await Business.findById(businessId);

        if (!business) {
            return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
        }

        // Find location index
        const locationIndex = (business.locations || []).findIndex(loc => loc.id === locationId);

        if (locationIndex === -1) {
            return NextResponse.json({ error: "Lokalizacja nie została znaleziona" }, { status: 404 });
        }

        // Remove location
        business.locations.splice(locationIndex, 1);
        await business.save();

        // Invalidate cache
        await invalidateBusinessCache(businessId);

        return NextResponse.json({
            message: "Lokalizacja została usunięta"
        }, { status: 200 });

    } catch (error) {
        console.error("Błąd usuwania lokalizacji:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/businesses/[id]/locations/[locationId]
 * Update a specific location
 */
export async function PUT(req, { params }) {
    try {
        // CSRF validation
        const csrfError = await csrfMiddleware(req);
        if (csrfError) {
            return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
        }

        // Authorization check
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Brak autoryzacji - zaloguj się" },
                { status: 401 }
            );
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json(
                { error: "Nieprawidłowy lub wygasły token" },
                { status: 401 }
            );
        }

        if (decoded.role !== 'business') {
            return NextResponse.json(
                { error: "Brak uprawnień" },
                { status: 403 }
            );
        }

        await connectDB();
        const { id: paramId, locationId } = await params;
        const businessId = paramId === 'current' ? decoded.id : paramId;

        // Fetch business first
        const business = await Business.findById(businessId);

        if (!business) {
            return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
        }

        // Ownership check
        if (decoded.id !== businessId) {
            return NextResponse.json(
                { error: "Brak uprawnień - możesz edytować tylko własny biznes" },
                { status: 403 }
            );
        }

        // Special handling for primary location
        if (locationId === 'primary') {
            const data = await req.json();

            // Update root business fields
            if (data.name) business.name = data.name;
            if (data.phone !== undefined) business.phone = data.phone;
            if (data.email !== undefined) business.email = data.email;

            // Address updates for root business
            if (data.addressDetails) {
                business.address = data.addressDetails.street || business.address;
                business.city = data.addressDetails.city || business.city;
                business.postCode = data.addressDetails.postCode || business.postCode;
            }

            await business.save();
            await invalidateBusinessCache(businessId);

            return NextResponse.json({
                message: "Główna lokalizacja została zaktualizowana",
                location: {
                    id: 'primary',
                    name: business.name,
                    phone: business.phone,
                    email: business.email,
                    isPrimary: true,
                    isOriginal: true
                }
            }, { status: 200 });
        }

        // Find location index
        const locationIndex = (business.locations || []).findIndex(loc => loc.id === locationId);

        if (locationIndex === -1) {
            return NextResponse.json({ error: "Lokalizacja nie została znaleziona" }, { status: 404 });
        }

        const data = await req.json();

        // Update location fields
        const existingLocation = business.locations[locationIndex];
        // Convert to plain object to spread correctly
        const existingLocationObj = existingLocation.toObject ? existingLocation.toObject() : { ...existingLocation };

        // Prepare billing address - use empty object if null/undefined (Mongoose requires object, not null)
        let newBillingAddress = existingLocationObj.billingAddress;
        if (data.billingAddressDetails) {
            newBillingAddress = {
                street: data.billingAddressDetails.street || '',
                apartmentNumber: data.billingAddressDetails.apartmentNumber || '',
                district: data.billingAddressDetails.district || '',
                city: data.billingAddressDetails.city || '',
                region: data.billingAddressDetails.region || '',
                province: data.billingAddressDetails.province || '',
                postCode: data.billingAddressDetails.postCode || '',
                country: data.billingAddressDetails.country || 'Polska'
            };
        } else if (!newBillingAddress || newBillingAddress === null) {
            // Mongoose subdoc schema requires object, not null/undefined
            newBillingAddress = {};
        }

        // Spread existing data first, then override with new values
        business.locations[locationIndex] = {
            ...existingLocationObj,
            // Override specific fields if provided
            name: data.name || existingLocationObj.name,
            phone: data.phone !== undefined ? data.phone : existingLocationObj.phone,
            email: data.email !== undefined ? data.email : existingLocationObj.email,
            businessType: data.businessType || existingLocationObj.businessType,
            additionalTypes: data.additionalTypes || existingLocationObj.additionalTypes,
            address: data.addressDetails ? {
                street: data.addressDetails.street || '',
                apartmentNumber: data.addressDetails.apartmentNumber || '',
                district: data.addressDetails.district || '',
                city: data.addressDetails.city || '',
                region: data.addressDetails.region || '',
                province: data.addressDetails.province || '',
                postCode: data.addressDetails.postCode || '',
                country: data.addressDetails.country || 'Polska'
            } : existingLocationObj.address,
            billingAddress: newBillingAddress,
            noAddress: data.noAddress !== undefined ? data.noAddress : existingLocationObj.noAddress,
            workingHours: data.workingHours || existingLocationObj.workingHours
        };

        await business.save();

        // Invalidate cache
        await invalidateBusinessCache(businessId);

        return NextResponse.json({
            message: "Lokalizacja została zaktualizowana",
            location: business.locations[locationIndex]
        }, { status: 200 });

    } catch (error) {
        console.error("Błąd aktualizacji lokalizacji:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

export const PATCH = PUT;



import { connectDB } from "@/lib/mongodb";
import Business from "@/app/models/Business";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { csrfMiddleware } from "@/lib/csrf";
import { canAddLocation, getLimitErrorMessage } from "@/lib/subscriptionLimits";
import { invalidateBusinessCache } from "@/lib/cache";

/**
 * GET /api/businesses/[id]/locations
 * Fetch all locations for a business
 */
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Brak ID biznesu" }, { status: 400 });
        }

        await connectDB();

        const business = await Business.findById(id)
            .select('locations subscription')
            .lean();

        if (!business) {
            return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
        }

        return NextResponse.json({
            locations: business.locations || [],
            subscription: business.subscription,
            count: (business.locations || []).length
        }, { status: 200 });

    } catch (error) {
        console.error("Błąd pobierania lokalizacji:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/businesses/[id]/locations
 * Create a new location (with subscription limit check)
 */
export async function POST(req, { params }) {
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
        const { id } = await params;

        // Ownership check
        if (decoded.id !== id) {
            return NextResponse.json(
                { error: "Brak uprawnień - możesz edytować tylko własny biznes" },
                { status: 403 }
            );
        }

        const business = await Business.findById(id);

        if (!business) {
            return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
        }

        // Subscription limit check
        const currentLocationCount = (business.locations || []).length;
        if (!canAddLocation(business, currentLocationCount)) {
            return NextResponse.json({
                error: getLimitErrorMessage('locations', business),
                limitReached: true
            }, { status: 403 });
        }

        const data = await req.json();

        // Validate required fields
        if (!data.name || !data.name.trim()) {
            return NextResponse.json({ error: "Nazwa lokalizacji jest wymagana" }, { status: 400 });
        }

        // Create new location object
        const newLocation = {
            id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name.trim(),
            phone: data.phone || '',
            email: data.email || '',
            businessType: data.businessType || '',
            additionalTypes: data.additionalTypes || [],
            address: {
                street: data.addressDetails?.street || data.address || '',
                apartmentNumber: data.addressDetails?.apartmentNumber || '',
                district: data.addressDetails?.district || '',
                city: data.addressDetails?.city || '',
                region: data.addressDetails?.region || '',
                province: data.addressDetails?.province || '',
                postCode: data.addressDetails?.postCode || '',
                country: data.addressDetails?.country || 'Polska'
            },
            billingAddress: data.billingAddressDetails ? {
                street: data.billingAddressDetails.street || '',
                apartmentNumber: data.billingAddressDetails.apartmentNumber || '',
                district: data.billingAddressDetails.district || '',
                city: data.billingAddressDetails.city || '',
                region: data.billingAddressDetails.region || '',
                province: data.billingAddressDetails.province || '',
                postCode: data.billingAddressDetails.postCode || '',
                country: data.billingAddressDetails.country || 'Polska'
            } : null,
            noAddress: data.noAddress || false,
            isPrimary: false, // New locations are always additional, not primary
            createdAt: new Date()
        };

        // Add location to business
        business.locations = business.locations || [];
        business.locations.push(newLocation);
        await business.save();

        // Invalidate cache
        await invalidateBusinessCache(id);

        return NextResponse.json({
            message: "Lokalizacja została dodana",
            location: newLocation
        }, { status: 201 });

    } catch (error) {
        console.error("Błąd dodawania lokalizacji:", error);
        return NextResponse.json(
            { error: error.message || "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

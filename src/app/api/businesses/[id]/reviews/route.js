import { connectDB } from "@/lib/mongodb";
import Business from "../../../../models/Business";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const { author, rating, text, service } = await req.json();

        await connectDB();

        const business = await Business.findById(id);

        if (!business) {
            return NextResponse.json(
                { error: "Nie znaleziono biznesu" },
                { status: 404 }
            );
        }

        const newReview = {
            author,
            rating,
            text,
            service,
            date: new Date(),
            verified: false // Domyślnie niezweryfikowana, chyba że dodamy logikę weryfikacji
        };

        business.reviews.push(newReview);
        await business.save();

        return NextResponse.json(
            { message: "Opinia została dodana", review: newReview },
            { status: 201 }
        );

    } catch (error) {
        console.error("Błąd podczas dodawania opinii:", error);
        return NextResponse.json(
            { error: "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await connectDB();

        const business = await Business.findById(id).select('reviews');

        if (!business) {
            return NextResponse.json(
                { error: "Nie znaleziono biznesu" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { reviews: business.reviews },
            { status: 200 }
        );

    } catch (error) {
        console.error("Błąd podczas pobierania opinii:", error);
        return NextResponse.json(
            { error: "Wystąpił błąd serwera" },
            { status: 500 }
        );
    }
}

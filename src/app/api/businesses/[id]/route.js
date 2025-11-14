import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Brak ID biznesu" }, { status: 400 });
    }

    // Pobranie biznesu - tylko aktywne
    const business = await Business.findOne({ _id: id, isActive: true })
      .select('-password -__v')
      .lean();

    if (!business) {
      return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
    }

    // Transformacja danych do formatu używanego w frontendzie
    let services = [];
    if (business.services && business.services.length > 0) {
      services = business.services.map((serviceName, idx) => ({
        id: `${business._id}_${idx}`,
        name: serviceName,
        price: business.pricing ? parseFloat(business.pricing) || 100 : 100 + (idx * 10),
        duration: 60 + (idx * 15),
        tags: [business.category],
        category: business.category,
        description: `${serviceName} w ${business.companyName}`
      }));
    }

    // Jeśli brak usług, dodaj domyślną
    if (services.length === 0) {
      services = [{
        id: `${business._id}_default`,
        name: business.category || 'Usługa',
        price: 100,
        duration: 60,
        tags: [business.category],
        category: business.category,
        description: `Usługa w ${business.companyName}`
      }];
    }

    // Współrzędne (tymczasowo - można dodać do modelu)
    const lat = 52.2297;
    const lng = 21.0122;

    // Obrazy (tymczasowo - można dodać do modelu)
    const images = [
      `https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop`,
    ];

    const transformedBusiness = {
      id: business._id.toString(),
      name: business.companyName,
      description: business.description || `${business.companyType} w ${business.city}. ${business.companyName} oferuje wysokiej jakości usługi.`,
      rating: 4.5, // Tymczasowa ocena
      reviews: 50, // Tymczasowa liczba opinii
      likes: 30, // Tymczasowa liczba polubień
      location: `${business.city}, ${business.address}`,
      fullAddress: `${business.address}, ${business.postalCode} ${business.city}`,
      distance: "1.2 km",
      phone: business.phone,
      website: business.website || '',
      email: business.email,
      socialMedia: {
        instagram: business.instagram || '',
        facebook: business.facebook || '',
        twitter: '',
        youtube: ''
      },
      images,
      portfolioImages: images.slice(0, 3),
      lat,
      lng,
      categories: business.category ? [business.category] : [],
      services,
      reviews: [], // Można dodać w przyszłości
      workingHours: business.workingHours || {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      teamSize: business.teamSize || '',
      companyType: business.companyType,
      isVerified: business.isVerified || false
    };

    return NextResponse.json({ business: transformedBusiness }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania szczegółów biznesu:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


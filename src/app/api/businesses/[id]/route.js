import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Brak ID biznesu" }, { status: 400 });
    }

    // Find active business
    const business = await Business.findOne({ _id: id, isActive: true })
      .select('-password -__v')
      .lean();

    if (!business) {
      return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
    }

    // Services are now stored in the correct format
    let services = business.services || [];

    // If no services, add default
    if (services.length === 0) {
      services = [{
        id: `${business._id}_default`,
        name: business.category || 'Usługa',
        price: 100,
        duration: 60,
        description: `Usługa w ${business.companyName}`
      }];
    }

    // Set coordinates - temporary
    const lat = 52.2297;
    const lng = 21.0122;

    // Set images
    const images = [
      `https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop`,
    ];

    const transformedBusiness = {
      id: business._id.toString(),
      name: business.companyName,
      description: business.description || `${business.companyType} w ${business.city}. ${business.companyName} oferuje wysokiej jakości usługi.`,
      rating: business.reviews && business.reviews.length > 0
        ? (business.reviews.reduce((acc, review) => acc + review.rating, 0) / business.reviews.length).toFixed(1)
        : 0,
      reviews: business.reviews ? business.reviews.length : 0,
      likes: 30, // Temporary
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
      reviewsList: business.reviews || [], // Return actual reviews
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
      employees: business.employees || [],
      team: (business.employees || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.position || 'Pracownik',
        experience: 'Doświadczony', // Placeholder or add to schema if needed
        rating: 5.0, // Placeholder
        avatar: emp.avatarImage || null, // Use avatarImage if available
        vacations: emp.vacations || [],
        assignedServices: emp.assignedServices || []
      })),
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

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Brak ID biznesu" }, { status: 400 });
    }

    // Update business
    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedBusiness) {
      return NextResponse.json({ error: "Biznes nie został znaleziony" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Dane zostały zaktualizowane",
      business: updatedBusiness
    }, { status: 200 });

  } catch (error) {
    console.error("Błąd aktualizacji biznesu:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

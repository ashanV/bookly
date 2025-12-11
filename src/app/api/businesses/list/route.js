import { connectDB } from "@/lib/mongodb";
import Business from "../../../models/Business";
import { NextResponse } from "next/server";
import { getCache, setCache, generateCacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(req) {
  try {
    // Pobranie parametrów z URL
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';

    // Generate cache key from params
    const cacheKey = generateCacheKey('businesses:list', { search, location, category });

    // Try to get from cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json({ businesses: cachedData }, { status: 200 });
    }

    await connectDB();

    // Budowanie zapytania - tylko aktywne biznesy
    const query = { isActive: true };

    // Wyszukiwanie po nazwie, opisie, usługach
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { services: { $regex: search, $options: 'i' } }
      ];
    }

    // Wyszukiwanie po lokalizacji (miasto)
    if (location) {
      query.city = { $regex: location, $options: 'i' };
    }

    // Filtrowanie po kategorii
    if (category && category !== 'Wszystkie') {
      query.category = { $regex: category, $options: 'i' };
    }

    // Pobranie biznesów
    const businesses = await Business.find(query)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .lean();

    // Transformacja danych do formatu używanego w frontendzie
    const transformedBusinesses = businesses.map((business, index) => {
      // Utworzenie usług z cennika (jeśli pricing jest stringiem z danymi)
      let services = [];
      if (business.services && business.services.length > 0) {
        // Obsługa zarówno tablicy stringów jak i obiektów
        services = business.services.map((serviceItem, idx) => {
          const isObject = typeof serviceItem === 'object' && serviceItem !== null;
          return {
            id: isObject ? (serviceItem.id || serviceItem._id || `${business._id}_${idx}`) : `${business._id}_${idx}`,
            name: isObject ? serviceItem.name : serviceItem,
            price: isObject ? (serviceItem.price || (business.pricing ? parseFloat(business.pricing) : 100)) : (business.pricing ? parseFloat(business.pricing) || 100 : 100),
            duration: isObject ? (serviceItem.duration || 60) : 60,
            tags: isObject ? (serviceItem.tags || [business.category]) : [business.category],
            category: isObject ? (serviceItem.category || business.category) : business.category
          };
        });
      }

      // Utworzenie kategorii
      const categories = business.category ? [business.category] : [];

      // Obliczenie współrzędnych (tymczasowo - w przyszłości można dodać do modelu)
      const lat = 52.2297 + (index * 0.01); // Tymczasowe współrzędne
      const lng = 21.0122 + (index * 0.01);

      return {
        id: business._id.toString(),
        name: business.companyName,
        description: business.description || `${business.companyType} w ${business.city}`,
        rating: 4.5 + (index % 5) * 0.1, // Tymczasowa ocena
        reviews: 50 + (index * 10), // Tymczasowa liczba opinii
        likes: 30 + (index * 5), // Tymczasowa liczba polubień
        location: `${business.city}, ${business.address}`,
        distance: `${(index + 1) * 0.5} km`, // Tymczasowa odległość
        image: `https://images.unsplash.com/photo-${1562004760 + index}?w=400&h=300&fit=crop`,
        nextAvailable: "Dziś 14:30",
        isPromoted: index % 3 === 0, // Co trzeci biznes jest promowany
        discount: index % 3 === 0 ? 20 : 0,
        lat,
        lng,
        categories,
        services: services.length > 0 ? services : [{
          id: `${business._id}_default`,
          name: business.category || 'Usługa',
          price: 100,
          duration: 60,
          tags: [business.category],
          category: business.category
        }],
        phone: business.phone,
        email: business.email,
        website: business.website,
        instagram: business.instagram,
        facebook: business.facebook,
        workingHours: business.workingHours,
        address: business.address,
        postalCode: business.postalCode,
        city: business.city
      };
    });

    // Store in cache for future requests
    await setCache(cacheKey, transformedBusinesses, CACHE_TTL.BUSINESS_LIST);

    return NextResponse.json({ businesses: transformedBusinesses }, { status: 200 });
  } catch (error) {
    console.error("Błąd pobierania biznesów:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}


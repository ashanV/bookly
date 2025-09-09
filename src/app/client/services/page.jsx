"use client";

import React, { useState, useMemo, useEffect } from 'react';;
import Link from "next/link";
import { Search, MapPin, Star, Heart, X, ChevronDown, Map } from 'lucide-react';
import MapModal from '../../../components/Map';
import BookingModal from '../../../components/BookingModal';
import StudioCard from '../../../components/StudioCard';
import FilterSidebar from '../../../components/FilterSidebar';

// Mock data for services
const mockStudios = [
  {
    id: 1,
    name: "Elite Barber Shop",
    description: "Premium salon fryzjerski dla mężczyzn",
    rating: 4.8,
    reviews: 324,
    likes: 456,
    location: "Warszawa, Mokotów",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=400&h=300&fit=crop",
    nextAvailable: "Dziś 14:30",
    isPromoted: true,
    discount: 20,
    lat: 52.1942,
    lng: 21.0347,
    categories: ["Fryzjer"],
    services: [
      { id: 101, name: "Strzyżenie męskie Premium + Stylizacja", price: 120, duration: 60, tags: ["Męski", "Premium", "Stylizacja"] },
      { id: 102, name: "Strzyżenie + Modelowanie brody", price: 80, duration: 45, tags: ["Męski", "Broda", "Stylizacja"] },
      { id: 103, name: "Golenie tradycyjne", price: 60, duration: 30, tags: ["Męski", "Tradycyjne", "Relaks"] }
    ]
  },
  {
    id: 2,
    name: "Studio Piękna Aurora",
    description: "Kompleksowe usługi kosmetyczne i paznokcie",
    rating: 4.9,
    reviews: 189,
    likes: 278,
    location: "Kraków, Stare Miasto",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
    nextAvailable: "Jutro 10:00",
    isPromoted: false,
    lat: 50.0614,
    lng: 19.9366,
    categories: ["Paznokcie", "Kosmetyczka"],
    services: [
      { id: 201, name: "Manicure hybrydowy z wzorkami", price: 150, duration: 90, tags: ["Hybrydowy", "Wzorki", "Długotrwały"] },
      { id: 202, name: "Oczyszczanie twarzy", price: 180, duration: 75, tags: ["Oczyszczanie", "Pielęgnacja", "Relaks"] },
      { id: 203, name: "Pedicure klasyczny", price: 120, duration: 60, tags: ["Pedicure", "Klasyczny", "Relaks"] }
    ]
  },
  {
    id: 3,
    name: "Wellness & Relax Center",
    description: "Centrum SPA i masażu dla pełnego relaksu",
    rating: 4.7,
    reviews: 256,
    likes: 412,
    location: "Wrocław, Centrum",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    nextAvailable: "Za 2 dni 16:00",
    isPromoted: true,
    discount: 15,
    lat: 51.1079,
    lng: 17.0385,
    categories: ["SPA"],
    services: [
      { id: 301, name: "Masaż relaksacyjny całego ciała", price: 200, duration: 90, tags: ["Relaks", "Całe ciało", "Aromaterapia"] },
      { id: 302, name: "Masaż gorącymi kamieniami", price: 250, duration: 75, tags: ["Gorące kamienie", "Relaks", "Premium"] },
      { id: 303, name: "Peeling ciała", price: 180, duration: 60, tags: ["Peeling", "Pielęgnacja", "Odmładzanie"] }
    ]
  },
];

const sortOptions = [
  { value: "relevance", label: "Trafność" },
  { value: "price-low", label: "Cena: od najniższej" },
  { value: "price-high", label: "Cena: od najwyższej" },
  { value: "rating", label: "Najwyżej oceniane" },
  { value: "distance", label: "Najbliżej" }
];

export default function ServicesPage() {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'Wszystkie',
    priceRange: [0, 500],
    minRating: 0,
    availability: [],
    promotions: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

   useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGeolocation = () => {
    if (isClient && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationQuery('Warszawa');
          alert('Lokalizacja ustawiona na: Warszawa (demo)');
        },
        (error) => alert('Błąd geolokalizacji: ' + error.message)
      );
    } else if (isClient) {
      alert('Geolokalizacja nie jest wspierana.');
    }
  };

  const filteredStudios = useMemo(() => {
    let result = mockStudios.filter(studio => {
      const matchesSearch = searchQuery === '' ||
        studio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studio.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studio.services.some(service => service.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        studio.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation = locationQuery === '' || studio.location.toLowerCase().includes(locationQuery.toLowerCase());
      const matchesCategory = filters.category === 'Wszystkie' || studio.categories.includes(filters.category);
      const studioMinPrice = Math.min(...studio.services.map(s => s.price));
      const studioMaxPrice = Math.max(...studio.services.map(s => s.price));
      const matchesPrice = studioMaxPrice >= filters.priceRange[0] && studioMinPrice <= filters.priceRange[1];
      const matchesRating = studio.rating >= filters.minRating;
      const matchesPromotion = !filters.promotions || studio.isPromoted;

      return matchesSearch && matchesLocation && matchesCategory && matchesPrice && matchesRating && matchesPromotion;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Math.min(...a.services.map(s => s.price)) - Math.min(...b.services.map(s => s.price)));
        break;
      case 'price-high':
        result.sort((a, b) => Math.max(...b.services.map(s => s.price)) - Math.max(...a.services.map(s => s.price)));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      default:
        result.sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));
    }
    return result;
  }, [searchQuery, locationQuery, filters, sortBy]);

  const topService = useMemo(() => {
    return [...filteredStudios].sort((a, b) => b.rating - a.rating)[0];
  }, [filteredStudios]);

  const handleFavorite = (serviceId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }
    setFavorites(newFavorites);
  };

  const handleBookingClick = (studio, service) => {
    setSelectedService(service || studio);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white/90 backdrop-blur-xl shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                Bookly
              </h1>
              <p className="text-xs text-gray-500 font-medium">Rezerwuj piękno</p>
            </div>
            <div className="hidden md:flex flex-1 max-w-3xl mx-8 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj usługi, salonu lub kategorii..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Miasto lub lokalizacja..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>
              <button
                onClick={handleGeolocation}
                className="bg-violet-600 hover:bg-violet-700 cursor-pointer text-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMapOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/business" className="text-gray-700 cursor-pointer hover:text-violet-600 px-4 py-3 rounded-full font-semibold transition-all duration-300">
                Dla firmy
              </Link>
              <Link href="/client/auth" className="bg-violet-600 cursor-pointer hover:bg-violet-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                Zaloguj
              </Link>
            </div>
          </div>
          <div className="md:hidden pb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Szukaj usługi, salonu..." className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition-all duration-300" />
            </div>
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="Miasto lub lokalizacja..." className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition-all duration-300" />
              <button onClick={handleGeolocation} className="absolute right-2 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition-all duration-300">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {searchQuery ? `Wyniki dla "${searchQuery}"` : 'Odkryj usługi beauty'}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600 mt-2">
                    <span className="bg-violet-100 text-violet-700 px-4 py-1 rounded-full text-sm font-medium">
                      {filteredStudios.length} wyników
                    </span>
                    {favorites.size > 0 && (
                      <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Heart className="w-4 h-4 mr-1 fill-current" />
                        {favorites.size} ulubionych
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-full px-6 py-3 pr-12 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {(filters.category !== 'Wszystkie' || filters.promotions || filters.minRating > 0) && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {filters.category !== 'Wszystkie' && (
                    <span className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm">
                      {filters.category}
                      <button onClick={() => setFilters({ ...filters, category: 'Wszystkie' })} className="ml-2 hover:bg-violet-200 rounded-full p-1 transition-colors"><X className="w-4 h-4" /></button>
                    </span>
                  )}
                  {filters.promotions && (
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm">
                      🔥 Promocje
                      <button onClick={() => setFilters({ ...filters, promotions: false })} className="ml-2 hover:bg-orange-200 rounded-full p-1 transition-colors"><X className="w-4 h-4" /></button>
                    </span>
                  )}
                  {filters.minRating > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {filters.minRating}+
                      <button onClick={() => setFilters({ ...filters, minRating: 0 })} className="ml-2 hover:bg-yellow-200 rounded-full p-1 transition-colors"><X className="w-4 h-4" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {filteredStudios.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                Brak wyników. Spróbuj zmienić wyszukiwanie lub filtry.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredStudios.map(studio => (
                  <StudioCard
                    key={studio.id}
                    studio={studio}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.has(studio.id)}
                    onBookingClick={handleBookingClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} filteredStudios={filteredStudios} topService={topService} favorites={favorites} onFavorite={handleFavorite} />
      <BookingModal isOpen={isBookingOpen} onClose={() => { setIsBookingOpen(false); setSelectedService(null); }} service={selectedService} />
    </div>
  );
}
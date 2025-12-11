"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Heart, X, ChevronDown, Map, User, LogOut, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import components that might use browser APIs
// Dynamically import components that might use browser APIs
const MapModal = dynamic(() => import('../../../components/Map'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div></div>
});
const BookingModal = dynamic(() => import('../../../components/BookingModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div></div>
});
const StudioCard = dynamic(() => import('../../../components/StudioCard'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-2xl animate-pulse"></div>
});
const FilterSidebar = dynamic(() => import('../../../components/FilterSidebar'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-100 rounded-2xl animate-pulse"></div>
});

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ServicesPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (locationQuery) params.append('location', locationQuery);
        if (filters.category !== 'Wszystkie') params.append('category', filters.category);

        const response = await fetch(`/api/businesses/list?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          // Map backend data to UI structure
          const mappedBusinesses = (data.businesses || []).map(b => ({
            ...b,
            id: b._id || b.id,
            location: b.city ? `${b.city}, ${b.address}` : b.location || 'Brak lokalizacji',
            categories: b.category ? [b.category] : (b.categories || []),
            services: (b.services || []).map(s => ({
              ...s,
              tags: s.tags || []
            })),
            rating: b.rating || 0,
            reviews: b.reviews || [],
            likes: b.likes || 0,
            isPromoted: b.isPromoted || false,
            image: b.images?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"
          }));

          const allStudios = [...mappedBusinesses, ...mockStudios];
          setStudios(allStudios);
        } else {
          console.error('Błąd pobierania biznesów:', data.error);
          setStudios(mockStudios);
        }
      } catch (error) {
        console.error('Błąd pobierania biznesów:', error);
        setStudios(mockStudios);
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      fetchBusinesses();
    }
  }, [isClient, searchQuery, locationQuery, filters.category]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleGeolocation = () => {
    if (!isClient) return;

    if (typeof window !== 'undefined' && 'navigator' in window && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationQuery('Warszawa');
          alert('Lokalizacja ustawiona na: Warszawa (demo)');
        },
        (error) => alert('Błąd geolokalizacji: ' + error.message)
      );
    } else {
      alert('Geolokalizacja nie jest wspierana.');
    }
  };

  const handleLogout = async () => {
    await logout(false);
    setIsUserMenuOpen(false);
  };

  const filteredStudios = useMemo(() => {
    let result = studios.filter(studio => {
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
  }, [studios, searchQuery, locationQuery, filters, sortBy]);

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
    // Sprawdź czy użytkownik jest zalogowany
    if (!isAuthenticated) {
      // Przekieruj na stronę logowania z parametrem redirect
      const currentPath = window.location.pathname;
      router.push(`/client/auth?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Jeśli użytkownik jest zalogowany, otwórz modal rezerwacji
    setSelectedService(service || studio);
    setIsBookingOpen(true);
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      router.push('/client');
    } else {
      router.push('/client/auth');
    }
  };

  // Show loading state during SSR/hydration or auth loading
  if (!isClient || authLoading || loading) {
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
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <div className="text-gray-500">
                {authLoading ? 'Sprawdzanie autoryzacji...' : loading ? 'Ładowanie salonów...' : 'Ładowanie...'}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Bookly
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Rezerwuj piękno</p>
            </div>

            <div className="hidden md:flex flex-1 max-w-3xl mx-8 items-center space-x-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj usługi, salonu lub kategorii..."
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white shadow-sm hover:shadow transition-all duration-300"
                />
              </div>
              <div className="relative flex-1 group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Miasto lub lokalizacja..."
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white shadow-sm hover:shadow transition-all duration-300"
                />
              </div>
              <button
                onClick={handleGeolocation}
                className="bg-violet-100 hover:bg-violet-200 text-violet-700 p-3.5 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                title="Użyj mojej lokalizacji"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMapOpen(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3.5 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                title="Pokaż na mapie"
              >
                <Map className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/business" className="hidden lg:block text-gray-600 hover:text-violet-600 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:bg-violet-50">
                Dla firmy
              </Link>
              {isAuthenticated ? (
                // Dropdown menu użytkownika
                <div className="relative" ref={userMenuRef}>
                  <button
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="cursor-pointer p-1.5 pr-4 rounded-full bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all duration-300 flex items-center space-x-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-inner">
                      <User size={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-violet-700 hidden xl:block">{user?.firstName || 'Konto'}</span>
                    <ChevronDown size={16} className="text-gray-400 group-hover:text-violet-500 transition-transform duration-300 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setIsUserMenuOpen(true)}
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={handleUserClick}
                          className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors flex items-center space-x-3 group"
                        >
                          <User size={18} className="text-gray-500 group-hover:text-violet-600 transition-colors" />
                          <span className="text-gray-700 font-medium group-hover:text-violet-700 transition-colors">Mój profil</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600 group"
                        >
                          <LogOut size={18} className="group-hover:text-red-700 transition-colors" />
                          <span className="font-medium group-hover:text-red-700 transition-colors">Wyloguj się</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Przycisk logowania dla niezalogowanych
                <button
                  onClick={() => {
                    const currentPath = window.location.pathname + window.location.search;
                    localStorage.setItem('redirectAfterLogin', currentPath);
                    router.push(`/client/auth?redirect=${encodeURIComponent(currentPath)}`);
                  }}
                  className="bg-violet-600 cursor-pointer hover:bg-violet-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  Zaloguj
                </button>
              )}
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Szukaj usługi, salonu..." className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm" />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="Lokalizacja..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm" />
              </div>
              <button onClick={handleGeolocation} className="bg-violet-100 text-violet-700 p-3 rounded-xl">
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Sticky on Desktop */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between font-semibold text-gray-700"
                >
                  <span className="flex items-center"><Filter className="w-5 h-5 mr-2" /> Filtry</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
                <FilterSidebar isOpen={true} onClose={() => { }} filters={filters} onFiltersChange={setFilters} />
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {searchQuery ? `Wyniki dla "${searchQuery}"` : 'Odkryj usługi beauty'}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600 mt-2">
                    <span className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium border border-violet-100">
                      {filteredStudios.length} wyników
                    </span>
                    {favorites.size > 0 && (
                      <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center border border-red-100">
                        <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />
                        {favorites.size} ulubionych
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative z-20">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-3 pr-12 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow transition-all duration-300 font-medium text-gray-700 cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Active Filters Tags */}
              <AnimatePresence>
                {(filters.category !== 'Wszystkie' || filters.promotions || filters.minRating > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 mt-4"
                  >
                    {filters.category !== 'Wszystkie' && (
                      <motion.span layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm">
                        {filters.category}
                        <button onClick={() => setFilters({ ...filters, category: 'Wszystkie' })} className="ml-2 hover:bg-gray-700 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
                      </motion.span>
                    )}
                    {filters.promotions && (
                      <motion.span layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm border border-orange-200">
                        🔥 Promocje
                        <button onClick={() => setFilters({ ...filters, promotions: false })} className="ml-2 hover:bg-orange-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
                      </motion.span>
                    )}
                    {filters.minRating > 0 && (
                      <motion.span layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm border border-yellow-200">
                        <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                        {filters.minRating}+
                        <button onClick={() => setFilters({ ...filters, minRating: 0 })} className="ml-2 hover:bg-yellow-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {filteredStudios.length === 0 ? (
              <div className="text-center text-gray-500 py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="mb-4 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Brak wyników</h3>
                <p>Spróbuj zmienić kryteria wyszukiwania lub filtry.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLocationQuery('');
                    setFilters({
                      category: 'Wszystkie',
                      priceRange: [0, 500],
                      minRating: 0,
                      availability: [],
                      promotions: false
                    });
                  }}
                  className="mt-4 text-violet-600 font-medium hover:text-violet-800"
                >
                  Wyczyść wszystkie filtry
                </button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode='popLayout'>
                  {filteredStudios.map(studio => (
                    <StudioCard
                      key={studio.id}
                      studio={studio}
                      onFavorite={handleFavorite}
                      isFavorite={favorites.has(studio.id)}
                      onBookingClick={handleBookingClick}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        filteredStudios={filteredStudios}
        topService={topService}
        favorites={favorites}
        onFavorite={handleFavorite}
      />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setSelectedService(null); }}
        service={selectedService}
      />
    </div>
  );
}
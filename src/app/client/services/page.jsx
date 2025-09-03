"use client";

import React, { useState, useMemo } from 'react';
import Link from "next/link";
import { Search, Filter, MapPin, Star, Clock, Calendar, Heart, ArrowRight, SlidersHorizontal, X, ChevronDown, Zap, Shield, Users, Award, Menu, Plus } from 'lucide-react';

// Mock data for services with added likes
const mockServices = [
  {
    id: 1,
    name: "Strzyżenie męskie Premium + Stylizacja",
    salon: "Elite Barber Shop",
    category: "Fryzjer",
    price: 120,
    duration: 60,
    rating: 4.8,
    reviews: 124,
    likes: 256,
    location: "Warszawa, Mokotów",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=400&h=300&fit=crop",
    tags: ["Męski", "Premium", "Stylizacja"],
    nextAvailable: "Dziś 14:30",
    isPromoted: true,
    discount: 20
  },
  {
    id: 2,
    name: "Manicure hybrydowy z wzorkami",
    salon: "Studio Piękna Aurora",
    category: "Paznokcie",
    price: 150,
    duration: 90,
    rating: 4.9,
    reviews: 89,
    likes: 178,
    location: "Kraków, Stare Miasto",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
    tags: ["Hybrydowy", "Wzorki", "Długotrwały"],
    nextAvailable: "Jutro 10:00",
    isPromoted: false
  },
  {
    id: 3,
    name: "Masaż relaksacyjny całego ciała",
    salon: "Wellness & Relax Center",
    category: "SPA",
    price: 200,
    duration: 90,
    rating: 4.7,
    reviews: 156,
    likes: 312,
    location: "Wrocław, Centrum",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    tags: ["Relaks", "Całe ciało", "Aromaterapia"],
    nextAvailable: "Za 2 dni 16:00",
    isPromoted: true,
    discount: 15
  },
  {
    id: 4,
    name: "Oczyszczanie twarzy + Peeling",
    salon: "Beauty Clinic Premium",
    category: "Kosmetyczka",
    price: 250,
    duration: 75,
    rating: 4.8,
    reviews: 203,
    likes: 189,
    location: "Gdańsk, Wrzeszcz",
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
    tags: ["Oczyszczanie", "Peeling", "Anti-aging"],
    nextAvailable: "Dziś 18:00",
    isPromoted: false
  },
  {
    id: 5,
    name: "Strzyżenie damskie + Modelowanie",
    salon: "Hair Art Studio",
    category: "Fryzjer",
    price: 180,
    duration: 120,
    rating: 4.6,
    reviews: 67,
    likes: 145,
    location: "Warszawa, Śródmieście",
    distance: "2.8 km",
    image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=300&fit=crop",
    tags: ["Damski", "Modelowanie", "Stylizacja"],
    nextAvailable: "Jutro 12:00",
    isPromoted: false
  },
  {
    id: 6,
    name: "Depilacja laserowa - nogi",
    salon: "Laser Beauty Clinic",
    category: "Depilacja",
    price: 300,
    duration: 60,
    rating: 4.9,
    reviews: 95,
    likes: 234,
    location: "Poznań, Jeżyce",
    distance: "1.9 km",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop",
    tags: ["Laser", "Długotrwały", "Bezbolesny"],
    nextAvailable: "Za 3 dni 14:00",
    isPromoted: true,
    discount: 25
  }
];

const categories = ["Wszystkie", "Fryzjer", "Paznokcie", "SPA", "Kosmetyczka", "Depilacja", "Pedicure", "Makijaż"];
const sortOptions = [
  { value: "relevance", label: "Trafność" },
  { value: "price-low", label: "Cena: od najniższej" },
  { value: "price-high", label: "Cena: od najwyższej" },
  { value: "rating", label: "Najwyżej oceniane" },
  { value: "distance", label: "Najbliżej" }
];

function ServiceCard({ service, onFavorite, isFavorite }) {
  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-violet-300 relative">
      {service.isPromoted && (
        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md backdrop-blur-md">
          -{service.discount}% Promocja
        </div>
      )}

      <div className="relative overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        {/* Favorite button - moved here to be inside image container */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => onFavorite(service.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-100 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 z-10">
          <span className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
            {service.category}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
            {service.name}
          </h3>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-5 h-5 mr-2 text-violet-500" />
            <span className="text-base">{service.salon} • {service.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">{service.rating}</span>
              <span className="text-gray-500 ml-1">({service.reviews})</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-5 h-5 mr-1" />
              <span>{service.duration} min</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {service.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-base text-gray-500 pt-2 border-t border-gray-100">
          <span className="flex items-center">
            <MapPin className="w-5 h-5 mr-1" />
            {service.distance}
          </span>
          <span className="flex items-center">
            <Calendar className="w-5 h-5 mr-1" />
            {service.nextAvailable}
          </span>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="space-y-1">
            {service.isPromoted && (
              <div className="text-base text-gray-400 line-through">
                {Math.round(service.price / (1 - service.discount / 100))} zł
              </div>
            )}
            <div className="text-3xl font-bold text-gray-900">
              {service.price} zł
            </div>
          </div>
          <button className="bg-gradient-to-r from-violet-600 to-purple-600 cursor-pointer hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2">
            <span>Rezerwuj</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }) {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white lg:bg-transparent shadow-2xl lg:shadow-none transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-hidden`}>
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Filtry</h3>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Kategorie */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Kategoria</h4>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category} className="flex items-center cursor-pointer hover:bg-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                    className="mr-3 text-violet-600 focus:ring-violet-500 w-5 h-5"
                  />
                  <span className="text-gray-700 font-medium">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Zakres cen */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Zakres cen</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">{priceRange[0]} zł</span>
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full shadow-sm">{priceRange[1]} zł</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => {
                  const newRange = [priceRange[0], parseInt(e.target.value)];
                  setPriceRange(newRange);
                  onFiltersChange({ ...filters, priceRange: newRange });
                }}
                className="w-full h-2 bg-violet-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
          </div>

          {/* Ocena */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Minimalna ocena</h4>
            <div className="space-y-3">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer hover:bg-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={(e) => {
                      setSelectedRating(parseFloat(e.target.value));
                      onFiltersChange({ ...filters, minRating: parseFloat(e.target.value) });
                    }}
                    className="mr-3 text-violet-600 focus:ring-violet-500 w-5 h-5"
                  />
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                    <span className="font-medium">{rating}+</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dostępność */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Dostępność</h4>
            <div className="space-y-3">
              {[
                { value: 'today', label: 'Dziś', icon: '🔥' },
                { value: 'tomorrow', label: 'Jutro', icon: '⚡' },
                { value: 'week', label: 'W tym tygodniu', icon: '📅' }
              ].map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer hover:bg-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    checked={filters.availability?.includes(option.value)}
                    onChange={(e) => {
                      const current = filters.availability || [];
                      const updated = e.target.checked
                        ? [...current, option.value]
                        : current.filter(v => v !== option.value);
                      onFiltersChange({ ...filters, availability: updated });
                    }}
                    className="mr-3 text-violet-600 focus:ring-violet-500 w-5 h-5 rounded"
                  />
                  <span className="mr-2 text-xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Promocje */}
          <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-5">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.promotions}
                onChange={(e) => onFiltersChange({ ...filters, promotions: e.target.checked })}
                className="mr-4 text-orange-600 focus:ring-orange-500 w-5 h-5 rounded"
              />
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔥</span>
                <span className="text-gray-900 font-bold">Tylko promocje</span>
              </div>
            </label>
          </div>

          <button
            onClick={() => {
              onFiltersChange({ category: 'Wszystkie', priceRange: [0, 500], minRating: 0, availability: [], promotions: false });
              setPriceRange([0, 500]);
              setSelectedRating(0);
            }}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 cursor-pointer text-white rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-md"
          >
            Wyczyść filtry
          </button>
        </div>
      </div>
    </>
  );
}

export default function ServicesPage() {
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

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock: Set to Warszawa for demo
          setLocationQuery('Warszawa');
          alert('Lokalizacja ustawiona na: Warszawa (demo)');
        },
        (error) => {
          alert('Błąd geolokalizacji: ' + error.message);
        }
      );
    } else {
      alert('Geolokalizacja nie jest wspierana.');
    }
  };

  const filteredServices = useMemo(() => {
    let result = mockServices.filter(service => {
      const matchesSearch = searchQuery === '' ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.salon.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = locationQuery === '' ||
        service.location.toLowerCase().includes(locationQuery.toLowerCase());

      const matchesCategory = filters.category === 'Wszystkie' || service.category === filters.category;
      const matchesPrice = service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1];
      const matchesRating = service.rating >= filters.minRating;
      const matchesPromotion = !filters.promotions || service.isPromoted;

      return matchesSearch && matchesLocation && matchesCategory && matchesPrice && matchesRating && matchesPromotion;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
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

  const handleFavorite = (serviceId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                Bookly
              </h1>
              <p className="text-xs text-gray-500 font-medium">Rezerwuj piękno</p>
            </div>

            {/* Search Bar - Hidden on mobile */}
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
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/business" className="text-gray-700 cursor-pointer hover:text-violet-600 px-4 py-3 rounded-full font-semibold transition-all duration-300">
                Dla firmy
              </Link>
              <Link href="/client/auth" className="bg-violet-600 cursor-pointer hover:bg-violet-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                Zaloguj
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj usługi, salonu..."
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition-all duration-300"
              />
            </div>
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Miasto lub lokalizacja..."
                className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm transition-all duration-300"
              />
              <button
                onClick={handleGeolocation}
                className="absolute right-2 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition-all duration-300"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {searchQuery ? `Wyniki dla "${searchQuery}"` : 'Odkryj usługi beauty'}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600 mt-2">
                    <span className="bg-violet-100 text-violet-700 px-4 py-1 rounded-full text-sm font-medium">
                      {filteredServices.length} usług
                    </span>
                    {favorites.size > 0 && (
                      <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Heart className="w-4 h-4 mr-1 fill-current" />
                        {favorites.size} ulubionych
                      </span>
                    )}
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-full px-6 py-3 pr-12 focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Active Filters */}
              {(filters.category !== 'Wszystkie' || filters.promotions || filters.minRating > 0) && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {filters.category !== 'Wszystkie' && (
                    <span className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm">
                      {filters.category}
                      <button
                        onClick={() => setFilters({ ...filters, category: 'Wszystkie' })}
                        className="ml-2 hover:bg-violet-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                  {filters.promotions && (
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm">
                      🔥 Promocje
                      <button
                        onClick={() => setFilters({ ...filters, promotions: false })}
                        className="ml-2 hover:bg-orange-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                  {filters.minRating > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {filters.minRating}+
                      <button
                        onClick={() => setFilters({ ...filters, minRating: 0 })}
                        className="ml-2 hover:bg-yellow-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Services Grid - Reduced columns for larger cards */}
            {filteredServices.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                Brak wyników. Spróbuj zmienić wyszukiwanie lub filtry.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.has(service.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
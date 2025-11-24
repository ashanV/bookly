"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Star, Heart, MapPin, Clock, Phone, Globe,
  Share2, Camera, Calendar, ChevronRight, Users, Award,
  CheckCircle, X, Filter, ChevronDown, Instagram, Facebook,
  Twitter, Youtube, Mail, MessageCircle, Info, Image
} from 'lucide-react';
import BookingModal from '../../../../components/BookingModal';
import { useAuth } from '../../../../hooks/useAuth';

// Mock data for detailed studio info
const getStudioDetails = (id) => {
  const studios = {
    1: {
      id: 1,
      name: "Elite Barber Shop",
      description: "Premium salon fryzjerski dla mężczyzn z tradycją sięgającą 1995 roku. Oferujemy najwyższej jakości usługi fryzjerskie i pielęgnacyjne w eleganckim, męskim wnętrzu.",
      rating: 4.8,
      reviews: 324,
      likes: 456,
      location: "Warszawa, Mokotów",
      fullAddress: "ul. Puławska 142, 02-624 Warszawa",
      distance: "1.2 km",
      phone: "+48 22 123 45 67",
      website: "www.elitebarber.pl",
      email: "kontakt@elitebarber.pl",
      socialMedia: {
        instagram: "https://instagram.com/elitebarber",
        facebook: "https://facebook.com/elitebarber",
        twitter: "https://twitter.com/elitebarber",
        youtube: "https://youtube.com/elitebarber"
      },
      images: [
        "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop"
      ],
      portfolioImages: [
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1606920962412-46b3b5b2ad17?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1571633986899-3b14d5c50b71?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1548142223-a221f7530fef?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1565108808014-b7b6a0cfc6ef?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583907027143-4b86b5b2ee9a?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1616003657970-d4617ee3a5a5?w=400&h=400&fit=crop"
      ],
      aboutUs: {
        story: "Elite Barber Shop powstał w 1995 roku z pasji do klasycznego męskiego stylu. Nasz zespół składa się z doświadczonych mistrzów, którzy łączą tradycyjne techniki z nowoczesnymi trendami. Każdy klient otrzymuje u nas indywidualne podejście i pełen profesjonalizm.",
        mission: "Naszą misją jest przywracanie kultury męskiego piękna i elegancji. Dbamy o każdy detal - od atmosfery salonu po najwyższej jakości kosmetyki i narzędzia.",
        values: ["Tradycja i rzemiosło", "Indywidualne podejście", "Najwyższa jakość", "Męska elegancja", "Profesjonalizm"]
      },
      openingHours: {
        monday: "9:00 - 19:00",
        tuesday: "9:00 - 19:00",
        wednesday: "9:00 - 19:00",
        thursday: "9:00 - 20:00",
        friday: "9:00 - 20:00",
        saturday: "9:00 - 17:00",
        sunday: "Zamknięte"
      },
      nextAvailable: "Dziś 14:30",
      isPromoted: true,
      discount: 20,
      lat: 52.1942,
      lng: 21.0347,
      categories: ["Fryzjer"],
      amenities: ["WiFi", "Parking", "Klimatyzacja", "Muzyka", "Napoje", "Karty płatnicze"],
      team: [
        {
          id: 1,
          name: "Adam Kowalski",
          role: "Master Barber",
          experience: "15 lat doświadczenia",
          rating: 4.9,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
        },
        {
          id: 2,
          name: "Michał Nowak",
          role: "Senior Barber",
          experience: "8 lat doświadczenia",
          rating: 4.7,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        }
      ],
      services: [
        {
          id: 101,
          name: "Strzyżenie męskie Premium + Stylizacja",
          description: "Profesjonalne strzyżenie z konsultacją stylisty, myciem włosów premium szamponami i stylizacją",
          price: 120,
          duration: 60,
          tags: ["Męski", "Premium", "Stylizacja"],
          category: "Strzyżenia"
        },
        {
          id: 102,
          name: "Strzyżenie + Modelowanie brody",
          description: "Klasyczne strzyżenie połączone z profesjonalnym modelowaniem brody maszynką i nożyczkami",
          price: 80,
          duration: 45,
          tags: ["Męski", "Broda", "Stylizacja"],
          category: "Strzyżenia"
        },
        {
          id: 103,
          name: "Golenie tradycyjne",
          description: "Luksusowe golenie brzytewką z gorącymi okładami i olejkami pielęgnacyjnymi",
          price: 60,
          duration: 30,
          tags: ["Męski", "Tradycyjne", "Relaks"],
          category: "Golenie"
        },
        {
          id: 104,
          name: "Strzyżenie dziecięce",
          description: "Strzyżenie dla najmłodszych w przyjaznej atmosferze z zabawkami",
          price: 40,
          duration: 30,
          tags: ["Dziecięce", "Szybkie"],
          category: "Strzyżenia"
        },
        {
          id: 105,
          name: "Pielęgnacja brody",
          description: "Kompleksowa pielęgnacja brody z olejkami i balsamami",
          price: 50,
          duration: 25,
          tags: ["Broda", "Pielęgnacja"],
          category: "Pielęgnacja"
        }
      ],
      reviews: [
        {
          id: 1,
          author: "Tomasz K.",
          rating: 5,
          date: "2024-01-15",
          text: "Świetny salon! Adam to prawdziwy mistrz swojego fachu. Strzyżenie wykonane perfekcyjnie, atmosfera bardzo profesjonalna. Polecam!",
          service: "Strzyżenie męskie Premium + Stylizacja",
          verified: true
        },
        {
          id: 2,
          author: "Marek S.",
          rating: 5,
          date: "2024-01-10",
          text: "Najlepszy barber w Warszawie! Golenie tradycyjne to czysta przyjemność. Obsługa na najwyższym poziomie.",
          service: "Golenie tradycyjne",
          verified: true
        },
        {
          id: 3,
          author: "Piotr W.",
          rating: 4,
          date: "2024-01-08",
          text: "Bardzo dobry salon, profesjonalna obsługa. Jedyny minus to czasem długie oczekiwanie, ale warto.",
          service: "Strzyżenie + Modelowanie brody",
          verified: false
        }
      ]
    }
  };
  return studios[id];
};

const dayNames = {
  monday: "Poniedziałek",
  tuesday: "Wtorek",
  wednesday: "Środa",
  thursday: "Czwartek",
  friday: "Piątek",
  saturday: "Sobota",
  sunday: "Niedziela"
};

export default function StudioDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const id = params?.id;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [serviceFilter, setServiceFilter] = useState('Wszystkie');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [studio, setStudio] = useState(null);
  const [loadingStudio, setLoadingStudio] = useState(true);

  const bookingCardRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchStudio = async () => {
      if (!id) return;
      try {
        setLoadingStudio(true);
        const isMockId = !isNaN(id);
        if (isMockId) {
          const mockStudio = getStudioDetails(parseInt(id));
          setStudio(mockStudio);
        } else {
          const response = await fetch(`/api/businesses/${id}`);
          const data = await response.json();
          if (response.ok && data.business) {
            setStudio(data.business);
          } else {
            const mockStudio = getStudioDetails(parseInt(id));
            setStudio(mockStudio || null);
          }
        }
      } catch (error) {
        console.error('Błąd pobierania szczegółów salona:', error);
        const mockStudio = getStudioDetails(parseInt(id));
        setStudio(mockStudio || null);
      } finally {
        setLoadingStudio(false);
      }
    };
    fetchStudio();
  }, [id]);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        setIsVisible(false);
        setIsSticky(true);
      } else {
        setIsVisible(true);
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!id || authLoading || loadingStudio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{authLoading ? 'Sprawdzanie autoryzacji...' : loadingStudio ? 'Ładowanie szczegółów salona...' : 'Ładowanie...'}</p>
        </div>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Studio nie zostało znalezione</h2>
          <Link href="/client/services" className="text-violet-600 hover:text-violet-700">
            ← Powrót do wyszukiwania
          </Link>
        </div>
      </div>
    );
  }

  const serviceCategories = ['Wszystkie', ...new Set((studio.services || []).map(s => s.category).filter(Boolean))];
  const filteredServices = serviceFilter === 'Wszystkie'
    ? (studio.services || [])
    : (studio.services || []).filter(s => s.category === serviceFilter);

  const handleBookingClick = (service = null) => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/client/auth?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: studio.name,
          text: studio.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link skopiowany do schowka!');
    }
  };

  const socialIcons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {(isSticky || !isVisible) && isDesktop ? (
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-bold text-gray-900">{studio.name}</h1>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{studio.rating}</span>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{studio.location}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/client/services"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Wstecz
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-xl font-bold text-gray-900 truncate">{studio.name}</h1>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {isSticky && isDesktop ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-gray-900">
                      Od {studio.services && studio.services.length > 0 ? Math.min(...studio.services.map(s => s.price)) : 0} zł
                    </div>
                    <div className="text-xs text-green-600">{studio.nextAvailable || 'Sprawdź dostępność'}</div>
                  </div>
                  <button
                    onClick={() => handleBookingClick()}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    Zarezerwuj
                  </button>
                  <div className="h-6 w-px bg-gray-300" />
                </div>
              ) : null}
              {isSticky && !isDesktop && (
                <button
                  onClick={() => handleBookingClick()}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Zarezerwuj
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-all ${isFavorite
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {(studio.images && studio.images.length > 0) && (
              <div className="relative">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={studio.images[currentImageIndex] || studio.images[0]}
                    alt={studio.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {studio.images.length > 1 && (
                  <div className="flex mt-4 space-x-2 overflow-x-auto">
                    {studio.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-violet-500' : 'border-transparent'
                          }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Studio Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{studio.name}</h1>
                  <p className="text-gray-600 leading-relaxed mb-4">{studio.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium text-gray-900">{studio.rating}</span>
                      <span className="ml-1">({studio.reviews?.length || studio.reviews || 0} opinii)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {studio.distance}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {studio.likes} polubień
                    </div>
                  </div>
                </div>
                {studio.isPromoted && studio.discount && (
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    🔥 -{studio.discount}%
                  </div>
                )}
              </div>

              {(studio.socialMedia && Object.values(studio.socialMedia).some(url => url)) && (
                <div className="border-t pt-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Śledź nas</h3>
                  <div className="flex space-x-3">
                    {Object.entries(studio.socialMedia || {}).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = socialIcons[platform];
                      if (!Icon) return null;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-600 transition-all"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {(studio.amenities && studio.amenities.length > 0) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Udogodnienia</h3>
                  <div className="flex flex-wrap gap-2">
                    {studio.amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {[
                    { id: 'services', label: 'Usługi', icon: Calendar },
                    { id: 'about', label: 'O nas', icon: Info },
                    { id: 'portfolio', label: 'Portfolio', icon: Image },
                    { id: 'team', label: 'Zespół', icon: Users },
                    { id: 'reviews', label: 'Opinie', icon: Star }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex items-center justify-center px-6 py-4 text-sm font-medium transition-all ${activeTab === tab.id
                        ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Usługi ({filteredServices.length})</h3>
                      {serviceCategories.length > 1 && (
                        <div className="relative">
                          <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            {serviceCategories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {filteredServices.map(service => (
                        <div key={service.id} className="border border-gray-200 rounded-xl p-5 hover:border-violet-300 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                              {service.tags && service.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {service.tags.map((tag, index) => (
                                    <span key={index} className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {service.duration} min
                              </div>
                              <div className="font-bold text-xl text-gray-900">
                                {service.price} zł
                              </div>
                            </div>
                            <button
                              onClick={() => handleBookingClick(service)}
                              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                            >
                              Zarezerwuj
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Us Tab */}
                {activeTab === 'about' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">O nas</h3>
                    <div className="space-y-8">
                      {studio.aboutUs?.story && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Nasza historia</h4>
                          <p className="text-gray-700 leading-relaxed">{studio.aboutUs.story}</p>
                        </div>
                      )}
                      {studio.aboutUs?.mission && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Misja</h4>
                          <p className="text-gray-700 leading-relaxed">{studio.aboutUs.mission}</p>
                        </div>
                      )}
                      {(!studio.aboutUs?.story && !studio.aboutUs?.mission) && (
                        <div>
                          <p className="text-gray-700 leading-relaxed">{studio.description || 'Brak dodatkowych informacji.'}</p>
                        </div>
                      )}
                      {studio.aboutUs?.values && studio.aboutUs.values.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Nasze wartości</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {studio.aboutUs.values.map((value, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-violet-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Portfolio ({(studio.portfolioImages || studio.images || []).length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(studio.portfolioImages || studio.images || []).map((image, index) => (
                        <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-gray-600">Zobacz więcej naszych prac na mediach społecznościowych</p>
                      <div className="flex justify-center space-x-3 mt-3">
                        {Object.entries(studio.socialMedia || {}).map(([platform, url]) => {
                          if (!url) return null;
                          const Icon = socialIcons[platform];
                          if (!Icon) return null;
                          if (platform === 'instagram' || platform === 'facebook') {
                            return (
                              <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 transition-all"
                              >
                                <Icon className="w-5 h-5" />
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Nasz zespół</h3>
                    {(studio.team && studio.team.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {studio.team.map(member => (
                          <div key={member.id} className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                                <p className="text-violet-600 font-medium">{member.role}</p>
                                <p className="text-sm text-gray-500">{member.experience}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-medium text-gray-900">{member.rating}</span>
                                <span className="text-sm text-gray-500">ocena</span>
                              </div>
                              <button
                                onClick={() => handleBookingClick()}
                                className="bg-white border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-all"
                              >
                                Wybierz
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Brak informacji o zespole</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Opinie ({(studio.reviews || []).length})
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-bold text-gray-900">{studio.rating || 0}</span>
                        <span className="text-gray-500">/ 5</span>
                      </div>
                    </div>

                    {(studio.reviews && studio.reviews.length > 0) ? (
                      <div className="space-y-6">
                        {(showAllReviews ? studio.reviews : studio.reviews.slice(0, 3)).map(review => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-gray-900">{review.author}</span>
                                  {review.verified && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  <span>•</span>
                                  <span>{review.date}</span>
                                  <span>•</span>
                                  <span className="text-violet-600">{review.service}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.text}</p>
                          </div>
                        ))}

                        {studio.reviews.length > 3 && (
                          <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="w-full text-center py-3 text-violet-600 hover:text-violet-700 font-medium transition-colors"
                          >
                            {showAllReviews ? 'Pokaż mniej opinii' : `Pokaż wszystkie opinie (${studio.reviews.length})`}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Brak opinii. Bądź pierwszym, który oceni ten salon!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1" ref={sidebarRef}>
            {/* Booking Card */}
            <div
              ref={bookingCardRef}
              className={`bg-white rounded-2xl p-6 shadow-sm transition-all duration-500 ${isSticky && isDesktop ? 'fixed top-32 w-80 z-30' : 'sticky top-24'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'
                }`}
            >
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  Od {studio.services && studio.services.length > 0 ? Math.min(...studio.services.map(s => s.price)) : 0} zł
                </div>
                <div className="text-green-600 font-medium flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {studio.nextAvailable || 'Sprawdź dostępność'}
                </div>
              </div>

              <button
                onClick={() => handleBookingClick()}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl mb-4"
              >
                Zarezerwuj teraz
              </button>

              <div className="text-center text-sm text-gray-500 mb-6">
                ⚡ Natychmiastowe potwierdzenie
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{studio.location}</div>
                    <div className="text-sm text-gray-500">{studio.fullAddress}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${studio.phone}`} className="text-violet-600 hover:text-violet-700 font-medium">
                    {studio.phone}
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a
                    href={`https://${studio.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:text-violet-700 font-medium"
                  >
                    {studio.website}
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${studio.email}`} className="text-violet-600 hover:text-violet-700 font-medium">
                    {studio.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Godziny otwarcia
              </h3>
              <div className="space-y-2">
                {Object.entries(studio.openingHours || studio.workingHours || {}).map(([day, hours]) => {
                  if (typeof hours === 'object' && hours !== null) {
                    if (hours.closed) {
                      return (
                        <div key={day} className="flex justify-between items-center py-2">
                          <span className="text-gray-600">{dayNames[day] || day}</span>
                          <span className="font-medium text-red-600">Zamknięte</span>
                        </div>
                      );
                    }
                    return (
                      <div key={day} className="flex justify-between items-center py-2">
                        <span className="text-gray-600">{dayNames[day] || day}</span>
                        <span className="font-medium text-gray-900">{hours.open} - {hours.close}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={day} className="flex justify-between items-center py-2">
                      <span className="text-gray-600">{dayNames[day]}</span>
                      <span className={`font-medium ${hours === 'Zamknięte' ? 'text-red-600' : 'text-gray-900'}`}>
                        {hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Szybkie akcje</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-xl transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span>Wyślij wiadomość</span>
                </button>

                <button className="w-full flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl transition-all">
                  <Phone className="w-5 h-5" />
                  <span>Zadzwoń</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Udostępnij</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        studio={studio}
      />
    </div>
  );
}
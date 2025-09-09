"use client";

import React, { useState, useMemo } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation'; // App Router hook
import { 
  ArrowLeft, Star, Heart, MapPin, Clock, Phone, Globe, 
  Share2, Camera, Calendar, ChevronRight, Users, Award,
  CheckCircle, X, Filter, ChevronDown
} from 'lucide-react';
import BookingModal from '../../../../components/BookingModal';

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
      images: [
        "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop"
      ],
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
  const params = useParams(); // App Router way to get params
  const id = params?.id; // Get id from params
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [serviceFilter, setServiceFilter] = useState('Wszystkie');
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  const studio = useMemo(() => {
    if (!id) return null;
    return getStudioDetails(parseInt(id));
  }, [id]);
  
  // Loading state while params are being resolved
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!studio) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Studio nie zostało znalezione</h2>
        <Link href="/client/services" className="text-violet-600 hover:text-violet-700">
          ← Powrót do wyszukiwania
        </Link>
      </div>
    </div>;
  }

  const serviceCategories = ['Wszystkie', ...new Set(studio.services.map(s => s.category))];
  const filteredServices = serviceFilter === 'Wszystkie' 
    ? studio.services 
    : studio.services.filter(s => s.category === serviceFilter);

  const handleBookingClick = (service = null) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite 
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={studio.images[currentImageIndex]}
                  alt={studio.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex mt-4 space-x-2 overflow-x-auto">
                {studio.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-violet-500' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

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
                      <span className="ml-1">({studio.reviews.length} opinii)</span>
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

              {/* Amenities */}
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
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'services', label: 'Usługi', icon: Calendar },
                    { id: 'team', label: 'Zespół', icon: Users },
                    { id: 'reviews', label: 'Opinie', icon: Star }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-all ${
                        activeTab === tab.id
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
                    </div>
                    
                    <div className="space-y-4">
                      {filteredServices.map(service => (
                        <div key={service.id} className="border border-gray-200 rounded-xl p-5 hover:border-violet-300 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {service.tags.map((tag, index) => (
                                  <span key={index} className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
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

                {/* Team Tab */}
                {activeTab === 'team' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Nasz zespół</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {studio.team.map(member => (
                        <div key={member.id} className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-center mb-4">
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-16 h-16 rounded-full object-cover mr-4"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              <p className="text-violet-600 font-medium">{member.role}</p>
                              <p className="text-gray-500 text-sm">{member.experience}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{member.rating}</span>
                            <span className="text-gray-500 text-sm ml-2">ocena klientów</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Opinie ({studio.reviews.length})
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900">{studio.rating}</span>
                        <span>średnia ocena</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {(showAllReviews ? studio.reviews : studio.reviews.slice(0, 3)).map(review => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                                <span className="font-medium text-violet-600">
                                  {review.author.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-gray-900">{review.author}</h5>
                                  {review.verified && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3 h-3 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                  <span>•</span>
                                  <span>{new Date(review.date).toLocaleDateString('pl-PL')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.text}</p>
                          <p className="text-sm text-violet-600">Usługa: {review.service}</p>
                        </div>
                      ))}
                      
                      {studio.reviews.length > 3 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="w-full py-3 text-violet-600 font-medium hover:bg-violet-50 rounded-lg transition-colors"
                        >
                          {showAllReviews ? 'Pokaż mniej opinii' : `Pokaż wszystkie ${studio.reviews.length} opinii`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  Od {Math.min(...studio.services.map(s => s.price))} zł
                </div>
                <div className="text-green-600 font-medium flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {studio.nextAvailable}
                </div>
              </div>
              
              <button
                onClick={() => handleBookingClick()}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl mb-4"
              >
                Zarezerwuj teraz
              </button>
              
              <div className="text-center text-gray-500 text-sm">
                Bezpłatna rezerwacja • Potwierdzenie natychmiastowe
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Kontakt</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{studio.location}</div>
                    <div className="text-sm">{studio.fullAddress}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <a href={`tel:${studio.phone}`} className="hover:text-violet-600">
                    {studio.phone}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="w-4 h-4 mr-3 flex-shrink-0" />
                  <a 
                    href={`https://${studio.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-violet-600"
                  >
                    {studio.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Godziny otwarcia</h3>
              <div className="space-y-2">
                {Object.entries(studio.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-600">{dayNames[day]}</span>
                    <span className={`font-medium ${hours === 'Zamknięte' ? 'text-red-500' : 'text-gray-900'}`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

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
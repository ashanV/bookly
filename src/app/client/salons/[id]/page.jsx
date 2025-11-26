"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Star, Heart, MapPin, Clock, Phone, Globe,
  Share2, Calendar, Users, CheckCircle, ChevronDown, Instagram, Facebook,
  Twitter, Youtube, Mail, MessageCircle, Info, Image as ImageIcon,
  ChevronRight, Sparkles, Scissors, BadgeCheck, X
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import BookingModal from '../../../../components/BookingModal';
import { useAuth } from '../../../../hooks/useAuth';

// --- Mock Data & Helpers ---

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
        "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=800&fit=crop"
      ],
      portfolioImages: [
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1606920962412-46b3b5b2ad17?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571633986899-3b14d5c50b71?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1548142223-a221f7530fef?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1565108808014-b7b6a0cfc6ef?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583907027143-4b86b5b2ee9a?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1616003657970-d4617ee3a5a5?w=600&h=600&fit=crop"
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
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
        },
        {
          id: 2,
          name: "Michał Nowak",
          role: "Senior Barber",
          experience: "8 lat doświadczenia",
          rating: 4.7,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
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

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube
};

// --- Components ---

const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${active ? 'text-violet-600' : 'text-gray-500 hover:text-gray-900'
      }`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

const ServiceCard = ({ service, onBook }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    className="group bg-white border border-gray-100 rounded-2xl p-5 transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-violet-600 transition-colors">{service.name}</h4>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{service.description}</p>
        <div className="flex flex-wrap gap-2">
          {service.tags?.map((tag, i) => (
            <span key={i} className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md text-xs font-medium border border-gray-100">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right">
        <span className="block text-xl font-bold text-gray-900">{service.price} zł</span>
        <span className="text-xs text-gray-400">{service.duration} min</span>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
      <button
        onClick={() => onBook(service)}
        className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-600 transition-colors flex items-center shadow-md hover:shadow-lg transform active:scale-95 duration-200"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Rezerwuj
      </button>
    </div>
  </motion.div>
);

const ReviewCard = ({ review }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg">
          {review.author.charAt(0)}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900">{review.author}</span>
            {review.verified && <BadgeCheck className="w-4 h-4 text-violet-500" />}
          </div>
          <div className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm">
        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
        <span className="font-bold text-gray-900">{review.rating}</span>
      </div>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.text}</p>
    <div className="text-xs text-violet-600 font-medium bg-violet-50 inline-block px-2 py-1 rounded">
      Usługa: {review.service}
    </div>
  </motion.div>
);

const ReviewModal = ({ isOpen, onClose, onSubmit, services }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setReviewText('');
      setSelectedServiceId('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !reviewText.trim() || !selectedServiceId) {
      alert('Proszę wypełnić wszystkie pola i wybrać ocenę.');
      return;
    }
    const serviceName = services.find(s => s.id === parseInt(selectedServiceId))?.name;
    onSubmit({
      rating,
      text: reviewText,
      service: serviceName,
      serviceId: parseInt(selectedServiceId),
      date: new Date().toISOString().split('T')[0],
      verified: true // Assuming reviews from modal are verified
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Dodaj swoją opinię</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ocena</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              Usługa, której dotyczy opinia
            </label>
            <select
              id="service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md shadow-sm"
              required
            >
              <option value="">Wybierz usługę</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
              Twoja opinia
            </label>
            <textarea
              id="reviewText"
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="shadow-sm focus:ring-violet-500 focus:border-violet-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
              placeholder="Podziel się swoją opinią o usłudze..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
          >
            Wyślij opinię
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

export default function StudioDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const id = params?.id;

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [studio, setStudio] = useState(null);
  const [loadingStudio, setLoadingStudio] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('Wszystkie');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchStudio = async () => {
      if (!id) return;
      try {
        setLoadingStudio(true);
        // Try to fetch real data, fallback to mock
        const isMockId = !isNaN(id);
        if (isMockId) {
          setStudio(getStudioDetails(parseInt(id)));
        } else {
          const response = await fetch(`/api/businesses/${id}`);
          const data = await response.json();
          if (response.ok && data.business) {
            setStudio(data.business);
          } else {
            setStudio(getStudioDetails(parseInt(id)) || null);
          }
        }
      } catch (error) {
        console.error('Error fetching studio:', error);
        setStudio(getStudioDetails(parseInt(id)) || null);
      } finally {
        setLoadingStudio(false);
      }
    };
    fetchStudio();
  }, [id]);

  const handleBookingClick = (service = null) => {
    if (!isAuthenticated) {
      router.push(`/client/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
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
      alert('Link skopiowany!');
    }
  };

  const handleAddReview = async (reviewData) => {
    if (!isAuthenticated) {
      router.push(`/client/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const response = await fetch(`/api/businesses/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reviewData,
          author: user?.name || 'Anonim', // Fallback if user name is missing
        }),
      });

      if (response.ok) {
        // Refresh studio data to show new review
        const updatedResponse = await fetch(`/api/businesses/${id}`);
        const data = await updatedResponse.json();
        if (updatedResponse.ok && data.business) {
          setStudio(data.business);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Błąd podczas dodawania opinii');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Wystąpił błąd. Spróbuj ponownie później.');
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  if (!id || authLoading || loadingStudio) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nie znaleziono salonu</h2>
          <Link href="/client/services" className="text-violet-600 hover:text-violet-700 font-medium">
            ← Wróć do wyszukiwarki
          </Link>
        </div>
      </div>
    );
  }

  const serviceCategories = ['Wszystkie', ...new Set((studio.services || []).map(s => s.category).filter(Boolean))];
  const filteredServices = serviceFilter === 'Wszystkie'
    ? (studio.services || [])
    : (studio.services || []).filter(s => s.category === serviceFilter);

  const currentDay = getCurrentDay();
  
  // Helper to get reviews array and count
  // Priority: reviewsList (if exists) > reviews (if array) > reviews (if number) > []
  const reviewsArray = Array.isArray(studio.reviewsList) 
    ? studio.reviewsList 
    : (Array.isArray(studio.reviews) ? studio.reviews : []);
  
  const reviewsCount = Array.isArray(studio.reviewsList) 
    ? studio.reviewsList.length 
    : (Array.isArray(studio.reviews) 
      ? studio.reviews.length 
      : (typeof studio.reviews === 'number' ? studio.reviews : 0));

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* Sticky Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/client/services" className={`flex items-center transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            <div className={`p-2 rounded-full transition-colors ${scrolled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-black/20 hover:bg-black/30 backdrop-blur-sm'}`}>
              <ArrowLeft className="w-5 h-5" />
            </div>
          </Link>

          <AnimatePresence>
            {scrolled && (
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-bold text-gray-900 truncate max-w-md"
              >
                {studio.name}
              </motion.h1>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm'
                }`}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'hover:bg-gray-100' : 'bg-black/20 hover:bg-black/30 backdrop-blur-sm'
                } ${isFavorite ? 'text-red-500' : scrolled ? 'text-gray-600' : 'text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden bg-gray-900">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
          <img
            src={studio.images?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"}
            alt={studio.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 pb-12 pt-32 bg-gradient-to-t from-gray-900 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {studio.isPromoted && (
                  <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-violet-900/20">
                    Promowany
                  </span>
                )}
                {studio.discount && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    -{studio.discount}%
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center border border-white/10">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  {studio.rating} ({reviewsCount})
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                {studio.name}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center text-gray-300 gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-violet-400" />
                  {studio.fullAddress}
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-violet-400" />
                  {studio.nextAvailable ? `Wolny termin: ${studio.nextAvailable}` : 'Sprawdź dostępność'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Tabs Navigation */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-24 z-30">
              <nav className="flex overflow-x-auto no-scrollbar gap-2">
                {[
                  { id: 'services', label: 'Usługi', icon: Scissors },
                  { id: 'team', label: 'Zespół', icon: Users },
                  { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
                  { id: 'reviews', label: 'Opinie', icon: Star },
                  { id: 'about', label: 'O nas', icon: Info }
                ].map((tab) => (
                  <TabButton
                    key={tab.id}
                    {...tab}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'services' && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Wybierz usługę</h3>
                      {serviceCategories.length > 1 && (
                        <div className="relative">
                          <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-sm"
                          >
                            {serviceCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      )}
                    </div>
                    <div className="grid gap-4">
                      {filteredServices.map(service => (
                        <ServiceCard key={service.id} service={service} onBook={handleBookingClick} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'team' && (
                  <motion.div
                    key="team"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {studio.team?.map(member => (
                      <div key={member.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                        <p className="text-violet-600 font-medium text-sm mb-2">{member.role}</p>
                        <p className="text-gray-500 text-xs mb-4">{member.experience}</p>
                        <button
                          onClick={() => handleBookingClick()}
                          className="w-full bg-gray-50 hover:bg-violet-50 text-gray-900 hover:text-violet-700 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          Umów wizytę
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'portfolio' && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="columns-2 md:columns-3 gap-4 space-y-4">
                      {(studio.portfolioImages || studio.images || []).map((img, i) => (
                        <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                          <img src={img} alt="" className="w-full h-auto hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-violet-50 rounded-2xl p-8 text-center border border-violet-100">
                      <div className="text-5xl font-bold text-violet-900 mb-2">{studio.rating}</div>
                      <div className="flex justify-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-6 h-6 ${i < Math.round(studio.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-violet-700 font-medium">Na podstawie {reviewsCount} opinii</p>

                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push(`/client/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
                            return;
                          }
                          setIsReviewModalOpen(true);
                        }}
                        className="mt-6 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-violet-500/30 flex items-center justify-center mx-auto"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        Dodaj opinię
                      </button>
                    </div>
                    <div className="space-y-4">
                      {Array.isArray(reviewsArray) && reviewsArray.length > 0 ? (
                        reviewsArray.map((review, i) => (
                          <ReviewCard key={review.id || i} review={review} />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          Brak opinii. Bądź pierwszym, który doda opinię!
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 text-violet-600 mr-2" />
                        Nasza historia
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{studio.aboutUs?.story || studio.description}</p>
                    </div>

                    {studio.aboutUs?.mission && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <BadgeCheck className="w-5 h-5 text-violet-600 mr-2" />
                          Misja
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{studio.aboutUs.mission}</p>
                      </div>
                    )}

                    {studio.amenities && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Udogodnienia</h3>
                        <div className="flex flex-wrap gap-3">
                          {studio.amenities.map((amenity, i) => (
                            <span key={i} className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Booking Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-1">Ceny od</p>
                  <div className="text-3xl font-bold text-gray-900">
                    {studio.services && studio.services.length > 0 ? Math.min(...studio.services.map(s => s.price)) : 0} zł
                  </div>
                </div>

                <button
                  onClick={() => handleBookingClick()}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-violet-500/30 mb-4 flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Zarezerwuj wizytę
                </button>

                <div className="flex items-center justify-center text-green-600 text-sm font-medium bg-green-50 py-2 rounded-lg mb-6">
                  <Clock className="w-4 h-4 mr-2" />
                  {studio.nextAvailable || 'Dostępne terminy'}
                </div>

                {/* Opening Hours Calendar */}
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Godziny otwarcia
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(dayNames).map(([key, label]) => {
                      // Handle both data structures: simple string (mock) or object (real DB)
                      const hoursData = studio.workingHours?.[key] || studio.openingHours?.[key];

                      let displayHours = 'Zamknięte';
                      let isClosed = true;

                      if (typeof hoursData === 'string') {
                        displayHours = hoursData;
                        isClosed = hoursData === 'Zamknięte';
                      } else if (hoursData && typeof hoursData === 'object') {
                        if (!hoursData.closed && hoursData.open && hoursData.close) {
                          displayHours = `${hoursData.open} - ${hoursData.close}`;
                          isClosed = false;
                        }
                      }

                      const isToday = key === currentDay;

                      return (
                        <div
                          key={key}
                          className={`flex justify-between items-center py-1.5 px-2 rounded-lg ${isToday ? 'bg-violet-50 font-medium' : ''
                            }`}
                        >
                          <span className={isToday ? 'text-violet-700' : 'text-gray-500'}>
                            {label}
                          </span>
                          <span className={
                            isClosed
                              ? 'text-red-500'
                              : isToday ? 'text-violet-700' : 'text-gray-900'
                          }>
                            {displayHours}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Adres</p>
                      <p className="text-sm text-gray-500">{studio.fullAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Socials */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Kontakt</h3>
                <div className="space-y-3 mb-6">
                  <a href={`tel:${studio.phone}`} className="flex items-center space-x-3 text-gray-600 hover:text-violet-600 transition-colors p-2 hover:bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5" />
                    <span>{studio.phone}</span>
                  </a>
                  <a href={`mailto:${studio.email}`} className="flex items-center space-x-3 text-gray-600 hover:text-violet-600 transition-colors p-2 hover:bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5" />
                    <span>{studio.email}</span>
                  </a>
                  <a href={`https://${studio.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-600 hover:text-violet-600 transition-colors p-2 hover:bg-gray-50 rounded-lg">
                    <Globe className="w-5 h-5" />
                    <span>{studio.website}</span>
                  </a>
                </div>

                <div className="flex justify-center space-x-4 pt-4 border-t border-gray-100">
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
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-violet-100 hover:text-violet-600 transition-all"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedService}
        studioName={studio.name}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleAddReview}
        services={studio.services || []}
      />
    </div>
  );
}
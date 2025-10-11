"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Calendar,
  Clock,
  Star,
  MapPin,
  Sparkles,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";


// Komponenty
import Navigation from "@/components/Navbar";
import Footer from "@/components/Footer";
import TypeText from "@/components/animations/TypeText";
import AnimatedContent from '@/components/animations/AnimatedContent';


function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector(".search-container");
      const suggestionsContainer = document.querySelector(
        ".search-suggestions-container"
      );

      if (
        searchContainer &&
        !searchContainer.contains(event.target) &&
        suggestionsContainer &&
        !suggestionsContainer.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    };

    if (isSearchFocused) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSearchFocused]);

  const closeSuggestions = () => {
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      console.log("Szukam:", searchQuery);
      setIsSearchFocused(false);
      // Navigate to services page with search query
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/client/services?search=${encodedQuery}`);
    }
  };

  const handleSuggestionClick = (term) => {
    setSearchQuery(term);
    const encodedQuery = encodeURIComponent(term);
    router.push(`/client/services?search=${encodedQuery}`);
  };

  const handleCityClick = (city) => {
    const newQuery = `${searchQuery} ${city}`;
    setSearchQuery(newQuery);
    const encodedQuery = encodeURIComponent(newQuery);
    router.push(`/client/services?search=${encodedQuery}`);
  };

  return (
    <section className="hero-bg min-h-screen flex items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 pt-20 pb-16 relative z-10">
        <div className="text-center text-white">
          <AnimatedContent delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8">
              Znajdź i zarezerwuj <br />
              swój idealny{" "}
              <span className="hero-gradient-text">
                <TypeText 
                  text={["termin", "styl", "relaks"]}
                  typingSpeed={100}
                  pauseDuration={2000}
                  deletingSpeed={50}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorClassName="pulse-custom"
                  className="inline"
                />
              </span>
            </h1>
          </AnimatedContent>

          <AnimatedContent delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12">
              Odkryj najlepszych specjalistów w Twojej okolicy. Szybka i prosta
              rezerwacja wizyt online 24/7.
            </p>
          </AnimatedContent>

          <AnimatedContent delay={0.3}>
            <div className="mt-10 max-w-2xl mx-auto mb-12">
            <div className="search-container relative group">
              <div
                className={`glass-card rounded-xl shadow-xl border transition-all duration-300 ${isSearchFocused
                  ? "border-white/60 shadow-xl scale-[1.0]"
                  : "border-white/20 hover:border-white/40"
                  }`}
              >
                <div className="flex items-center p-2">
                  <div className="flex items-center flex-1 px-4">
                    <Search
                      className={`w-5 h-5 mr-3 transition-colors duration-300 ${isSearchFocused ? "text-violet-500" : "text-gray-400"
                        }`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchSubmit();
                        }
                      }}
                      placeholder="Jakiej usługi szukasz? (np. strzyżenie męskie, manicure)"
                      className="search-input w-full py-3 bg-transparent placeholder-gray-400 text-gray-700 focus:outline-none text-base border-0 focus:ring-0"
                    />
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="cursor-pointer bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!searchQuery.trim()}
                  >
                    Szukaj
                  </button>
                </div>
              </div>

              {isSearchFocused && (
                <div className="search-suggestions-container absolute top-full left-0 right-0 mt-4 z-50">
                    <div
                      className="glass-card rounded-lg p-5 shadow-xl border border-white/20 pulse-glow"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={closeSuggestions}
                        className="cursor-pointer absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="text-sm text-gray-600 mb-3 font-medium flex items-center">
                        <Search className="w-4 h-4 mr-2 text-violet-500" />
                        Popularne wyszukiwania:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Fryzjer męski",
                          "Manicure hybrydowy",
                          "Masaż relaksacyjny",
                          "Depilacja",
                          "Strzyżenie damskie",
                          "Pedicure",
                        ].map((term) => (
                          <button
                            key={term}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleSuggestionClick(term);
                            }}
                            className="suggestion-item hover-lift text-sm bg-gradient-to-r from-white to-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:from-violet-50 hover:to-purple-50 hover:text-violet-700 cursor-pointer font-medium border border-gray-200 hover:border-violet-300 shadow-sm hover:shadow-lg"
                          >
                            {term}
                          </button>
                        ))}
                      </div>

                      {searchQuery && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-600 mb-2 font-medium flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-violet-500" />
                            Szukasz: &quot;{searchQuery}&quot;
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Warszawa",
                              "Kraków",
                              "Wrocław",
                              "Gdańsk",
                              "Poznań",
                            ].map((city) => (
                              <button
                                key={city}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleCityClick(city);
                                }}
                                className="suggestion-item hover-lift text-sm bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 px-3 py-2 rounded-lg hover:from-violet-100 hover:to-purple-100 cursor-pointer font-medium border border-violet-200 hover:border-violet-400 shadow-sm hover:shadow-lg"
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              )}
            </div>
          </div>
          </AnimatedContent>

          <AnimatedContent delay={0.4}>
            <div className="popular-services-slide flex flex-wrap items-center justify-center gap-3 mb-16 transition-all duration-500 ease-out"
            style={{
              marginTop: isSearchFocused
                ? searchQuery
                  ? "200px"
                  : "160px"
                : "0px",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <span className="text-gray-200 font-medium hidden sm:inline mr-2 text-base">
              Popularne:
            </span>
            {[
              "Fryzjer",
              "Barber",
              "Kosmetyczka",
              "Paznokcie",
              "Masaż",
              "SPA",
            ].map((service) => (
              <button
                key={service}
                className="cursor-pointer hover-lift glass-card text-gray-700 px-5 py-3 rounded-lg font-medium hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/20 hover:border-white/40"
                onClick={() => {
                  const encodedQuery = encodeURIComponent(service);
                  router.push(`/client/services?search=${encodedQuery}`);
                }}
              >
                {service}
              </button>
            ))}
          </div>
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
}

function FeaturedServices() {
  const router = useRouter();
  const services = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=400&h=250&fit=crop",
      category: "Fryzjer",
      categoryColor: "bg-blue-100 text-blue-700",
      name: "Strzyżenie męskie Premium",
      salon: "Elite Barber Shop",
      price: "120 zł",
      rating: 4.8,
      reviews: 124,
      location: "Warszawa, Mokotów",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=250&fit=crop",
      category: "Paznokcie",
      categoryColor: "bg-pink-100 text-pink-700",
      name: "Manicure hybrydowy z wzorkami",
      salon: "Studio Piękna Aurora",
      price: "150 zł",
      rating: 4.9,
      reviews: 89,
      location: "Kraków, Stare Miasto",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=250&fit=crop",
      category: "SPA",
      categoryColor: "bg-green-100 text-green-700",
      name: "Masaż relaksacyjny całego ciała",
      salon: "Wellness & Relax",
      price: "200 zł",
      rating: 4.7,
      reviews: 156,
      location: "Wrocław, Centrum",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=250&fit=crop",
      category: "Kosmetyczka",
      categoryColor: "bg-purple-100 text-purple-700",
      name: "Oczyszczanie twarzy z peelingiem",
      salon: "Beauty Clinic Premium",
      price: "250 zł",
      rating: 4.8,
      reviews: 203,
      location: "Gdańsk, Wrzeszcz",
    },
  ];

  const handleServiceClick = (service) => {
    const encodedCategory = encodeURIComponent(service.category);
    router.push(`/client/services?category=${encodedCategory}`);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedContent delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Odkryj najlepsze usługi w{" "}
              <span className="hero-gradient-text">Twojej okolicy</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wybrane przez naszych ekspertów miejsca, które gwarantują najwyższą
              jakość usług
            </p>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <AnimatedContent key={service.id} delay={0.2 + (index * 0.1)}>
              <div
                className="service-card bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl group cursor-pointer"
                onClick={() => handleServiceClick(service)}
              >
              <div className="relative overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`${service.categoryColor} px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {service.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white bg-opacity-90 px-2 py-1 rounded-lg text-sm font-semibold text-gray-800 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    {service.rating}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {service.salon}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {service.location} • {service.reviews} opinii
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {service.price}
                  </span>
                  <button className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center">
                    Rezerwuj
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const mainFeatures = [
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Błyskawiczne rezerwacje",
      description:
        "Zarezerwuj wizytę w mniej niż 30 sekund. Bez czekania, bez telefonów.",
      stats: "98% rezerwacji w < 30s",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Bezpieczeństwo płatności",
      description:
        "Wszystkie transakcje są zabezpieczone najwyższymi standardami bezpieczeństwa.",
      stats: "256-bit SSL szyfrowanie",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Sprawdzeni specjaliści",
      description:
        "Każdy specjalista przechodzi proces weryfikacji i ma potwierdzone kwalifikacje.",
      stats: "100% zweryfikowanych",
      color: "from-blue-400 to-cyan-500",
    },
  ];

  const additionalFeatures = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Przypomnienia SMS",
      description: "Automatyczne przypomnienia o nadchodzących wizytach",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "System ocen",
      description: "Sprawdź opinie innych klientów przed rezerwacją",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Geolokalizacja",
      description: "Znajdź najbliższe salony w okolicy",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Kalendarz wizyt",
      description: "Zarządzaj wszystkimi wizytami w jednym miejscu",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mainFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [mainFeatures.length]);

  return (
    <section className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Header */}
        <AnimatedContent delay={0.1}>
          <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-violet-100 to-purple-100 px-6 py-2 rounded-full text-violet-700 font-semibold mb-6">
            <Sparkles className="w-5 h-5 mr-2" />
            Dlaczego jesteśmy najlepsi
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
            Doświadczenie które{" "}
            <span className="hero-gradient-text">zmienia wszystko</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nie jesteśmy kolejną platformą rezerwacji. Tworzymy przyszłość
            branży beauty & wellness.
          </p>
          </div>
        </AnimatedContent>

        {/* Interactive Main Features */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            {mainFeatures.map((feature, index) => (
              <AnimatedContent key={index} delay={0.2 + (index * 0.1)}>
                <div
                  className={`relative p-8 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${activeFeature === index
                    ? "bg-white shadow-2xl border-2 border-violet-200"
                    : "bg-white/50 hover:bg-white/80 shadow-lg"
                    }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                <div className="flex items-start space-x-6">
                  <div
                    className={`bg-gradient-to-br ${feature.color} text-white p-4 rounded-2xl flex-shrink-0 shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg mb-4">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      {feature.stats}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
                  {activeFeature === index && (
                    <div
                      className={`h-full bg-gradient-to-r ${feature.color}`}
                      style={{ width: "100%", transition: "width 4s linear" }}
                    />
                  )}
                </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* Enhanced Visual Showcase without main image */}
          <AnimatedContent delay={0.5}>
            <div className="relative min-h-[500px] flex items-center justify-center">
            {/* Central decorative element */}
            <div className="relative w-80 h-80">
              {/* Main circle with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400 rounded-full opacity-20"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-violet-300 via-purple-300 to-pink-300 rounded-full opacity-30"></div>

              {/* Center logo/icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/Logo.png"
                    alt="Bookly Logo"
                    width={240}
                    height={240}
                    className="w-50 h-50 object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            <div className="absolute -top-4 -right-8 bg-white p-6 rounded-2xl shadow-xl float-animation max-w-xs border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Wizyta potwierdzona!
                  </p>
                  <p className="text-sm text-gray-600">Jutro o 14:00</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Aktywne
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -left-8 bg-white p-6 rounded-2xl shadow-xl float-animation border border-gray-100"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-7 h-7 text-white fill-current" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Nowa opinia: 5⭐
                  </p>
                  <p className="text-sm text-gray-600">Doskonała obsługa!</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-xs text-yellow-600 font-medium">
                      Właśnie teraz
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional floating elements for better visual balance */}
            <div
              className="absolute top-1/2 -left-12 bg-white p-4 rounded-xl shadow-lg float-animation"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    +50 nowych
                  </p>
                  <p className="text-xs text-gray-600">specjalistów</p>
                </div>
              </div>
            </div>

            <div
              className="absolute top-1/2 -right-16 bg-white p-4 rounded-xl shadow-lg float-animation"
              style={{ animationDelay: "3s" }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">15s</p>
                  <p className="text-xs text-gray-600">średni czas</p>
                </div>
              </div>
            </div>
          </div>
          </AnimatedContent>
        </div>

        {/* Additional Features Grid */}
        <AnimatedContent delay={0.6}>
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              I to nie wszystko...
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <AnimatedContent key={index} delay={0.7 + (index * 0.1)}>
                  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-violet-600">{feature.icon}</div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>
        </AnimatedContent>

        {/* Call to Action */}
        <AnimatedContent delay={0.8}>
          <div className="text-center">
            <div className="glass-card p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto">
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Gotowy na <span className="hero-gradient-text">przyszłość</span>{" "}
                rezerwacji?
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Dołącz do tysięcy zadowolonych użytkowników, którzy już odkryli
                nowy sposób na rezerwację usług.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="cursor-pointer bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center">
                  Rozpocznij teraz
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}

// Główny komponent strony
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturedServices />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
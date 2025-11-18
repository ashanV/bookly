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
  Check,
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
      {/* Premium Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px] float-animation"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[120px] float-animation"
          style={{ animationDelay: "3s" }}
        ></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 pt-24 pb-16 relative z-10">
        <div className="text-center text-white max-w-5xl mx-auto">
          <AnimatedContent delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white/90">Nowy wymiar rezerwacji</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-8 tracking-tight">
              Znajdź swój idealny <br />
              <span className="hero-gradient-text relative">
                <TypeText
                  text={["termin", "styl", "relaks", "moment"]}
                  typingSpeed={80}
                  pauseDuration={2500}
                  deletingSpeed={40}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorClassName="text-fuchsia-400"
                  className="inline"
                />
              </span>
            </h1>
          </AnimatedContent>

          <AnimatedContent delay={0.2}>
            <p className="text-lg md:text-2xl text-slate-200 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Odkryj najlepszych specjalistów w Twojej okolicy.
              <span className="block mt-2 text-slate-300">Szybka i prosta rezerwacja wizyt online 24/7.</span>
            </p>
          </AnimatedContent>

          <AnimatedContent delay={0.3}>
            <div className="mt-8 max-w-3xl mx-auto mb-16 relative z-50">
              <div className="search-container relative group">
                <div
                  className={`glass-premium rounded-2xl transition-all duration-500 ${isSearchFocused
                    ? "shadow-[0_0_40px_rgba(139,92,246,0.3)] border-white/40 scale-[1.02]"
                    : "border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center p-2">
                    <div className="flex items-center flex-1 px-4 lg:px-6">
                      <Search
                        className={`w-6 h-6 mr-4 transition-colors duration-300 ${isSearchFocused ? "text-fuchsia-400" : "text-slate-400"
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
                        placeholder="Czego szukasz? (np. fryzjer, masaż, paznokcie)"
                        className="search-input w-full py-4 bg-transparent placeholder-slate-400 text-white focus:outline-none text-lg font-medium border-0 focus:ring-0"
                      />
                    </div>
                    <button
                      onClick={handleSearchSubmit}
                      className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transform hover:scale-105 transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={!searchQuery.trim()}
                    >
                      Szukaj
                    </button>
                  </div>
                </div>

                {isSearchFocused && (
                  <div className="search-suggestions-container absolute top-full left-0 right-0 mt-4">
                    <div
                      className="glass-card rounded-2xl p-6 shadow-2xl border border-white/40 backdrop-blur-xl bg-white/90"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={closeSuggestions}
                        className="cursor-pointer absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold flex items-center">
                        <Sparkles className="w-3 h-3 mr-2 text-violet-500" />
                        Popularne wyszukiwania
                      </div>
                      <div className="flex flex-wrap gap-3 mb-6">
                        {[
                          "Fryzjer męski",
                          "Manicure hybrydowy",
                          "Masaż relaksacyjny",
                          "Depilacja laserowa",
                          "Strzyżenie damskie",
                          "Pedicure leczniczy",
                        ].map((term) => (
                          <button
                            key={term}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleSuggestionClick(term);
                            }}
                            className="suggestion-item group relative overflow-hidden text-sm bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl hover:text-violet-700 cursor-pointer font-medium border border-slate-200 hover:border-violet-200 transition-all duration-300"
                          >
                            <span className="relative z-10">{term}</span>
                            <div className="absolute inset-0 bg-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </button>
                        ))}
                      </div>

                      {searchQuery && (
                        <div className="pt-4 border-t border-slate-100">
                          <div className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-semibold flex items-center">
                            <MapPin className="w-3 h-3 mr-2 text-violet-500" />
                            Lokalizacja: &quot;{searchQuery}&quot;
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Warszawa",
                              "Kraków",
                              "Wrocław",
                              "Gdańsk",
                              "Poznań",
                              "Łódź",
                              "Katowice"
                            ].map((city) => (
                              <button
                                key={city}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleCityClick(city);
                                }}
                                className="suggestion-item text-sm bg-violet-50/50 text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-100 cursor-pointer font-medium border border-violet-100 hover:border-violet-200 transition-colors"
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
            <div className="popular-services-slide flex flex-wrap items-center justify-center gap-3 transition-all duration-500 ease-out"
              style={{
                marginTop: isSearchFocused
                  ? searchQuery
                    ? "280px"
                    : "240px"
                  : "0px",
              }}
            >
              <span className="text-slate-300 font-medium hidden sm:inline mr-2 text-sm uppercase tracking-wide">
                Szybki wybór:
              </span>
              {[
                { name: "Fryzjer", icon: "✂️" },
                { name: "Barber", icon: "💈" },
                { name: "Kosmetyczka", icon: "💄" },
                { name: "Paznokcie", icon: "💅" },
                { name: "Masaż", icon: "💆‍♂️" },
              ].map((service) => (
                <button
                  key={service.name}
                  className="cursor-pointer group glass-premium px-5 py-2.5 rounded-full font-medium text-white hover:bg-white hover:text-violet-900 transition-all duration-300 border border-white/10 hover:border-white flex items-center gap-2"
                  onClick={() => {
                    const encodedQuery = encodeURIComponent(service.name);
                    router.push(`/client/services?search=${encodedQuery}`);
                  }}
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">{service.icon}</span>
                  {service.name}
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
        "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=800&h=500&fit=crop",
      category: "Fryzjer",
      categoryColor: "bg-blue-50 text-blue-600 border-blue-100",
      name: "Strzyżenie męskie Premium",
      salon: "Elite Barber Shop",
      price: "120 zł",
      rating: 4.9,
      reviews: 124,
      location: "Warszawa, Mokotów",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=500&fit=crop",
      category: "Paznokcie",
      categoryColor: "bg-pink-50 text-pink-600 border-pink-100",
      name: "Manicure hybrydowy Art",
      salon: "Studio Piękna Aurora",
      price: "150 zł",
      rating: 4.9,
      reviews: 89,
      location: "Kraków, Stare Miasto",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
      category: "SPA",
      categoryColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      name: "Rytuał Relaksacyjny",
      salon: "Wellness & Relax",
      price: "200 zł",
      rating: 4.8,
      reviews: 156,
      location: "Wrocław, Centrum",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&fit=crop",
      category: "Kosmetyczka",
      categoryColor: "bg-violet-50 text-violet-600 border-violet-100",
      name: "Oczyszczanie wodorowe",
      salon: "Beauty Clinic Premium",
      price: "250 zł",
      rating: 4.9,
      reviews: 203,
      location: "Gdańsk, Wrzeszcz",
    },
  ];

  const handleServiceClick = (service) => {
    const encodedCategory = encodeURIComponent(service.category);
    router.push(`/client/services?category=${encodedCategory}`);
  };

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <AnimatedContent delay={0.1}>
          <div className="text-center mb-20">
            <span className="text-violet-600 font-semibold tracking-wider uppercase text-sm mb-4 block">Polecane oferty</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Odkryj najlepsze usługi w{" "}
              <span className="hero-gradient-text">Twojej okolicy</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Wyselekcjonowane miejsca, które gwarantują najwyższą jakość i profesjonalizm.
            </p>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <AnimatedContent key={service.id} delay={0.2 + (index * 0.1)}>
              <div
                className="service-card group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer border border-slate-100"
                onClick={() => handleServiceClick(service)}
              >
                <div className="relative overflow-hidden h-56">
                  <Image
                    src={service.image}
                    alt={service.name}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                  <div className="absolute top-4 left-4">
                    <span
                      className={`${service.categoryColor} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md bg-white/90`}
                    >
                      {service.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold text-slate-800 flex items-center shadow-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1.5" />
                      {service.rating}
                    </div>
                  </div>
                </div>

                <div className="p-6 relative">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    <p className="text-slate-500 text-sm flex items-center mb-1">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {service.location}
                    </p>
                    <p className="text-slate-500 text-sm flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {service.salon}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 font-medium uppercase">Cena od</span>
                      <span className="text-xl font-bold text-slate-900">
                        {service.price}
                      </span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-violet-200">
                      <ArrowRight className="w-5 h-5 transform group-hover:-rotate-45 transition-transform duration-300" />
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
      icon: <Zap className="w-6 h-6" />,
      title: "Błyskawiczne rezerwacje",
      description:
        "Zarezerwuj wizytę w mniej niż 30 sekund. Bez czekania, bez telefonów.",
      stats: "98% rezerwacji w < 30s",
      color: "from-amber-400 to-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-100",
      text: "text-orange-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bezpieczeństwo",
      description:
        "Weryfikowane salony i bezpieczne płatności online.",
      stats: "100% ochrony danych",
      color: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Sprawdzeni specjaliści",
      description:
        "Tylko zweryfikowane salony z potwierdzonymi kwalifikacjami.",
      stats: "4.9/5 średnia ocena",
      color: "from-blue-400 to-indigo-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600"
    },
  ];

  const additionalFeatures = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Przypomnienia SMS",
      description: "Nigdy nie zapomnisz o wizycie",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "System ocen",
      description: "Wiarygodne opinie klientów",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Geolokalizacja",
      description: "Znajdź salony blisko Ciebie",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Kalendarz wizyt",
      description: "Pełna historia Twoich wizyt",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mainFeatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainFeatures.length]);

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-40 left-20 w-[800px] h-[800px] bg-violet-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-40 right-20 w-[600px] h-[600px] bg-fuchsia-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Header */}
        <AnimatedContent delay={0.1}>
          <div className="text-center mb-24">
            <div className="inline-flex items-center bg-violet-50 border border-violet-100 px-4 py-1.5 rounded-full text-violet-700 font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Dlaczego Bookly?
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              Doświadczenie, które{" "}
              <span className="hero-gradient-text">zmienia wszystko</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Nie jesteśmy kolejną platformą rezerwacji. Tworzymy nowy standard
              w branży beauty & wellness.
            </p>
          </div>
        </AnimatedContent>

        {/* Interactive Main Features */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-6">
            {mainFeatures.map((feature, index) => (
              <AnimatedContent key={index} delay={0.2 + (index * 0.1)}>
                <div
                  className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-500 border ${activeFeature === index
                    ? "bg-white shadow-xl border-violet-100 scale-105"
                    : "bg-transparent border-transparent hover:bg-slate-50"
                    }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-300 ${activeFeature === index ? `bg-gradient-to-br ${feature.color} text-white` : "bg-white border border-slate-100 text-slate-400"}`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${activeFeature === index ? "text-slate-900" : "text-slate-600"}`}>
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed mb-3">
                        {feature.description}
                      </p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-opacity duration-300 ${activeFeature === index ? `opacity-100 ${feature.bg} ${feature.text}` : "opacity-0"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${feature.text.replace('text-', 'bg-')}`}></div>
                        {feature.stats}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* Enhanced Visual Showcase */}
          <AnimatedContent delay={0.4}>
            <div className="relative h-[600px] w-full flex items-center justify-center perspective-1000">
              {/* Abstract Background Shapes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] bg-gradient-to-tr from-violet-100 to-fuchsia-100 rounded-full opacity-50 blur-3xl animate-pulse"></div>
              </div>

              {/* Main App Card Mockup */}
              <div className="relative w-[320px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden float-animation z-20">
                {/* Status Bar */}
                <div className="h-7 bg-slate-900 flex justify-between px-6 items-center">
                  <div className="w-12 h-4 bg-slate-800 rounded-full"></div>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                  </div>
                </div>

                {/* App Content */}
                <div className="p-6 bg-slate-50 h-[600px]">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                  </div>

                  <div className="mb-6">
                    <div className="h-8 w-3/4 bg-slate-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded-lg"></div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex gap-3 mb-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-4 w-3/4 bg-slate-100 rounded mb-2"></div>
                            <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 w-16 bg-violet-100 rounded-full"></div>
                          <div className="h-8 w-20 bg-slate-900 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 right-10 z-30 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="glass-premium p-4 rounded-2xl shadow-lg border border-white/40 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Rezerwacja</p>
                      <p className="text-xs text-slate-500">Potwierdzona</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-40 left-0 z-30 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="glass-premium p-4 rounded-2xl shadow-lg border border-white/40 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">+2k Klientów</p>
                      <p className="text-xs text-slate-500">w tym miesiącu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>

        {/* Additional Features Grid */}
        <AnimatedContent delay={0.6}>
          <div className="mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {additionalFeatures.map((feature, index) => (
                <AnimatedContent key={index} delay={0.7 + (index * 0.1)}>
                  <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group text-center">
                    <div className="w-16 h-16 mx-auto bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 text-sm">{feature.description}</p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>
        </AnimatedContent>

        {/* Call to Action */}
        <AnimatedContent delay={0.8}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[3rem] transform rotate-1 opacity-50 blur-lg"></div>
            <div className="relative bg-slate-900 rounded-[2.5rem] p-12 md:p-24 text-center overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-violet-500 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-fuchsia-500 rounded-full blur-[150px]"></div>
              </div>

              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                  Gotowy na <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">nowy poziom</span>?
                </h3>
                <p className="text-xl text-slate-300 mb-12 leading-relaxed">
                  Dołącz do tysięcy zadowolonych użytkowników, którzy już odkryli
                  wygodę rezerwacji online.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button className="cursor-pointer bg-white text-slate-900 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transform hover:scale-105 transition-all duration-300 flex items-center">
                    Rozpocznij teraz
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                  <button className="cursor-pointer px-10 py-4 rounded-xl font-bold text-lg text-white border border-white/20 hover:bg-white/10 transition-all duration-300">
                    Dla biznesu
                  </button>
                </div>
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
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  Smartphone,
  Globe,
  Zap,
  Shield,
  Star,
  ChevronRight,
  Play,
  Check,
  ArrowRight,
  Bell,
  Settings,
  TrendingUp,
  Heart,
  Mail,
  Phone,
  MapPin,
  Image,
  Gift,
  Target,
  Layers,
  BookOpen,
  Headphones,
  Award,
  Lock,
  RefreshCw,
  Database,
  Palette,
  Code,
  Workflow,
  Bot,
  Eye,
  MousePointer,
} from "lucide-react";

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

const FeatureCard = ({ feature, index, isVisible }) => {
  const Icon = feature.icon;

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform transition-all duration-700 hover:scale-105 hover:shadow-2xl group ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative mb-6">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6`}
        >
          <Icon className="w-full h-full text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Check className="w-4 h-4 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {feature.title}
      </h3>

      <p className="text-gray-600 mb-6 leading-relaxed">
        {feature.description}
      </p>

      <div className="space-y-3 mb-6">
        {feature.benefits.map((benefit, i) => (
          <div key={i} className="flex items-start group/benefit">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 group-hover/benefit:scale-150 transition-transform"></div>
            <span className="text-sm text-gray-700 group-hover/benefit:text-gray-900 transition-colors">
              {benefit}
            </span>
          </div>
        ))}
      </div>

      <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center group/button">
        Dowiedz się więcej
        <ArrowRight className="w-4 h-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "Automatyzacja rezerwacji",
    "Zarządzanie klientami",
    "Płatności online",
    "Marketing automation",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white rounded-lg rotate-45"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border border-white rounded-lg rotate-12"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 border border-white/30">
          <Star className="w-4 h-4 mr-2" />
          Ponad 50 zaawansowanych funkcji
        </div>

        <h1 className="text-6xl font-bold text-white mb-6">
          Wszystko czego potrzebujesz do
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {slides[currentSlide]}
            </span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 animate-pulse"></div>
          </span>
        </h1>

        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Kompleksowe rozwiązanie do zarządzania rezerwacjami, które
          automatyzuje procesy biznesowe i zwiększa Twoje przychody o średnio
          40%.
        </p>

        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {[
            { icon: Users, label: "10k+ Klientów", value: 10000 },
            { icon: Calendar, label: "Rezerwacji dziennie", value: 5000 },
            { icon: TrendingUp, label: "Wzrost przychodów", value: 40 },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl p-3 mx-auto mb-3 border border-white/30">
                <stat.icon className="w-full h-full text-white" />
              </div>
              <div className="text-3xl font-bold text-white">
                <AnimatedCounter end={stat.value} />
                {i === 2 ? "%" : "+"}
              </div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center group">
          <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Zobacz wszystkie funkcje
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const FeatureSection = ({ title, description, features, gradient }) => {
  const [visibleCards, setVisibleCards] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".feature-card").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={`py-20 px-4 bg-gradient-to-br ${gradient}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" data-index={index}>
              <FeatureCard
                feature={feature}
                index={index}
                isVisible={visibleCards.has(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const InteractiveDemo = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Klient wybiera usługę",
      icon: MousePointer,
      description:
        "Klient przegląda dostępne usługi i wybiera interesującą go opcję z katalogu.",
    },
    {
      title: "Sprawdza dostępność",
      icon: Calendar,
      description:
        "System pokazuje dostępne terminy w czasie rzeczywistym, uwzględniając wszystkie ograniczenia.",
    },
    {
      title: "Rezerwuje termin",
      icon: Check,
      description:
        "Klient wybiera odpowiadający mu termin i potwierdza rezerwację jednym kliknięciem.",
    },
    {
      title: "Płaci online",
      icon: CreditCard,
      description:
        "Bezpieczna płatność online kartą, BLIK-iem lub innymi metodami płatności.",
    },
    {
      title: "Otrzymuje potwierdzenie",
      icon: Bell,
      description:
        "Automatyczne potwierdzenie SMS/email z detalami wizyty i możliwością dodania do kalendarza.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Jak to działa w praktyce?
          </h2>
          <p className="text-xl text-gray-300">
            Cały proces rezerwacji w 5 prostych krokach
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Progress line */}
          <div className="absolute top-8 left-8 right-8 h-1 bg-gray-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between items-start mb-12 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center relative z-10"
                  style={{ width: "180px" }}
                >
                  <div
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? "bg-blue-500 border-blue-500 text-white"
                        : isActive
                        ? "bg-blue-500 border-blue-500 text-white scale-110 shadow-xl shadow-blue-500/50"
                        : "bg-gray-800 border-gray-600 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  <div className="text-center mt-4">
                    <span
                      className={`text-sm font-medium transition-colors duration-500 block ${
                        isActive
                          ? "text-blue-400"
                          : isCompleted
                          ? "text-blue-300"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">
                      Krok {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active step details */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {steps[activeStep].title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {steps[activeStep].description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {activeStep + 1}
                </div>
                <div className="text-sm text-gray-400">z {steps.length}</div>
              </div>
            </div>

            {/* Manual navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeStep
                        ? "bg-blue-500 scale-125"
                        : index < activeStep
                        ? "bg-blue-400"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setActiveStep((prev) =>
                      prev > 0 ? prev - 1 : steps.length - 1
                    )
                  }
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Poprzedni
                </button>
                <button
                  onClick={() =>
                    setActiveStep((prev) => (prev + 1) % steps.length)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Następny
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Liczby, które mówią same za siebie
          </h2>
          <p className="text-xl text-gray-600">
            Rezultaty, które osiągają nasi klienci
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              value: 40,
              suffix: "%",
              label: "Wzrost przychodów",
              icon: TrendingUp,
              color: "from-green-500 to-emerald-500",
            },
            {
              value: 60,
              suffix: "%",
              label: "Mniej no-show",
              icon: Shield,
              color: "from-blue-500 to-cyan-500",
            },
            {
              value: 75,
              suffix: "%",
              label: "Oszczędność czasu",
              icon: Clock,
              color: "from-purple-500 to-pink-500",
            },
            {
              value: 98,
              suffix: "%",
              label: "Zadowolenie klientów",
              icon: Heart,
              color: "from-red-500 to-orange-500",
            },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl p-4 mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl`}
              >
                <stat.icon className="w-full h-full text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter end={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function BooklyFeaturesPage() {
  const coreFeatures = [
    {
      title: "Inteligentny Kalendarz Rezerwacji",
      description:
        "Zaawansowany system kalendarzowy z automatyczną synchronizacją, konfliktami terminów i inteligentnym przydzielaniem zasobów.",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      benefits: [
        "Automatyczna synchronizacja z Google Calendar, Outlook",
        "Inteligentne wykrywanie konfliktów terminów",
        "Bulk operations - masowe operacje na terminach",
        "Widok tygodniowy, miesięczny i dzienny",
        "Drag & drop do przesuwania terminów",
      ],
    },
    {
      title: "Automatyczne Powiadomienia SMS/Email",
      description:
        "Kompleksowy system komunikacji z klientami. Automatyczne przypomnienia, potwierdzenia i follow-up zwiększają punktualność o 60%.",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      benefits: [
        "Przypomnienia 24h, 2h przed wizytą",
        "Potwierdzenia rezerwacji w czasie rzeczywistym",
        "Ankiety zadowolenia po usłudze",
        "Spersonalizowane szablony wiadomości",
        "Auto-follow up dla nowych klientów",
      ],
    },
    {
      title: "Płatności Online & Faktury",
      description:
        "Zintegrowany system płatności z automatycznym wystawianiem faktur, obsługą kart, BLIK-a i płatności mobilnych.",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
      benefits: [
        "Akceptacja kart, BLIK, Apple Pay, Google Pay",
        "Automatyczne faktury VAT",
        "Przedpłaty i zadatki online",
        "Subskrypcje i pakiety usług",
        "Raportowanie finansowe w czasie rzeczywistym",
      ],
    },
    {
      title: "CRM - Zarządzanie Klientami",
      description:
        "Zaawansowany system CRM z profilami klientów, historią wizyt, preferencjami i zautomatyzowanymi kampaniami marketingowymi.",
      icon: Users,
      color: "from-amber-500 to-orange-500",
      benefits: [
        "360° profil klienta z historią wizyt",
        "Automatyczna segmentacja klientów",
        "Program lojalnościowy z punktami",
        "Notatki i preferencje klientów",
        "Import/export bazy klientów",
      ],
    },
    {
      title: "Zaawansowane Raportowanie",
      description:
        "Kompleksowa analityka biznesowa z raportami w czasie rzeczywistym, prognozami i benchmarkingiem konkurencji.",
      icon: BarChart3,
      color: "from-indigo-500 to-blue-500",
      benefits: [
        "Dashboard z KPI w czasie rzeczywistym",
        "Raporty sprzedaży, wydajności, zadowolenia",
        "Prognozy przychodów AI-powered",
        "Analiza trendów i sezonowości",
        "Export do Excel, PDF, integracja z BI",
      ],
    },
    {
      title: "Aplikacja Mobilna",
      description:
        "Natywne aplikacje iOS/Android dla klientów i personelu z pełną funkcjonalnością offline i synchronizacją.",
      icon: Smartphone,
      color: "from-pink-500 to-red-500",
      benefits: [
        "Rezerwacje z poziomu aplikacji mobilnej",
        "Push notifications o statusie wizyty",
        "Tryb offline dla personelu",
        "Geolokalizacja i nawigacja do salonu",
        "Mobile check-in i płatności",
      ],
    },
  ];

  const marketingFeatures = [
    {
      title: "Email Marketing Automation",
      description:
        "Zaawansowane kampanie e-mail z segmentacją klientów, testami A/B i automatyzacją opartą na zachowaniach.",
      icon: Mail,
      color: "from-blue-500 to-indigo-500",
      benefits: [
        "Kampanie drip dla nowych klientów",
        "Kampanie odzyskujące nieaktywnych klientów",
        "Kampanie urodzinowe i rocznicowe",
        "Testy A/B tematów i treści",
        "Zaawansowana segmentacja i personalizacja",
      ],
    },
    {
      title: "SMS Marketing & Automatyzacja",
      description:
        "Potężne narzędzie SMS z automatyzacją, personalizacją i śledzeniem konwersji dla maksymalnego zwrotu z inwestycji.",
      icon: Phone,
      color: "from-green-500 to-teal-500",
      benefits: [
        "Masowe SMS-y z personalizacją",
        "Wiadomości SMS wyzwalane działaniami",
        "Ankiety SMS i zbieranie opinii",
        "Zarządzanie opt-in/opt-out",
        "Śledzenie kliknięć i analityka",
      ],
    },
    {
      title: "Program Lojalnościowy",
      description:
        "System lojalnościowy oparty na grywalizacji – punkty, poziomy, nagrody i wyzwania zwiększające retencję.",
      icon: Gift,
      color: "from-yellow-500 to-amber-500",
      benefits: [
        "System punktów za wizyty i wydatki",
        "Poziomy z ekskluzywnymi benefitami",
        "Program poleceń z bonusami",
        "Nagrody urodzinowe i rocznicowe",
        "Zachęty do udostępnień w social media",
      ],
    },
    {
      title: "Integracja Social Media",
      description:
        "Łatwa integracja z social mediami, automatyczne postowanie i zbieranie opinii społecznych.",
      icon: Globe,
      color: "from-purple-500 to-violet-500",
      benefits: [
        "Automatyczne postowanie rezerwacji na Instagram/Facebook",
        "Zbieranie i prezentowanie social proof",
        "Automatyczne prośby o opinie",
        "Analityka social media",
        "Śledzenie hashtagów i monitoring marki",
      ],
    },
    {
      title: "Landing Page Builder",
      description:
        "Intuicyjny kreator drag & drop do tworzenia stron docelowych z wysoką konwersją i testami A/B.",
      icon: Palette,
      color: "from-pink-500 to-rose-500",
      benefits: [
        "Kreator stron drag & drop",
        "Responsywne szablony",
        "Testy A/B różnych wersji",
        "Śledzenie konwersji i mapy ciepła",
        "Narzędzia do optymalizacji SEO",
      ],
    },
    {
      title: "Marketing Automation Workflows",
      description:
        "Wizualny kreator do budowania złożonych sekwencji automatyzacji opartych na zachowaniach i wyzwalaczach.",
      icon: Workflow,
      color: "from-indigo-500 to-purple-500",
      benefits: [
        "Wizualny kreator workflow",
        "Automatyzacja wyzwalana zachowaniami",
        "Kampanie wielokanałowe",
        "Sekwencje lead nurturing",
        "Zaawansowane warunki i rozgałęzienia",
      ],
    },
  ];

  const advancedFeatures = [
    {
      title: "API & Webhooki",
      description:
        "RESTful API z webhookami do bezproblemowej integracji z istniejącymi systemami i custom developmentem.",
      icon: Code,
      color: "from-slate-500 to-gray-600",
      benefits: [
        "RESTful API z pełną dokumentacją",
        "Webhooki do powiadomień w czasie rzeczywistym",
        "SDK dla popularnych języków",
        "Rate limiting i uwierzytelnianie",
        "Środowisko sandbox do testów",
      ],
    },
    {
      title: "Rozwiązanie White Label",
      description:
        "Kompletne rozwiązanie white-label z własnym brandingiem, domenami i pełną możliwością personalizacji.",
      icon: Award,
      color: "from-emerald-500 to-green-600",
      benefits: [
        "Własny branding i logo",
        "Własna domena i certyfikat SSL",
        "Personalizowane schematy kolorów",
        "Brandowane aplikacje mobilne",
        "Szablony e-mail white-label",
      ],
    },
    {
      title: "Zaawansowane Bezpieczeństwo",
      description:
        "Bezpieczeństwo klasy enterprise z szyfrowaniem, zgodnością z przepisami, backupem i planem awaryjnym.",
      icon: Shield,
      color: "from-red-500 to-pink-600",
      benefits: [
        "Szyfrowanie end-to-end",
        "Zgodność z GDPR i HIPAA",
        "Codzienne automatyczne kopie zapasowe",
        "Uwierzytelnianie dwuskładnikowe",
        "Kontrola dostępu oparta na rolach",
      ],
    },
    {
      title: "Analityka wspierana AI",
      description:
        "Algorytmy uczenia maszynowego do predykcyjnej analityki, analizy zachowań klientów i optymalizacji biznesu.",
      icon: Bot,
      color: "from-cyan-500 to-blue-600",
      benefits: [
        "Predykcyjna analiza rezerwacji",
        "Prognoza wartości klienta w czasie życia",
        "Ocena ryzyka rezygnacji",
        "Rekomendacje optymalnych cen",
        "Prognozowanie popytu",
      ],
    },
    {
      title: "Zarządzanie Multi-Lokalizacjami",
      description:
        "Centralne zarządzanie wieloma lokalizacjami z ujednoliconym raportowaniem i analizą międzyoddziałową.",
      icon: MapPin,
      color: "from-orange-500 to-red-500",
      benefits: [
        "Ujednolicony panel dla wszystkich lokalizacji",
        "Zarządzanie personelem między lokalizacjami",
        "Skonsolidowane raporty",
        "Personalizacja dla poszczególnych lokalizacji",
        "Centralna baza klientów",
      ],
    },
    {
      title: "Integracje Niestandardowe",
      description:
        "Dedykowany zespół integracyjny do łączenia z istniejącymi narzędziami, systemami POS, księgowością i innymi.",
      icon: Layers,
      color: "from-violet-500 to-purple-600",
      benefits: [
        "Integracje z systemami POS",
        "Synchronizacja z oprogramowaniem księgowym",
        "Połączenie z narzędziami marketingowymi",
        "Integracje zewnętrzne na zamówienie",
        "Usługi migracji danych",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />

      <FeatureSection
        title="Podstawowe Funkcje"
        description="Wszystkie narzędzia potrzebne do efektywnego zarządzania rezerwacjami i klientami w jednym miejscu."
        features={coreFeatures}
        gradient="from-gray-50 to-blue-50"
      />

      <InteractiveDemo />

      <FeatureSection
        title="Marketing & Automatyzacja"
        description="Zaawansowane narzędzia marketingowe, które automatyzują komunikację i zwiększają sprzedaż."
        features={marketingFeatures}
        gradient="from-blue-50 to-purple-50"
      />

      <StatsSection />

      <FeatureSection
        title="Zaawansowane Funkcje Enterprise"
        description="Funkcje dedykowane dla dużych biznesów wymagających maksymalnej kontroli i customization."
        features={advancedFeatures}
        gradient="from-purple-50 to-pink-50"
      />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Gotowy na transformację swojego biznesu?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Dołącz do tysięcy zadowolonych przedsiębiorców, którzy zwiększyli
            swoje przychody dzięki Bookly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center justify-center group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Rozpocznij 14-dniowy trial
            </button>
          </div>
          <div className="flex justify-center items-center gap-8 mt-8 text-sm opacity-75">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              <span>Bez karty kredytowej</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              <span>Setup w 5 minut</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              <span>Wsparcie 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

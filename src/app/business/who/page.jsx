"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Scissors,
    Stethoscope,
    Dumbbell,
    Camera,
    Palette,
    Wrench,
    GraduationCap,
    Heart,
    Car,
    Home,
    Sparkles,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    ArrowRight,
    Star,
    Zap,
    Shield,
    Calendar,
    CreditCard,
    Smartphone,
    BarChart3,
    User,
    Quote,
    ChevronDown,
    Menu,
    X,
    PlayCircle
} from 'lucide-react';

// Animations
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};


// Hero Section
function HeroSection() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 opacity-30"
            >
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse delay-700" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-8"
                    >
                        <Users className="w-4 h-4 text-yellow-400" />
                        Dla każdego biznesu opartego na rezerwacjach
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Idealny dla
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"> Twojej branży</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        Od salonów piękności po kliniki medyczne - Bookly Business dopasowuje się do specyfiki
                        Twojego biznesu i pomaga osiągnąć maksymalną efektywność.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <button className="group bg-white text-gray-900 px-8 cursor-pointer py-4 rounded-xl font-semibold flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <Zap className="w-5 h-5" />
                            Znajdź swoją branżę
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="group flex items-center gap-3 text-white border cursor-pointer border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                            <PlayCircle className="w-5 h-5" />
                            Zobacz case study
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// Industries Section
function IndustriesSection() {
    const industries = [
        {
            icon: <Scissors className="w-8 h-8" />,
            title: "Salony fryzjerskie & piękności",
            description: "Kompleksowe zarządzanie usługami beauty, stylizacją i pielęgnacją. Automatyczne przypomnienia, booking online i płatności.",
            features: ["Kalendarz dla każdego stylisty", "Galeria prac", "Program lojalnościowy", "Zarządzanie produktami"],
            stats: { clients: "15,000+", growth: "+52%" },
            gradient: "from-pink-500 to-rose-500",
            bgColor: "bg-pink-50",
            emoji: "💇‍♀️"
        },
        {
            icon: <Stethoscope className="w-8 h-8" />,
            title: "Kliniki & gabinety medyczne",
            description: "Profesjonalne zarządzanie wizytami medycznymi z pełną dokumentacją pacjentów i integracją z systemami NFZ.",
            features: ["Historia medyczna", "Recepty elektroniczne", "Przypomnienia o kontrolach", "Bezpieczna dokumentacja"],
            stats: { clients: "8,500+", growth: "+38%" },
            gradient: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            emoji: "🏥"
        },
        {
            icon: <Dumbbell className="w-8 h-8" />,
            title: "Kluby fitness & siłownie",
            description: "Zarządzanie członkostwa, grupowych zajęć i treningów personalnych. Monitoring postępów i płatności automatyczne.",
            features: ["Rezerwacja sprzętu", "Zajęcia grupowe", "Plany treningowe", "Monitoring postępów"],
            stats: { clients: "3,200+", growth: "+64%" },
            gradient: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50",
            emoji: "💪"
        },
        {
            icon: <Camera className="w-8 h-8" />,
            title: "Studia fotograficzne",
            description: "Organizacja sesji zdjęciowych, zarządzanie sprzętem i lokalizacjami. Galerie dla klientów i automatyczne dostawy zdjęć.",
            features: ["Kalendarz sesji", "Zarządzanie sprzętem", "Galerie klientów", "Pakiety zdjęciowe"],
            stats: { clients: "2,100+", growth: "+41%" },
            gradient: "from-purple-500 to-indigo-500",
            bgColor: "bg-purple-50",
            emoji: "📸"
        },
        {
            icon: <Palette className="w-8 h-8" />,
            title: "Studia tatuażu & piercing",
            description: "Specjalistyczne funkcje dla branży tattoo z portfoliami artystów, projektami custom i zarządzaniem sesjami.",
            features: ["Portfolio artystów", "Projekty custom", "Aftercare automatyczny", "Booking konsultacji"],
            stats: { clients: "1,800+", growth: "+59%" },
            gradient: "from-gray-600 to-gray-800",
            bgColor: "bg-gray-50",
            emoji: "🎨"
        },
        {
            icon: <Wrench className="w-8 h-8" />,
            title: "Warsztaty & serwisy",
            description: "Zarządzanie naprawami, diagnostyką i serwisem. Śledzenie statusu zleceń i automatyczne powiadomienia.",
            features: ["Status napraw", "Kosztorysy online", "Historia serwisowa", "Części i materiały"],
            stats: { clients: "4,500+", growth: "+35%" },
            gradient: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50",
            emoji: "🔧"
        }
    ];

    return (
        <section id="branże" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Users className="w-4 h-4" />
                        Branże i segmenty
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Stworzony dla Twojej branży
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Każda branża ma swoje unikalne potrzeby. Bookly Business oferuje dedykowane funkcje
                        i rozwiązania dostosowane do specyfiki Twojego biznesu.
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {industries.map((industry, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className={`group ${industry.bgColor} rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-white`}
                        >
                            <div className="flex items-start gap-6">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${industry.gradient} text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    {industry.icon}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-bold text-gray-900">{industry.title}</h3>
                                        <span className="text-2xl">{industry.emoji}</span>
                                    </div>
                                    <p className="text-gray-700 mb-6 leading-relaxed">{industry.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {industry.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{industry.stats.clients}</div>
                                                <div className="text-xs text-gray-500">Aktywnych klientów</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">{industry.stats.growth}</div>
                                                <div className="text-xs text-gray-500">Średni wzrost</div>
                                            </div>
                                        </div>
                                        
                                        <button className={`flex items-center gap-2 cursor-pointer bg-gradient-to-r ${industry.gradient} text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 group/button`}>
                                            Zobacz więcej
                                            <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Business Size Section
function BusinessSizeSection() {
    const businessSizes = [
        {
            title: "Indywidualni specjaliści",
            subtitle: "Freelancerzy i jednoosobowe gabinety",
            icon: <User className="w-8 h-8" />,
            description: "Idealne rozwiązanie dla freelancerów i specjalistów prowadzących jednoosobową działalność.",
            features: [
                "Prosty kalendarz rezerwacji",
                "Podstawowe płatności online",
                "Automatyczne przypomnienia",
                "Profil online z portfolio"
            ],
            price: "Od 49 zł/mies",
            popular: false,
            gradient: "from-blue-500 to-indigo-500"
        },
        {
            title: "Małe i średnie firmy",
            subtitle: "2-20 pracowników",
            icon: <Users className="w-8 h-8" />,
            description: "Kompleksne zarządzanie zespołem z zaawansowaną analityką i automatyzacją procesów.",
            features: [
                "Wielopoziomowe kalendarze",
                "Zarządzanie zespołem",
                "Zaawansowana analityka",
                "Integracje z systemami",
                "Program lojalnościowy",
                "Marketing automation"
            ],
            price: "Od 149 zł/mies",
            popular: true,
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Duże przedsiębiorstwa",
            subtitle: "20+ pracowników, multiple locations",
            icon: <BarChart3 className="w-8 h-8" />,
            description: "Enterprise rozwiązanie z dedykowanym wsparciem i możliwością pełnej personalizacji.",
            features: [
                "Multi-location management",
                "Zaawansowane role i uprawnienia",
                "Custom branding",
                "API i custom integracje",
                "Dedykowany account manager",
                "SLA 99.9% uptime"
            ],
            price: "Oferta indywidualna",
            popular: false,
            gradient: "from-indigo-500 to-purple-500"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-green-100 text-green-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <TrendingUp className="w-4 h-4" />
                        Skalowalność
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Rośniemy razem z Tobą
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Bez względu na wielkość Twojego biznesu - od jednoosobowego gabinetu po sieć salonów
                        - mamy plan idealny dla Ciebie.
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {businessSizes.map((size, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
                                size.popular 
                                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-2xl' 
                                    : 'bg-white border border-gray-200 hover:shadow-xl'
                            }`}
                        >
                            {size.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Najpopularniejszy
                                    </span>
                                </div>
                            )}

                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${size.gradient} text-white mb-6`}>
                                {size.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{size.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{size.subtitle}</p>
                            <p className="text-gray-700 mb-6 leading-relaxed">{size.description}</p>

                            <div className="space-y-3 mb-8">
                                {size.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <div className="text-3xl font-bold text-gray-900 mb-4">{size.price}</div>
                                <button className={`w-full py-3 rounded-xl cursor-pointer font-medium transition-all duration-200 ${
                                    size.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}>
                                    {size.price === "Oferta indywidualna" ? "Skontaktuj się" : "Wypróbuj za darmo"}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Benefits Section
function BenefitsSection() {
    const benefits = [
        {
            icon: <Calendar className="w-6 h-6" />,
            title: "Automatyzacja rezerwacji",
            description: "Klienci mogą rezerwować 24/7, system automatycznie zarządza terminami i eliminuje podwójne bookingu."
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "Płatności bez wysiłku",
            description: "Przyjmuj płatności online, automatyzuj faktury i zarządzaj subskrypcjami w jednym miejscu."
        },
        {
            icon: <Smartphone className="w-6 h-6" />,
            title: "Mobilność total",
            description: "Zarządzaj biznesem z każdego miejsca - aplikacja mobilna daje pełną kontrolę nad operacjami."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Inteligentna analityka",
            description: "Podejmuj decyzje w oparciu o dane - szczegółowe raporty i prognozy biznesowe w czasie rzeczywistym."
        }
    ];

    return (
        <section id="korzyści" className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Dlaczego przedsiębiorcy wybierają Bookly?
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-white/80 max-w-3xl mx-auto">
                        Nie importuje czy prowadzisz salon, klinikę czy studio - nasze rozwiązanie dostosowuje się 
                        do Twoich potrzeb i pomaga osiągnąć cele biznesowe.
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 group"
                        >
                            <div className="text-white/70 mb-4 group-hover:scale-110 transition-transform">
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                            <p className="text-white/80 leading-relaxed">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Success Stories Section
function SuccessStoriesSection() {
    const stories = [
        {
            name: "Anna Kowalska",
            business: "Salon Beauty Dreams",
            location: "Warszawa",
            avatar: "👩‍💼",
            quote: "Bookly zwiększył naszą efektywność o 80%. Klienci uwielbiają możliwość rezerwacji online, a my mamy więcej czasu na to, co robimy najlepiej.",
            results: [
                { label: "Wzrost przychodów", value: "150%" },
                { label: "Więcej rezerwacji", value: "3x" },
                { label: "Zadowolenie klientów", value: "98%" }
            ],
            industry: "Beauty",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            name: "Dr Marek Nowak",
            business: "Klinika Medica Plus",
            location: "Kraków",
            avatar: "👨‍⚕️",
            quote: "System zarządzania pacjentami jest nieoceniony. Wszystko w jednym miejscu - od historii medycznej po automatyczne przypomnienia.",
            results: [
                { label: "Oszczędność czasu", value: "40%" },
                { label: "Mniej no-shows", value: "-65%" },
                { label: "Satysfakcja pacjentów", value: "96%" }
            ],
            industry: "Medical",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            name: "Tomasz Wiśniewski",
            business: "Studio Foto Pro",
            location: "Gdańsk",
            avatar: "📸",
            quote: "Automatyzacja procesów pozwoliła mi skupić się na kreatywności. Klienci mają dostęp do galerii online, a ja nie tracę czasu na administrację.",
            results: [
                { label: "Więcej sesji", value: "+45%" },
                { label: "Zadowolenie klientów", value: "99%" },
                { label: "Oszczędność czasu", value: "6h/dzień" }
            ],
            industry: "Photography",
            gradient: "from-purple-500 to-indigo-500"
        }
    ];

    return (
        <section id="historie" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Star className="w-4 h-4" />
                        Historie sukcesu
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Realne rezultaty, prawdziwi klienci
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Dołącz do tysięcy zadowolonych przedsiębiorców, którzy już zoptymalizowali swoje biznesy z Bookly Business.
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {stories.map((story, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                                    {story.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{story.name}</h4>
                                    <p className="text-gray-600 text-sm">{story.business}</p>
                                    <p className="text-gray-500 text-xs">{story.location}</p>
                                </div>
                            </div>

                            <div className="relative mb-6">
                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-200" />
                                <p className="text-gray-700 italic leading-relaxed pl-6">"{story.quote}"</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {story.results.map((result, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <span className="text-gray-600 text-sm">{result.label}</span>
                                        <span className={`font-bold bg-gradient-to-r ${story.gradient} bg-clip-text text-transparent`}>
                                            {result.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full mt-6 bg-gradient-to-r ${story.gradient} text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 group/button`}>
                                <span className="flex items-center justify-center cursor-pointer gap-2">
                                    Przeczytaj pełną historię
                                    <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// CTA Section
function CTASection() {
    return (
        <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
            <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)",
                        "radial-gradient(circle at 40% 80%, #ec4899 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%)"
                    ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-8">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Gotowy na start?
                    </motion.div>

                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Zacznij optymalizować swój biznes
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"> już dziś</span>
                    </motion.h2>

                    <motion.p variants={fadeInUp} className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Dołącz do tysięcy przedsiębiorców, którzy już zwiększyli swoje przychody 
                        i poprawili satysfakcję klientów dzięki Bookly Business.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button className="group bg-white text-gray-900 px-8 cursor-pointer py-4 rounded-xl font-bold flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg">
                            <Sparkles className="w-5 h-5" />
                            Rozpocznij darmowy trial
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            14 dni za darmo
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Bez zobowiązań
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Pełne wsparcie
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Bez ukrytych kosztów
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <div className="text-2xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Bookly
                            </span>
                            <span> Business</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Nowoczesne rozwiązanie do zarządzania rezerwacjami dla każdego biznesu usługowego.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Produkt</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Funkcje</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cennik</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Integracje</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Wsparcie</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Centrum pomocy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Webinary</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Firma</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">O nas</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Kariera</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Polityka prywatności</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Regulamin</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 Bookly Business. Wszystkie prawa zastrzeżone.</p>
                </div>
            </div>
        </footer>
    );
}

// Main Component Export
export default function BooklyBusinessLanding() {
    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <IndustriesSection />
            <BusinessSizeSection />
            <BenefitsSection />
            <SuccessStoriesSection />
            <CTASection />
            <Footer />
        </div>
    );
}

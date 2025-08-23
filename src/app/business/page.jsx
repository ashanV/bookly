"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Calendar,
    Users,
    BarChart3,
    CreditCard,
    Smartphone,
    LogIn,
    User,
    UserCog,
    Star,
    CheckCircle,
    ArrowRight,
    PlayCircle,
    Shield,
    Zap,
    Clock,
    TrendingUp,
    MessageSquare,
    Bell,
    Globe,
    Headphones,
    Award,
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    Facebook,
    Twitter,
    Linkedin,
    Instagram
} from 'lucide-react';

// Animacje
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

// Navbar
function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
                <div className={`text-2xl font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'
                    }`}>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Bookly
                    </span>
                    <span className={scrolled ? 'text-gray-900' : 'text-white'}> Business</span>
                </div>
                <ul className={`hidden md:flex gap-8 text-sm font-medium transition-colors ${scrolled ? 'text-gray-700' : 'text-white/90'
                    }`}>
                    {[
                        { name: 'Home', href: "#HeroSection" },
                        { name: 'Funkcje', href: '/funkcje' },
                        { name: 'Cennik', href: '/business/pricing' },
                        { name: 'Klienci', href: '/' },
                        { name: 'Kontakt', href: '/kontakt' }
                    ].map((item, i) => (
                        <li key={i}>
                            <Link
                                href={item.href}
                                className="hover:text-indigo-600 transition-colors duration-200 relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-200 group-hover:w-full" />
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-4">
                    <Link href="/admin/auth">
                        <button className={`hidden md:flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'
                            }`}>
                            <User size={18} />
                            Zaloguj się
                        </button>
                    </Link>
                    <Link href="/admin/auth">
                        <button className="bg-gradient-to-r cursor-pointer from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                            Wypróbuj za darmo
                        </button>
                    </Link>
                    <button
                        className={`md:hidden transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
                >
                    <div className="px-6 py-4 space-y-4">
                        {['Home', 'Funkcje', 'Cennik', 'Klienci', 'Kontakt'].map((item, i) => (
                            <a key={i} href={`#${item.toLowerCase()}`} className="block text-gray-700 hover:text-indigo-600 transition-colors">
                                {item}
                            </a>
                        ))}
                        <div className="pt-4 border-t border-gray-200">
                            <button className="w-full bg-gradient-to-r  from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium">
                                Wypróbuj za darmo
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </nav>
    );
}

// Hero Section
function HeroSection() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            {/* Animated background */}
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 opacity-30"
            >
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse delay-700" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-8"
                    >
                        <Star className="w-4 h-4 text-yellow-400" />
                        Zaufało nam ponad 50,000 firm w Polsce
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Rewolucja w
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"> rezerwacjach</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Automatyzuj rezerwacje, zwiększ przychody o 40% i zredukuj no-show o 75%.
                        Kompleksowe rozwiązanie dla salonów, klinik i gabinetów.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                    >
                        <button className="group bg-white text-gray-900 px-8 py-4 rounded-xl cursor-pointer font-semibold flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <Zap className="w-5 h-5" />
                            Rozpocznij 14-dniowy test
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="group flex items-center gap-3 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                            <PlayCircle className="w-5 h-5" />
                            Zobacz demo (2 min)
                        </button>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            RODO & SSL
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Bez zobowiązań
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Setup w 5 minut
                        </div>
                        <div className="flex items-center gap-2">
                            <Headphones className="w-4 h-4" />
                            24/7 Support
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => {
                    window.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                    });
                }}
            >
                <ChevronDown className="w-6 h-6 text-white/50 hover:text-white/80 transition-colors" />
            </motion.div>
        </section>
    );
}

// Features Section
function FeaturesSection() {
    const features = [
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Inteligentny kalendarz",
            description: "AI optymalizuje harmonogramy, automatycznie wypełnia luki i sugeruje najlepsze terminy.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "360° widok klienta",
            description: "Historia wizyt, preferencje, notatki i automatyczne przypomnienia w jednym miejscu.",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Analityka biznesowa",
            description: "Real-time raporty przychodów, wydajności zespołu i prognozowanie wzrostu.",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: <CreditCard className="w-8 h-8" />,
            title: "Płatności bez granic",
            description: "BLIK, karty, raty, kryptowaluty + automatyczne faktury i przypomnienia o płatnościach.",
            gradient: "from-orange-500 to-red-500"
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Mobilna aplikacja",
            description: "Pełne zarządzanie z telefonu - kalendarze, klienci, płatności, powiadomienia.",
            gradient: "from-indigo-500 to-purple-500"
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Komunikacja omnichannel",
            description: "SMS, email, WhatsApp, Messenger - wszystko w jednym dashboardzie komunikacji.",
            gradient: "from-teal-500 to-blue-500"
        }
    ];

    return (
        <section id="funkcje" className="py-24 bg-gray-50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        Funkcje premium
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Wszystko czego potrzebujesz
                        <br />w jednym miejscu
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Kompleksowa platforma, która łączy rezerwacje, płatności, komunikację i analitykę
                        w jeden potężny system zarządzania biznesem
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Stats Section with real-time counters
function StatsSection() {
    const stats = [
        { value: 50000, suffix: '+', label: 'Aktywnych firm', icon: <Users className="w-6 h-6" /> },
        { value: 40, suffix: '%', label: 'Wzrost przychodów', icon: <TrendingUp className="w-6 h-6" /> },
        { value: 75, suffix: '%', label: 'Redukcja no-show', icon: <CheckCircle className="w-6 h-6" /> },
        { value: 5000000, suffix: '+', label: 'Obsłużonych wizyt', icon: <Calendar className="w-6 h-6" /> },
    ];

    const [counters, setCounters] = useState(stats.map(() => 0));
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;

        const timers = stats.map((stat, index) => {
            const increment = stat.value / 100;
            let current = 0;

            return setInterval(() => {
                current += increment;
                if (current >= stat.value) {
                    current = stat.value;
                    clearInterval(timers[index]);
                }
                setCounters(prev => {
                    const newCounters = [...prev];
                    newCounters[index] = Math.floor(current);
                    return newCounters;
                });
            }, 20);
        });

        return () => timers.forEach(clearInterval);
    }, [hasStarted]);

    return (
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/50 to-purple-600/50" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    onViewportEnter={() => setHasStarted(true)}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Liczby mówią same za siebie
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-white/80 max-w-2xl mx-auto">
                        Dołącz do tysięcy przedsiębiorców, którzy już przekształcili swój biznes z Bookly
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="text-center group"
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                                <div className="text-white/70 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {counters[index].toLocaleString()}{stat.suffix}
                                </div>
                                <p className="text-white/80 font-medium">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Social Proof Section
function SocialProofSection() {
    const testimonials = [
        {
            name: "Anna Kowalska",
            role: "Właścicielka Salonu Piękności 'Bella'",
            avatar: "👩‍💼",
            rating: 5,
            text: "Bookly zwiększyło nasze przychody o 45% w 3 miesiące. Klienci uwielbiają rezerwować online, a my mamy pełną kontrolę nad kalendarzem."
        },
        {
            name: "Dr Marek Nowak",
            role: "Klinika Stomatologiczna",
            avatar: "👨‍⚕️",
            rating: 5,
            text: "No-show spadły o 80%! Automatyczne przypomnienia i możliwość zmiany terminów online to game changer dla naszej praktyki."
        },
        {
            name: "Katarzyna Wiśniewska",
            role: "Studio Kosmetyczne Premium",
            avatar: "👩‍🎨",
            rating: 5,
            text: "Integracja z płatnościami online i automatyczne faktury oszczędzają nam 10 godzin tygodniowo. ROI był natychmiastowy."
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
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-green-100 text-green-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Award className="w-4 h-4" />
                        Opinie klientów
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Przedsiębiorcy pokochali Bookly
                    </motion.h2>
                    <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-gray-600 ml-2">4.9/5 na podstawie 12,847 opinii</span>
                    </motion.div>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{testimonial.avatar}</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                                </div>
                            </div>
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
        <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/4 w-64 h-64 border border-white/5 rounded-full"
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Zacznij już dziś
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            bez ryzyka
                        </span>
                    </motion.h2>

                    <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        14 dni pełnej funkcjonalności za darmo. Bez karty kredytowej, bez zobowiązań.
                        Jeśli nie będziesz zadowolony, po prostu przestań korzystać.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                        <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer text-white px-10 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <Zap className="w-5 h-5" />
                            Rozpocznij za darmo
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Setup w 5 minut
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Migracja danych gratis
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            24/7 wsparcie PL
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Gwarancja zwrotu
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    const footerLinks = {
        'Produkt': ['Funkcje', 'Cennik', 'Integracje', 'API', 'Bezpieczeństwo'],
        'Biznes': ['O nas', 'Kariera', 'Blog', 'Partnerzy', 'Inwestorzy'],
        'Wsparcie': ['Centrum pomocy', 'Kontakt', 'Status', 'Dokumentacja', 'Webinary'],
        'Legal': ['Regulamin', 'Prywatność', 'RODO', 'Cookies', 'Licencje']
    };

    const socialIcons = [
        { icon: Facebook, href: '#' },
        { icon: Twitter, href: '#' },
        { icon: Linkedin, href: '#' },
        { icon: Instagram, href: '#' }
    ];

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
                    {/* Brand section */}
                    <div className="lg:col-span-2">
                        <div className="text-2xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Bookly
                            </span>{' '}
                            Business
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Nowoczesna platforma do zarządzania rezerwacjami, która pomaga tysiącom firm
                            zwiększać przychody i optymalizować operacje.
                        </p>
                        <div className="flex gap-4">
                            {socialIcons.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Footer links */}
                    {Object.entries(footerLinks).map(([category, links], index) => (
                        <div key={index}>
                            <h3 className="font-semibold mb-4">{category}</h3>
                            <ul className="space-y-2">
                                {links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-8 mt-16">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2025 Bookly Business. Wszystkie prawa zastrzeżone.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Polska
                            </span>
                            <span className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                RODO Compliant
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <motion.button
            className={`fixed bottom-8 right-8 z-50 bg-gradient-to-r cursor-pointer from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : 20 
            }}
        >
            <ChevronUp className="w-6 h-6" />
        </motion.button>
    );
}

// Main App Component
export default function App() {
    return (
        <div className="font-sans">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <StatsSection />
            <SocialProofSection />
            <CTASection />
            <Footer />
            <ScrollToTop />
        </div>
    )
}
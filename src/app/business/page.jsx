"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Users,
    BarChart3,
    CreditCard,
    Smartphone,
    User,
    Star,
    CheckCircle,
    ArrowRight,
    PlayCircle,
    Shield,
    Zap,
    Clock,
    TrendingUp,
    MessageSquare,
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
    Instagram,
    Building2
} from 'lucide-react';
import HeroBackground from '../../components/HeroComponents/HeroBackground';
import BusinessHeroAsset from '../../components/HeroComponents/BusinessHeroAsset';

// Animacje
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

// Navbar (Redesigned to match global style)
function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Dla kogo', href: "/business/who" },
        { name: 'Funkcje', href: '/business/functions' },
        { name: 'Cennik', href: '/business/pricing' },
        { name: 'Klienci', href: '/' }, // Link back to client side
        { name: 'Kontakt', href: '/business/contact' }
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg"
            : "bg-transparent py-6"
            }`}>
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/business" className="relative z-50 group">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white tracking-tight group-hover:opacity-90 transition-opacity">
                                Bookly<span className="text-violet-500">.</span> <span className="text-sm font-medium text-slate-400 ml-1">Business</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 transition-all duration-200 group-hover:w-full" />
                            </Link>
                        ))}

                        <div className="flex items-center gap-4 ml-4">
                            <Link href="/business/auth" className="text-sm font-medium text-white hover:text-violet-400 transition-colors">
                                Zaloguj się
                            </Link>
                            <Link href="/admin/auth">
                                <button className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                    Wypróbuj za darmo
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-6 space-y-4">
                            {navLinks.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className="block text-slate-300 hover:text-white transition-colors p-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/10 space-y-4">
                                <Link href="/business/auth" className="block text-center text-white font-medium" onClick={() => setIsOpen(false)}>
                                    Zaloguj się
                                </Link>
                                <Link href="/admin/auth" onClick={() => setIsOpen(false)}>
                                    <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                                        Wypróbuj za darmo
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

// Hero Section
function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
            <HeroBackground />

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Column: Text */}
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div
                                variants={fadeInUp}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-8"
                            >
                                <Star className="w-4 h-4 text-yellow-400" />
                                Zaufało nam ponad 50,000 firm
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
                            >
                                Rewolucja w
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                                    rezerwacjach
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
                            >
                                Automatyzuj rezerwacje, zwiększ przychody o 40% i zredukuj no-show o 75%.
                                Kompleksowe rozwiązanie dla nowoczesnych biznesów.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12"
                            >
                                <button className="group bg-white text-slate-900 px-8 py-4 rounded-full cursor-pointer font-bold flex items-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
                                    <Zap className="w-5 h-5" />
                                    Rozpocznij test
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="group flex items-center gap-3 text-white border border-white/30 px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                                    <PlayCircle className="w-5 h-5" />
                                    Zobacz demo
                                </button>
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-slate-400 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    RODO & SSL
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    Bez zobowiązań
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    Setup w 5 min
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column: Asset */}
                    <div className="lg:w-1/2 w-full">
                        <BusinessHeroAsset />
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => {
                    const nextSection = document.getElementById("funkcje");
                    if (nextSection) {
                        nextSection.scrollIntoView({ behavior: "smooth" });
                    }
                }}
            >
                <div className="flex flex-col items-center gap-2 group">
                    <span className="text-xs text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Poznaj funkcje</span>
                    <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </div>
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
        <section id="funkcje" className="py-32 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        Funkcje premium
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Wszystko czego potrzebujesz
                        <br />w jednym miejscu
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
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
                            className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
                        >
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
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
        <section className="py-32 bg-slate-900 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    onViewportEnter={() => setHasStarted(true)}
                    variants={staggerContainer}
                    className="text-center mb-20"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Liczby mówią same za siebie
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
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
                            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 border border-white/5 group-hover:border-white/10">
                                <div className="text-violet-400 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {counters[index].toLocaleString()}{stat.suffix}
                                </div>
                                <p className="text-slate-400 font-medium">{stat.label}</p>
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
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Award className="w-4 h-4" />
                        Opinie klientów
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Przedsiębiorcy pokochali Bookly
                    </motion.h2>
                    <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-slate-600 ml-2 font-medium">4.9/5 na podstawie 12,847 opinii</span>
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
                            className="bg-slate-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-slate-100"
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-slate-700 text-lg mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl bg-white p-2 rounded-full shadow-sm">{testimonial.avatar}</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                                    <p className="text-slate-500 text-sm">{testimonial.role}</p>
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
        <section className="py-32 bg-slate-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20" />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/4 w-96 h-96 border border-white/5 rounded-full"
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
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            bez ryzyka
                        </span>
                    </motion.h2>

                    <motion.p variants={fadeInUp} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        14 dni pełnej funkcjonalności za darmo. Bez karty kredytowej, bez zobowiązań.
                        Jeśli nie będziesz zadowolony, po prostu przestań korzystać.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                        <button className="group bg-white text-slate-900 cursor-pointer px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
                            <Zap className="w-5 h-5" />
                            Rozpocznij za darmo
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Setup w 5 minut
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Migracja danych gratis
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            24/7 wsparcie PL
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
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
        <footer className="bg-slate-950 text-white border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
                    {/* Brand section */}
                    <div className="lg:col-span-2">
                        <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                            Bookly<span className="text-violet-500">.</span> <span className="text-sm font-medium text-slate-500">Business</span>
                        </div>
                        <p className="text-slate-400 mb-6 leading-relaxed font-light">
                            Nowoczesna platforma do zarządzania rezerwacjami, która pomaga tysiącom firm
                            zwiększać przychody i optymalizować operacje.
                        </p>
                        <div className="flex gap-4">
                            {socialIcons.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center hover:bg-violet-600 transition-all duration-300"
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Footer links */}
                    {Object.entries(footerLinks).map(([category, links], index) => (
                        <div key={index}>
                            <h3 className="font-bold mb-4 text-slate-200">{category}</h3>
                            <ul className="space-y-2">
                                {links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-900 pt-8 mt-16">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-sm">
                            © 2025 Bookly Business. Wszystkie prawa zastrzeżone.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
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
            className={`fixed bottom-8 right-8 z-50 bg-violet-600 cursor-pointer text-white p-3 rounded-full shadow-lg hover:bg-violet-700 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
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
        <div className="font-sans bg-slate-50 selection:bg-violet-500/30">
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
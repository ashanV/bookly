"use client";

import { useState, useEffect } from "react";
import {
    Zap,
    Shield,
    Users,
    Clock,
    Star,
    MapPin,
    Calendar,
    Sparkles,
    Check,
    ArrowRight,
} from "lucide-react";

import AnimatedContent from '@/components/animations/AnimatedContent';

export default function FeaturesSection() {
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

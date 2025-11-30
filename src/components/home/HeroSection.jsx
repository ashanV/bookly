"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Search,
    Sparkles,
    X,
    ChevronDown,
} from "lucide-react";

import TypeText from "@/components/animations/TypeText";
import AnimatedContent from '@/components/animations/AnimatedContent';
import HeroBackground from "@/components/HeroComponents/HeroBackground";
import HeroPhoneMockup from "@/components/HeroComponents/HeroPhoneMockup";

export default function HeroSection() {
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

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
            <HeroBackground />

            <div className="container mx-auto px-6 pt-32 pb-16 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text & Search */}
                    <div className="text-left text-white">
                        <AnimatedContent delay={0.1}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-medium text-white/90">Nowy wymiar rezerwacji</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
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
                            <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-light">
                                Odkryj najlepszych specjalistów w Twojej okolicy.
                                <span className="block mt-2 text-slate-400">Szybka i prosta rezerwacja wizyt online 24/7.</span>
                            </p>
                        </AnimatedContent>

                        <AnimatedContent delay={0.3}>
                            <div className="mb-12 relative z-50 max-w-2xl">
                                <div className="search-container relative group">
                                    <div
                                        className={`glass-premium rounded-2xl transition-all duration-500 ${isSearchFocused
                                            ? "shadow-[0_0_40px_rgba(139,92,246,0.3)] border-white/40 scale-[1.02]"
                                            : "border-white/10 hover:border-white/30 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center p-2">
                                            <div className="flex items-center flex-1 px-4">
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
                                                    placeholder="Czego szukasz? (np. fryzjer)"
                                                    className="search-input w-full py-4 bg-transparent placeholder-slate-400 text-white focus:outline-none text-lg font-medium border-0 focus:ring-0"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSearchSubmit}
                                                className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-fuchsia-500/30 transform hover:scale-105 transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AnimatedContent>

                        <AnimatedContent delay={0.4}>
                            <div className="popular-services-slide flex flex-wrap items-center gap-3 transition-all duration-500 ease-out"
                                style={{
                                    marginTop: isSearchFocused
                                        ? searchQuery
                                            ? "200px"
                                            : "180px"
                                        : "0px",
                                }}
                            >
                                <span className="text-slate-400 font-medium mr-2 text-sm uppercase tracking-wide">
                                    Szybki wybór:
                                </span>
                                {[
                                    { name: "Fryzjer", icon: "✂️" },
                                    { name: "Barber", icon: "💈" },
                                    { name: "Paznokcie", icon: "💅" },
                                ].map((service) => (
                                    <button
                                        key={service.name}
                                        className="cursor-pointer group glass-premium px-4 py-2 rounded-full font-medium text-white hover:bg-white hover:text-violet-900 transition-all duration-300 border border-white/10 hover:border-white flex items-center gap-2 text-sm"
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

                    {/* Right Column: Phone Mockup */}
                    <div className="hidden lg:block relative h-[800px] w-full flex items-center justify-center">
                        <HeroPhoneMockup />
                    </div>
                </div>
            </div>


            {/* Scroll Down Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
                onClick={() => {
                    const nextSection = document.getElementById("featured-services");
                    if (nextSection) {
                        nextSection.scrollIntoView({ behavior: "smooth" });
                    } else {
                        // Fallback if id is not set yet, scroll by window height
                        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                    }
                }}
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-2 group"
                >
                    <span className="text-xs text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Odkryj więcej</span>
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300">
                        <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-white" />
                    </div>
                </motion.div>
            </motion.div>
        </section >
    );
}

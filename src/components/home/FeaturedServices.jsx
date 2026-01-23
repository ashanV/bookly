"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Star,
    MapPin,
    Users,
    ArrowRight,
} from "lucide-react";

import AnimatedContent from '@/components/animations/AnimatedContent';

export default function FeaturedServices() {
    const router = useRouter();

    const services = [
        {
            id: 1,
            image:
                "https://images.unsplash.com/photo-1503951914875-befea7470dac?w=800&h=500&fit=crop",
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
        <section id="featured-services" className="py-32 bg-slate-50 relative overflow-hidden">
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

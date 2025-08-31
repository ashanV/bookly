"use client";

import { useState, Fragment, } from 'react';
import { Check, Star, Zap, Crown, Users, Calendar, Clock, Shield, Phone, Mail, ArrowRight, ChevronDown, ChevronUp, Play, X, Building, TrendingUp, Heart, Award, Headphones, Globe } from 'lucide-react';

// --- Komponenty Podrzędne ---

const HeroSection = ({ billingCycle, setBillingCycle }) => (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto text-center relative">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Zaufało nam już ponad 10,000+ biznesów
            </div>

            <h1 className="text-6xl font-bold text-white mb-6">
                Proste <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ceny</span>
                <br />bez niespodzianek
            </h1>

            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                Wybierz plan idealny dla Twojego biznesu. Bez ukrytych kosztów,
                z możliwością zmiany w każdej chwili. Zacznij za darmo już dziś.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center text-white">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>14 dni za darmo</span>
                </div>
                <div className="flex items-center text-white">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Bez karty kredytowej</span>
                </div>
                <div className="flex items-center text-white">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Anuluj kiedy chcesz</span>
                </div>
            </div>

            <div className="flex items-center justify-center mb-8">
                <div className="bg-white p-1 rounded-xl shadow-lg border">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 ${billingCycle === 'monthly'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Miesięczny
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 ${billingCycle === 'yearly'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Roczny
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                            -20%
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const PlanCard = ({ plan, billingCycle, getPrice, getSavings, hoveredPlan, setHoveredPlan }) => {
    const Icon = plan.icon;
    const savings = getSavings(plan);

    return (
        <div
            className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 ${plan.popular
                    ? 'border-purple-200 scale-105 shadow-2xl ring-4 ring-purple-100'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-xl'
                } ${hoveredPlan === plan.id ? 'transform scale-105' : ''}`}
            onMouseEnter={() => setHoveredPlan(plan.id)}
            onMouseLeave={() => setHoveredPlan(null)}
        >
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                        <Star className="w-4 h-4 mr-1" />
                        Najpopularniejszy
                    </div>
                </div>
            )}
            <div className="p-8">
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} p-3 mx-auto mb-4 transform transition-transform duration-200 ${hoveredPlan === plan.id ? 'scale-110' : ''}`}>
                        <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                </div>
                <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-bold text-gray-900">{getPrice(plan)}</span>
                        <span className="text-xl text-gray-600 ml-2">zł</span>
                    </div>
                    <p className="text-gray-600">
                        za {billingCycle === 'monthly' ? 'miesiąc' : 'miesiąc (płatne rocznie)'}
                    </p>
                    {savings > 0 && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Oszczędzasz {savings}%
                        </div>
                    )}
                </div>
                <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-8 border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Limity planu:
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Personel:</span>
                            <span className="font-medium">{plan.limits.staff}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Rezerwacje:</span>
                            <span className="font-medium">{plan.limits.bookings}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Lokalizacje:</span>
                            <span className="font-medium">{plan.limits.locations}</span>
                        </div>
                    </div>
                </div>
                <button
                    className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 group ${plan.popular
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 shadow-lg'
                            : 'bg-gray-900 text-white hover:bg-gray-800 hover:transform hover:scale-105'
                        }`}
                >
                    <span className="flex items-center justify-center cursor-pointer">
                        Rozpocznij bezpłatny trial
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                    14 dni za darmo, bez karty kredytowej
                </p>
            </div>
        </div>
    );
};

// Comparison Table
const ComparisonTable = ({ features, show, toggle }) => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <button onClick={toggle} className="flex items-center justify-between w-full text-left">
                <span className="text-lg font-semibold text-gray-900">Porównanie funkcji</span>
                <div className="transition-transform duration-300" style={{ transform: show ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>
            </button>
        </div>
        <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${show ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Funkcja</th>
                                <th className="text-center py-3 px-4 font-semibold text-blue-600">Starter</th>
                                <th className="text-center py-3 px-4 font-semibold text-purple-600">Professional</th>
                                <th className="text-center py-3 px-4 font-semibold text-amber-600">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((category, categoryIndex) => (
                                <Fragment key={categoryIndex}>
                                    <tr className="bg-gray-50">
                                        <td colSpan={4} className="py-3 px-4 font-semibold text-gray-800">{category.category}</td>
                                    </tr>
                                    {category.features.map((feature, featureIndex) => (
                                        <tr key={featureIndex} className="border-b border-gray-100">
                                            <td className="py-3 px-4 text-gray-700">{feature.name}</td>
                                            <td className="py-3 px-4 text-center">
                                                {typeof feature.starter === 'boolean' ? (feature.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600">{feature.starter}</span>}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {typeof feature.professional === 'boolean' ? (feature.professional ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600">{feature.professional}</span>}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {typeof feature.enterprise === 'boolean' ? (feature.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : <span className="text-sm text-gray-600">{feature.enterprise}</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

const TestimonialCard = ({ testimonial, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-2xl shadow-lg border transition-all duration-300 cursor-pointer ${isSelected ? 'border-purple-200 shadow-xl scale-105' : 'border-gray-100 hover:shadow-xl'
            }`}
    >
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {testimonial.avatar}
            </div>
            <div className="ml-4">
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.business}</p>
            </div>
            <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {testimonial.plan}
                </span>
            </div>
        </div>
        <div className="flex mb-3">
            {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
        </div>
        <p className="text-gray-700 italic">"{testimonial.text}"</p>
    </div>
);

const AddOnsSection = ({ addOns }) => (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dodatki opcjonalne</h2>
            <p className="text-gray-600">Rozszerz funkcjonalność swojego planu</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => {
                const Icon = addon.icon;
                return (
                    <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-lg group">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-2 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="w-full h-full text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{addon.name}</h3>
                        <p className="text-2xl font-bold text-blue-600 mb-2">{addon.price}</p>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

// FAQ
const FaqItem = ({ faq, isExpanded, onClick }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <button onClick={onClick} className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-900">{faq.question}</span>
            <div className="transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            </div>
        </button>
        <div
            className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="px-6 pb-6 border-t border-gray-100">
                <p className="text-gray-700 pt-4">{faq.answer}</p>
            </div>
        </div>
    </div>
);

const CtaSection = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-16">
        <div className="px-8 py-12 text-center text-white relative">
            <div className="absolute inset-0 bg-opacity-20"></div>
            <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">Gotowy, żeby zacząć?</h2>
                <p className="text-xl mb-8 opacity-90">Dołącz do tysięcy zadowolonych właścicieli biznesów</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
                        <span className="flex items-center">
                            <Play className="w-5 h-5 mr-2" />
                            Rozpocznij 14-dniowy trial
                        </span>
                    </button>
                    <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold cursor-pointer hover:bg-white hover:text-blue-600 transition-all duration-200">
                        <span className="flex items-center">
                            <Phone className="w-5 h-5 mr-2" />
                            Porozmawiaj z ekspertem
                        </span>
                    </button>
                </div>
                <div className="flex justify-center items-center gap-8 mt-8 text-sm opacity-75">
                    <div className="flex items-center"><Check className="w-4 h-4 mr-2" /><span>Bez zobowiązań</span></div>
                    <div className="flex items-center"><Check className="w-4 h-4 mr-2" /><span>Setup w 5 minut</span></div>
                    <div className="flex items-center"><Check className="w-4 h-4 mr-2" /><span>Wsparcie 24/7</span></div>
                </div>
            </div>
        </div>
    </div>
);

// Footer
const PageFooter = () => (
    <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <div className="text-2xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Bookly
                        </span>{' '}
                        Business
                    </div>
                    <p className="text-gray-400 mb-4">Narzędzie do rezerwacji, które rozwija Twój biznes.</p>
                    <div className="flex space-x-4">
                        <a href="mailto:kontakt@bookly.com" aria-label="Napisz do nas" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                            <Mail className="w-4 h-4" />
                        </a>
                        <a href="tel:+48123456789" aria-label="Zadzwoń do nas" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                            <Phone className="w-4 h-4" />
                        </a>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Produkt</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Funkcje</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Ceny</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Wsparcie</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Centrum pomocy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Firma</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">O nas</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Polityka prywatności</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 flex justify-between items-center">
                <p className="text-gray-400 text-sm">© 2025 Bookly. Wszystkie prawa zastrzeżone.</p>
            </div>
        </div>
    </footer>
);


// --- Główny Komponent Strony ---

export default function BooklyBusinessPricing() {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(0);

    // --- Dane ---
    const plans = [
        { id: 'starter', name: 'Starter', description: 'Idealny na start', icon: Calendar, color: 'from-blue-500 to-cyan-500', monthlyPrice: 49, yearlyPrice: 39, popular: false, features: ['Do 2 specjalistów', '100 rezerwacji/miesiąc', 'Kalendarz online', 'Powiadomienia SMS', 'Płatności online', 'Podstawowe raporty', 'Email support'], limits: { staff: '2 specjalistów', bookings: '100 rezerwacji', locations: '1 lokalizacja' }, },
        { id: 'professional', name: 'Professional', description: 'Najpopularniejszy wybór', icon: Zap, color: 'from-purple-500 to-pink-500', monthlyPrice: 99, yearlyPrice: 79, popular: true, features: ['Do 10 specjalistów', 'Nielimitowane rezerwacje', 'Zaawansowany kalendarz', 'SMS & Email marketing', 'Płatności + faktury', 'Zaawansowane raporty', 'Zarządzanie klientami CRM', 'Integracje (Google, Zoom)', 'Wsparcie priorytetowe'], limits: { staff: '10 specjalistów', bookings: 'Nielimitowane', locations: '3 lokalizacje' }, },
        { id: 'enterprise', name: 'Enterprise', description: 'Dla dużych biznesów', icon: Crown, color: 'from-amber-500 to-orange-500', monthlyPrice: 199, yearlyPrice: 159, popular: false, features: ['Nielimitowani specjaliści', 'Nielimitowane rezerwacje', 'White-label rozwiązanie', 'Zaawansowana automatyzacja', 'API dostęp', 'Dedykowany account manager', 'Custom integracje', 'Zaawansowana analityka', 'Wsparcie 24/7', 'Szkolenia zespołu'], limits: { staff: 'Nielimitowane', bookings: 'Nielimitowane', locations: 'Nielimitowane' }, }
    ];

    const addOns = [
        { name: 'Dodatkowe SMS', price: '0.15 zł za SMS', description: 'Ponad limit planu bazowego', icon: Phone },
        { name: 'Dodatkowa lokalizacja', price: '29 zł/miesiąc', description: 'Każda dodatkowa lokalizacja', icon: Building },
        { name: 'Premium support', price: '99 zł/miesiąc', description: 'Priorytetowe wsparcie 24/7', icon: Headphones },
        { name: 'White-label branding', price: '149 zł/miesiąc', description: 'Usuń logo Bookly, dodaj swoje', icon: Award }
    ];

    const testimonials = [
        { name: 'Anna Kowalska', business: 'Salon Piękności "Glamour"', avatar: 'AK', text: 'Bookly zwiększył nasze rezerwacje o 40%. Klienci uwielbiają możliwość rezerwowania online 24/7.', rating: 5, plan: 'Professional' },
        { name: 'Marcin Nowak', business: 'Centrum Medyczne "Zdrowie+"', avatar: 'MN', text: 'Zarządzanie 15 specjalistami nigdy nie było tak proste. System automatycznie przypisuje terminy i wysyła przypomnienia.', rating: 5, plan: 'Enterprise' },
        { name: 'Katarzyna Wiśniewska', business: 'Studio Fitness "Active"', avatar: 'KW', text: 'Rozpoczęliśmy z planem Starter i szybko przeszliśmy na Professional. ROI był widoczny już w pierwszym miesiącu.', rating: 5, plan: 'Professional' }
    ];

    const faqs = [
        { question: 'Czy mogę zmienić plan w dowolnym momencie?', answer: 'Tak, możesz zmienić plan w każdej chwili. Przy przejściu na wyższy plan, różnica zostanie naliczona proporcjonalnie. Przy przejściu na niższy plan, kredyt zostanie zastosowany w następnym cyklu rozliczeniowym.' },
        { question: 'Co się dzieje po zakończeniu okresu próbnego?', answer: 'Po 14-dniowym okresie próbnym automatycznie zostanie naliczony koszt wybranego planu. Możesz anulować w każdej chwili podczas okresu próbnego bez żadnych opłat.' },
        { question: 'Czy dane są bezpieczne?', answer: 'Absolutnie. Używamy szyfrowania SSL, regularne backupy i jesteśmy zgodni z RODO/GDPR. Twoje dane są przechowywane na bezpiecznych serwerach w UE.' },
        { question: 'Czy jest limit na liczbę rezerwacji?', answer: 'Plan Starter ma limit 100 rezerwacji miesięcznie. Plany Professional i Enterprise oferują nielimitowane rezerwacje.' },
    ];

    const comparisonFeatures = [
        { category: 'Podstawowe funkcje', features: [{ name: 'Kalendarz rezerwacji', starter: true, professional: true, enterprise: true }, { name: 'Powiadomienia SMS/Email', starter: true, professional: true, enterprise: true }, { name: 'Płatności online', starter: true, professional: true, enterprise: true }, { name: 'Panel administracyjny', starter: true, professional: true, enterprise: true }] },
        { category: 'Zarządzanie', features: [{ name: 'CRM klientów', starter: false, professional: true, enterprise: true }, { name: 'Zarządzanie zespołem', starter: '✓ (2 osoby)', professional: '✓ (10 osób)', enterprise: '✓ Nielimitowane' }, { name: 'Multi-lokalizacja', starter: false, professional: '✓ (3 lokalizacje)', enterprise: '✓ Nielimitowane' }, { name: 'Zaawansowane raporty', starter: false, professional: true, enterprise: true }] },
        { category: 'Marketing', features: [{ name: 'Email marketing', starter: false, professional: true, enterprise: true }, { name: 'SMS marketing', starter: false, professional: true, enterprise: true }, { name: 'Program lojalnościowy', starter: false, professional: true, enterprise: true }, { name: 'Automatyzacja marketingu', starter: false, professional: true, enterprise: true }] },
        { category: 'Integracje', features: [{ name: 'Google Calendar', starter: true, professional: true, enterprise: true }, { name: 'Zoom/Teams', starter: false, professional: true, enterprise: true }, { name: 'API dostęp', starter: false, professional: 'Ograniczony', enterprise: 'Pełny' }, { name: 'Custom integracje', starter: false, professional: false, enterprise: true }] }
    ];

    // --- Funkcje Pomocnicze ---
    const getPrice = (plan) => {
        return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    };

    const getSavings = (plan) => {
        if (billingCycle === 'yearly') {
            const monthlyCost = plan.monthlyPrice * 12;
            const yearlyCost = plan.yearlyPrice * 12;
            return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
        }
        return 0;
    };

    const handleFaqToggle = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    // --- Renderowanie Głównego Komponentu ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <HeroSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

            <main className="max-w-7xl mx-auto px-4">
                <section className="grid lg:grid-cols-3 gap-8 mb-16 -mt-8">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            billingCycle={billingCycle}
                            getPrice={getPrice}
                            getSavings={getSavings}
                            hoveredPlan={hoveredPlan}
                            setHoveredPlan={setHoveredPlan}
                        />
                    ))}
                </section>

                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Porównaj wszystkie funkcje</h2>
                        <p className="text-gray-600">Szczegółowe porównanie planów, żebyś mógł wybrać idealny dla siebie</p>
                    </div>
                    <ComparisonTable
                        features={comparisonFeatures}
                        show={showComparison}
                        toggle={() => setShowComparison(!showComparison)}
                    />
                </section>

                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Co mówią nasi klienci</h2>
                        <p className="text-gray-600">Ponad 10,000 biznesów już nam zaufało</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <TestimonialCard
                                key={index}
                                testimonial={testimonial}
                                isSelected={selectedTestimonial === index}
                                onClick={() => setSelectedTestimonial(index)}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <AddOnsSection addOns={addOns} />
                </section>

                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Często zadawane pytania</h2>
                        <p className="text-gray-600">Znajdź odpowiedzi na najczęściej zadawane pytania</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <FaqItem
                                key={index}
                                faq={faq}
                                isExpanded={expandedFAQ === index}
                                onClick={() => handleFaqToggle(index)}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <CtaSection />
                </section>
            </main>

            <PageFooter />
        </div>
    );
}
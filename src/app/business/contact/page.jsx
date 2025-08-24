"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Facebook,
    Twitter,
    Linkedin,   
    Instagram,
    Shield,
    Send,
    MessageSquare,
    Headphones,
    Users,
    Calendar,
    CheckCircle,
    ArrowRight,
    Star,
    Zap,
    MessageCircle,
    Video,
    Book,
    Coffee,
    Building,
    User,
    Globe,
    Award
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

// Hero Section
function ContactHero() {
    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
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
                        <Headphones className="w-4 h-4" />
                        24/7 Wsparcie w języku polskim
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
                    >
                        Skontaktuj się
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"> z nami</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Jesteśmy tutaj, aby pomóc Ci rozwijać biznes. Nasz zespół ekspertów odpowie na wszystkie pytania i pomoże wybrać najlepsze rozwiązanie.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Odpowiedź w 15 minut
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Dedykowani specjaliści
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Wsparcie w 12 językach
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// Contact Methods Section
function ContactMethods() {
    const contactMethods = [
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Live Chat",
            description: "Natychmiastowa pomoc przez czat na żywo",
            details: "Dostępny 24/7",
            action: "Rozpocznij czat",
            gradient: "from-green-500 to-emerald-500",
            recommended: true
        },
        {
            icon: <Phone className="w-8 h-8" />,
            title: "Telefon",
            description: "Bezpośredni kontakt z ekspertami",
            details: "+48 22 123 45 67",
            action: "Zadzwoń teraz",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Mail className="w-8 h-8" />,
            title: "Email",
            description: "Szczegółowe odpowiedzi na zapytania",
            details: "kontakt@bookly.pl",
            action: "Napisz email",
            gradient: "from-purple-500 to-pink-500"
        },
    ];

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Wybierz sposób kontaktu
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Oferujemy różne kanały komunikacji, abyś mógł skontaktować się z nami w najwygodniejszy dla Ciebie sposób
                    </motion.p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {contactMethods.map((method, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className={`relative group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border ${
                                method.recommended ? 'border-indigo-200 ring-2 ring-indigo-100' : 'border-gray-100'
                            }`}
                        >
                            {method.recommended && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Polecane
                                    </div>
                                </div>
                            )}
                            
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${method.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {method.icon}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                            <p className="text-gray-600 mb-4">{method.description}</p>
                            <p className="text-sm text-gray-500 mb-6">{method.details}</p>
                            
                            <button className={`w-full bg-gradient-to-r ${method.gradient} text-white py-3 cursor-pointer rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200`}>
                                {method.action}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Contact Form Section
function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    businessType: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Usuń błąd dla tego pola jeśli użytkownik zaczyna pisać
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Imię i nazwisko jest wymagane";
    if (!form.email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Podaj prawidłowy adres email";
    }
    if (!form.subject.trim()) newErrors.subject = "Temat jest wymagany";
    if (!form.message.trim()) newErrors.message = "Wiadomość jest wymagana";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus("❌ Proszę poprawić błędy w formularzu");
      return;
    }

    setIsSubmitting(true);
    setStatus("📤 Wysyłanie wiadomości...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setStatus("✅ Wiadomość została wysłana pomyślnie!");
        
        // Reset formularza
        setForm({
          name: "",
          email: "",
          company: "",
          phone: "",
          businessType: "",
          subject: "",
          message: ""
        });
        
        // Scroll do góry po sukcesie
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } else {
        setStatus(`❌ ${data.error || "Wystąpił błąd podczas wysyłania"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("❌ Wystąpił błąd sieci. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
      
      // Automatycznie usuń status po 5 sekundach
      setTimeout(() => {
        setStatus("");
      }, 5000);
    }
  };

    if (submitted) {
        return (
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 rounded-2xl p-12"
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Dziękujemy za wiadomość!</h3>
                        <p className="text-xl text-gray-600 mb-8">
                            Otrzymaliśmy Twoje zapytanie i odpowiemy w ciągu 15 minut w godzinach roboczych.
                        </p>
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Wyślij kolejną wiadomość
                        </button>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Send className="w-4 h-4" />
                        Formularz kontaktowy
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Napisz do nas
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                        Wypełnij formularz poniżej, a nasz zespół skontaktuje się z Tobą najszybciej jak to możliwe
                    </motion.p>
                </motion.div>

                <motion.form
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    onSubmit={handleSubmit}
                    className="bg-gray-50 rounded-2xl p-8 md:p-12"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Imię i nazwisko *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-200"
                                placeholder="Jan Kowalski"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-200"
                                placeholder="jan@firma.pl"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nazwa firmy
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={form.company}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-200"
                                placeholder="Twoja Firma Sp. z o.o."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-0 duration-200"
                                placeholder="+48 123 456 789"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rodzaj biznesu
                        </label>
                        <select
                            name="businessType"
                            value={form.businessType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border cursor-pointer border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-200"
                        >
                            <option value="">Wybierz rodzaj biznesu</option>
                            <option value="salon-pieknosci">Salon piękności</option>
                            <option value="klinika-medyczna">Klinika medyczna</option>
                            <option value="gabinet-stomatologiczny">Gabinet stomatologiczny</option>
                            <option value="salon-fryzjerski">Salon fryzjerski</option>
                            <option value="centrum-spa">Centrum SPA</option>
                            <option value="fitness">Fitness / Siłownia</option>
                            <option value="inne">Inne</option>
                        </select>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temat *
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-200"
                            placeholder="Np. Pytanie o funkcjonalności, cennik, demo..."
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wiadomość *
                        </label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows="6"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-200 resize-none"
                            placeholder="Opisz szczegółowo swoje pytanie lub potrzeby..."
                        />
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            * Pola wymagane
                        </p>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-indigo-600 cursor-pointer to-purple-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-3 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Wysyłanie...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Wyślij wiadomość
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </section>
    );
}

// FAQ Section
function FAQSection() {
    const [openFAQ, setOpenFAQ] = useState(null);

    const faqs = [
        {
            question: "Jak szybko mogę wdrożyć Bookly w mojej firmie?",
            answer: "Standardowe wdrożenie trwa 24-48 godzin. Nasz zespół pomoże Ci w konfiguracji, imporcie danych i szkoleniu zespołu. Możesz zacząć przyjmować rezerwacje już pierwszego dnia."
        },
        {
            question: "Czy Bookly integruje się z moimi obecnymi systemami?",
            answer: "Tak! Oferujemy integracje z najpopularniejszymi systemami księgowymi (Comarch, iFirma), płatnościami (PayU, Przelewy24, Stripe) i narzędziami marketingowymi (Facebook, Google)."
        },
        {
            question: "Jakie są koszty wdrożenia i użytkowania?",
            answer: "Wdrożenie jest bezpłatne. Miesięczne koszty zaczynają się od 99 zł/miesiąc. Oferujemy 14-dniowy bezpłatny okres próbny bez podawania danych karty."
        },
        {
            question: "Czy moje dane są bezpieczne?",
            answer: "Absolutnie. Używamy najwyższych standardów bezpieczeństwa: szyfrowanie SSL, zgodność z RODO, regularne kopie zapasowe i hosting w europejskich centrach danych."
        },
        {
            question: "Jakie wsparcie techniczne oferujecie?",
            answer: "24/7 wsparcie przez czat, email i telefon w języku polskim. Dodatkowo oferujemy bezpłatne szkolenia, webinary i dedykowanego opiekuna klienta."
        },
        {
            question: "Czy mogę używać Bookly na urządzeniach mobilnych?",
            answer: "Tak! Mamy natywne aplikacje na iOS i Android oraz responsywną wersję web. Możesz zarządzać biznesem z dowolnego miejsca."
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-600 rounded-full px-4 py-2 text-sm font-medium mb-6">
                        <Book className="w-4 h-4" />
                        Często zadawane pytania
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Masz pytania? Mamy odpowiedzi!
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                        Znajdź odpowiedzi na najczęściej zadawane pytania o Bookly
                    </motion.p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="bg-white rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between cursor-pointer transition-colors duration-200"
                            >
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ArrowRight className="w-5 h-5 text-gray-600" />
                                </motion.div>
                            </button>
                            <motion.div
                                initial={false}
                                animate={{
                                    height: openFAQ === index ? "auto" : 0,
                                    opacity: openFAQ === index ? 1 : 0
                                }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-4">
                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mt-12"
                >
                    <p className="text-gray-600 mb-6">Nie znalazłeś odpowiedzi na swoje pytanie?</p>
                    <button className="bg-gradient-to-r cursor-pointer from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                        Skontaktuj się z nami
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

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

export default function ContactPage() {
    return (
        <div className="bg-white text-gray-900">
            <ContactHero />
            <ContactMethods />
            <ContactForm />
            <FAQSection />
            <Footer />
        </div>
    );
}

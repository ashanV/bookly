'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';

// Komponenty
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-card shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bookly
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/business" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Dodaj swój biznes
            </Link>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              Załóż konto
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 glass-card rounded-xl">
            <div className="space-y-4">
              <Link href="/business" className="block text-gray-600 hover:text-indigo-600 font-medium">
                Dodaj swój biznes
              </Link>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold">
                Załóż konto
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const [currentWord, setCurrentWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const words = ['terminu', 'stylu', 'relaksu', 'doświadczenia'];

  useEffect(() => {
    let timeout;
    const currentFullWord = words[wordIndex];
    
    if (currentWord.length < currentFullWord.length) {
      timeout = setTimeout(() => {
        setCurrentWord(currentFullWord.slice(0, currentWord.length + 1));
      }, 100);
    } else {
      timeout = setTimeout(() => {
        setCurrentWord('');
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [currentWord, wordIndex, words]);

  return (
    <section className="hero-bg min-h-screen flex items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-6 pt-20 pb-16 relative z-10">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8 fade-in-up">
            Znajdź i zarezerwuj <br />
            swój idealny{' '}
            <span className="hero-gradient-text">
              {currentWord}
              <span className="pulse-custom">|</span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 fade-in-up animation-delay-200">
            Odkryj najlepszych specjalistów w Twojej okolicy. Szybka i prosta rezerwacja wizyt online 24/7.
          </p>

          {/* Enhanced Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto mb-12 fade-in-up animation-delay-400">
            <div className="relative">
              <div className="glass-card rounded-2xl shadow-2xl border border-white/20">
                <div className="flex items-center p-2">
                  <div className="flex items-center flex-1 px-4">
                    <Search className="w-6 h-6 text-gray-400 mr-3" />
                    <input 
                      type="text"
                      placeholder="Jakiej usługi szukasz? (np. strzyżenie męskie, manicure)"
                      className="w-full py-4 bg-transparent placeholder-gray-400 text-gray-700 focus:outline-none text-lg border-0 focus:ring-0"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                    Szukaj teraz
                  </button>
                </div>
              </div>
              {/* Floating suggestions */}
              <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="glass-card rounded-xl p-4 shadow-lg">
                  <div className="text-sm text-gray-600 mb-2">Popularne wyszukiwania:</div>
                  <div className="flex flex-wrap gap-2">
                    {['Fryzjer męski', 'Manicure hybrydowy', 'Masaż relaksacyjny', 'Depilacja'].map(term => (
                      <span key={term} className="text-xs bg-white/80 text-gray-700 px-3 py-1 rounded-full hover:bg-violet-100 cursor-pointer transition-colors">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Services */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16 fade-in-up animation-delay-600">
            <span className="text-gray-200 font-medium hidden sm:inline mr-2">Popularne:</span>
            {['Fryzjer', 'Barber', 'Kosmetyczka', 'Paznokcie', 'Masaż', 'SPA'].map((service) => (
              <button key={service} className="glass-card text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-white hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                {service}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto fade-in-up animation-delay-800">
            {[
              { number: '10K+', label: 'Zadowolonych klientów' },
              { number: '500+', label: 'Specjalistów' },
              { number: '50+', label: 'Miast' },
              { number: '24/7', label: 'Dostępność' }
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 rounded-xl text-center hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-gray-700 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedServices() {
  const services = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1562004760-acb5df6b5102?w=400&h=250&fit=crop",
      category: "Fryzjer",
      categoryColor: "bg-blue-100 text-blue-700",
      name: "Strzyżenie męskie Premium",
      salon: "Elite Barber Shop",
      price: "120 zł",
      rating: 4.8,
      reviews: 124,
      location: "Warszawa, Mokotów"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=250&fit=crop",
      category: "Paznokcie",
      categoryColor: "bg-pink-100 text-pink-700",
      name: "Manicure hybrydowy z wzorkami",
      salon: "Studio Piękna Aurora",
      price: "150 zł",
      rating: 4.9,
      reviews: 89,
      location: "Kraków, Stare Miasto"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=250&fit=crop",
      category: "SPA",
      categoryColor: "bg-green-100 text-green-700",
      name: "Masaż relaksacyjny całego ciała",
      salon: "Wellness & Relax",
      price: "200 zł",
      rating: 4.7,
      reviews: 156,
      location: "Wrocław, Centrum"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=250&fit=crop",
      category: "Kosmetyczka",
      categoryColor: "bg-purple-100 text-purple-700",
      name: "Oczyszczanie twarzy z peelingiem",
      salon: "Beauty Clinic Premium",
      price: "250 zł",
      rating: 4.8,
      reviews: 203,
      location: "Gdańsk, Wrzeszcz"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Odkryj najlepsze usługi w{' '}
            <span className="hero-gradient-text">Twojej okolicy</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Wybrane przez naszych ekspertów miejsca, które gwarantują najwyższą jakość usług
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="service-card bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl group fade-in-up"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${service.categoryColor} px-3 py-1 rounded-full text-sm font-semibold`}>
                    {service.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white bg-opacity-90 px-2 py-1 rounded-lg text-sm font-semibold text-gray-800 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    {service.rating}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {service.salon}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {service.location} • {service.reviews} opinii
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {service.price}
                  </span>
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center">
                    Rezerwuj
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
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
      icon: <Zap className="w-12 h-12" />,
      title: "Błyskawiczne rezerwacje",
      description: "Zarezerwuj wizytę w mniej niż 30 sekund. Bez czekania, bez telefonów.",
      stats: "98% rezerwacji w < 30s",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Bezpieczeństwo płatności",
      description: "Wszystkie transakcje są zabezpieczone najwyższymi standardami bezpieczeństwa.",
      stats: "256-bit SSL szyfrowanie",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Sprawdzeni specjaliści",
      description: "Każdy specjalista przechodzi proces weryfikacji i ma potwierdzone kwalifikacje.",
      stats: "100% zweryfikowanych",
      color: "from-blue-400 to-cyan-500"
    }
  ];

  const additionalFeatures = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Przypomnienia SMS",
      description: "Automatyczne przypomnienia o nadchodzących wizytach"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "System ocen",
      description: "Sprawdź opinie innych klientów przed rezerwacją"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Geolokalizacja",
      description: "Znajdź najbliższe salony w okolicy"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Kalendarz wizyt",
      description: "Zarządzaj wszystkimi wizytami w jednym miejscu"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % mainFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [mainFeatures.length]);

  return (
    <section className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-violet-100 to-purple-100 px-6 py-2 rounded-full text-violet-700 font-semibold mb-6">
            <Sparkles className="w-5 h-5 mr-2" />
            Dlaczego jesteśmy najlepsi
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
            Doświadczenie które{' '}
            <span className="hero-gradient-text">zmienia wszystko</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nie jesteśmy kolejną platformą rezerwacji. Tworzymy przyszłość branży beauty & wellness.
          </p>
        </div>

        {/* Interactive Main Features */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                  activeFeature === index
                    ? 'bg-white shadow-2xl border-2 border-violet-200'
                    : 'bg-white/50 hover:bg-white/80 shadow-lg'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-start space-x-6">
                  <div className={`bg-gradient-to-br ${feature.color} text-white p-4 rounded-2xl flex-shrink-0 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg mb-4">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      {feature.stats}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${feature.color} transition-all duration-4000 ${
                      activeFeature === index ? 'w-full' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Showcase */}
          <div className="relative">
            <div className="glass-card p-8 rounded-3xl shadow-2xl">
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop"
                  alt="Bookify App Interface"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="text-2xl font-bold mb-2">Intuicyjny interfejs</h4>
                  <p className="text-gray-200">Zaprojektowany z myślą o Tobie</p>
                </div>
              </div>
            </div>
            
            {/* Floating notification cards */}
            <div className="absolute -top-8 -right-8 bg-white p-4 rounded-2xl shadow-xl float-animation max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Wizyta potwierdzona!</p>
                  <p className="text-sm text-gray-600">Jutro o 14:00</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl float-animation" style={{animationDelay: '1s'}}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Nowa opinia: 5⭐</p>
                  <p className="text-sm text-gray-600">Doskonała obsługa!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            I to nie wszystko...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 text-center group fade-in-up"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-violet-600">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-card p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Gotowy na <span className="hero-gradient-text">przyszłość</span> rezerwacji?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Dołącz do tysięcy zadowolonych użytkowników, którzy już odkryli nowy sposób na rezerwację usług.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center">
                Rozpocznij za darmo
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-violet-400 hover:text-violet-600 transition-all duration-300">
                Zobacz demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Bookly
              </span>
            </Link>
            <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
              Najprostszy sposób na rezerwację usług beauty i wellness w Polsce. 
              Odkryj, zarezerwuj, ciesz się rezultatem.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5 mr-3" />
                <span>+48 123 456 789</span>
              </div>
              <div className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5 mr-3" />
                <span>hello@bookly.pl</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="group">
                <div className="w-12 h-12 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg">
                  <Facebook className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </div>
              </Link>
              <Link href="https://instagram.com" className="group">
                <div className="w-12 h-12 bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg">
                  <Instagram className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </div>
              </Link>
              <Link href="https://twitter.com" className="group">
                <div className="w-12 h-12 bg-gray-800 hover:bg-blue-400 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg">
                  <Twitter className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </div>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6 text-white">Produkt</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Funkcje
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Cennik
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Dla biznesu
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6 text-white">Firma</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  O nas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Kariera
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2024 Bookify. Wszelkie prawa zastrzeżone.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Regulamin
              </Link>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Prywatność
              </Link>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Główny komponent strony
export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturedServices />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
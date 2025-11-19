"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Building2, User, Mail, Phone, MapPin, Briefcase, Clock, DollarSign, Users, Star, Globe, Instagram, Facebook, Camera, LogIn, UserPlus, Eye, EyeOff, Lock, ArrowRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const BooklyAuth = () => {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth('/business/auth');
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    // Registration fields
    companyName: '',
    companyType: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    postalCode: '',
    category: '',
    description: '',
    services: [],
    workingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    pricing: '',
    teamSize: '',
    website: '',
    instagram: '',
    facebook: '',
    acceptTerms: false,
    newsletter: false
  });

  const totalSteps = 5;

  // Sprawdź czy użytkownik jest już zalogowany jako client - przekieruj
  useEffect(() => {
    if (!authLoading && user && user.role === 'client') {
      router.push('/client');
    }
  }, [authLoading, user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError('');
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [field]: value
        }
      }
    });
  };

  const toggleService = (service) => {
    const services = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData({ ...formData, services });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      if (isStepValid()) {
        setStep(step + 1);
      } else {
        // Pokaż toast z informacją o brakujących polach
        let missingFields = [];
        if (step === 1 && (!formData.companyName || !formData.companyType || !formData.category)) {
          missingFields.push('nazwa firmy', 'typ działalności', 'kategoria');
        } else if (step === 2 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone)) {
          missingFields.push('imię', 'nazwisko', 'email', 'telefon');
        } else if (step === 3 && (!formData.city || !formData.address || !formData.postalCode)) {
          missingFields.push('miasto', 'adres', 'kod pocztowy');
        } else if (step === 4 && formData.services.length === 0) {
          missingFields.push('usługi');
        }

        if (missingFields.length > 0) {
          toast.warning(`Proszę wypełnić: ${missingFields.join(', ')}`);
        }
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // LOGOWANIE - tylko dla biznesów
      const response = await fetch('/api/auth/login-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Zapisz dane użytkownika
        localStorage.setItem('user', JSON.stringify(data.user));

        // Przekieruj na dashboard biznesu
        const redirectUrl = '/business/dashboard';
        router.push(redirectUrl);
        toast.success('Pomyślnie zalogowano!');
        console.log('✅ Logowanie biznesu udane - przekierowanie...');
      } else {
        const errorMsg = data.error || 'Nie udało się zalogować';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Błąd:', err);
      const errorMsg = 'Wystąpił nieoczekiwany błąd';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Walidacja hasła
      if (!formData.password || formData.password.length < 6) {
        const errorMsg = 'Hasło musi mieć co najmniej 6 znaków';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      // Walidacja wymaganych pól
      if (!formData.companyName || !formData.companyType || !formData.category) {
        const errorMsg = 'Proszę wypełnić wszystkie wymagane pola w kroku 1';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        setStep(1);
        return;
      }

      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        const errorMsg = 'Proszę wypełnić wszystkie wymagane pola w kroku 2';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        setStep(2);
        return;
      }

      if (!formData.city || !formData.address || !formData.postalCode) {
        const errorMsg = 'Proszę wypełnić wszystkie wymagane pola w kroku 3';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        setStep(3);
        return;
      }

      if (!formData.services || formData.services.length === 0) {
        const errorMsg = 'Proszę wybrać co najmniej jedną usługę w kroku 4';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        setStep(4);
        return;
      }

      if (!formData.acceptTerms) {
        const errorMsg = 'Musisz zaakceptować regulamin';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      // Przygotowanie danych do wysłania
      const registrationData = {
        companyName: formData.companyName,
        companyType: formData.companyType,
        category: formData.category,
        description: formData.description,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        postalCode: formData.postalCode,
        services: formData.services,
        workingHours: formData.workingHours,
        pricing: formData.pricing,
        teamSize: formData.teamSize,
        website: formData.website,
        instagram: formData.instagram,
        facebook: formData.facebook,
        newsletter: formData.newsletter
      };

      toast.info('Wysyłanie danych...');

      const response = await fetch('/api/auth/register-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Gratulacje! Rejestracja ukończona pomyślnie! Możesz się teraz zalogować.');
        setIsLogin(true);
        setFormData({
          ...formData,
          password: '',
          acceptTerms: false
        });
        setStep(1);
      } else {
        const errorMsg = data.error || 'Wystąpił błąd podczas rejestracji';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Błąd:', err);
      const errorMsg = 'Wystąpił błąd połączenia z serwerem';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setStep(1);
    setFormData({
      email: '',
      password: '',
      companyName: '',
      companyType: '',
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      address: '',
      postalCode: '',
      category: '',
      description: '',
      services: [],
      workingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      pricing: '',
      teamSize: '',
      website: '',
      instagram: '',
      facebook: '',
      acceptTerms: false,
      newsletter: false
    });
  };

  const isStepValid = () => {
    if (step === 1) return formData.companyName && formData.companyType && formData.category;
    if (step === 2) return formData.firstName && formData.lastName && formData.email && formData.phone;
    if (step === 3) return formData.city && formData.address && formData.postalCode;
    if (step === 4) return formData.services.length > 0;
    if (step === 5) return formData.acceptTerms && formData.password && formData.password.length >= 6;
    return false;
  };

  const serviceOptions = [
    { id: 'haircut', name: 'Strzyżenie', icon: '✂️' },
    { id: 'coloring', name: 'Koloryzacja', icon: '🎨' },
    { id: 'styling', name: 'Stylizacja', icon: '💇' },
    { id: 'facial', name: 'Zabiegi na twarz', icon: '✨' },
    { id: 'manicure', name: 'Manicure', icon: '💅' },
    { id: 'pedicure', name: 'Pedicure', icon: '🦶' },
    { id: 'massage', name: 'Masaż', icon: '💆' },
    { id: 'waxing', name: 'Depilacja', icon: '🔥' },
    { id: 'makeup', name: 'Makijaż', icon: '💄' },
    { id: 'lashes', name: 'Rzęsy', icon: '👁️' },
    { id: 'brows', name: 'Brwi', icon: '👀' },
    { id: 'spa', name: 'SPA', icon: '🧖' }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela'
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400">Sprawdzam autoryzację...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="p-10 text-center relative overflow-hidden border-b border-white/5">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-white tracking-tight">
              {isLogin ? 'Witaj ponownie' : 'Dołącz do Bookly'}
            </h1>
            <p className="text-slate-400 text-lg font-light">
              {isLogin ? 'Zaloguj się do swojego panelu biznesowego' : 'Rozpocznij transformację swojego biznesu'}
            </p>
          </div>
        </div>

        {/* Toggle Buttons */}
        {isLogin && (
          <div className="px-8 pt-6">
            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setIsLogin(true)}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isLogin
                    ? 'bg-white/10 text-white shadow-lg border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <LogIn size={18} />
                <span>Logowanie</span>
              </button>
              <button
                onClick={toggleMode}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${!isLogin
                    ? 'bg-white/10 text-white shadow-lg border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UserPlus size={18} />
                <span>Rejestracja</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {!isLogin && (
          <div className="px-8 py-6 bg-slate-800/30 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <React.Fragment key={num}>
                  <div className="flex flex-col items-center relative z-10">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: step >= num ? '#8b5cf6' : '#1e293b',
                        scale: step === num ? 1.1 : 1
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border ${step >= num ? 'border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'border-white/10 text-slate-500'
                        }`}
                    >
                      {step > num ? <Check size={18} /> : num}
                    </motion.div>
                    <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${step >= num ? 'text-violet-400' : 'text-slate-600'}`}>
                      {num === 1 ? 'Firma' : num === 2 ? 'Dane' : num === 3 ? 'Adres' : num === 4 ? 'Usługi' : 'Hasło'}
                    </span>
                  </div>
                  {num < 5 && (
                    <div className="flex-1 h-[2px] mx-2 bg-slate-800 relative overflow-hidden rounded-full">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: step > num ? "100%" : "0%" }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          {isLogin && (
            <motion.form
              key="login"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Adres email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                      placeholder="jan.kowalski@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hasło
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.button
                variants={fadeInUp}
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 ${isLoading || !formData.email || !formData.password
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02]'
                  }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Zaloguj się</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>

              <motion.div variants={fadeInUp} className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Nie masz konta? <span className="text-violet-400">Zarejestruj się</span>
                </button>
              </motion.div>
            </motion.form>
          )}

          {/* Registration Form - Multi-step */}
          {!isLogin && (
            <form onSubmit={handleRegister}>
              <AnimatePresence mode="wait">
                {/* Step 1 - Informacje o firmie */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp} className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Informacje o firmie</h2>
                        <p className="text-sm text-slate-400">Podstawowe informacje o Twojej działalności</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nazwa firmy *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                        placeholder="np. Beauty Salon Premium"
                        required
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Typ działalności *
                      </label>
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white transition-all appearance-none"
                        required
                        disabled={isLoading}
                      >
                        <option value="" className="bg-slate-900">Wybierz typ</option>
                        <option value="salon" className="bg-slate-900">Salon fryzjerski</option>
                        <option value="beauty" className="bg-slate-900">Salon kosmetyczny</option>
                        <option value="barber" className="bg-slate-900">Barbershop</option>
                        <option value="spa" className="bg-slate-900">SPA & Wellness</option>
                        <option value="nails" className="bg-slate-900">Studio paznokci</option>
                        <option value="massage" className="bg-slate-900">Gabinet masażu</option>
                        <option value="fitness" className="bg-slate-900">Fitness & Siłownia</option>
                        <option value="tattoo" className="bg-slate-900">Studio tatuażu</option>
                      </select>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Główna kategoria *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white transition-all appearance-none"
                        required
                        disabled={isLoading}
                      >
                        <option value="" className="bg-slate-900">Wybierz kategorię</option>
                        <option value="hair" className="bg-slate-900">Fryzjerstwo</option>
                        <option value="beauty" className="bg-slate-900">Kosmetyka</option>
                        <option value="nails" className="bg-slate-900">Manicure & Pedicure</option>
                        <option value="massage" className="bg-slate-900">Masaże</option>
                        <option value="wellness" className="bg-slate-900">Wellness & SPA</option>
                        <option value="fitness" className="bg-slate-900">Fitness</option>
                      </select>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Opis firmy
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all resize-none"
                        placeholder="Opisz swoją firmę, atmosferę, specjalizację..."
                        disabled={isLoading}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2 - Dane kontaktowe */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp} className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                        <User size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Dane kontaktowe</h2>
                        <p className="text-sm text-slate-400">Informacje o właścicielu lub osobie kontaktowej</p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Imię *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                          placeholder="Jan"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nazwisko *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                          placeholder="Kowalski"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Adres email *
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                          placeholder="jan.kowalski@example.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Numer telefonu *
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                          placeholder="+48 123 456 789"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Wielkość zespołu
                      </label>
                      <select
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white transition-all appearance-none"
                        disabled={isLoading}
                      >
                        <option value="" className="bg-slate-900">Wybierz</option>
                        <option value="1" className="bg-slate-900">Tylko ja</option>
                        <option value="2-5" className="bg-slate-900">2-5 osób</option>
                        <option value="6-10" className="bg-slate-900">6-10 osób</option>
                        <option value="11-20" className="bg-slate-900">11-20 osób</option>
                        <option value="20+" className="bg-slate-900">Powyżej 20 osób</option>
                      </select>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3 - Lokalizacja */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp} className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Lokalizacja i godziny</h2>
                        <p className="text-sm text-slate-400">Gdzie znajduje się Twoja firma?</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Miasto *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                        placeholder="Warszawa"
                        required
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ulica i numer *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                        placeholder="ul. Piękna 123/45"
                        required
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Kod pocztowy *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                        placeholder="00-000"
                        required
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div variants={fadeInUp} className="pt-4">
                      <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                        <Clock size={16} className="text-violet-400" />
                        Godziny otwarcia
                      </label>
                      <div className="space-y-3 bg-slate-800/30 p-4 rounded-xl border border-white/5">
                        {days.map((day) => (
                          <div key={day} className="flex items-center gap-3">
                            <div className="w-32">
                              <span className="text-sm font-medium text-slate-300">{dayNames[day]}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!formData.workingHours[day].closed}
                              onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                              className="w-4 h-4 text-violet-600 rounded bg-slate-700 border-slate-600 focus:ring-violet-500"
                              disabled={isLoading}
                            />
                            {!formData.workingHours[day].closed ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="time"
                                  value={formData.workingHours[day].open}
                                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg focus:border-violet-500 focus:outline-none text-sm text-white"
                                  disabled={isLoading}
                                />
                                <span className="text-slate-500">-</span>
                                <input
                                  type="time"
                                  value={formData.workingHours[day].close}
                                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg focus:border-violet-500 focus:outline-none text-sm text-white"
                                  disabled={isLoading}
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500 italic">Zamknięte</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 4 - Usługi i cennik */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp} className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Usługi i social media</h2>
                        <p className="text-sm text-slate-400">Jakie usługi oferujesz?</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Wybierz usługi * (wybierz co najmniej jedną)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {serviceOptions.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleService(service.id)}
                            disabled={isLoading}
                            className={`p-4 rounded-xl border transition-all text-left relative group ${formData.services.includes(service.id)
                                ? 'border-violet-500 bg-violet-500/10'
                                : 'border-white/10 bg-slate-800/30 hover:border-violet-500/50 hover:bg-slate-800/50'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl group-hover:scale-110 transition-transform">{service.icon}</span>
                              <span className={`text-sm font-medium ${formData.services.includes(service.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {service.name}
                              </span>
                            </div>
                            {formData.services.includes(service.id) && (
                              <div className="absolute top-2 right-2 bg-violet-500 rounded-full p-0.5">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <DollarSign size={16} className="text-violet-400" />
                        Przedział cenowy
                      </label>
                      <select
                        name="pricing"
                        value={formData.pricing}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white transition-all appearance-none"
                        disabled={isLoading}
                      >
                        <option value="" className="bg-slate-900">Wybierz</option>
                        <option value="budget" className="bg-slate-900">$ - Budżetowy (20-50 zł)</option>
                        <option value="moderate" className="bg-slate-900">$$ - Umiarkowany (50-100 zł)</option>
                        <option value="premium" className="bg-slate-900">$$$ - Premium (100-200 zł)</option>
                        <option value="luxury" className="bg-slate-900">$$$$ - Luksusowy (200+ zł)</option>
                      </select>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="pt-4 border-t border-white/10">
                      <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                        <Globe size={16} className="text-violet-400" />
                        Social Media (opcjonalnie)
                      </label>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Instagram size={20} className="text-white" />
                          </div>
                          <input
                            type="text"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none text-white placeholder-slate-500"
                            placeholder="@twoj_profil"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Facebook size={20} className="text-white" />
                          </div>
                          <input
                            type="text"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none text-white placeholder-slate-500"
                            placeholder="facebook.com/twojaprofil"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                            <Globe size={20} className="text-white" />
                          </div>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none text-white placeholder-slate-500"
                            placeholder="www.twojastrona.pl"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 5 - Hasło i podsumowanie */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp} className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                        <Star size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Hasło i regulamin</h2>
                        <p className="text-sm text-slate-400">Utwórz hasło i zaakceptuj regulamin</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Hasło *
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl focus:border-violet-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all"
                          placeholder="Minimum 6 znaków"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 size={20} className="text-violet-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400">Nazwa firmy</p>
                          <p className="font-semibold text-white">{formData.companyName || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User size={20} className="text-violet-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400">Osoba kontaktowa</p>
                          <p className="font-semibold text-white">{formData.firstName} {formData.lastName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-violet-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400">Email</p>
                          <p className="font-semibold text-white">{formData.email || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-violet-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400">Lokalizacja</p>
                          <p className="font-semibold text-white">
                            {formData.address}, {formData.city} {formData.postalCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Briefcase size={20} className="text-violet-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400">Liczba usług</p>
                          <p className="font-semibold text-white">{formData.services.length} wybranych</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="space-y-4 pt-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 checked:bg-violet-500 checked:border-violet-500 transition-colors appearance-none cursor-pointer"
                            required
                            disabled={isLoading}
                          />
                          {formData.acceptTerms && <Check size={14} className="absolute left-0.5 text-white pointer-events-none" />}
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          Akceptuję <a href="#" className="text-violet-400 font-semibold hover:text-violet-300 hover:underline">politykę prywatności</a> Bookly *
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            name="newsletter"
                            checked={formData.newsletter}
                            onChange={handleChange}
                            className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 checked:bg-violet-500 checked:border-violet-500 transition-colors appearance-none cursor-pointer"
                            disabled={isLoading}
                          />
                          {formData.newsletter && <Check size={14} className="absolute left-0.5 text-white pointer-events-none" />}
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          Chcę otrzymywać newsletter z poradami biznesowymi i nowościami
                        </span>
                      </label>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 p-5 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Camera size={24} className="text-violet-400 mt-1" />
                        <div>
                          <p className="font-semibold text-white mb-1">Co dalej?</p>
                          <p className="text-sm text-slate-400">
                            Po rejestracji otrzymasz dostęp do panelu, gdzie będziesz mógł dodać zdjęcia,
                            szczegółowy cennik i zacząć przyjmować rezerwacje od klientów!
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}
        </div>

        {/* Navigation */}
        <div className="px-8 py-6 bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
          {!isLogin && (
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1 || isLoading
                  ? 'opacity-0 pointer-events-none'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <ChevronLeft size={20} />
              Wstecz
            </button>
          )}

          {!isLogin && step < totalSteps && (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid() || isLoading}
              className={`ml-auto flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 ${isStepValid() && !isLoading
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              Dalej
              <ChevronRight size={20} />
            </button>
          )}

          {!isLogin && step === totalSteps && (
            <button
              type="submit"
              onClick={handleRegister}
              disabled={!isStepValid() || isLoading}
              className={`ml-auto flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 ${isStepValid() && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={20} />
                  Zakończ rejestrację
                </>
              )}
            </button>
          )}

          {!isLogin && step === 1 && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={toggleMode}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Masz już konto? <span className="text-violet-400">Zaloguj się</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

export default BooklyAuth;

"use client";
import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, Check, Building2, User, Mail, Phone, MapPin,
  Briefcase, Clock, DollarSign, Users, Star, Globe, Instagram, Facebook,
  Camera, LogIn, UserPlus, Eye, EyeOff, Lock, ArrowRight, Zap, Sparkles
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCsrf } from '@/hooks/useCsrf';
import { useTranslations } from 'next-intl';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const BooklyAuth = () => {
  const router = useRouter();
  const t = useTranslations('BusinessAuth');
  const { isAuthenticated, user, loading: authLoading, refreshUser } = useAuth('/business/auth');
  const { secureFetch } = useCsrf();
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

  // Redirect if already logged in as client
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
      const response = await secureFetch('/api/auth/login-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (refreshUser) await refreshUser();
        router.push('/business/dashboard');
        toast.success('Pomyślnie zalogowano!');
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
      if (!formData.password || formData.password.length < 6) {
        const errorMsg = 'Hasło musi mieć co najmniej 6 znaków';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!formData.acceptTerms) {
        const errorMsg = 'Musisz zaakceptować regulamin';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

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

      const response = await secureFetch('/api/auth/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Gratulacje! Rejestracja ukończona pomyślnie! Możesz się teraz zalogować.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', acceptTerms: false }));
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
    setFormData(prev => ({
      ...prev,
      email: '',
      password: '',
      // Reset other fields if needed, but keeping them might be better UX if user accidentally switches
    }));
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
    monday: 'Poniedziałek', tuesday: 'Wtorek', wednesday: 'Środa', thursday: 'Czwartek',
    friday: 'Piątek', saturday: 'Sobota', sunday: 'Niedziela'
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="w-full md:w-[45%] lg:w-[40%] relative bg-slate-900 overflow-hidden flex flex-col justify-between p-8 md:p-12">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Bookly<span className="text-violet-400">Business.</span></span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 md:mt-24"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              {t('title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {t('title2')}
              </span> <br />
              {t('title3')}
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>© 2025 Bookly Inc.</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <a href="#" className="hover:text-violet-400 transition-colors">Prywatność</a>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <a href="#" className="hover:text-violet-400 transition-colors">Regulamin</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-slate-950 relative flex flex-col">
        {/* Top Navigation / Toggle */}
        <div className="absolute top-0 right-0 p-6 md:p-8 z-20 flex items-center gap-4">
          <span className="text-slate-400 text-sm hidden sm:inline-block">
            {isLogin ? t('noAccount') : t('hasAccount')}
          </span>
          <button
            onClick={toggleMode}
            className="px-5 py-2.5 rounded-full bg-slate-900 border border-white/10 text-white text-sm font-medium hover:bg-slate-800 hover:border-violet-500/30 transition-all duration-300 flex items-center gap-2 group"
          >
            {isLogin ? (
              <>
                <UserPlus size={16} className="text-violet-400 group-hover:scale-110 transition-transform" />
                <span>{t('register')}</span>
              </>
            ) : (
              <>
                <LogIn size={16} className="text-violet-400 group-hover:scale-110 transition-transform" />
                <span>{t('login')}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-xl mx-auto pt-16 md:pt-0">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">{t('welcomeBack')}</h2>
                    <p className="text-slate-400">{t('loginDesc')}</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300 ml-1">{t('emailLabel')}</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                          placeholder={t('emailPlaceholder')}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between ml-1">
                        <label className="text-sm font-medium text-slate-300">{t('passwordLabel')}</label>
                        <a href="#" className="text-xs text-violet-400 hover:text-violet-300">{t('forgotPassword')}</a>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                          placeholder={t('passwordPlaceholder')}
                          required
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

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{t('login')}</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{t('createAccount')}</h2>
                    <p className="text-slate-400">Krok {step} z {totalSteps}: {
                      step === 1 ? t('step1') :
                        step === 2 ? t('step2') :
                          step === 3 ? t('step3') :
                            step === 4 ? t('step4') : t('step5')
                    }</p>

                    {/* Stepper */}
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-violet-500' : 'bg-slate-800'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div key="step1" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                          <div className="grid gap-5">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-300 ml-1">Nazwa firmy</label>
                              <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                                placeholder="np. Beauty Salon Premium"
                                autoFocus
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300 ml-1">Typ działalności</label>
                                <select
                                  name="companyType"
                                  value={formData.companyType}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white transition-all appearance-none"
                                >
                                  <option value="" className="bg-slate-900">Wybierz typ</option>
                                  <option value="salon" className="bg-slate-900">Salon fryzjerski</option>
                                  <option value="beauty" className="bg-slate-900">Salon kosmetyczny</option>
                                  <option value="barber" className="bg-slate-900">Barbershop</option>
                                  <option value="spa" className="bg-slate-900">SPA & Wellness</option>
                                  <option value="nails" className="bg-slate-900">Studio paznokci</option>
                                  <option value="massage" className="bg-slate-900">Gabinet masażu</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300 ml-1">Kategoria</label>
                                <select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white transition-all appearance-none"
                                >
                                  <option value="" className="bg-slate-900">Wybierz kategorię</option>
                                  <option value="hair" className="bg-slate-900">Fryzjerstwo</option>
                                  <option value="beauty" className="bg-slate-900">Kosmetyka</option>
                                  <option value="nails" className="bg-slate-900">Manicure & Pedicure</option>
                                  <option value="massage" className="bg-slate-900">Masaże</option>
                                  <option value="wellness" className="bg-slate-900">Wellness & SPA</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-300 ml-1">Opis firmy</label>
                              <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all resize-none"
                                placeholder="Opisz krótko swoją działalność..."
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div key="step2" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                          <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-300 ml-1">Imię</label>
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                                placeholder="Jan"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-300 ml-1">Nazwisko</label>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                                placeholder="Kowalski"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                              placeholder="jan.kowalski@example.com"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Telefon</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                              placeholder="+48 123 456 789"
                            />
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div key="step3" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Miasto</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                              placeholder="Warszawa"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Ulica i numer</label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                              placeholder="ul. Marszałkowska 1"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Kod pocztowy</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                              placeholder="00-001"
                            />
                          </div>
                        </motion.div>
                      )}

                      {step === 4 && (
                        <motion.div key="step4" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {serviceOptions.map((service) => (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.id)}
                                className={`p-4 rounded-xl border text-left relative group transition-all duration-200 ${formData.services.includes(service.id)
                                  ? 'border-violet-500 bg-violet-600/10'
                                  : 'border-white/10 bg-slate-900/30 hover:bg-slate-900/60 hover:border-white/20'
                                  }`}
                              >
                                <div className="flex flex-col gap-2">
                                  <span className="text-2xl">{service.icon}</span>
                                  <span className={`text-sm font-medium ${formData.services.includes(service.id) ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    {service.name}
                                  </span>
                                </div>
                                {formData.services.includes(service.id) && (
                                  <div className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Przedział cenowy</label>
                            <select
                              name="pricing"
                              value={formData.pricing}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white transition-all appearance-none"
                            >
                              <option value="" className="bg-slate-900">Wybierz</option>
                              <option value="budget" className="bg-slate-900">$ - Budżetowy</option>
                              <option value="moderate" className="bg-slate-900">$$ - Umiarkowany</option>
                              <option value="premium" className="bg-slate-900">$$$ - Premium</option>
                              <option value="luxury" className="bg-slate-900">$$$$ - Luksusowy</option>
                            </select>
                          </div>
                        </motion.div>
                      )}

                      {step === 5 && (
                        <motion.div key="step5" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Hasło</label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-600 transition-all"
                                placeholder="Minimum 6 znaków"
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

                          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5 space-y-3">
                            <h3 className="text-white font-medium mb-2">Podsumowanie</h3>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Firma:</span>
                              <span className="text-slate-300">{formData.companyName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Email:</span>
                              <span className="text-slate-300">{formData.email}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Usługi:</span>
                              <span className="text-slate-300">{formData.services.length} wybranych</span>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <div className="relative flex items-center mt-0.5">
                                <input
                                  type="checkbox"
                                  name="acceptTerms"
                                  checked={formData.acceptTerms}
                                  onChange={handleChange}
                                  className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 checked:bg-violet-500 checked:border-violet-500 transition-colors appearance-none cursor-pointer"
                                />
                                {formData.acceptTerms && <Check size={14} className="absolute left-0.5 text-white pointer-events-none" />}
                              </div>
                              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                Akceptuję <a href="#" className="text-violet-400 hover:underline">Regulamin</a> i <a href="#" className="text-violet-400 hover:underline">Politykę Prywatności</a>
                              </span>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-8">
                      {step > 1 ? (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium flex items-center gap-2"
                        >
                          <ChevronLeft size={18} />
                          {t('back')}
                        </button>
                      ) : (
                        <div />
                      )}

                      {step < totalSteps ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="px-8 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-200 font-bold transition-all shadow-lg shadow-white/10 flex items-center gap-2"
                        >
                          {t('next')}
                          <ChevronRight size={18} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:shadow-violet-600/30 text-white font-bold transition-all flex items-center gap-2"
                        >
                          {isLoading ? t('registering') : t('finish')}
                          {!isLoading && <Check size={18} />}
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default BooklyAuth;

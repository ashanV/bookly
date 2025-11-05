"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Building2, User, Mail, Phone, MapPin, Briefcase, Clock, DollarSign, Users, Star, Globe, Instagram, Facebook, Camera, LogIn, UserPlus, Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Sprawdzam autoryzację...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 size={32} className="text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Dołącz do Booksy</h1>
            <p className="text-purple-100 text-lg">
              {isLogin ? 'Zaloguj się do swojego konta biznesowego' : 'Rozwijaj swoją firmę z najlepszym systemem rezerwacji'}
            </p>
          </div>
        </div>

        {/* Toggle Buttons - only show when not in registration steps */}
        {isLogin && (
          <div className="px-8 pt-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <LogIn size={18} />
                <span>Logowanie</span>
              </button>
              <button
                onClick={toggleMode}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UserPlus size={18} />
                <span>Rejestracja</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar - only for registration */}
        {!isLogin && (
          <div className="px-8 py-6 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <React.Fragment key={num}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step >= num 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-110' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step > num ? <Check size={20} /> : num}
                    </div>
                    <span className={`text-xs mt-2 font-medium text-center ${step >= num ? 'text-purple-600' : 'text-gray-400'}`}>
                      {num === 1 ? 'Firma' : num === 2 ? 'Dane' : num === 3 ? 'Lokalizacja' : num === 4 ? 'Usługi' : 'Hasło'}
                    </span>
                  </div>
                  {num < 5 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      step > num ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">Krok {step} z {totalSteps}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8 max-h-[600px] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-purple-600" />
                    Adres email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                    placeholder="jan.kowalski@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-purple-600" />
                    Hasło *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="Wprowadź hasło"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isLoading || !formData.email || !formData.password
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Zaloguj się</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-purple-600 hover:underline text-sm font-medium"
                >
                  Nie masz konta? Zarejestruj się
                </button>
              </div>
            </form>
          )}

          {/* Registration Form - Multi-step */}
          {!isLogin && (
            <form onSubmit={handleRegister}>
              {/* Step 1 - Informacje o firmie */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <Building2 className="text-purple-600" />
                      Informacje o firmie
                    </h2>
                    <p className="text-sm text-gray-600">Podstawowe informacje o Twojej działalności</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nazwa firmy *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="np. Beauty Salon Premium"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Typ działalności *
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Wybierz typ</option>
                      <option value="salon">Salon fryzjerski</option>
                      <option value="beauty">Salon kosmetyczny</option>
                      <option value="barber">Barbershop</option>
                      <option value="spa">SPA & Wellness</option>
                      <option value="nails">Studio paznokci</option>
                      <option value="massage">Gabinet masażu</option>
                      <option value="fitness">Fitness & Siłownia</option>
                      <option value="tattoo">Studio tatuażu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Główna kategoria *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Wybierz kategorię</option>
                      <option value="hair">Fryzjerstwo</option>
                      <option value="beauty">Kosmetyka</option>
                      <option value="nails">Manicure & Pedicure</option>
                      <option value="massage">Masaże</option>
                      <option value="wellness">Wellness & SPA</option>
                      <option value="fitness">Fitness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Opis firmy
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all resize-none"
                      placeholder="Opisz swoją firmę, atmosferę, specjalizację..."
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Ten opis będzie widoczny dla Twoich klientów</p>
                  </div>
                </div>
              )}

              {/* Step 2 - Dane kontaktowe */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <User className="text-purple-600" />
                      Dane kontaktowe
                    </h2>
                    <p className="text-sm text-gray-600">Informacje o właścicielu lub osobie kontaktowej</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Imię *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                        placeholder="Jan"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nazwisko *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                        placeholder="Kowalski"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-purple-600" />
                      Adres email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="jan.kowalski@example.com"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Na ten adres wyślemy potwierdzenie rejestracji</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-purple-600" />
                      Numer telefonu *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="+48 123 456 789"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users size={16} className="text-purple-600" />
                      Wielkość zespołu
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      disabled={isLoading}
                    >
                      <option value="">Wybierz</option>
                      <option value="1">Tylko ja</option>
                      <option value="2-5">2-5 osób</option>
                      <option value="6-10">6-10 osób</option>
                      <option value="11-20">11-20 osób</option>
                      <option value="20+">Powyżej 20 osób</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3 - Lokalizacja */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <MapPin className="text-purple-600" />
                      Lokalizacja i godziny pracy
                    </h2>
                    <p className="text-sm text-gray-600">Gdzie znajduje się Twoja firma?</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Miasto *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="Warszawa"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ulica i numer *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="ul. Piękna 123/45"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kod pocztowy *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      placeholder="00-000"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-purple-600" />
                      Godziny otwarcia
                    </label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      {days.map((day) => (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-32">
                            <span className="text-sm font-medium text-gray-700">{dayNames[day]}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={!formData.workingHours[day].closed}
                            onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded"
                            disabled={isLoading}
                          />
                          {!formData.workingHours[day].closed ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                value={formData.workingHours[day].open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                disabled={isLoading}
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="time"
                                value={formData.workingHours[day].close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                disabled={isLoading}
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Zamknięte</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 - Usługi i cennik */}
              {step === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <Briefcase className="text-purple-600" />
                      Usługi i social media
                    </h2>
                    <p className="text-sm text-gray-600">Jakie usługi oferujesz?</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Wybierz usługi * (wybierz co najmniej jedną)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {serviceOptions.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          disabled={isLoading}
                          className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                            formData.services.includes(service.id)
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{service.icon}</span>
                            <span className="text-sm font-medium">{service.name}</span>
                          </div>
                          {formData.services.includes(service.id) && (
                            <Check size={16} className="text-purple-600 absolute top-2 right-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign size={16} className="text-purple-600" />
                      Przedział cenowy
                    </label>
                    <select
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      disabled={isLoading}
                    >
                      <option value="">Wybierz</option>
                      <option value="budget">$ - Budżetowy (20-50 zł)</option>
                      <option value="moderate">$$ - Umiarkowany (50-100 zł)</option>
                      <option value="premium">$$$ - Premium (100-200 zł)</option>
                      <option value="luxury">$$$$ - Luksusowy (200+ zł)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Globe size={16} className="text-purple-600" />
                      Social Media (opcjonalnie)
                    </label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <Instagram size={20} className="text-white" />
                        </div>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleChange}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                          placeholder="@twoj_profil"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Facebook size={20} className="text-white" />
                        </div>
                        <input
                          type="text"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleChange}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                          placeholder="facebook.com/twojaprofil"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Globe size={20} className="text-white" />
                        </div>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                          placeholder="www.twojastrona.pl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 - Hasło i podsumowanie */}
              {step === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <Star className="text-purple-600" />
                      Hasło i regulamin
                    </h2>
                    <p className="text-sm text-gray-600">Utwórz hasło i zaakceptuj regulamin</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Lock size={16} className="text-purple-600" />
                      Hasło *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                        placeholder="Minimum 6 znaków"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hasło musi mieć co najmniej 6 znaków</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 size={20} className="text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Nazwa firmy</p>
                        <p className="font-semibold text-gray-800">{formData.companyName || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User size={20} className="text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Osoba kontaktowa</p>
                        <p className="font-semibold text-gray-800">{formData.firstName} {formData.lastName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{formData.email || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Lokalizacja</p>
                        <p className="font-semibold text-gray-800">
                          {formData.address}, {formData.city} {formData.postalCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase size={20} className="text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Liczba usług</p>
                        <p className="font-semibold text-gray-800">{formData.services.length} wybranych</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="w-5 h-5 text-purple-600 rounded mt-1"
                        required
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">
                        Akceptuję <a href="#" className="text-purple-600 font-semibold hover:underline">politykę prywatności</a> Booksy *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="w-5 h-5 text-purple-600 rounded mt-1"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">
                        Chcę otrzymywać newsletter z poradami biznesowymi i nowościami
                      </span>
                    </label>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-5 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Camera size={24} className="text-purple-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">Co dalej?</p>
                        <p className="text-sm text-gray-600">
                          Po rejestracji otrzymasz dostęp do panelu, gdzie będziesz mógł dodać zdjęcia, 
                          szczegółowy cennik i zacząć przyjmować rezerwacje od klientów!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Navigation */}
        <div className="px-8 py-6 bg-gray-50 border-t flex items-center justify-between">
          {!isLogin && (
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                step === 1 || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
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
              className={`ml-auto flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isStepValid() && !isLoading
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
              className={`ml-auto flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                isStepValid() && !isLoading
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                className="text-purple-600 hover:underline text-sm font-medium"
              >
                Masz już konto? Zaloguj się
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default BooklyAuth;

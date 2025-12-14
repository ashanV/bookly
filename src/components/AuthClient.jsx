"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/Toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  ArrowLeft,
  UserPlus,
  LogIn,
  Facebook,
} from "lucide-react";

import { useCsrf } from '@/hooks/useCsrf';

const BooklyAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, user, loading: authLoading } = useAuth(); // Używamy hooka
  const { secureFetch } = useCsrf();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
  });

  // Sprawdź czy użytkownik jest już zalogowany jako business - przekieruj
  useEffect(() => {
    if (!authLoading && user && user.role === 'business') {
      router.push('/business/dashboard');
    }
  }, [authLoading, user, router]);



  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Wyczyść błąd przy zmianie danych
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // LOGOWANIE - tylko dla klientów
        const response = await secureFetch('/api/auth/login-client', {
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

          // Przekieruj na dashboard klienta
          const redirectUrl = searchParams?.get('redirect') ||
            localStorage.getItem('redirectAfterLogin') ||
            '/client';

          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
          toast.success('Pomyślnie zalogowano!');
          console.log("✅ Logowanie klienta udane - przekierowanie...");
        } else {
          const errorMsg = data.error || 'Błąd logowania';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        // REJESTRACJA
        // Walidacja po stronie klienta
        if (formData.password !== formData.confirmPassword) {
          setError("Hasła nie są identyczne");
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Hasło musi mieć co najmniej 6 znaków");
          setIsLoading(false);
          return;
        }

        // Używamy hooka do rejestracji
        const result = await register(formData);

        if (result.success) {
          setError(""); // Wyczyść błędy
          toast.success("Rejestracja udana! Możesz się teraz zalogować.");
          // Po rejestracji przełącz na tryb logowania
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phone: "",
            birthDate: "",
          });
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error("Błąd:", err);
      const errorMsg = "Wystąpił nieoczekiwany błąd";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(""); // Wyczyść błędy
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      birthDate: "",
    });
  };

  // Pokaż loader podczas sprawdzania autoryzacji
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Sprawdzam autoryzację...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Dekoracyjne elementy tła */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-52 h-20 rounded-2xl mb-4">
            <Image
              src="/images/Logo.png"
              alt="Bookly Logo"
              width={300}
              height={300}
              className="w-36 h-16 md:w-50 md:h-20 object-cover hover:scale-105 transition-transform duration-200"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bookly
          </h1>
          <div className="text-gray-600 mt-2 transition-all duration-500">
            {isLogin ? "Witaj ponownie!" : "Stwórz swoje konto"}
          </div>
        </div>

        {/* Formularz */}
        <div className="backdrop-blur-lg bg-white/80 border border-white/50 rounded-2xl shadow-xl p-8">
          {/* Toggle buttons */}
          <div className="flex mb-8 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg cursor-pointer font-medium transition-all duration-500 ease-in-out flex items-center justify-center space-x-2 ${isLogin
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <LogIn size={18} />
              <span>Logowanie</span>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg cursor-pointer font-medium transition-all duration-500 ease-in-out flex items-center justify-center space-x-2 ${!isLogin
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <UserPlus size={18} />
              <span>Rejestracja</span>
            </button>
          </div>

          {/* Komunikat błędu */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pola dla rejestracji */}
            <div
              className={`transition-all duration-700 ease-in-out transform ${!isLogin
                ? "max-h-screen opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
                }`}
            >
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={20}
                      />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Imię"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required={!isLogin}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-0 focus:border-transparent transition-all duration-300 bg-white/70 disabled:opacity-50"
                      />
                    </div>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={20}
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Nazwisko"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required={!isLogin}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-0 focus:border-transparent transition-all duration-300 bg-white/70 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                      size={20}
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Numer telefonu"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-0 transition-all duration-300 bg-white/70 disabled:opacity-50"
                    />
                  </div>

                  <div className="relative mb-6">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                      size={20}
                    />
                    <input
                      type="date"
                      name="birthDate"
                      placeholder="Data urodzenia"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-0 focus:border-transparent transition-all duration-300 bg-white/70 disabled:opacity-50"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black transition-all duration-300"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Adres email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-0 focus:border-transparent transition-all duration-300 bg-white/70 disabled:opacity-50"
              />
            </div>

            {/* Hasło */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black transition-all duration-300"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Hasło"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-0 focus:border-transparent transition-all duration-300 bg-white/70 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* Potwierdzenie hasła - tylko przy rejestracji */}
            <div
              className={`relative transition-all duration-700 ease-in-out transform ${!isLogin
                ? "max-h-screen opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
                }`}
            >
              {!isLogin && (
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black transition-all duration-300"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Potwierdź hasło"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required={!isLogin}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-0 focus:border-transparent transition-all duration-300 bg-white/70 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Checkbox dla rejestracji */}
            <div
              className={`transition-all duration-700 ease-in-out transform ${!isLogin
                ? "max-h-screen opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
                }`}
            >
              {!isLogin && (
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required={!isLogin}
                    disabled={isLoading}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Akceptuję{" "}
                    <span className="text-indigo-600 hover:underline cursor-pointer transition-all duration-300">
                      regulamin
                    </span>{" "}
                    i{" "}
                    <span className="text-indigo-600 hover:underline cursor-pointer transition-all duration-300">
                      politykę prywatności
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Przycisk submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 cursor-pointer to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-500 ease-in-out flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="transition-all duration-300 transform">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isLogin ? (
                  <LogIn size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
              </div>
              <span className="transition-all duration-300">
                {isLoading
                  ? isLogin
                    ? "Logowanie..."
                    : "Rejestracja..."
                  : isLogin
                    ? "Zaloguj się"
                    : "Utwórz konto"}
              </span>
            </button>

            {/* Link "Zapomniałeś hasła?" - tylko przy logowaniu */}
            <div
              className={`text-center transition-all duration-700 ease-in-out transform ${isLogin
                ? "max-h-screen opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
                }`}
            >
              {isLogin && (
                <span className="text-indigo-600 hover:underline text-sm cursor-pointer transition-all duration-300 hover:text-indigo-700">
                  Zapomniałeś hasła?
                </span>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200 transition-all duration-500"></div>
            <span className="px-4 text-gray-500 text-sm transition-all duration-500">
              lub
            </span>
            <div className="flex-1 border-t border-gray-200 transition-all duration-500"></div>
          </div>

          {/* Logowanie przez social media */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center cursor-pointer space-x-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 group hover:shadow-md transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="text-gray-700 font-medium transition-all duration-300">
                Kontynuuj z Google
              </span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center cursor-pointer space-x-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 group hover:shadow-md transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Facebook size={24} color="#0300a8" />
              <span className="text-gray-700 font-medium transition-all duration-300">
                Kontynuuj z Facebook
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600 transition-all duration-500">
            {isLogin ? (
              <>
                Nie masz konta?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={isLoading}
                  className="text-indigo-600 hover:underline cursor-pointer font-medium transition-all duration-300 hover:text-indigo-700 disabled:opacity-50"
                >
                  Zarejestruj się
                </button>
              </>
            ) : (
              <>
                Masz już konto?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={isLoading}
                  className="text-indigo-600 hover:underline font-medium transition-all duration-300 hover:text-indigo-700 disabled:opacity-50"
                >
                  Zaloguj się
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooklyAuth;

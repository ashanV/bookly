"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, UserPlus, Building2, ArrowUp, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zamknij dropdown gdy klikniesz poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      router.push('/client');
    } else {
      handleLoginClick();
    }
  };

  const handleLoginClick = () => {
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('redirectAfterLogin', currentPath);
    router.push(`/client/auth?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleLogout = async () => {
    await logout(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled ? "glass-card shadow-lg py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/Logo.png"
                alt="Bookly Logo"
                width={300}
                height={300}
                className="w-36 h-16 md:w-50 md:h-20 object-cover hover:scale-105 transition-transform duration-200"
                priority
              />
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              {authLoading ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              ) : isAuthenticated ? (
                // Dropdown menu użytkownika
                <div className="relative" ref={userMenuRef}>
                  <button
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="cursor-pointer p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                    title={`Profil użytkownika: ${user?.firstName || 'Użytkownik'}`}
                  >
                    <User size={20} />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      onMouseEnter={() => setIsUserMenuOpen(true)}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          handleUserClick();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                      >
                        <User size={18} className="text-gray-600" />
                        <span className="text-gray-700 font-medium">Mój profil</span>
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Wyloguj się</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Przycisk logowania dla niezalogowanych
                <button
                  onClick={handleLoginClick}
                  className="bg-violet-600 cursor-pointer hover:bg-violet-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                >
                  Zaloguj
                </button>
              )}
              
              <Link
                href="/business"
                className="cursor-pointer text-black-600 hover:text-orange-600 font-medium transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 hover:shadow-md group border border-transparent hover:border-orange-200"
              >
                <Building2
                  size={18}
                  className="group-hover:scale-110 transition-transform duration-300 text-orange-500"
                />
                <span>Dodaj swój biznes</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Menu mobilne */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden md:hidden ${
              isMenuOpen ? "max-h-screen mt-4" : "max-h-0 mt-0"
            }`}
          >
            <div className="p-4 glass-card rounded-xl">
              <div className="space-y-4">
                <Link
                  href="/business"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-all duration-300 flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 group border border-transparent hover:border-orange-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Building2
                    size={20}
                    className="group-hover:scale-110 transition-transform duration-300 text-orange-500"
                  />
                  <span>Dodaj swój biznes</span>
                </Link>

                {authLoading ? (
                  <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
                ) : isAuthenticated ? (
                  // Menu użytkownika dla mobile
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleUserClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 cursor-pointer"
                    >
                      <User size={18} className="text-gray-600" />
                      <span className="text-gray-700 font-medium">Mój profil</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3 text-red-600 cursor-pointer"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Wyloguj się</span>
                    </button>
                  </div>
                ) : (
                  // Przycisk logowania dla niezalogowanych (mobile)
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <UserPlus size={18} />
                    <span>Załóż konto</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* "Scroll up" button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-110 transition-all duration-300 ease-in-out ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </>
  );
}
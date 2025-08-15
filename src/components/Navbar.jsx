"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, UserPlus, Building2, ArrowUp } from "lucide-react";
import Image from "next/image";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
              <Link
                href="/client/auth"
                className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <UserPlus size={18} />
                <span>Załóż konto / Zaloguj</span>
              </Link>
              <Link
                href="/business"
                className="cursor-pointer text-gray-600 hover:text-orange-600 font-medium transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 hover:shadow-md group border border-transparent hover:border-orange-200"
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
                >
                  <Building2
                    size={20}
                    className="group-hover:scale-110 transition-transform duration-300 text-orange-500"
                  />
                  <span>Dodaj swój biznes</span>
                </Link>
                <Link
                  href="/auth"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center space-x-2"
                >
                  <UserPlus size={18} />
                  <span>Załóż konto</span>
                </Link>
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
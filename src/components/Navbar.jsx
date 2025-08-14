"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-card shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-3">
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

          <div className="hidden md:flex items-center space-x-6">
            <button className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              Załóż konto
            </button>
            <Link
              href="/business"
              className="cursor-pointer text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Dodaj swój biznes
            </Link>
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
              <Link
                href="/business"
                className="block text-gray-600 hover:text-indigo-600 font-medium"
              >
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

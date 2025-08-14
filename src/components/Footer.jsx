"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  X,
} from "lucide-react";

export default function Footer() {
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
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Funkcje
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Cennik
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Dla biznesu
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
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
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  O nas
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Kariera
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
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
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Regulamin
              </Link>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Prywatność
              </Link>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

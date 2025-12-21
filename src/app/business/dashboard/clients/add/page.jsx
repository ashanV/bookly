"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, ChevronDown, Edit2, Plus, Globe, Flag, Mail, Phone } from 'lucide-react';

export default function AddClientPage() {
    const [activeSection, setActiveSection] = useState('profile');

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold text-slate-900">Dodaj nowego klienta</h1>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/business/dashboard/clients"
                                className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-full font-medium transition-colors border border-slate-300"
                            >
                                Zamknij
                            </Link>
                            <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-slate-800 font-medium transition-colors">
                                Zapisz
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-64 flex-shrink-0 hidden md:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-2 px-2">Profil osobisty</h3>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => scrollToSection('profile')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'profile' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Profil
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('addresses')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'addresses' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Adresy
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('emergency')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'emergency' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Kontakty alarmowe
                                    </button>
                                </nav>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => scrollToSection('settings')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'settings' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Ustawienia
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 space-y-12 pb-24">

                        {/* Profile Section */}
                        <section id="profile" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Profil</h2>
                            <p className="text-slate-500 mb-8">Zarządzaj profilem osobistym klienta</p>

                            <div className="mb-8">
                                <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-2 relative group cursor-pointer">
                                    <User size={40} />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm text-slate-500 hover:text-violet-600">
                                        <Edit2 size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Imię</label>
                                    <input type="text" placeholder="np. Jan" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Nazwisko</label>
                                    <input type="text" placeholder="np. Markowska" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">E-mail</label>
                                    <input type="email" placeholder="przyklad@domena.com" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Telefon</label>
                                    <div className="flex gap-3">
                                        <div className="relative w-24 flex-shrink-0">
                                            <select className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900">
                                                <option>+48</option>
                                                <option>+1</option>
                                                <option>+44</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                        <input type="tel" placeholder="np. +1 234 567 8901" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Data urodzenia</label>
                                        <div className="relative">
                                            <input type="text" placeholder="Dzień i miesiąc" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">📅</div>
                                        </div>
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Rok</label>
                                        <input type="text" placeholder="Rok" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Płeć</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-slate-500">
                                            <option>Wybierz opcję</option>
                                            <option>Kobieta</option>
                                            <option>Mężczyzna</option>
                                            <option>Inna</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Zaimki</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-slate-500">
                                            <option>Wybierz opcję</option>
                                            <option>Ona/Jej</option>
                                            <option>On/Jego</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-slate-200" />

                        {/* Informacje dodatkowe Section */}
                        <section className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Informacje dodatkowe</h2>
                            <p className="text-slate-500 mb-8">Zarządzaj danymi klienta.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Źródło polecenia</label>
                                    <div className="relative mb-2">
                                        <select className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900">
                                            <option>Bez rezerwacji</option>
                                            <option>Instagram</option>
                                            <option>Google</option>
                                            <option>Polecenie znajomego</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-slate-500">Podaj, w jaki sposób ten klient znalazł Twoją firmę. <span className="text-violet-600 cursor-pointer">Dowiedz się więcej</span></p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Polecony przez</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs">A</div>
                                            <input type="text" placeholder="Wybierz klienta" className="w-full pl-11 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                        </div>
                                        <button className="px-4 py-2 text-violet-600 font-medium hover:bg-violet-50 rounded-lg transition-colors">Dodaj</button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Wybierz, kto polecił tego klienta Twojej firmie. <span className="text-violet-600 cursor-pointer">Dowiedz się więcej</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2 flex justify-between">
                                        Preferowany język
                                    </label>
                                    <div className="relative mb-2">
                                        <input type="text" placeholder="Wybierz język" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-600 font-medium">Zmień</button>
                                    </div>
                                    <p className="text-xs text-slate-500">Ustaw język automatycznych powiadomień klientów. <br /> <span className="text-violet-600 cursor-pointer">Dowiedz się więcej</span></p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2 flex justify-between">
                                        Zawód
                                        <span className="text-slate-400 font-normal">0/255</span>
                                    </label>
                                    <input type="text" placeholder="Wpisz informacje o zawodzie klienta" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Kraj</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-slate-500">
                                            <option>Wybierz kraj</option>
                                            <option>Polska</option>
                                            <option>USA</option>
                                            <option>Niemcy</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Dodatkowy adres e-mail</label>
                                    <input type="email" placeholder="przyklad+1@domena.com" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Dodatkowy telefon</label>
                                    <div className="flex gap-3">
                                        <div className="relative w-24 flex-shrink-0">
                                            <select className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900">
                                                <option>+48</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                        <input type="tel" placeholder="np. +1 234 567 8901" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

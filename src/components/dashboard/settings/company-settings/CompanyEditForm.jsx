"use client";

import React from 'react';
import { Facebook, Instagram, Globe } from 'lucide-react';

export default function CompanyEditForm({
    businessName,
    setBusinessName,
    taxSettings,
    setTaxSettings,
    facebook,
    setFacebook,
    instagram,
    setInstagram,
    twitter,
    setTwitter,
    website,
    setWebsite,
    onSave,
    onClose
}) {
    return (
        <div className="max-w-3xl mx-auto animate-fade-in text-left">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900">Edytuj dane firmy</h1>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                    >
                        Zamknij
                    </button>
                    <button
                        onClick={onSave}
                        className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium transition-all shadow-lg shadow-gray-200"
                    >
                        Zapisz
                    </button>
                </div>
            </div>

            <div className="space-y-12 pb-12">
                {/* Company Info */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Informacje o firmie</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Wybierz nazwę wyświetlaną w Twoim profilu rezerwacji online, na dowodach sprzedaży i w wiadomościach do klientów.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Nazwa firmy</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                            />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm text-gray-600">
                            Twój wybrany kraj to <span className="font-bold text-gray-900">Polska</span>, a waluta to <span className="font-bold text-gray-900">PLN</span>.
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* Tax Settings */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Podatek</h2>
                    <p className="text-gray-500 mb-4 text-sm">
                        Określ sposób doliczania podatku do cen na potrzeby sprzedaży i raportów.
                    </p>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="radio"
                                    name="tax"
                                    className="peer sr-only"
                                    checked={taxSettings === 'retail_excl'}
                                    onChange={() => setTaxSettings('retail_excl')}
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-purple-600 peer-checked:border-[6px] transition-all bg-white"></div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">Ceny detaliczne nie zawierają podatku</div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Podatek = cena detaliczna * stawka podatkowa
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="radio"
                                    name="tax"
                                    className="peer sr-only"
                                    checked={taxSettings === 'retail_incl'}
                                    onChange={() => setTaxSettings('retail_incl')}
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-purple-600 peer-checked:border-[6px] transition-all bg-white"></div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">Ceny detaliczne zawierają podatek</div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Podatek = (stawka podatkowa * cena detaliczna) / (1 + stawka podatkowa)
                                </p>
                            </div>
                        </label>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* Language Settings */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ustawienia języka</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Wybierz domyślny język dla klientów i zespołu.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Domyślny język zespołu</label>
                            <div className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                                <span className="text-sm text-gray-900">polski (PL)</span>
                                <button className="text-sm text-purple-600 font-medium hover:underline">Zmień</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Domyślny język klienta</label>
                            <div className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                                <span className="text-sm text-gray-900">polski (PL)</span>
                                <button className="text-sm text-purple-600 font-medium hover:underline">Zmień</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700">
                        Pracownicy i klienci będą mogli zmienić język wyświetlany w ich ustawieniach.
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* External Links */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Linki zewnętrzne</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Dodaj swoją stronę internetową i linki do mediów społecznościowych.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Facebook</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Facebook size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={facebook}
                                    onChange={(e) => setFacebook(e.target.value)}
                                    placeholder="facebook.com/twojastrona"
                                    className="w-full pl-10 bg-white border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Instagram</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Instagram size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="instagram.com/twojastrona"
                                    className="w-full pl-10 bg-white border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">X (Twitter)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="x.com/twojastrona"
                                    className="w-full pl-10 bg-white border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Strona internetowa</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="twojastrona.com"
                                    className="w-full pl-10 bg-white border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

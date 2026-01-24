"use client";

import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export default function ServicePricing({ data, onChange }) {
    return (
        <section id="pricing" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cena i czas trwania</h2>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Typ ceny
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none bg-white font-medium text-gray-900"
                            >
                                <option value="fixed">Stała</option>
                                <option value="from">Od</option>
                                <option value="free">Bezpłatna</option>
                                <option value="varies">Zmienna</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Cena
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">zł</span>
                            <input
                                type="number"
                                value={data.price}
                                onChange={(e) => onChange('price', e.target.value)}
                                placeholder="0,00"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Czas trwania
                        </label>
                        <div className="relative">
                            <select
                                value={data.duration}
                                onChange={(e) => onChange('duration', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none bg-white font-medium text-gray-900"
                            >
                                <option value="15">15 min</option>
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">1h</option>
                                <option value="75">1h 15min</option>
                                <option value="90">1h 30min</option>
                                <option value="105">1h 45min</option>
                                <option value="120">2h</option>
                                {/* Add more options as needed */}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Plus className="w-4 h-4" />
                        Dodaj czas
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Opcje
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}

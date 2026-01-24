"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

function CategorySelector({ selectedCategory, categories, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayCategories = React.useMemo(() => {
        const hasGeneral = categories.some(c => c.name === 'Ogólne');
        if (!hasGeneral) {
            return [{ name: 'Ogólne', color: '#38bdf8' }, ...categories];
        }
        return categories;
    }, [categories]);

    const selectedCatObj = displayCategories.find(c => c.name === selectedCategory);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white flex items-center justify-between transition-all outline-none ${isOpen ? 'border-black ring-1 ring-black' : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {selectedCatObj ? (
                        <>
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: selectedCatObj.color || '#38bdf8' }}
                            />
                            <span className="font-medium text-gray-900">{selectedCategory}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">Wybierz kategorię</span>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto p-1">
                        {displayCategories.map((cat) => (
                            <button
                                key={cat.name}
                                type="button"
                                onClick={() => {
                                    onSelect(cat.name);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                            >
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: cat.color || '#38bdf8' }}
                                />
                                <span className={`font-medium ${selectedCategory === cat.name ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="p-1 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                onSelect('new');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Dodaj kategorię
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ServiceBasicInfo({ data, onChange, categories }) {
    return (
        <section id="basic" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Podstawowe informacje</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nazwa zabiegu
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="Dodaj nazwę zabiegu, np. strzyżenie męskie"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Kategoria
                        </label>
                        <CategorySelector
                            selectedCategory={data.category}
                            categories={categories}
                            onSelect={(value) => onChange('category', value)}
                        />
                        <p className="mt-2 text-xs text-gray-500">Kategoria wyświetlana Tobie i klientom online</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Rodzaj zabiegu
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all appearance-none bg-white font-medium text-gray-900"
                            >
                                <option value="">Wybierz rodzaj zabiegu</option>
                                {/* Placeholder for service types if needed */}
                                <option value="service">Usługa podstawowa</option>
                                <option value="package">Pakiet</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Pomaga klientom znaleźć Twoje usługi</p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-900">
                            Opis <span className="text-gray-400 font-normal">(Opcjonalne)</span>
                        </label>
                        <span className="text-xs text-gray-400">0/1000</span>
                    </div>
                    <textarea
                        value={data.description}
                        onChange={(e) => onChange('description', e.target.value)}
                        placeholder="Dodaj krótki opis"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 resize-none"
                    />
                </div>
            </div>
        </section>
    );
}

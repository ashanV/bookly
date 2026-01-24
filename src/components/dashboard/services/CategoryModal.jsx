"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

const COLORS = [
    { name: 'Niebieski', value: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Fioletowy', value: '#8b5cf6', bg: 'bg-violet-500' },
    { name: 'Zielony', value: '#22c55e', bg: 'bg-green-500' },
    { name: 'Czerwony', value: '#ef4444', bg: 'bg-red-500' },
    { name: 'Pomarańczowy', value: '#f97316', bg: 'bg-orange-500' },
    { name: 'Różowy', value: '#ec4899', bg: 'bg-pink-500' },
    { name: 'Szary', value: '#6b7280', bg: 'bg-gray-500' },
];

export default function CategoryModal({ isOpen, onClose, onSave, initialData }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [showColorDropdown, setShowColorDropdown] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            const color = COLORS.find(c => c.value === initialData.color) || COLORS[0];
            setSelectedColor(color);
        } else {
            setName('');
            setDescription('');
            setSelectedColor(COLORS[0]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name,
            description,
            color: selectedColor.value,
            originalName: initialData?.name // Pass original name to identify which category to update
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {initialData ? 'Edytuj kategorię' : 'Dodaj kategorię'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Nazwa kategorii</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="np. usługi fryzjerskie"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-900 mb-2">Kolor rezerwacji</label>
                                <button
                                    type="button"
                                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-500 text-left flex items-center justify-between bg-white text-gray-900"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-4 h-4 rounded-full ${selectedColor.bg}`}></span>
                                        {selectedColor.name}
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                </button>

                                {showColorDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-10 max-h-60 overflow-y-auto">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setShowColorDropdown(false);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className={`w-4 h-4 rounded-full ${color.bg}`}></span>
                                                <span className="text-gray-700">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-900">Opis</label>
                                <span className="text-xs text-gray-400">{description.length}/255</span>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={255}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 rounded-full border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-all"
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition-all"
                            >
                                {initialData ? 'Zapisz' : 'Dodaj'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

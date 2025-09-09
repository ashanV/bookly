"use client";

import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

const categories = ["Wszystkie", "Fryzjer", "Paznokcie", "SPA", "Kosmetyczka", "Depilacja", "Pedicure", "Makijaż"];

export default function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }) {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleClearFilters = () => {
    onFiltersChange({ category: 'Wszystkie', priceRange: [0, 500], minRating: 0, availability: [], promotions: false });
    setPriceRange([0, 500]);
    setSelectedRating(0);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white lg:bg-transparent shadow-2xl lg:shadow-none transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-hidden`}>
        <div className="h-full overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Filtry</h3>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Kategoria</h4>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category} className="flex items-center cursor-pointer hover:bg-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                    className="mr-3 text-violet-600 focus:ring-violet-500 w-5 h-5"
                  />
                  <span className="text-gray-700 font-medium">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Zakres cen</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="bg-white px-3 py-1 rounded-full shadow-sm">{priceRange[0]} zł</span>
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full shadow-sm">{priceRange[1]} zł</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => {
                  const newRange = [priceRange[0], parseInt(e.target.value)];
                  setPriceRange(newRange);
                  onFiltersChange({ ...filters, priceRange: newRange });
                }}
                className="w-full h-2 bg-violet-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Minimalna ocena</h4>
            <div className="space-y-3">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer hover:bg-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={(e) => {
                      setSelectedRating(parseFloat(e.target.value));
                      onFiltersChange({ ...filters, minRating: parseFloat(e.target.value) });
                    }}
                    className="mr-3 text-violet-600 focus:ring-violet-500 w-5 h-5"
                  />
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                    <span className="font-medium">{rating}+</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Dostępność</h4>
            <div className="space-y-3">
              {[
                { value: 'today', label: 'Dziś', icon: '🔥' },
                { value: 'tomorrow', label: 'Jutro', icon: '⚡' },
                { value: 'week', label: 'W tym tygodniu', icon: '📅' }
              ].map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer hover:bg-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    checked={filters.availability?.includes(option.value)}
                    onChange={(e) => {
                      const current = filters.availability || [];
                      const updated = e.target.checked
                        ? [...current, option.value]
                        : current.filter(v => v !== option.value);
                      onFiltersChange({ ...filters, availability: updated });
                    }}
                    className="mr-3 text-violet-600 focus:ring-violet-500 w-5 h-5 rounded"
                  />
                  <span className="mr-2 text-xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-5">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.promotions}
                onChange={(e) => onFiltersChange({ ...filters, promotions: e.target.checked })}
                className="mr-4 text-orange-600 focus:ring-orange-500 w-5 h-5 rounded"
              />
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔥</span>
                <span className="text-gray-900 font-bold">Tylko promocje</span>
              </div>
            </label>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 cursor-pointer text-white rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-md"
          >
            Wyczyść filtry
          </button>
        </div>
      </div>
    </>
  );
}
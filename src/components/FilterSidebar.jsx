"use client";

import React, { useState } from 'react';
import { X, Star, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ["Wszystkie", "Fryzjer", "Paznokcie", "SPA", "Kosmetyczka", "Depilacja", "Pedicure", "Makijaż"];

const FilterSection = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between group"
      >
        <h4 className="text-base font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{title}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }) {
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 500]);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleClearFilters = () => {
    onFiltersChange({ category: 'Wszystkie', priceRange: [0, 500], minRating: 0, availability: [], promotions: false });
    setPriceRange([0, 500]);
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed lg:sticky lg:top-24 inset-y-0 left-0 z-50 w-80 bg-white lg:bg-transparent shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col h-full lg:h-[calc(100vh-8rem)]`}>

        {/* Header Mobile */}
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-gray-100 bg-white">
          <h3 className="text-xl font-bold text-gray-900">Filtry</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-1 lg:p-0 lg:pr-2 custom-scrollbar">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-2">

            {/* Promotions Toggle - Always visible */}
            <div className="pb-4 border-b border-gray-100">
              <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-orange-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${filters.promotions ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-500'}`}>
                    <span className="text-lg">🔥</span>
                  </div>
                  <span className={`font-bold transition-colors ${filters.promotions ? 'text-orange-600' : 'text-gray-700'}`}>Tylko promocje</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={filters.promotions}
                    onChange={(e) => onFiltersChange({ ...filters, promotions: e.target.checked })}
                  />
                  <div className={`w-12 h-7 rounded-full transition-colors duration-300 ${filters.promotions ? 'bg-orange-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${filters.promotions ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </label>
            </div>

            <FilterSection title="Kategoria" isOpen={openSections.category} onToggle={() => toggleSection('category')}>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = filters.category === category;
                  return (
                    <button
                      key={category}
                      onClick={() => onFiltersChange({ ...filters, category })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Zakres cen" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
              <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block">Od</span>
                    <span className="font-bold text-gray-900">{priceRange[0]} zł</span>
                  </div>
                  <div className="w-4 h-px bg-gray-300"></div>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block">Do</span>
                    <span className="font-bold text-gray-900">{priceRange[1]} zł</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newRange = [priceRange[0], parseInt(e.target.value)];
                    setPriceRange(newRange);
                    onFiltersChange({ ...filters, priceRange: newRange });
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600 hover:accent-violet-700"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  <span>0 zł</span>
                  <span>250 zł</span>
                  <span>500+ zł</span>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Ocena" isOpen={openSections.rating} onToggle={() => toggleSection('rating')}>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5].map((rating) => (
                  <label key={rating} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filters.minRating === rating ? 'border-violet-600 bg-violet-600' : 'border-gray-300 bg-white'}`}>
                        {filters.minRating === rating && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <input
                        type="radio"
                        name="rating"
                        className="hidden"
                        checked={filters.minRating === rating}
                        onChange={() => onFiltersChange({ ...filters, minRating: rating })}
                      />
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900 mr-2">{rating}+</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Dostępność" isOpen={openSections.availability} onToggle={() => toggleSection('availability')}>
              <div className="space-y-2">
                {[
                  { value: 'today', label: 'Dziś', icon: '⚡' },
                  { value: 'tomorrow', label: 'Jutro', icon: '📅' },
                  { value: 'week', label: 'W tym tygodniu', icon: '🗓️' }
                ].map((option) => {
                  const isChecked = filters.availability?.includes(option.value);
                  return (
                    <label key={option.value} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-violet-200 bg-violet-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isChecked ? 'bg-violet-600 border-violet-600' : 'bg-white border-gray-300'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = filters.availability || [];
                          const updated = e.target.checked
                            ? [...current, option.value]
                            : current.filter(v => v !== option.value);
                          onFiltersChange({ ...filters, availability: updated });
                        }}
                      />
                      <span className="mr-2">{option.icon}</span>
                      <span className={`font-medium ${isChecked ? 'text-violet-900' : 'text-gray-700'}`}>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-6 bg-white border-t border-gray-100 lg:bg-transparent lg:border-0">
          <button
            onClick={handleClearFilters}
            className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
            <span>Wyczyść filtry</span>
          </button>
        </div>
      </div>
    </>
  );
}

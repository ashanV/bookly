"use client";

import React from 'react';
import { Plus } from 'lucide-react';

export default function ServiceCategorySidebar({
    categories,
    selectedCategory,
    onSelectCategory,
    onAddCategory
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit w-full md:w-72 flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kategorie</h3>

            <div className="space-y-2">
                <button
                    onClick={() => onSelectCategory(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center group ${selectedCategory === null
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <span>Wszystkie kategorie</span>
                    <span className={`text-sm ${selectedCategory === null ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded-full`}>
                        {categories.reduce((acc, cat) => acc + cat.count, 0)}
                    </span>
                </button>

                {categories.map((category, index) => (
                    <button
                        key={`${category.name}-${index}`}
                        onClick={() => onSelectCategory(category.name)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center group ${selectedCategory === category.name
                            ? 'bg-purple-50 text-purple-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <span className="truncate">{category.name}</span>
                        <span className={`text-sm ${selectedCategory === category.name ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded-full`}>
                            {category.count}
                        </span>
                    </button>
                ))}
            </div>

            <button
                onClick={onAddCategory}
                className="w-full mt-6 text-left px-4 py-2 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Dodaj kategorię
            </button>
        </div>
    );
}

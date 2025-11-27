"use client";

import React from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

export default function PortfolioSection({
    portfolio,
    onPortfolioUpload,
    onDeleteImage
}) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
                    <p className="text-sm text-gray-500 mt-1">Zaprezentuj swoje najlepsze prace</p>
                </div>
                <label className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Dodaj Zdjęcia
                    <input type="file" className="hidden" accept="image/*" multiple onChange={onPortfolioUpload} />
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {portfolio.map(img => (
                    <div key={img.id} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-purple-400 transition-all">
                            <img src={img.url} alt="Portfolio" className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={() => onDeleteImage(img.id)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                            <Trash2 className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ))}
                {portfolio.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Brak zdjęć w portfolio</p>
                        <p className="text-sm text-gray-400 mt-2">Dodaj swoje prace, aby pokazać je klientom</p>
                    </div>
                )}
            </div>
        </div>
    );
}



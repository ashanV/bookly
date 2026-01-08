'use client';

import React from 'react';
import { ArrowLeft, Download, ChevronDown } from 'lucide-react';

export default function ReservationsHeader({ onBack, onExport }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wizyty</h1>
            <p className="text-sm text-gray-600">
              Wyświetlaj, filtruj i eksportuj wizyty zarezerwowane przez klientów.
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium shadow-sm"
          >
            <span>Eksportuj</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}


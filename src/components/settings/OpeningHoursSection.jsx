"use client";

import React from 'react';
import { Save, Users } from 'lucide-react';

export default function OpeningHoursSection({
    openingHours,
    onUpdateOpeningHours,
    onSaveHours,
    onApplyToAllEmployees
}) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Godziny Otwarcia</h2>
                <p className="text-sm text-gray-500 mt-1">Ustaw godziny pracy swojej firmy</p>
            </div>

            <div className="space-y-4">
                {openingHours.map((day, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <label className="block text-gray-900 font-semibold mb-2">{day.day}</label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={day.open}
                                        onChange={(e) => onUpdateOpeningHours(index, 'open', e.target.value)}
                                        disabled={day.closed}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="time"
                                        value={day.close}
                                        onChange={(e) => onUpdateOpeningHours(index, 'close', e.target.value)}
                                        disabled={day.closed}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={day.closed}
                                        onChange={(e) => onUpdateOpeningHours(index, 'closed', e.target.checked)}
                                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">Nieczynne</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onSaveHours}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Zapisz Godziny
                    </button>
                    <button
                        onClick={onApplyToAllEmployees}
                        className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                        <Users className="w-5 h-5" />
                        Zastosuj do wszystkich pracowników
                    </button>
                </div>
            </div>
        </div>
    );
}



"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Copy, Check } from 'lucide-react';
import { toast } from '@/components/Toast';

const DAYS = [
    { key: 'monday', label: 'poniedziałek' },
    { key: 'tuesday', label: 'wtorek' },
    { key: 'wednesday', label: 'środa' },
    { key: 'thursday', label: 'czwartek' },
    { key: 'friday', label: 'piątek' },
    { key: 'saturday', label: 'sobota' },
    { key: 'sunday', label: 'niedziela' }
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
}
// Add 24:00 option (End of day)
TIME_OPTIONS.push('24:00');

// Helper to normalize the hours object structure
const normalizeHours = (hours) => {
    const normalized = { ...hours };
    DAYS.forEach(day => {
        if (!normalized[day.key]) {
            normalized[day.key] = { ranges: [{ open: '10:00', close: '19:00' }], closed: false };
        } else {
            // Ensure ranges exist or migrate from legacy open/close
            if (!normalized[day.key].ranges || normalized[day.key].ranges.length === 0) {
                normalized[day.key].ranges = [
                    {
                        open: normalized[day.key].open || '10:00',
                        close: normalized[day.key].close || '19:00'
                    }
                ];
            }
        }
    });
    return normalized;
};

const DEFAULT_HOURS = {
    monday: { ranges: [{ open: '10:00', close: '19:00' }], closed: false },
    tuesday: { ranges: [{ open: '10:00', close: '19:00' }], closed: false },
    wednesday: { ranges: [{ open: '10:00', close: '19:00' }], closed: false },
    thursday: { ranges: [{ open: '10:00', close: '19:00' }], closed: false },
    friday: { ranges: [{ open: '10:00', close: '19:00' }], closed: false },
    saturday: { ranges: [{ open: '10:00', close: '15:00' }], closed: true },
    sunday: { ranges: [{ open: '10:00', close: '15:00' }], closed: true }
};

export default function WorkingHoursEditor({ value, onChange }) {
    const [hours, setHours] = useState(value ? normalizeHours(value) : DEFAULT_HOURS);
    const [showCopyButton, setShowCopyButton] = useState(false);

    // Sync with external value changes
    useEffect(() => {
        if (value) {
            setHours(normalizeHours(value));
        }
    }, [value]);

    const handleChange = (newHours) => {
        setHours(newHours);
        onChange(newHours);
        setShowCopyButton(true);
    };

    const handleToggleDay = (dayKey) => {
        const newHours = { ...hours };
        newHours[dayKey] = {
            ...newHours[dayKey],
            closed: !newHours[dayKey].closed
        };
        handleChange(newHours);
    };

    const handleTimeChange = (dayKey, index, field, newValue) => {
        const newHours = { ...hours };
        const newRanges = [...newHours[dayKey].ranges];
        newRanges[index] = { ...newRanges[index], [field]: newValue };

        newHours[dayKey] = {
            ...newHours[dayKey],
            ranges: newRanges,
            // Keep legacy fields updated for backward compatibility
            open: index === 0 ? newRanges[0].open : newHours[dayKey].open,
            close: index === newRanges.length - 1 ? newRanges[index].close : newHours[dayKey].close
        };

        handleChange(newHours);
    };

    const addRange = (dayKey) => {
        const newHours = { ...hours };
        const newRanges = [...newHours[dayKey].ranges, { open: '12:00', close: '16:00' }];

        newHours[dayKey] = {
            ...newHours[dayKey],
            ranges: newRanges
        };
        handleChange(newHours);
    };

    const removeRange = (dayKey, index) => {
        const newHours = { ...hours };
        let newRanges = [...newHours[dayKey].ranges];

        if (newRanges.length > 1) {
            newRanges.splice(index, 1);
        } else {
            // Don't remove the last range, maybe close the day instead or just reset?
            // For now let's just keep one range
            return;
        }

        newHours[dayKey] = {
            ...newHours[dayKey],
            ranges: newRanges
        };
        handleChange(newHours);
    };

    const copyToAllDays = () => {
        // Use monday as the source
        const source = hours['monday'];
        const newHours = { ...hours };

        DAYS.forEach(day => {
            if (day.key !== 'monday') {
                newHours[day.key] = {
                    ...JSON.parse(JSON.stringify(source)), // Deep copy ranges
                    closed: false // Open all days when copying? Or keep closed status? User usually wants to copy active hours.
                };
            }
        });

        handleChange(newHours);
        toast.success("Skopiowano godziny do wszystkich dni");
        setShowCopyButton(false);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {DAYS.map((day) => {
                    const dayData = hours[day.key];
                    const isOpen = !dayData.closed;
                    const ranges = dayData.ranges || [{ open: '10:00', close: '19:00' }];

                    return (
                        <div key={day.key} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
                            {/* Checkbox */}
                            <button
                                type="button"
                                onClick={() => handleToggleDay(day.key)}
                                className={`mt-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isOpen
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'bg-white border-gray-300'
                                    }`}
                            >
                                {isOpen && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>

                            {/* Day Name */}
                            <span className={`mt-2 w-32 text-sm font-medium ${isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                {day.label}
                            </span>

                            {/* Time Selectors */}
                            <div className="flex-1 space-y-3">
                                {isOpen ? (
                                    ranges.map((range, index) => (
                                        <div key={index} className="flex items-center gap-2 animate-fade-in">
                                            {/* Open Time */}
                                            <div className="relative">
                                                <select
                                                    value={range.open}
                                                    onChange={(e) => handleTimeChange(day.key, index, 'open', e.target.value)}
                                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[100px]"
                                                >
                                                    {TIME_OPTIONS.map((time) => (
                                                        <option key={`open-${day.key}-${index}-${time}`} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>

                                            <span className="text-gray-400">-</span>

                                            {/* Close Time */}
                                            <div className="relative">
                                                <select
                                                    value={range.close}
                                                    onChange={(e) => handleTimeChange(day.key, index, 'close', e.target.value)}
                                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[100px]"
                                                >
                                                    {TIME_OPTIONS.map((time) => (
                                                        <option key={`close-${day.key}-${index}-${time}`} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 ml-2">
                                                {index === ranges.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => addRange(day.key)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Dodaj przerwę/kolejną zmianę"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRange(day.key, index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Usuń zakres"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}

                                                {/* Allow removing the last range if there's more than one */}
                                                {index === ranges.length - 1 && ranges.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRange(day.key, index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Usuń zakres"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-2">
                                        <span className="text-sm text-gray-400 italic">Zamknięte</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Copy to all button - show if we have edits */}
            {showCopyButton && (
                <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                            <Copy size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Czy te same godziny otwarcia obowiązują we wszystkie dni?</p>
                            <button
                                type="button"
                                onClick={copyToAllDays}
                                className="text-sm text-purple-600 font-bold hover:underline text-left mt-0.5"
                            >
                                Tak, skopiuj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { DEFAULT_HOURS };

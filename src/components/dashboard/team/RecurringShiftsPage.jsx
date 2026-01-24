import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, Info } from 'lucide-react';
import { format, addWeeks } from 'date-fns';
import { pl } from 'date-fns/locale';

const DAYS_OF_WEEK = [
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

const PLANNING_OPTIONS = [
    { value: 'weekly', label: 'Co tydzień' },
    { value: 'biweekly', label: 'Co dwa tygodnie' },
    { value: 'custom', label: 'Niestandardowe' }
];

function calculateDayHours(shifts) {
    return shifts.reduce((acc, shift) => {
        const [startH, startM] = shift.start.split(':').map(Number);
        const [endH, endM] = shift.end.split(':').map(Number);
        return acc + ((endH * 60 + endM) - (startH * 60 + startM));
    }, 0);
}

function formatHours(minutes) {
    if (minutes <= 0) return '0 godz.';
    const hours = Math.floor(minutes / 60);
    return `${hours} godz.`;
}

export default function RecurringShiftsPage({ isOpen, onClose, employee, onSave }) {
    const [planningType, setPlanningType] = useState('weekly');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState('');
    const [schedule, setSchedule] = useState({});

    const [isPlanningDropdownOpen, setIsPlanningDropdownOpen] = useState(false);
    const [openTimeDropdown, setOpenTimeDropdown] = useState(null); // { day, shiftIndex, type }

    useEffect(() => {
        if (isOpen && employee) {
            // Initialize schedule from employee's availability
            const initialSchedule = {};
            DAYS_OF_WEEK.forEach((day, index) => {
                const dayData = employee.availability?.[day.key];
                const uniqueId = Date.now() + index; // Ensure unique ID for each day
                if (dayData && !dayData.closed) {
                    initialSchedule[day.key] = {
                        enabled: true,
                        shifts: [{ id: uniqueId, start: dayData.open || '10:00', end: dayData.close || '19:00' }]
                    };
                } else {
                    initialSchedule[day.key] = {
                        enabled: false,
                        shifts: [{ id: uniqueId, start: '10:00', end: '19:00' }]
                    };
                }
            });
            setSchedule(initialSchedule);
        }
    }, [isOpen, employee]);

    if (!isOpen || !employee) return null;

    const handleToggleDay = (dayKey) => {
        setSchedule(prev => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                enabled: !prev[dayKey]?.enabled
            }
        }));
    };

    const handleAddShift = (dayKey) => {
        const newId = Date.now() + Math.random(); // Ensure unique ID
        setSchedule(prev => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                shifts: [...(prev[dayKey]?.shifts || []), { id: newId, start: '10:00', end: '19:00' }]
            }
        }));
    };

    const handleRemoveShift = (dayKey, shiftIndex) => {
        setSchedule(prev => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                shifts: prev[dayKey].shifts.filter((_, i) => i !== shiftIndex)
            }
        }));
    };

    const handleTimeChange = (dayKey, shiftIndex, type, value) => {
        setSchedule(prev => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                shifts: prev[dayKey].shifts.map((shift, i) =>
                    i === shiftIndex ? { ...shift, [type]: value } : shift
                )
            }
        }));
        setOpenTimeDropdown(null);
    };

    const handleSave = () => {
        // Convert schedule to availability format
        const availability = {};
        DAYS_OF_WEEK.forEach(day => {
            const daySchedule = schedule[day.key];
            if (daySchedule?.enabled && daySchedule.shifts.length > 0) {
                // Use first shift for main availability
                availability[day.key] = {
                    closed: false,
                    open: daySchedule.shifts[0].start,
                    close: daySchedule.shifts[daySchedule.shifts.length - 1].end
                };
            } else {
                availability[day.key] = {
                    closed: true,
                    open: '00:00',
                    close: '00:00'
                };
            }
        });

        onSave({
            employeeId: employee.id,
            availability,
            recurringShifts: schedule,
            planningType,
            startDate,
            endDate
        });
        onClose();
    };

    // Calculate total weekly hours
    const totalWeeklyMinutes = DAYS_OF_WEEK.reduce((acc, day) => {
        const daySchedule = schedule[day.key];
        if (daySchedule?.enabled) {
            return acc + calculateDayHours(daySchedule.shifts || []);
        }
        return acc;
    }, 0);

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{employee.name}</span>
                    <span className="mx-1">•</span>
                    <span>Powtarzające się zmiany seta</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Zamknij
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                        Zapisz
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {employee.name}Powtarzające się zmiany seta
                </h1>
                <p className="text-gray-500 mb-1">
                    Ustaw cotygodniowe, dwutygodniowe lub niestandardowe zmiany. Zmiany zostaną zapisane dla wszystkich nadchodzących zmian w wybranym okresie.
                </p>
                <button className="text-blue-600 hover:underline text-sm mb-8">
                    Dowiedz się więcej
                </button>

                <div className="grid grid-cols-[320px_1fr] gap-12">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        {/* Planning Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Planowanie
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsPlanningDropdownOpen(!isPlanningDropdownOpen)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-gray-900">
                                        {PLANNING_OPTIONS.find(o => o.value === planningType)?.label}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>
                                {isPlanningDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                        {PLANNING_OPTIONS.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setPlanningType(option.value);
                                                    setIsPlanningDropdownOpen(false);
                                                }}
                                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${planningType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Data rozpoczęcia
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Data zakończenia
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Wybierz opcję"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
                            />
                        </div>

                        {/* Info Note */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <Info size={18} className="text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-600">
                                Zmiany pracowników nie będą wyświetlane w dniach zamknięcia firmy.
                            </p>
                        </div>
                    </div>

                    {/* Right Content - Weekly Schedule */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Co tydzień</h2>
                            <span className="text-sm text-gray-500">{Math.floor(totalWeeklyMinutes / 60)} h łącznie</span>
                        </div>

                        <div className="space-y-4">
                            {DAYS_OF_WEEK.map(day => {
                                const daySchedule = schedule[day.key] || { enabled: false, shifts: [] };
                                const dayMinutes = daySchedule.enabled ? calculateDayHours(daySchedule.shifts || []) : 0;

                                return (
                                    <div key={day.key} className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => handleToggleDay(day.key)}
                                            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-3 transition-colors ${daySchedule.enabled ? 'bg-black' : 'border-2 border-gray-300'}`}
                                        >
                                            {daySchedule.enabled && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Day Label */}
                                        <div className="w-24 shrink-0 pt-3">
                                            <div className={`font-medium ${daySchedule.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {day.label}
                                            </div>
                                            {daySchedule.enabled && (
                                                <div className="text-xs text-gray-500">{formatHours(dayMinutes)}</div>
                                            )}
                                        </div>

                                        {/* Shifts */}
                                        {daySchedule.enabled && (
                                            <div className="flex-1 space-y-2">
                                                {(daySchedule.shifts || []).map((shift, shiftIndex) => (
                                                    <div key={shift.id} className="flex items-center gap-2">
                                                        {/* Start Time */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setOpenTimeDropdown(
                                                                    openTimeDropdown?.day === day.key && openTimeDropdown?.shiftIndex === shiftIndex && openTimeDropdown?.type === 'start'
                                                                        ? null
                                                                        : { day: day.key, shiftIndex, type: 'start' }
                                                                )}
                                                                className="w-28 px-3 py-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors text-sm"
                                                            >
                                                                <span>{shift.start}</span>
                                                                <ChevronDown size={14} className="text-gray-400" />
                                                            </button>
                                                            {openTimeDropdown?.day === day.key && openTimeDropdown?.shiftIndex === shiftIndex && openTimeDropdown?.type === 'start' && (
                                                                <div className="absolute top-full left-0 mt-1 w-28 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto">
                                                                    {TIME_OPTIONS.map(time => (
                                                                        <button
                                                                            key={time}
                                                                            onClick={() => handleTimeChange(day.key, shiftIndex, 'start', time)}
                                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${shift.start === time ? 'bg-blue-50 text-blue-600' : ''}`}
                                                                        >
                                                                            {time}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <span className="text-gray-400 text-sm">do</span>

                                                        {/* End Time */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setOpenTimeDropdown(
                                                                    openTimeDropdown?.day === day.key && openTimeDropdown?.shiftIndex === shiftIndex && openTimeDropdown?.type === 'end'
                                                                        ? null
                                                                        : { day: day.key, shiftIndex, type: 'end' }
                                                                )}
                                                                className="w-28 px-3 py-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors text-sm"
                                                            >
                                                                <span>{shift.end}</span>
                                                                <ChevronDown size={14} className="text-gray-400" />
                                                            </button>
                                                            {openTimeDropdown?.day === day.key && openTimeDropdown?.shiftIndex === shiftIndex && openTimeDropdown?.type === 'end' && (
                                                                <div className="absolute top-full left-0 mt-1 w-28 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto">
                                                                    {TIME_OPTIONS.map(time => (
                                                                        <button
                                                                            key={time}
                                                                            onClick={() => handleTimeChange(day.key, shiftIndex, 'end', time)}
                                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${shift.end === time ? 'bg-blue-50 text-blue-600' : ''}`}
                                                                        >
                                                                            {time}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Add Shift */}
                                                        <button
                                                            onClick={() => handleAddShift(day.key)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Plus size={18} />
                                                        </button>

                                                        {/* Remove Shift */}
                                                        <button
                                                            onClick={() => handleRemoveShift(day.key, shiftIndex)}
                                                            disabled={daySchedule.shifts.length === 1}
                                                            className={`p-2 rounded-lg transition-colors ${daySchedule.shifts.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
}

function calculateDuration(start, end) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes <= 0) return '0 godz.';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) return `${hours} godz.`;
    return `${hours} godz. ${minutes} min.`;
}

export default function ShiftModal({ isOpen, onClose, employee, date, onSave, existingShifts }) {
    const [shifts, setShifts] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null); // { index, type: 'start' | 'end' }

    useEffect(() => {
        if (isOpen) {
            if (existingShifts && existingShifts.length > 0) {
                setShifts(existingShifts.map(s => ({ ...s })));
            } else {
                setShifts([{ id: Date.now(), start: '10:00', end: '19:00' }]);
            }
        }
    }, [isOpen, existingShifts]);

    if (!isOpen || !employee || !date) return null;

    const handleAddShift = () => {
        setShifts([...shifts, { id: Date.now(), start: '10:00', end: '19:00' }]);
    };

    const handleRemoveShift = (index) => {
        if (shifts.length > 1) {
            setShifts(shifts.filter((_, i) => i !== index));
        }
    };

    const handleTimeChange = (index, type, value) => {
        const updated = [...shifts];
        updated[index] = { ...updated[index], [type]: value };
        setShifts(updated);
        setOpenDropdown(null);
    };

    const handleSubmit = () => {
        onSave({
            employeeId: employee.id,
            date: format(date, 'yyyy-MM-dd'),
            shifts: shifts
        });
        onClose();
    };

    const handleDeleteAll = () => {
        onSave({
            employeeId: employee.id,
            date: format(date, 'yyyy-MM-dd'),
            shifts: []
        });
        onClose();
    };

    const totalMinutes = shifts.reduce((acc, shift) => {
        const [startH, startM] = shift.start.split(':').map(Number);
        const [endH, endM] = shift.end.split(':').map(Number);
        return acc + ((endH * 60 + endM) - (startH * 60 + startM));
    }, 0);

    const totalDuration = totalMinutes > 0
        ? `${Math.floor(totalMinutes / 60)} godz.${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60} min.` : ''}`
        : '0 godz.';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {employee.name} – zmiana w dniu {format(date, 'EEE. d LLL', { locale: pl })}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Edytujesz tylko zmiany z tego dnia. Aby ustawić powtarzające się zmiany, przejdź do{' '}
                            <span className="text-blue-600 cursor-pointer hover:underline">zaplanowanych zmian</span>.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-4 space-y-4">
                    {/* Labels */}
                    <div className="grid grid-cols-[1fr_1fr_40px] gap-4 text-sm font-medium text-gray-700">
                        <div>Godzina rozpoczęcia</div>
                        <div>Godzina zakończenia</div>
                        <div></div>
                    </div>

                    {/* Shifts */}
                    {shifts.map((shift, index) => (
                        <div key={shift.id} className="grid grid-cols-[1fr_1fr_40px] gap-4 items-center">
                            {/* Start Time */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(openDropdown?.index === index && openDropdown?.type === 'start' ? null : { index, type: 'start' })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-gray-900">{shift.start}</span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>
                                {openDropdown?.index === index && openDropdown?.type === 'start' && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto">
                                        {TIME_OPTIONS.map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => handleTimeChange(index, 'start', time)}
                                                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${shift.start === time ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* End Time */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(openDropdown?.index === index && openDropdown?.type === 'end' ? null : { index, type: 'end' })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-gray-900">{shift.end}</span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>
                                {openDropdown?.index === index && openDropdown?.type === 'end' && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto">
                                        {TIME_OPTIONS.map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => handleTimeChange(index, 'end', time)}
                                                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${shift.end === time ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleRemoveShift(index)}
                                disabled={shifts.length === 1}
                                className={`p-2 rounded-lg transition-colors ${shifts.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {/* Add Shift & Duration */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleAddShift}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Plus size={16} />
                            Dodaj zmianę
                        </button>
                        <span className="text-sm text-gray-500">
                            Całkowity czas trwania zmiany: {totalDuration}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleDeleteAll}
                        className="p-3 border border-gray-200 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                        >
                            Zapisz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

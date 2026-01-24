"use client";

import { Check } from 'lucide-react';

export default function ServiceEmployees({ data, onChange, employees = [] }) {
    const selectedIds = data.employees || [];

    const handleToggleAll = () => {
        if (selectedIds.length === employees.length) {
            onChange('employees', []);
        } else {
            onChange('employees', employees.map(e => e.id));
        }
    };

    const handleToggleEmployee = (employeeId) => {
        if (selectedIds.includes(employeeId)) {
            onChange('employees', selectedIds.filter(id => id !== employeeId));
        } else {
            onChange('employees', [...selectedIds, employeeId]);
        }
    };

    const allSelected = employees.length > 0 && selectedIds.length === employees.length;

    // Helper to get initials
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <section id="team" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Pracownicy</h2>
            <p className="text-gray-500 text-sm mb-6">Wybierz, którzy pracownicy będą świadczyć tę usługę</p>

            <div className="space-y-4">
                {/* Select All */}
                <button
                    onClick={handleToggleAll}
                    className="flex items-center gap-4 w-full text-left group"
                >
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${allSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                        }`}>
                        {allSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-semibold text-gray-900">Wszyscy pracownicy</span>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                        {employees.length}
                    </span>
                </button>

                <div className="h-px bg-gray-100 my-2" />

                {/* Employee List */}
                {employees.map(employee => {
                    const isSelected = selectedIds.includes(employee.id);
                    return (
                        <button
                            key={employee.id}
                            onClick={() => handleToggleEmployee(employee.id)}
                            className="flex items-center gap-4 w-full text-left group py-2"
                        >
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                                }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>

                            <div className="flex items-center gap-3">
                                {employee.avatarImage ? (
                                    <img
                                        src={employee.avatarImage}
                                        alt={employee.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-sm font-bold border border-cyan-100">
                                        {getInitials(employee.name)}
                                    </div>
                                )}
                                <span className="text-gray-900">{employee.name}</span>
                            </div>
                        </button>
                    );
                })}

                {employees.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        Brak pracowników. Dodaj ich w zakładce Zespół.
                    </div>
                )}
            </div>
        </section>
    );
}

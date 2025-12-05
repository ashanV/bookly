import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';

export default function EmployeeSelectionModal({
    isOpen,
    onClose,
    employees,
    selectedEmployeeIds,
    onSave,
    businessName = "Twoim lokalu"
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSelectedIds, setTempSelectedIds] = useState(selectedEmployeeIds);

    // Reset temp selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSelectedIds(selectedEmployeeIds);
            setSearchQuery('');
        }
    }, [isOpen, selectedEmployeeIds]);

    if (!isOpen) return null;

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every(emp => tempSelectedIds.includes(emp.id));

    const handleToggleAll = () => {
        if (isAllSelected) {
            // Deselect all currently filtered employees
            const filteredIds = filteredEmployees.map(e => e.id);
            setTempSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            // Select all currently filtered employees
            const filteredIds = filteredEmployees.map(e => e.id);
            setTempSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
        }
    };

    const handleToggleEmployee = (id) => {
        setTempSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSave = () => {
        onSave(tempSelectedIds);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pracownicy w lokalu {businessName}</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Wybierz pracowników, którzy mogą być rezerwowani do wykonywania usług w tej lokalizacji.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Szukaj pracowników"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 p-2">
                    {/* Select All */}
                    <div
                        onClick={handleToggleAll}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                    >
                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${isAllSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
                            {isAllSelected && <Check size={14} className="text-white" />}
                        </div>
                        <span className="font-semibold text-gray-900">Wszyscy pracownicy</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                            {filteredEmployees.length}
                        </span>
                    </div>

                    {/* Employees */}
                    {filteredEmployees.map(employee => {
                        const isSelected = tempSelectedIds.includes(employee.id);
                        return (
                            <div
                                key={employee.id}
                                onClick={() => handleToggleEmployee(employee.id)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                            >
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
                                    {isSelected && <Check size={14} className="text-white" />}
                                </div>

                                {employee.avatarImage ? (
                                    <img
                                        src={employee.avatarImage}
                                        alt={employee.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center font-bold text-sm border border-purple-200">
                                        {employee.avatar || employee.name.charAt(0)}
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{employee.name}</div>
                                    <div className="text-xs text-gray-500">52 godz.</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
                    <span className="text-sm text-gray-500 font-medium">
                        wybrano {tempSelectedIds.length}
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200/50 rounded-lg transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            Zastosuj
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

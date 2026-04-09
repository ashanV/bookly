import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronDown } from 'lucide-react';

export default function VacationModal({ isOpen, onClose, employees, onSave, initialEmployeeId, initialData }) {
    const t = useTranslations('BusinessVacationModal');
    
    const VACATION_TYPES = [
        { value: 'vacation', label: t('types.vacation') },
        { value: 'sick', label: t('types.sick') },
        { value: 'unpaid', label: t('types.unpaid') },
        { value: 'other', label: t('types.other') }
    ];

    const [formData, setFormData] = useState({
        id: null,
        employeeId: '',
        type: 'vacation',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '17:00',
        recurring: false,
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    id: initialData.id,
                    employeeId: initialEmployeeId || initialData.employeeId || '',
                    type: initialData.type || 'vacation',
                    startDate: initialData.startDate || '',
                    startTime: initialData.startTime || '09:00',
                    endDate: initialData.endDate || '',
                    endTime: initialData.endTime || '17:00',
                    recurring: initialData.recurring || false,
                    notes: initialData.notes || ''
                });
            } else if (initialEmployeeId) {
                setFormData(prev => ({ ...prev, employeeId: initialEmployeeId }));
            }
        }
    }, [isOpen, initialEmployeeId, initialData]);

    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.employeeId || !formData.startDate || !formData.endDate) {
            alert(t('requiredFields'));
            return;
        }

        onSave(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            id: null,
            employeeId: '',
            type: 'vacation',
            startDate: '',
            startTime: '09:00',
            endDate: '',
            endTime: '17:00',
            recurring: false,
            notes: ''
        });
        onClose();
    };

    const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
    const selectedType = VACATION_TYPES.find(type => type.value === formData.type);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900">{initialData ? t('editTitle') : t('addTitle')}</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        {/* Employee Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {t('employee')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className={selectedEmployee ? 'text-gray-900' : 'text-gray-400'}>
                                        {selectedEmployee ? selectedEmployee.name : t('selectEmployee')}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {isEmployeeDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                                        {employees.map((employee) => (
                                            <button
                                                key={employee.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, employeeId: employee.id });
                                                    setIsEmployeeDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                {employee.avatarImage ? (
                                                    <img
                                                        src={employee.avatarImage}
                                                        alt={employee.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                        {employee.avatar || employee.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-gray-900">{employee.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Type Selection */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {t('type')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-gray-900">
                                        {selectedType?.label}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {isTypeDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                        {VACATION_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, type: type.value });
                                                    setIsTypeDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-900"
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {t('startDate')}
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {t('startTime')}
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {t('endDate')}
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    {t('endTime')}
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* Recurring Checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="recurring"
                                checked={formData.recurring}
                                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="recurring" className="text-sm font-medium text-gray-900 cursor-pointer">
                                {t('recurring')}
                            </label>
                        </div>

                        {/* Notes */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-900">
                                    {t('notes')}
                                </label>
                                <span className="text-xs text-gray-500">{formData.notes.length}/100</span>
                            </div>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value.slice(0, 100) })}
                                placeholder={t('notesPlaceholder')}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all resize-none"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2.5 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
}

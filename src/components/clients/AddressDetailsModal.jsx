"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, AlertCircle } from 'lucide-react';
import { validateInput, addressDetailsSchema } from '@/lib/validations';

export default function AddressDetailsModal({ isOpen, onClose, onSave, initialData = {} }) {
    const [formData, setFormData] = useState({
        street: '',
        apartmentNumber: '',
        district: '',
        city: '',
        region: '', // Okręg
        province: '', // Województwo
        postCode: '',
        country: 'Polska'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                street: initialData.street || '',
                apartmentNumber: initialData.apartmentNumber || '',
                district: initialData.district || '',
                city: initialData.city || '',
                region: initialData.region || '',
                province: initialData.province || '',
                postCode: initialData.postCode || '',
                country: initialData.country || 'Polska'
            });
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleChange = (field, value) => {
        let finalValue = value;

        // Auto-format Postal Code (XX-XXX)
        if (field === 'postCode') {
            // Remove non-digits
            const digits = value.replace(/\D/g, '');

            if (digits.length <= 2) {
                finalValue = digits;
            } else {
                finalValue = `${digits.slice(0, 2)}-${digits.slice(2, 5)}`;
            }
        }

        setFormData(prev => ({ ...prev, [field]: finalValue }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSave = () => {
        const validation = validateInput(addressDetailsSchema, formData);

        if (!validation.success) {
            const newErrors = {};
            validation.errors.forEach(err => {
                newErrors[err.field] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        onSave(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[60]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-0 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Edytuj szczegóły adresu</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                <div className="grid grid-cols-12 gap-4 mb-4">
                                    <div className="col-span-8">
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Adres</label>
                                        <input
                                            type="text"
                                            value={formData.street}
                                            onChange={(e) => handleChange('street', e.target.value)}
                                            className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 outline-none transition-all ${errors.street
                                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-slate-300 focus:ring-violet-500/20 focus:border-violet-500'
                                                }`}
                                        />
                                        {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Nr mieszkania</label>
                                        <input
                                            type="text"
                                            value={formData.apartmentNumber}
                                            onChange={(e) => handleChange('apartmentNumber', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Dzielnica</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => handleChange('district', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Miasto</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => handleChange('city', e.target.value)}
                                            className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 outline-none transition-all ${errors.city
                                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-slate-300 focus:ring-violet-500/20 focus:border-violet-500'
                                                }`}
                                        />
                                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Okręg</label>
                                        <input
                                            type="text"
                                            value={formData.region}
                                            onChange={(e) => handleChange('region', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Województwo</label>
                                        <input
                                            type="text"
                                            value={formData.province}
                                            onChange={(e) => handleChange('province', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Kod pocztowy</label>
                                        <input
                                            type="text"
                                            value={formData.postCode}
                                            onChange={(e) => handleChange('postCode', e.target.value)}
                                            placeholder="XX-XXX"
                                            className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 outline-none transition-all ${errors.postCode
                                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-slate-300 focus:ring-violet-500/20 focus:border-violet-500'
                                                }`}
                                        />
                                        {errors.postCode && <p className="text-xs text-red-500 mt-1">{errors.postCode}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Kraj</label>
                                        <div className="relative">
                                            <select
                                                value={formData.country}
                                                onChange={(e) => handleChange('country', e.target.value)}
                                                className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900"
                                            >
                                                <option>Polska</option>
                                                <option>Niemcy</option>
                                                <option>Ukraina</option>
                                                {/* Add more countries as needed */}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-slate-700 font-bold hover:bg-slate-50 rounded-full border border-slate-300 transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-slate-800 transition-colors ml-auto"
                                >
                                    Dalej
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

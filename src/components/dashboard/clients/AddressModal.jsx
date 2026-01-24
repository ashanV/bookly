"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Briefcase, Home, MoreHorizontal, Check, Plus } from 'lucide-react';
import AddressDetailsModal from './AddressDetailsModal';

const ADDRESS_TYPES = [
    { id: 'Dom', icon: Home, label: 'Dom' },
    { id: 'Praca', icon: Briefcase, label: 'Praca' },
    { id: 'Inny', icon: MoreHorizontal, label: 'Inny' }
];

export default function AddressModal({ isOpen, onClose, onSave, initialData = null }) {
    const [selectedType, setSelectedType] = useState('Dom');
    const [name, setName] = useState('Dom');
    const [address, setAddress] = useState('');
    const [showAddressInput, setShowAddressInput] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [addressDetails, setAddressDetails] = useState(null);

    // Populate form when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setSelectedType(initialData.type || 'Dom');
                setName(initialData.name || '');
                setAddress(initialData.street || '');
                setAddressDetails(initialData);
            } else {
                setSelectedType('Dom');
                setName('Dom');
                setAddress('');
                setShowAddressInput(false);
                setAddressDetails(null);
            }
        }
    }, [isOpen, initialData]);

    const handleTypeSelect = (typeId) => {
        setSelectedType(typeId);
        // Auto-update name if it matches one of the default types
        if (['Dom', 'Praca', 'Inny'].includes(name) || name === '') {
            setName(typeId);
        }
    };

    const handleSave = () => {
        // Validation: require at least 'street' or 'address'
        if (!address.trim() && !addressDetails) return;

        // Combine basic info with details
        const finalAddress = {
            type: selectedType,
            name: name,
            street: addressDetails ? addressDetails.street : address,
            ...addressDetails // Spread other details (city, postCode, etc.)
        };

        onSave(finalAddress);
        onClose();
    };

    const handleDetailsSave = (details) => {
        setAddressDetails(details);
        // Also update the main 'address' display string if street is provided
        if (details.street) {
            setAddress(details.street);
        }
        setIsDetailsModalOpen(false);
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
                        className="fixed inset-0 bg-black/40 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-0 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Nowy adres</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Type Selection */}
                                <div className="flex gap-4 mb-6">
                                    {ADDRESS_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => handleTypeSelect(type.id)}
                                                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all relative ${isSelected
                                                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-violet-600 text-white rounded-full p-0.5">
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                )}
                                                <Icon size={24} className="mb-2" strokeWidth={1.5} />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Name Input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Nazwa adresu</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>

                                {/* Address Input/Details */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Adres</label>
                                    {!addressDetails && !address ? (
                                        <button
                                            onClick={() => setIsDetailsModalOpen(true)}
                                            className="flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700 transition-colors"
                                        >
                                            <div className="w-6 h-6 rounded-full border border-violet-600 flex items-center justify-center">
                                                <Plus size={14} />
                                            </div>
                                            Dodaj
                                        </button>
                                    ) : (
                                        <div className="relative cursor-pointer" onClick={() => setIsDetailsModalOpen(true)}>
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={address} // This shows the street or summarized address
                                                readOnly
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300 cursor-pointer hover:bg-slate-50"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-full border border-slate-300 transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-black text-white font-medium rounded-full hover:bg-slate-800 transition-colors"
                                >
                                    Dalej
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Nested Details Modal */}
                    <AddressDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                        onSave={handleDetailsSave}
                        initialData={addressDetails || {}}
                    />
                </>
            )}
        </AnimatePresence>
    );
}

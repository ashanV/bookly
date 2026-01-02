"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

const LANGUAGES = [
    { code: 'ar', name: 'العربية', englishName: 'Saudi Arabia' },
    { code: 'bg', name: 'Български', englishName: 'Boulgaria' },
    { code: 'cs', name: 'Čeština', englishName: 'Česká republika' },
    { code: 'da', name: 'Dansk', englishName: 'Danmark' },
    { code: 'de', name: 'Deutsch', englishName: 'Deutschland' },
    { code: 'el', name: 'Ελληνικά', englishName: 'Ελλάδα' },
    { code: 'en', name: 'English', englishName: 'United States' },
    { code: 'es', name: 'Español', englishName: 'España' },
    { code: 'fi', name: 'Suomi', englishName: 'Suomi' },
    { code: 'fr', name: 'Français', englishName: 'France' },
    { code: 'hr', name: 'Hrvatski', englishName: 'Hrvatska' },
    { code: 'hu', name: 'Magyar', englishName: 'Magyarország' },
    { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesia' },
    { code: 'it', name: 'Italiano', englishName: 'Italia' },
    { code: 'ja', name: '日本語', englishName: '日本' },
    { code: 'lt', name: 'Lietuvių', englishName: 'Lietuva' },
    { code: 'ms', name: 'Bahasa Melayu', englishName: 'Malaysia' },
    { code: 'nb', name: 'Norsk bokmål', englishName: 'Norge' },
    { code: 'nl', name: 'Nederlands', englishName: 'Nederland' },
    { code: 'pl', name: 'Polski', englishName: 'Polska' },
    { code: 'pt-br', name: 'Português', englishName: 'Brasil' },
    { code: 'pt-pt', name: 'Português', englishName: 'Portugal' },
    { code: 'ro', name: 'Română', englishName: 'România' },
    { code: 'ru', name: 'Русский', englishName: 'Россия' },
];

export default function LanguageSelectionModal({ isOpen, onClose, onSelect, selectedLanguage }) {
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 pb-2">
                                <div className="flex items-start justify-between mb-2">
                                    <h2 className="text-xl font-bold text-slate-900">Zmień język</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-sm font-medium text-slate-900 mb-4">Dostępne języki</p>
                            </div>

                            {/* Language Grid */}
                            <div className="flex-1 overflow-y-auto p-6 pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                onSelect(lang.name);
                                                onClose();
                                            }}
                                            className={`text-left p-4 rounded-xl border transition-all hover:bg-slate-50 ${selectedLanguage === lang.name
                                                    ? 'border-slate-900 ring-1 ring-slate-900'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="font-bold text-slate-900 mb-0.5">
                                                {lang.name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {lang.englishName}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Usuń", cancelText = "Anuluj" }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[100]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle size={24} className="text-red-600" />
                                    </div>
                                </div>

                                {/* Title & Message */}
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                    {message}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={onConfirm}
                                        className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                    >
                                        {confirmText}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

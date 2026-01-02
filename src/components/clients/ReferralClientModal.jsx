"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';

export default function ReferralClientModal({
    isOpen,
    onClose,
    onSelectClient,
    businessId,
    excludeClientId = null
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const searchInputRef = useRef(null);

    // Fetch clients when modal opens or search changes
    useEffect(() => {
        if (!isOpen || !businessId) return;

        const fetchClients = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams({
                    businessId,
                    search: searchQuery
                });

                const response = await fetch(`/api/clients?${params}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać klientów');
                }

                const data = await response.json();
                // Filter out the excluded client if specified
                const filteredClients = excludeClientId
                    ? data.clients.filter(c => c.id !== excludeClientId)
                    : data.clients;
                setClients(filteredClients);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(fetchClients, 300);
        return () => clearTimeout(timeoutId);
    }, [isOpen, businessId, searchQuery, excludeClientId]);

    // Focus search input when modal opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setClients([]);
            setError('');
        }
    }, [isOpen]);

    const handleSelectClient = (client) => {
        onSelectClient(client);
        onClose();
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between mb-1">
                                    <h2 className="text-xl font-bold text-slate-900">Dodaj polecenie</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Wyszukaj klienta, aby dodać polecenie.{' '}
                                    <span className="text-violet-600 cursor-pointer hover:underline">
                                        Dowiedz się więcej
                                    </span>
                                </p>
                            </div>

                            {/* Search */}
                            <div className="p-4 border-b border-slate-100">
                                <div className="relative">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="np. Sara Kowalska"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Client List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 size={24} className="animate-spin text-violet-600" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8 text-red-500">
                                        {error}
                                    </div>
                                ) : clients.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        {searchQuery
                                            ? 'Nie znaleziono klientów pasujących do wyszukiwania'
                                            : 'Brak klientów do wyświetlenia'
                                        }
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {clients.map((client) => (
                                            <button
                                                key={client.id}
                                                onClick={() => handleSelectClient(client)}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm flex-shrink-0">
                                                    {getInitials(client.firstName, client.lastName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-900 truncate">
                                                        {client.firstName} {client.lastName}
                                                    </div>
                                                    <div className="text-sm text-slate-500 truncate">
                                                        {client.email || client.phone || 'Brak danych kontaktowych'}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

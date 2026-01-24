"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown, FileSpreadsheet, FileText, Import, RefreshCw, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import ClientList from '@/components/dashboard/clients/ClientList';
import ClientDrawer from '@/components/dashboard/clients/ClientDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function CRMPage() {
    const { user } = useAuth('/business/auth');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isdrawerOpen, setIsDrawerOpen] = useState(false);
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [clientCount, setClientCount] = useState(0);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedClient(null), 300);
    };

    const handleClientCountChange = useCallback((count) => {
        setClientCount(count);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Drawer */}
            <ClientDrawer
                isOpen={isdrawerOpen}
                onClose={handleCloseDrawer}
                client={selectedClient}
            />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/business/dashboard"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 className="text-xl font-bold text-slate-900">Klienci</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900">Lista klientów</h2>
                            <span className="bg-slate-100 text-slate-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                {clientCount}
                            </span>
                        </div>
                        <p className="text-slate-500">Przeglądaj, dodawaj, edytuj i usuwaj dane klienta. <span className="text-violet-600 cursor-pointer hover:underline">Dowiedz się więcej</span></p>
                    </div>

                    <div className="flex gap-3 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                            >
                                Opcje
                                {showOptionsDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showOptionsDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowOptionsDropdown(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2"
                                        >
                                            <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                <Import size={16} className="text-slate-400" />
                                                Importuj klientów
                                            </button>
                                            <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                <RefreshCw size={16} className="text-slate-400" />
                                                Połącz profile klientów
                                            </button>

                                            <div className="my-2 border-t border-slate-100 mx-4" />

                                            <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Eksportuj
                                            </div>

                                            <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                <FileSpreadsheet size={16} className="text-slate-400" />
                                                Excel
                                            </button>
                                            <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                <FileText size={16} className="text-slate-400" />
                                                CSV
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link
                            href="/business/dashboard/clients/add"
                            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full hover:bg-slate-800 font-medium transition-colors"
                        >
                            Dodaj
                        </Link>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="w-full">
                        <ClientList
                            onSelectClient={handleClientClick}
                            selectedClientId={selectedClient?.id}
                            businessId={user?.id}
                            onClientCountChange={handleClientCountChange}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

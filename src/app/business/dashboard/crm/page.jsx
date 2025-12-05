"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    ArrowLeft,
    Gift,
    CheckSquare,
    BookOpen
} from 'lucide-react';
import Link from 'next/link';
import ClientList from '@/components/CRM/ClientList';
import ClientDetails from '@/components/CRM/ClientDetails';
import Loyalty from '@/components/CRM/Loyalty';
import Tasks from '@/components/CRM/Tasks';
import Notepad from '@/components/CRM/Notepad';

export default function CRMPage() {
    const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'loyalty', 'tasks', 'notepad'
    const [selectedClient, setSelectedClient] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50">
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
                            <h1 className="text-xl font-bold text-slate-900">CRM</h1>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('clients')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'clients'
                                    ? 'bg-white text-violet-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    Klienci
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('loyalty')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'loyalty'
                                    ? 'bg-white text-violet-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Gift size={16} />
                                    Lojalność
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'tasks'
                                    ? 'bg-white text-violet-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckSquare size={16} />
                                    Zadania
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('notepad')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'notepad'
                                    ? 'bg-white text-violet-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} />
                                    Notatnik
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'clients' ? (
                        <motion.div
                            key="clients"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-6 h-[calc(100vh-140px)]"
                        >
                            {/* Client List Sidebar */}
                            <div className={`w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${selectedClient ? 'hidden lg:flex' : 'flex'}`}>
                                <ClientList onSelectClient={setSelectedClient} selectedClientId={selectedClient?.id} />
                            </div>

                            {/* Client Details */}
                            <div className={`w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${!selectedClient ? 'hidden lg:flex' : 'flex'}`}>
                                {selectedClient ? (
                                    <ClientDetails client={selectedClient} onBack={() => setSelectedClient(null)} />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                            <Users size={40} className="text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Wybierz klienta</h3>
                                        <p className="max-w-xs mx-auto">Wybierz klienta z listy po lewej stronie, aby zobaczyć szczegóły, historię wizyt i notatki.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : activeTab === 'loyalty' ? (
                        <motion.div
                            key="loyalty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Loyalty />
                        </motion.div>
                    ) : activeTab === 'tasks' ? (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Tasks />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="notepad"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-[calc(100vh-140px)]"
                        >
                            <Notepad />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

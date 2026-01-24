"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ServiceFormLayout({
    children,
    title,
    onSave,
    loading = false,
    activeSection,
    onSectionChange
}) {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        { id: 'basic', label: 'Podstawowe informacje' },
        { id: 'team', label: 'Pracownicy', badge: '2' }, // Example badge
        { id: 'resources', label: 'Zasoby' },
        { id: 'addons', label: 'Dodatki do usługi' },
        { type: 'divider' },
        { id: 'settings', label: 'Ustawienia', isHeader: true },
        { id: 'online', label: 'Rezerwacje online' },
        { id: 'forms', label: 'Formularze', badge: '1' },
        { id: 'commission', label: 'Prowizje' },
        { id: 'advanced', label: 'Ustawienia zaawansowane' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar - Sticky */}
            <header className={`sticky top-0 z-40 bg-white border-b border-gray-200 transition-all duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            Zamknij
                        </button>
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="px-6 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            Zapisz
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-24 space-y-1">
                            {sections.map((section, index) => {
                                if (section.type === 'divider') {
                                    return <div key={index} className="h-px bg-gray-200 my-4 mx-2" />;
                                }
                                if (section.isHeader) {
                                    return (
                                        <h3 key={section.id} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {section.label}
                                        </h3>
                                    );
                                }

                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => onSectionChange && onSectionChange(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${isActive
                                                ? 'bg-purple-50 text-purple-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span>{section.label}</span>
                                        {section.badge && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {section.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 pb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>

                        <div className="space-y-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

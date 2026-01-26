"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function CompanyConfigSection({
    businessName,
    facebook,
    instagram,
    website,
    onBack,
    onEditClick,
    onSidebarClick,
    activeTab = 'details'
}) {
    return (
        <div className="animate-fade-in text-left">
            {/* Breadcrumbs Header */}
            <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700"
                >
                    <ArrowLeft size={16} />
                    Wróć
                </button>
                <span className="text-gray-300">|</span>
                <span>Ustawienia obszaru roboczego</span>
                <span className="text-gray-300">•</span>
                <span className="font-semibold text-gray-900">Konfiguracja firmy</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Konfiguracja firmy</h2>
                        <nav className="space-y-1">
                            <button
                                onClick={() => onSidebarClick && onSidebarClick('details')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Szczegóły dotyczące firmy
                            </button>
                            <button
                                onClick={() => onSidebarClick && onSidebarClick('locations')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'locations' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Lokalizacje
                            </button>
                        </nav>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-gray-900 mb-3 px-2 uppercase tracking-wider">Skróty</h2>
                        <nav className="space-y-1">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Menu usług</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Lista produktów</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Karnety</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Lista klientów</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Szczegóły dotyczące firmy</h1>
                        <p className="text-gray-500">
                            Ustaw nazwę firmy, preferencje podatkowe i językowe oraz zarządzaj linkami zewnętrznymi.
                        </p>
                    </div>

                    {/* Company Info Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Informacje o firmie</h3>
                                <button
                                    onClick={onEditClick}
                                    className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Zmień
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">Nazwa firmy</div>
                                    <div className="text-gray-500">{businessName}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">Kraj</div>
                                    <div className="text-gray-500">Polska</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">Waluta</div>
                                    <div className="text-gray-500">PLN</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">Podatek</div>
                                    <div className="text-gray-500">Ceny detaliczne zawierają podatek</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">Domyślny język zespołu</div>
                                    <div className="text-gray-500">PL polski (PL)</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">Domyślny język klienta</div>
                                    <div className="text-gray-500">PL polski (PL)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* External Links Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Linki zewnętrzne</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <div className="font-medium text-gray-900 mb-1">Facebook</div>
                                {facebook ? (
                                    <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline block truncate">{facebook}</a>
                                ) : (
                                    <button className="text-purple-600 hover:underline font-medium text-sm">Dodaj</button>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">X (Twitter)</div>
                                <button className="text-purple-600 hover:underline font-medium text-sm">Dodaj</button>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">Instagram</div>
                                {instagram ? (
                                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline block truncate">{instagram}</a>
                                ) : (
                                    <button className="text-purple-600 hover:underline font-medium text-sm">Dodaj</button>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">Strona internetowa</div>
                                {website ? (
                                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline block truncate">{website}</a>
                                ) : (
                                    <button className="text-purple-600 hover:underline font-medium text-sm">Dodaj</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

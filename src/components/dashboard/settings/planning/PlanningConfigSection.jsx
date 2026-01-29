"use client";

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TimeCalendarSettings from './TimeCalendarSettings';
import WaitlistSettings from './WaitlistSettings';
import TimeBlockTypesSettings from './TimeBlockTypesSettings';

export default function PlanningConfigSection({
    businessData,
    onBack,
    onUpdateBusiness
}) {
    const [activeTab, setActiveTab] = useState('time-calendar');

    const sidebarItems = [
        { id: 'time-calendar', label: 'Czas i kalendarz' },
        { id: 'waitlist', label: 'Lista oczekujących' },
        { id: 'block-types', label: 'Typy blokad czasu w kalendarzu' },
        { id: 'resources', label: 'Zasoby', disabled: true },
        { id: 'cancellation-reasons', label: 'Powody odwołania wizyty', disabled: true },
        { id: 'visit-statuses', label: 'Statusy wizyt', disabled: true },
        { id: 'closure-period', label: 'Okres zamknięcia', disabled: true },
        { id: 'online-booking', label: 'Rezerwacje online', disabled: true },
    ];

    const shortcuts = [
        { id: 'work-schedule', label: 'Grafik pracy', type: 'internal', action: 'hours' },
        { id: 'marketplace-profile', label: 'Profil we Fresha Marketplace', type: 'external' },
        { id: 'service-menu', label: 'Menu usług', type: 'external' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'time-calendar':
                return <TimeCalendarSettings businessData={businessData} onUpdate={onUpdateBusiness} />;
            case 'waitlist':
                return <WaitlistSettings businessData={businessData} onUpdate={onUpdateBusiness} />;
            case 'block-types':
                return <TimeBlockTypesSettings businessData={businessData} onUpdate={onUpdateBusiness} />;
            default:
                return (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        Ta sekcja jest w trakcie budowy.
                    </div>
                );
        }
    };

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
                <span className="font-semibold text-gray-900">Planowanie</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">Planowanie</h2>
                        <nav className="space-y-1">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => !item.disabled && setActiveTab(item.id)}
                                    disabled={item.disabled}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                        ? 'bg-purple-50 text-purple-700 font-semibold'
                                        : item.disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-gray-900 mb-3 px-2 uppercase tracking-wider">Skróty</h2>
                        <nav className="space-y-1">
                            {shortcuts.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.type === 'internal' && item.action === 'hours') {
                                            // This requires a way to switch main section back to 'hours'
                                            // We can handle this by passing a prop or using a callback
                                            // For now, let's assume we can pass a special 'navigate' function
                                            if (onUpdateBusiness && typeof onUpdateBusiness.navigate === 'function') {
                                                onUpdateBusiness.navigate('hours');
                                            } else {
                                                // Fallback or todo
                                                console.log("Navigation to hours requested");
                                                // Ideally we should have an onNavigate prop
                                                if (onBack) onBack('hours'); // Hacky way to signal parent? Better to add specific prop
                                            }
                                        }
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group"
                                >
                                    <span>{item.label}</span>
                                    <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

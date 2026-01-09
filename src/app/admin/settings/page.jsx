'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Settings, Save, Globe, Bell, Shield, Database } from 'lucide-react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'Bookly',
        contactEmail: 'kontakt@bookly.pl',
        commissionRate: 10,
        maxBookingsPerDay: 50,
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false,
    });

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <AdminHeader title="Ustawienia" subtitle="Konfiguracja systemu" />

            <div className="p-6 space-y-6 max-w-4xl">
                {/* General */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Ogólne
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Nazwa serwisu</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => updateSetting('siteName', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email kontaktowy</label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => updateSetting('contactEmail', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Business */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                        <Database className="w-5 h-5 text-blue-400" />
                        Biznes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Prowizja (%)</label>
                            <input
                                type="number"
                                value={settings.commissionRate}
                                onChange={(e) => updateSetting('commissionRate', parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Maks. rezerwacji dziennie</label>
                            <input
                                type="number"
                                value={settings.maxBookingsPerDay}
                                onChange={(e) => updateSetting('maxBookingsPerDay', parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        Powiadomienia
                    </h2>
                    <div className="space-y-4">
                        {[
                            { key: 'emailNotifications', label: 'Powiadomienia email' },
                            { key: 'smsNotifications', label: 'Powiadomienia SMS' },
                            { key: 'maintenanceMode', label: 'Tryb konserwacji' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl cursor-pointer">
                                <span className="text-gray-300">{label}</span>
                                <div className={`w-12 h-6 rounded-full transition-colors ${settings[key] ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${settings[key] ? 'translate-x-6' : 'translate-x-0.5'}`}
                                        onClick={() => updateSetting(key, !settings[key])}
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Save button */}
                <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                    <Save className="w-5 h-5" />
                    Zapisz ustawienia
                </button>
            </div>
        </>
    );
}

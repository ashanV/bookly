'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Settings, Save, Globe, Bell, Shield, Database, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default state matching the model
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        supportEmail: '',
        socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        },
        logoUrl: '',
        faviconUrl: '',
        commissionRate: 10,
        currency: 'PLN',
        maxBookingsPerDay: 100, // From existing model/view
        maintenanceMode: false,
        announcement: {
            enabled: false,
            text: '',
            type: 'info'
        }
    });

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/system/config');
            if (!res.ok) throw new Error('Błąd pobierania ustawień');
            const data = await res.json();

            // Merge with defaults to ensure all fields exist
            setSettings(prev => ({
                ...prev,
                ...data,
                socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) },
                announcement: { ...prev.announcement, ...(data.announcement || {}) }
            }));
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się pobrać konfiguracji');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const updateSocialLink = (platform, value) => {
        setSettings(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [platform]: value }
        }));
    };

    const updatenestedSetting = (parent, key, value) => {
        setSettings(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: value }
        }));
    };

    // File Upload Handler
    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'system_branding');
        formData.append('type', 'image');

        const toastId = toast.loading('Wysyłanie pliku...');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Błąd uploadu');

            const data = await res.json();
            updateSetting(field, data.url);
            toast.success('Plik wysłany pomyślnie', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Błąd podczas wysyłania pliku', { id: toastId });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/system/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Błąd zapisu');

            toast.success('Ustawienia zostały zapisane');
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się zapisać ustawień');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <>
            <AdminHeader title="Ustawienia" subtitle="Konfiguracja systemu" />

            <div className="p-6 space-y-6 max-w-5xl mx-auto pb-24">

                {/* Identity & Branding */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Tożsamość i Branding
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Dane podstawowe</h3>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nazwa serwisu</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => updateSetting('siteName', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="np. Bookly"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email kontaktowy</label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email supportu (opcjonalny)</label>
                                <input
                                    type="email"
                                    value={settings.supportEmail || ''}
                                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Branding Uploads */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Logotypy</h3>

                            {/* Logo Upload */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <label className="text-sm text-gray-300 font-medium">Logo Serwisu</label>
                                    {settings.logoUrl && (
                                        <div className="h-10 bg-gray-900 rounded p-1">
                                            <img src={settings.logoUrl} alt="Logo" className="h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 hover:border-purple-500 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                            <p className="text-sm text-gray-500 group-hover:text-gray-300">
                                                <span className="font-semibold">Kliknij, aby wgrać</span> lub upuść
                                            </p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                                    </label>
                                </div>
                            </div>

                            {/* Favicon Upload */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <label className="text-sm text-gray-300 font-medium">Favicon</label>
                                    {settings.faviconUrl && (
                                        <div className="h-8 w-8 bg-gray-900 rounded p-1">
                                            <img src={settings.faviconUrl} alt="Favicon" className="h-full w-full object-contain" />
                                        </div>
                                    )}
                                </div>
                                <label className="flex items-center gap-3 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-750 hover:border-gray-500 transition-all">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">Zmień ikonę strony</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'faviconUrl')} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Social Media Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['facebook', 'instagram', 'twitter', 'linkedin'].map(platform => (
                                <div key={platform}>
                                    <label className="block text-xs text-gray-500 mb-1 capitalize">{platform}</label>
                                    <input
                                        type="url"
                                        value={settings.socialLinks[platform] || ''}
                                        onChange={(e) => updateSocialLink(platform, e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder={`https://${platform}.com/...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Business & Monetization */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                        <Database className="w-5 h-5 text-blue-400" />
                        Biznes i Monetyzacja
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Prowizja systemu (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.commissionRate}
                                    onChange={(e) => updateSetting('commissionRate', parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Domyślna prowizja od rezerwacji.</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Waluta</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => updateSetting('currency', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="PLN">PLN (Złoty)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="USD">USD (Dolar)</option>
                            </select>
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

                {/* Notifications & Maintenance (Existing) */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        System i Powiadomienia
                    </h2>

                    {/* Maintenance Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl mb-4">
                        <div>
                            <div className="text-white font-medium">Tryb konserwacji</div>
                            <div className="text-sm text-gray-400">Blokuje dostęp do aplikacji dla użytkowników</div>
                        </div>
                        <div
                            onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                            className={`w-14 h-7 rounded-full cursor-pointer transition-colors relative ${settings.maintenanceMode ? 'bg-purple-600' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {/* Global Announcement */}
                    <div className="border-t border-gray-800 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-300">Globalne Ogłoszenie</div>
                            <div
                                onClick={() => updatenestedSetting('announcement', 'enabled', !settings.announcement.enabled)}
                                className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${settings.announcement.enabled ? 'bg-purple-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform transform ${settings.announcement.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        {settings.announcement.enabled && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={settings.announcement.text}
                                    onChange={(e) => updatenestedSetting('announcement', 'text', e.target.value)}
                                    placeholder="Treść ogłoszenia..."
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                <div className="flex gap-2">
                                    {['info', 'warning', 'error', 'success'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => updatenestedSetting('announcement', 'type', type)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium border ${settings.announcement.type === type
                                                    ? 'bg-gray-700 border-gray-500 text-white'
                                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg hover:shadow-purple-500/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Zapisywanie...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Zapisz zmiany
                        </>
                    )}
                </button>
            </div>
        </>
    );
}

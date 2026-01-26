"use client";

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import SingleStepEditor from './SingleStepEditor';

const DAYS_MAP = {
    monday: 'poniedziałek',
    tuesday: 'wtorek',
    wednesday: 'środa',
    thursday: 'czwartek',
    friday: 'piątek',
    saturday: 'sobota',
    sunday: 'niedziela'
};

export default function LocationDetails({
    location,
    businessName,
    onBack,
    onUpdate,
    onDelete,
    isDeleting
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [editMode, setEditMode] = useState(null); // 'contact', etc.

    // Format address helper
    const getFormattedAddress = () => {
        if (location.noAddress) return 'Brak stałego adresu';
        const addr = location.address;
        if (!addr) return 'Brak adresu';

        // Handle both simple string and object structure
        if (typeof addr === 'string') return addr;

        const parts = [
            addr.street,
            addr.city,
            addr.postCode,
            addr.province
        ].filter(Boolean);

        return parts.join(', ') || 'Brak adresu';
    };

    // Helper for billing address
    const getBillingAddress = () => {
        if (!location.billingAddress) return 'Brak danych';
        const d = location.billingAddress;
        return [d.street, d.city, d.postCode].filter(Boolean).join(', ') || 'Takie same jak adres lokalizacji';
    };

    return (
        <div className="animate-fade-in text-left">
            {/* Header / Breadcrumbs */}
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
                <span>Lokalizacje</span>
                <span className="text-gray-300">•</span>
                <span className="font-semibold text-gray-900">{location.name}</span>
            </div>

            {/* Title & Options */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{location.name}</h1>
                    <p className="text-gray-500">Brak opinii</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-full text-base font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                        Opcje
                        <ChevronDown size={18} />
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 animate-fade-in overflow-hidden">
                            <button
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                                onClick={() => onDelete(location.id)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                Usuń lokalizację
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-xl font-bold mb-2">Zarządzaj swoją firmą online</h2>
                    <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                        Zwiększ liczbę rezerwacji poprzez umieszczenie profilu Twojej firmy we Fresha Marketplace i umożliwienie swoim klientom rezerwacji bezpośrednio przez Twoją stronę internetową i profile w mediach społecznościowych.
                    </p>
                    <button className="flex items-center gap-2 font-medium hover:underline">
                        Włącz swój profil online
                        <span>→</span>
                    </button>
                </div>
                {/* Decorative mock element on the right - simplified */}
                <div className="hidden lg:block w-32 h-32 bg-white/10 rounded-lg backdrop-blur-sm -rotate-6"></div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Contact Info */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Dane kontaktowe</h3>
                        <button
                            onClick={() => setEditMode('contact')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            Zmień
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail lokalizacji</label>
                            <p className="text-gray-900">{location.email || 'Brak'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Numer kontaktowy lokalizacji</label>
                            <p className="text-gray-900">{location.phone || 'Brak'}</p>
                        </div>
                    </div>
                </div>

                {/* Business Types */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Rodzaje działalności</h3>
                        <button
                            onClick={() => setEditMode('types')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            Zmień
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Główny rodzaj</label>
                            <p className="text-gray-900 capitalize">{location.businessType || 'Brak'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dodatkowe rodzaje</label>
                            <p className="text-gray-900">{location.additionalTypes?.join(', ') || 'Brak'}</p>
                        </div>
                    </div>
                </div>

                {/* Location Map */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Lokalizacja</h3>
                        <button
                            onClick={() => setEditMode('address')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            Zmień
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adres firmy</label>
                        <p className="text-gray-900">{getFormattedAddress()}</p>
                    </div>
                    {!location.noAddress && location.address && (
                        <div className="h-48 w-full bg-gray-100 rounded-lg overflow-hidden relative">
                            {/* Valid Google Maps Embed */}
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(typeof location.address === 'string' ? location.address : location.address.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>

                {/* Hours */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Godziny otwarcia</h3>
                        <button
                            onClick={() => setEditMode('hours')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            Zmień
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Godziny otwarcia tych lokalizacji są domyślnymi godzinami pracy Twojego zespołu i będą widoczne dla Twoich klientów.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                            const hours = location.workingHours?.[day];
                            const isOpen = hours && !hours.closed;
                            const ranges = hours?.ranges || [{ open: hours?.open || '10:00', close: hours?.close || '19:00' }];

                            return (
                                <div key={day} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                                    <div className="text-sm font-medium text-purple-600 mb-2 capitalize">{DAYS_MAP[day]}</div>
                                    {isOpen ? (
                                        <div className="text-sm text-gray-900 font-medium space-y-1">
                                            {ranges.map((range, idx) => (
                                                <div key={idx}>
                                                    {range.open}<br />-<br />{range.close}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 py-4">Zamknięte</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Billing Data */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Dane rozliczeniowe wymagane przy sprzedaży</h3>
                        <button
                            onClick={() => setEditMode('address')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            Zmień
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Te dane pojawią się na dowodzie sprzedaży wystawianym w tej lokalizacji.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dane firmy</label>
                            <p className="text-gray-900">{businessName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                            <p className="text-gray-900">{getBillingAddress()}</p>
                        </div>
                    </div>
                </div>

                {/* Default Tax (Placeholder) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Domyślny podatek</h3>
                        <button className="text-sm text-purple-600 font-medium hover:underline">Zmień</button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Ustawienia podatku od usług i produktów w danej lokalizacji.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usługi</label>
                            <p className="text-gray-900">Bez podatku</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Produkty</label>
                            <p className="text-gray-900">Bez podatku</p>
                        </div>
                    </div>
                </div>

            </div>
            {/* Editors */}
            <SingleStepEditor
                isOpen={!!editMode}
                onClose={() => setEditMode(null)}
                location={{ ...location, businessId: location.businessId }} // Ensure businessId is passed if available
                mode={editMode}
                onUpdate={onUpdate}
            />
        </div>
    );
}

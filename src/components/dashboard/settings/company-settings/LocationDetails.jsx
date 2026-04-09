"use client";

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import SingleStepEditor from './SingleStepEditor';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('BusinessLocationDetails');
    const [showDropdown, setShowDropdown] = useState(false);
    const [editMode, setEditMode] = useState(null); // 'contact', etc.

    // Format address helper
    const getFormattedAddress = () => {
        if (location.noAddress) return t('noFixedAddress');
        const addr = location.address;
        if (!addr) return t('noAddress');

        // Handle both simple string and object structure
        if (typeof addr === 'string') return addr;

        const parts = [
            addr.street,
            addr.city,
            addr.postCode,
            addr.province
        ].filter(Boolean);

        return parts.join(', ') || t('noAddress');
    };

    // Helper for billing address
    const getBillingAddress = () => {
        if (!location.billingAddress) return t('noData');
        const d = location.billingAddress;
        return [d.street, d.city, d.postCode].filter(Boolean).join(', ') || t('sameAsLocationAddress');
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
                    {t('btnBack')}
                </button>
                <span className="text-gray-300">|</span>
                <span>{t('workspaceSettings')}</span>
                <span className="text-gray-300">•</span>
                <span>{t('locations')}</span>
                <span className="text-gray-300">•</span>
                <span className="font-semibold text-gray-900">{location.name}</span>
            </div>

            {/* Title & Options */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{location.name}</h1>
                    <p className="text-gray-500">{t('noReviews')}</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-full text-base font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                        {t('options')}
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
                                {t('deleteLocation')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-xl font-bold mb-2">{t('manageOnlineBiz')}</h2>
                    <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                        {t('onlineBizDesc')}
                    </p>
                    <button className="flex items-center gap-2 font-medium hover:underline">
                        {t('enableOnlineProfile')}
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
                        <h3 className="text-lg font-bold text-gray-900">{t('contactData')}</h3>
                        <button
                            onClick={() => setEditMode('contact')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            {t('btnChange')}
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('locationEmail')}</label>
                            <p className="text-gray-900">{location.email || t('none')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('locationPhone')}</label>
                            <p className="text-gray-900">{location.phone || t('none')}</p>
                        </div>
                    </div>
                </div>

                {/* Business Types */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">{t('businessTypes')}</h3>
                        <button
                            onClick={() => setEditMode('types')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            {t('btnChange')}
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mainType')}</label>
                            <p className="text-gray-900 capitalize">{location.businessType || t('none')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('additionalTypes')}</label>
                            <p className="text-gray-900">{location.additionalTypes?.join(', ') || t('none')}</p>
                        </div>
                    </div>
                </div>

                {/* Location Map */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{t('location')}</h3>
                        <button
                            onClick={() => setEditMode('address')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            {t('btnChange')}
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyAddress')}</label>
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
                        <h3 className="text-lg font-bold text-gray-900">{t('openingHours')}</h3>
                        <button
                            onClick={() => setEditMode('hours')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            {t('btnChange')}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('openingHoursDesc')}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                            const hours = location.workingHours?.[day];
                            const isOpen = hours && !hours.closed;
                            const ranges = hours?.ranges || [{ open: hours?.open || '10:00', close: hours?.close || '19:00' }];

                            return (
                                <div key={day} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                                    <div className="text-sm font-medium text-purple-600 mb-2 capitalize">{t(day)}</div>
                                    {isOpen ? (
                                        <div className="text-sm text-gray-900 font-medium space-y-1">
                                            {ranges.map((range, idx) => (
                                                <div key={idx}>
                                                    {range.open}<br />-<br />{range.close}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 py-4">{t('closed')}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Billing Data */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">{t('billingDataTitle')}</h3>
                        <button
                            onClick={() => setEditMode('address')}
                            className="text-sm text-purple-600 font-medium hover:underline"
                        >
                            {t('btnChange')}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('billingDataDesc')}
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyData')}</label>
                            <p className="text-gray-900">{businessName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                            <p className="text-gray-900">{getBillingAddress()}</p>
                        </div>
                    </div>
                </div>

                {/* Default Tax (Placeholder) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">{t('defaultTax')}</h3>
                        <button className="text-sm text-purple-600 font-medium hover:underline">{t('btnChange')}</button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('defaultTaxDesc')}
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('services')}</label>
                            <p className="text-gray-900">{t('noTax')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('products')}</label>
                            <p className="text-gray-900">{t('noTax')}</p>
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

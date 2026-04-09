"use client";

import React, { useState } from 'react';
import { toast } from '@/components/Toast';
import {
    MousePointerClick,
    RefreshCw,
    AlertCircle,
    Check,
    ArrowRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WaitlistSettings({ businessData, onUpdate }) {
    const t = useTranslations('BusinessWaitlist');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Initial state derived from businessData or defaults
    const [mode, setMode] = useState(businessData?.waitlistSettings?.mode || 'automatic');
    const [priority, setPriority] = useState(businessData?.waitlistSettings?.priority || 'first_come');
    const [onlineActive, setOnlineActive] = useState(businessData?.waitlistSettings?.onlineBooking?.active ?? true);
    const [onlinePreference, setOnlinePreference] = useState(businessData?.waitlistSettings?.onlineBooking?.preference || 'any_time');

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate({
                waitlistSettings: {
                    ...(businessData?.waitlistSettings || {}),
                    mode,
                    priority,
                    onlineBooking: {
                        active: onlineActive,
                        preference: onlinePreference
                    }
                }
            });
            setIsEditing(false);
            toast.success(t('successUpdate'));
        } catch (error) {
            toast.error(t('errSave'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset state to original values
        setMode(businessData?.waitlistSettings?.mode || 'automatic');
        setPriority(businessData?.waitlistSettings?.priority || 'first_come');
        setOnlineActive(businessData?.waitlistSettings?.onlineBooking?.active ?? true);
        setOnlinePreference(businessData?.waitlistSettings?.onlineBooking?.preference || 'any_time');
        setIsEditing(false);
    };

    // Main View (Summary)
    if (!isEditing) {
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                    <p className="text-gray-500">
                        {t('descTitle')} <span className="text-purple-600 hover:underline cursor-pointer">{t('learnMore')}</span>
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 text-left">
                    <div className="flex justify-between items-center mb-6 w-full">
                        <h3 className="text-lg font-bold text-gray-900">{t('settingsTitle')}</h3>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t('btnChange')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                        <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">{t('typeLabel')}</div>
                            <div className="text-gray-500 text-sm">
                                {mode === 'automatic' ? t('typeAuto') : t('typeManual')}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">{t('priorityLabel')}</div>
                            <div className="text-gray-500 text-sm">
                                {priority === 'first_come' ? t('priorityFirst') :
                                    priority === 'highest_value' ? t('priorityHighest') : t('priorityAll')}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="text-sm font-medium text-gray-900 mb-1">{t('onlineWaitlistLabel')}</div>
                            <div className="text-gray-500 text-sm">
                                {onlineActive ? (
                                    <>
                                        {t('onlineActive')} • {onlinePreference === 'any_time' ? t('onlinePrefAny') : t('onlinePrefOpening')}
                                    </>
                                ) : (
                                    t('onlineInactive')
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{t('notificationsTitle')}</h4>
                        <p className="text-sm text-gray-600">
                            {t.rich('notificationsDesc', { link: (chunks) => <span className="text-purple-600 hover:underline cursor-pointer">{chunks}</span> })}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Edit View
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-white sticky top-0 z-10 py-4 border-b border-gray-100 -mx-6 px-6 md:mx-0 md:px-0 md:border-none md:static">
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        {t('btnCancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white border border-black rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        {loading ? t('btnSaving') : t('btnSave')}
                    </button>
                </div>
            </div>

            <div className="space-y-10 max-w-3xl">
                {/* Intro Text */}
                <div>
                    <p className="text-gray-500">
                        {t('descTitle')} <span className="text-purple-600 hover:underline cursor-pointer">{t('learnMore')}</span>
                    </p>
                </div>

                {/* Section 1: Waitlist Type */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{t('selectTypeTitle')}</h2>
                    <p className="text-gray-500 text-sm mb-4">{t('selectTypeDesc')}</p>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Manual Option */}
                        <div
                            onClick={() => setMode('manual')}
                            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${mode === 'manual'
                                    ? 'border-purple-600 bg-purple-50/10'
                                    : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <MousePointerClick className="w-5 h-5 text-gray-700" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('typeManual')}</h3>
                                <p className="text-gray-500 text-sm mt-0.5">{t('typeManualDesc')}</p>
                            </div>
                        </div>

                        {/* Automatic Option */}
                        <div
                            onClick={() => setMode('automatic')}
                            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${mode === 'automatic'
                                    ? 'border-purple-600 bg-purple-50/10'
                                    : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <RefreshCw className="w-5 h-5 text-gray-700" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('typeAuto')}</h3>
                                <p className="text-gray-500 text-sm mt-0.5">{t('typeAutoDesc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Priority */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{t('selectPriorityTitle')}</h2>
                    <p className="text-gray-500 text-sm mb-4">{t('selectPriorityDesc')}</p>

                    <div className="space-y-4">
                        {/* First Come */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${priority === 'first_come' ? 'border-purple-600' : 'border-gray-300 group-hover:border-gray-400'
                                }`}>
                                {priority === 'first_come' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                            </div>
                            <input
                                type="radio"
                                name="priority"
                                value="first_come"
                                checked={priority === 'first_come'}
                                onChange={(e) => setPriority(e.target.value)}
                                className="hidden"
                            />
                            <div>
                                <span className={`block font-medium ${priority === 'first_come' ? 'text-gray-900' : 'text-gray-700'}`}>{t('priorityFirst')}</span>
                                <span className="block text-gray-500 text-sm">{t('priorityFirstDesc')}</span>
                            </div>
                        </label>

                        {/* Highest Value */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${priority === 'highest_value' ? 'border-purple-600' : 'border-gray-300 group-hover:border-gray-400'
                                }`}>
                                {priority === 'highest_value' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                            </div>
                            <input
                                type="radio"
                                name="priority"
                                value="highest_value"
                                checked={priority === 'highest_value'}
                                onChange={(e) => setPriority(e.target.value)}
                                className="hidden"
                            />
                            <div>
                                <span className={`block font-medium ${priority === 'highest_value' ? 'text-gray-900' : 'text-gray-700'}`}>{t('priorityHighest')}</span>
                                <span className="block text-gray-500 text-sm">{t('priorityHighestDesc')}</span>
                            </div>
                        </label>

                        {/* All (Oferta dla wszystkich) */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${priority === 'all' ? 'border-purple-600' : 'border-gray-300 group-hover:border-gray-400'
                                }`}>
                                {priority === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                            </div>
                            <input
                                type="radio"
                                name="priority"
                                value="all"
                                checked={priority === 'all'}
                                onChange={(e) => setPriority(e.target.value)}
                                className="hidden"
                            />
                            <div>
                                <span className={`block font-medium ${priority === 'all' ? 'text-gray-900' : 'text-gray-700'}`}>{t('priorityAll')}</span>
                                <span className="block text-gray-500 text-sm">{t('priorityAllDesc')}</span>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Warning Banner */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-gray-900 font-medium text-sm">{t('warningTitle')}</h4>
                        <button className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1 hover:underline">
                            {t('enableOnline')} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Section 3: Online Joining */}
                <div className="pt-4 border-t border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer group mb-6">
                        <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded border bg-white transition-colors ${onlineActive ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                            }`}>
                            {onlineActive && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={onlineActive}
                            onChange={(e) => setOnlineActive(e.target.checked)}
                            className="hidden"
                        />
                        <div>
                            <span className="block font-medium text-gray-900">{t('allowOnlineJoin')}</span>
                            <span className="block text-gray-500 text-sm">{t('allowOnlineJoinDesc')}</span>
                        </div>
                    </label>

                    {onlineActive && (
                        <div className="pl-8 space-y-4">
                            {/* Any Time */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${onlinePreference === 'any_time' ? 'border-purple-600' : 'border-gray-300 group-hover:border-gray-400'
                                    }`}>
                                    {onlinePreference === 'any_time' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                </div>
                                <input
                                    type="radio"
                                    name="onlinePreference"
                                    value="any_time"
                                    checked={onlinePreference === 'any_time'}
                                    onChange={(e) => setOnlinePreference(e.target.value)}
                                    className="hidden"
                                />
                                <div>
                                    <span className={`block font-medium ${onlinePreference === 'any_time' ? 'text-gray-900' : 'text-gray-700'}`}>{t('prefAnyLabel')}</span>
                                    <span className="block text-gray-500 text-sm">{t('prefAnyDesc')}</span>
                                </div>
                            </label>

                            {/* Opening Hours Only */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${onlinePreference === 'opening_hours' ? 'border-purple-600' : 'border-gray-300 group-hover:border-gray-400'
                                    }`}>
                                    {onlinePreference === 'opening_hours' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                </div>
                                <input
                                    type="radio"
                                    name="onlinePreference"
                                    value="opening_hours"
                                    checked={onlinePreference === 'opening_hours'}
                                    onChange={(e) => setOnlinePreference(e.target.value)}
                                    className="hidden"
                                />
                                <div>
                                    <span className={`block font-medium ${onlinePreference === 'opening_hours' ? 'text-gray-900' : 'text-gray-700'}`}>{t('prefOpeningLabel')}</span>
                                    <span className="block text-gray-500 text-sm">{t.rich('prefOpeningDesc', { link: (chunks) => <span className="underline cursor-pointer">{chunks}</span>})}</span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

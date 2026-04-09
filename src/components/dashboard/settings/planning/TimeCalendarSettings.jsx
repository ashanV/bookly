"use client";

import React, { useState } from 'react';
import { toast } from '@/components/Toast';
import { useTranslations } from 'next-intl';

export default function TimeCalendarSettings({ businessData, onUpdate }) {
    const t = useTranslations('BusinessTimeCalendar');
    const [loading, setLoading] = useState(false);

    // Initial state derived from businessData or defaults
    const [timeZone, setTimeZone] = useState(businessData?.timeZone || 'Europe/Warsaw');
    const [timeFormat, setTimeFormat] = useState(businessData?.timeFormat || '24h');
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(businessData?.firstDayOfWeek || 'monday');

    // Calendar settings
    const [visitColor, setVisitColor] = useState(businessData?.calendarSettings?.visitColor || 'employee');
    const [showWaitingTime, setShowWaitingTime] = useState(businessData?.calendarSettings?.showWaitingTime ?? true);
    const [showBlockTime, setShowBlockTime] = useState(businessData?.calendarSettings?.showBlockTime ?? true);

    const [isEditingTime, setIsEditingTime] = useState(false);
    const [isEditingCalendar, setIsEditingCalendar] = useState(false);

    const handleSaveTimeSettings = async () => {
        setLoading(true);
        try {
            await onUpdate({
                timeZone,
                timeFormat,
                firstDayOfWeek
            });
            setIsEditingTime(false);
            toast.success(t('successUpdateTime'));
        } catch (error) {
            toast.error(t('errSave'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCalendarSettings = async () => {
        setLoading(true);
        try {
            await onUpdate({
                calendarSettings: {
                    visitColor,
                    showWaitingTime,
                    showBlockTime
                }
            });
            setIsEditingCalendar(false);
            toast.success(t('successUpdateCalendar'));
        } catch (error) {
            toast.error(t('errSave'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-gray-500">
                    {t('descTitle')} <span className="text-purple-600 hover:underline cursor-pointer">{t('learnMore')}</span>
                </p>
            </div>

            {/* Date and Time Settings */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{t('timeSettingsTitle')}</h3>
                    {!isEditingTime ? (
                        <button
                            onClick={() => setIsEditingTime(true)}
                            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t('btnChange')}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditingTime(false)}
                                disabled={loading}
                                className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('btnCancel')}
                            </button>
                            <button
                                onClick={handleSaveTimeSettings}
                                disabled={loading}
                                className="px-4 py-1.5 bg-black text-white border border-black rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                {loading ? t('btnSaving') : t('btnSave')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('timezoneLabel')}</div>
                        {isEditingTime ? (
                            <select
                                value={timeZone}
                                onChange={(e) => setTimeZone(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="Europe/Warsaw">{t('timezoneWarsaw')}</option>
                                <option value="GMT">GMT</option>
                                <option value="UTC">UTC</option>
                                {/* Add more timezones as needed */}
                            </select>
                        ) : (
                            <div className="text-gray-500">{timeZone === 'Europe/Warsaw' ? t('timezoneWarsaw') : timeZone}</div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('timeFormatLabel')}</div>
                        {isEditingTime ? (
                            <select
                                value={timeFormat}
                                onChange={(e) => setTimeFormat(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="24h">{t('format24h')}</option>
                                <option value="12h">{t('format12h')}</option>
                            </select>
                        ) : (
                            <div className="text-gray-500">{timeFormat === '24h' ? t('format24h') : t('format12h')}</div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('firstDayLabel')}</div>
                        {isEditingTime ? (
                            <select
                                value={firstDayOfWeek}
                                onChange={(e) => setFirstDayOfWeek(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="monday">{t('monday')}</option>
                                <option value="sunday">{t('sunday')}</option>
                            </select>
                        ) : (
                            <div className="text-gray-500">{firstDayOfWeek === 'monday' ? t('monday') : t('sunday')}</div>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                    {t('dstInfo')}
                </div>
            </div>

            {/* Calendar Settings */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 text-left">
                <div className="flex justify-between items-start mb-6 w-full">
                    <h3 className="text-lg font-bold text-gray-900">{t('calendarSettingsTitle')}</h3>
                    {!isEditingCalendar ? (
                        <button
                            onClick={() => setIsEditingCalendar(true)}
                            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t('btnChange')}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditingCalendar(false)}
                                disabled={loading}
                                className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('btnCancel')}
                            </button>
                            <button
                                onClick={handleSaveCalendarSettings}
                                disabled={loading}
                                className="px-4 py-1.5 bg-black text-white border border-black rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                {loading ? t('btnSaving') : t('btnSave')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">{t('visitColorLabel')}</div>
                        {isEditingCalendar ? (
                            <select
                                value={visitColor}
                                onChange={(e) => setVisitColor(e.target.value)}
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="category">{t('colorCategory')}</option>
                                <option value="employee">{t('colorEmployee')}</option>
                                <option value="status">{t('colorStatus')}</option>
                            </select>
                        ) : (
                            <div className="w-full md:w-1/2 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                                {visitColor === 'employee' ? t('colorEmployee') : visitColor === 'status' ? t('colorStatus') : t('colorCategory')}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center h-5 mt-1">
                                <input
                                    id="showWaitingTime"
                                    type="checkbox"
                                    checked={showWaitingTime}
                                    onChange={(e) => isEditingCalendar && setShowWaitingTime(e.target.checked)}
                                    disabled={!isEditingCalendar}
                                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="showWaitingTime" className="font-medium text-gray-900 block mb-1">
                                    {t('showWaitTimeLabel')}
                                </label>
                                <p className="text-gray-600 leading-normal">
                                    {t('showWaitTimeDesc')} <span className="text-purple-600 hover:underline cursor-pointer">{t('learnMore')}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex items-center h-5 mt-1">
                                <input
                                    id="showBlockTime"
                                    type="checkbox"
                                    checked={showBlockTime}
                                    onChange={(e) => isEditingCalendar && setShowBlockTime(e.target.checked)}
                                    disabled={!isEditingCalendar}
                                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="showBlockTime" className="font-medium text-gray-900 block mb-1">
                                    {t('showBlockTimeLabel')}
                                </label>
                                <p className="text-gray-600 leading-normal">
                                    {t('showBlockTimeDesc')} <span className="text-purple-600 hover:underline cursor-pointer">{t('learnMore')}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

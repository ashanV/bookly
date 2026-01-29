"use client";

import React, { useState } from 'react';
import { toast } from '@/components/Toast';

export default function TimeCalendarSettings({ businessData, onUpdate }) {
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
            toast.success("Ustawienia daty i godziny zostały zaktualizowane");
        } catch (error) {
            toast.error("Błąd zapisu ustawień");
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
            toast.success("Ustawienia kalendarza zostały zaktualizowane");
        } catch (error) {
            toast.error("Błąd zapisu ustawień");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Czas i kalendarz</h1>
                <p className="text-gray-500">
                    Wybierz format godziny i daty dla swojej firmy. <span className="text-purple-600 hover:underline cursor-pointer">Dowiedz się więcej</span>.
                </p>
            </div>

            {/* Date and Time Settings */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Ustawienia daty i godziny</h3>
                    {!isEditingTime ? (
                        <button
                            onClick={() => setIsEditingTime(true)}
                            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Zmień
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditingTime(false)}
                                disabled={loading}
                                className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleSaveTimeSettings}
                                disabled={loading}
                                className="px-4 py-1.5 bg-black text-white border border-black rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                {loading ? 'Zapisywanie...' : 'Zapisz'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Strefa czasowa</div>
                        {isEditingTime ? (
                            <select
                                value={timeZone}
                                onChange={(e) => setTimeZone(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="Europe/Warsaw">(GMT +01:00) Warszawa</option>
                                <option value="GMT">GMT</option>
                                <option value="UTC">UTC</option>
                                {/* Add more timezones as needed */}
                            </select>
                        ) : (
                            <div className="text-gray-500">{timeZone === 'Europe/Warsaw' ? '(GMT +01:00) Warszawa' : timeZone}</div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Format godziny</div>
                        {isEditingTime ? (
                            <select
                                value={timeFormat}
                                onChange={(e) => setTimeFormat(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="24h">24 godziny (np. 21:00)</option>
                                <option value="12h">12 godzin (np. 9:00 PM)</option>
                            </select>
                        ) : (
                            <div className="text-gray-500">{timeFormat === '24h' ? '24 godziny (np. 21:00)' : '12 godzin (np. 9:00 PM)'}</div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Pierwszy dzień tygodnia</div>
                        {isEditingTime ? (
                            <select
                                value={firstDayOfWeek}
                                onChange={(e) => setFirstDayOfWeek(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="monday">Poniedziałek</option>
                                <option value="sunday">Niedziela</option>
                            </select>
                        ) : (
                            <div className="text-gray-500">{firstDayOfWeek === 'monday' ? 'Poniedziałek' : 'Niedziela'}</div>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                    Zmiany na czas letni lub zimowy zostaną automatycznie zastosowane na podstawie wybranej strefy czasowej
                </div>
            </div>

            {/* Calendar Settings */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 text-left">
                <div className="flex justify-between items-start mb-6 w-full">
                    <h3 className="text-lg font-bold text-gray-900">Ustawienia kalendarza</h3>
                    {!isEditingCalendar ? (
                        <button
                            onClick={() => setIsEditingCalendar(true)}
                            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Zmień
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditingCalendar(false)}
                                disabled={loading}
                                className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleSaveCalendarSettings}
                                disabled={loading}
                                className="px-4 py-1.5 bg-black text-white border border-black rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                {loading ? 'Zapisywanie...' : 'Zapisz'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">Kolor wizyty</div>
                        {isEditingCalendar ? (
                            <select
                                value={visitColor}
                                onChange={(e) => setVisitColor(e.target.value)}
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="category">Kategoria</option>
                                <option value="employee">Pracownik</option>
                                <option value="status">Status</option>
                            </select>
                        ) : (
                            <div className="w-full md:w-1/2 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                                {visitColor === 'employee' ? 'Pracownik' : visitColor === 'status' ? 'Status' : 'Kategoria'}
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
                                    Wyświetl segmenty czasu oczekiwania w kafelkach wizyt
                                </label>
                                <p className="text-gray-600 leading-normal">
                                    Dodatkowy czas oczekiwania w ramach wizyty będzie wyświetlany jako wyblakły segment w tym samym kolorze co kafelek wizyty. <span className="text-purple-600 hover:underline cursor-pointer">Dowiedz się więcej</span>
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
                                    Wyróżnij segmenty blokady czasu w kafelkach wizyt
                                </label>
                                <p className="text-gray-600 leading-normal">
                                    Dodatkowy zablokowany czas w ramach wizyty będzie wyświetlany jako szary segment w kafelku wizyty. <span className="text-purple-600 hover:underline cursor-pointer">Dowiedz się więcej</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

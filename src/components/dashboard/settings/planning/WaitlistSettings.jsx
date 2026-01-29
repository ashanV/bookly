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

export default function WaitlistSettings({ businessData, onUpdate }) {
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
            toast.success("Ustawienia listy oczekujących zostały zaktualizowane");
        } catch (error) {
            toast.error("Błąd zapisu ustawień");
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Lista oczekujących</h1>
                    <p className="text-gray-500">
                        Włącz listę oczekujących online i zdecyduj, w jaki sposób przedziały czasowe są oferowane klientom znajdującym się na liście. <span className="text-purple-600 hover:underline cursor-pointer">Dowiedz się więcej</span>.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 text-left">
                    <div className="flex justify-between items-center mb-6 w-full">
                        <h3 className="text-lg font-bold text-gray-900">Ustawienia</h3>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Zmień
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                        <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">Typ listy oczekujących</div>
                            <div className="text-gray-500 text-sm">
                                {mode === 'automatic' ? 'Rezerwuj automatycznie' : 'Rezerwuj ręcznie'}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">Priorytet listy oczekujących</div>
                            <div className="text-gray-500 text-sm">
                                {priority === 'first_come' ? 'Pierwszy w kolejce' :
                                    priority === 'highest_value' ? 'Najwyższa wartość usługi' : 'Oferta dla wszystkich'}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="text-sm font-medium text-gray-900 mb-1">Lista oczekujących na rezerwacje online</div>
                            <div className="text-gray-500 text-sm">
                                {onlineActive ? (
                                    <>
                                        Aktywna • {onlinePreference === 'any_time' ? 'Dowolna godzina' : 'Tylko godziny otwarcia'}
                                    </>
                                ) : (
                                    'Nieaktywna'
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Powiadomienia klienta</h4>
                        <p className="text-sm text-gray-600">
                            Skonfiguruj sposób powiadamiania klientów o zmianach na liście oczekujących w <span className="text-purple-600 hover:underline cursor-pointer">automatycznych wiadomościach</span>
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
                <h1 className="text-2xl font-bold text-gray-900">Ustawienia listy oczekujących</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Zamknij
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white border border-black rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        {loading ? 'Zapisywanie...' : 'Zapisz'}
                    </button>
                </div>
            </div>

            <div className="space-y-10 max-w-3xl">
                {/* Intro Text */}
                <div>
                    <p className="text-gray-500">
                        Włącz listę oczekujących online i zdecyduj, w jaki sposób przedziały czasowe są oferowane klientom znajdującym się na liście. <span className="text-purple-600 hover:underline cursor-pointer">Dowiedz się więcej</span>.
                    </p>
                </div>

                {/* Section 1: Waitlist Type */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Wybierz typ listy oczekujących</h2>
                    <p className="text-gray-500 text-sm mb-4">Wybierz, w jaki sposób chcesz rezerwować wizyty dla klientów z listy</p>

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
                                <h3 className="font-semibold text-gray-900">Rezerwuj ręcznie</h3>
                                <p className="text-gray-500 text-sm mt-0.5">Ręcznie wybierz klienta z listy oczekujących</p>
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
                                <h3 className="font-semibold text-gray-900">Rezerwuj automatycznie</h3>
                                <p className="text-gray-500 text-sm mt-0.5">Automatycznie powiadamiaj klientów z listy oczekujących</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Priority */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Priorytet listy oczekujących</h2>
                    <p className="text-gray-500 text-sm mb-4">Wybierz, w jaki sposób chcesz nadawać priorytet klientom z listy</p>

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
                                <span className={`block font-medium ${priority === 'first_come' ? 'text-gray-900' : 'text-gray-700'}`}>Pierwszy w kolejce</span>
                                <span className="block text-gray-500 text-sm">Automatycznie oferuj klientom w kolejności ich dołączania do listy</span>
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
                                <span className={`block font-medium ${priority === 'highest_value' ? 'text-gray-900' : 'text-gray-700'}`}>Najwyższa wartość usługi</span>
                                <span className="block text-gray-500 text-sm">Automatycznie oferuj klientom w kolejności najwyższej wartości zamówienia</span>
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
                                <span className={`block font-medium ${priority === 'all' ? 'text-gray-900' : 'text-gray-700'}`}>Oferta dla wszystkich</span>
                                <span className="block text-gray-500 text-sm">Automatycznie oferuj wszystkim klientom z listy oczekujących. Pierwszy klient, który dokona rezerwacji, otrzymuje dany termin</span>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Warning Banner */}
                {/* Warning displayed regardless of onlineActive state in the screenshot, but implies context. 
                    I'll replicate it as a static warning for now or conditional if I knew the global setting.
                    Given the screenshot shows it while editing, I'll include it. */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-gray-900 font-medium text-sm">Rezerwacje online są wyłączone. Klienci nie będą mogli rezerwować wizyt przez internet, gdy zwolnią się terminy</h4>
                        <button className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1 hover:underline">
                            Włącz rezerwacje online <ArrowRight className="w-3.5 h-3.5" />
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
                            <span className="block font-medium text-gray-900">Umożliwiaj klientom dołączanie do listy oczekujących online</span>
                            <span className="block text-gray-500 text-sm">Klient może dołączyć do listy oczekujących podczas dokonywania rezerwacji online</span>
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
                                    <span className={`block font-medium ${onlinePreference === 'any_time' ? 'text-gray-900' : 'text-gray-700'}`}>Klienci mogą poprosić o dowolną preferowaną godzinę</span>
                                    <span className="block text-gray-500 text-sm">Klienci mogą wybrać dowolną datę i godzinę, kiedy dołączają do listy oczekujących</span>
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
                                    <span className={`block font-medium ${onlinePreference === 'opening_hours' ? 'text-gray-900' : 'text-gray-700'}`}>Klienci mogą wybierać tylko godziny, w których Twoja firma jest otwarta</span>
                                    <span className="block text-gray-500 text-sm">Klienci mogą wybierać daty i godziny tylko w godzinach otwarcia Twojej lokalizacji. <span className="underline cursor-pointer">Zarządzaj godzinami otwarcia w Lokalizacjach</span></span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

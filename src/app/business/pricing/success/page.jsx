"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, ArrowRight, Calendar, Zap, AlertCircle } from 'lucide-react';

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [planName, setPlanName] = useState('');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            // Sync subscription with database
            syncSubscription(sessionId);
        } else {
            // No session ID - redirect to pricing
            router.push('/business/pricing');
        }
    }, [searchParams, router]);

    const syncSubscription = async (sessionId) => {
        setSyncing(true);
        try {
            const response = await fetch('/api/stripe/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setPlanName(data.plan);
            } else {
                console.error('Sync failed:', data.error);
                setSyncError(data.error);
            }
        } catch (error) {
            console.error('Sync error:', error);
            setSyncError('Nie udało się zsynchronizować subskrypcji');
        } finally {
            setSyncing(false);
            setLoading(false);
        }
    };

    const getPlanDisplayName = (plan) => {
        const names = {
            starter: 'Starter',
            professional: 'Professional',
            enterprise: 'Enterprise'
        };
        return names[plan] || plan;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">
                        {syncing ? 'Aktywowanie subskrypcji...' : 'Przetwarzanie płatności...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* Success Icon with Animation */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-12 h-12 text-white" strokeWidth={3} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Płatność zakończona sukcesem!
                    </h1>

                    {planName && (
                        <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold mb-4">
                            <Zap className="w-4 h-4 mr-2" />
                            Plan {getPlanDisplayName(planName)} aktywowany
                        </div>
                    )}

                    <p className="text-gray-600 mb-8">
                        Twoja subskrypcja została aktywowana. Dziękujemy za zaufanie!
                        Rozpoczął się 14-dniowy okres próbny.
                    </p>

                    {/* Sync Error Warning */}
                    {syncError && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-yellow-800 text-sm font-medium">
                                        Uwaga: Status subskrypcji może się zaktualizować za chwilę.
                                    </p>
                                    <p className="text-yellow-600 text-xs mt-1">
                                        Jeśli nie widzisz zmian w panelu, odśwież stronę po minucie.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features Unlocked */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                            Odblokowane funkcje
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center text-gray-700">
                                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Nielimitowane rezerwacje</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Powiadomienia SMS</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Płatności online</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Zaawansowane raporty</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/business/dashboard')}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center group cursor-pointer"
                        >
                            <Calendar className="w-5 h-5 mr-2" />
                            Przejdź do panelu
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => router.push('/business/pricing')}
                            className="w-full text-gray-600 py-3 px-6 rounded-xl font-medium hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            Wróć do cennika
                        </button>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Masz pytania? Napisz do nas na{' '}
                    <a href="mailto:kontakt@bookly.com" className="text-blue-600 hover:underline">
                        kontakt@bookly.com
                    </a>
                </p>
            </div>
        </div>
    );
}

"use client";

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle, RefreshCw } from 'lucide-react';

export default function SubscriptionCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Cancel Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* Cancel Icon */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-10 h-10 text-orange-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Płatność anulowana
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Twoja płatność została anulowana. Nie zostałeś obciążony żadnymi kosztami.
                        Możesz wrócić do cennika i wybrać plan ponownie.
                    </p>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                        <div className="flex items-start text-left">
                            <HelpCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-900 mb-1">
                                    Potrzebujesz pomocy?
                                </p>
                                <p className="text-blue-700">
                                    Jeśli napotkałeś problem z płatnością lub masz pytania dotyczące planów,
                                    skontaktuj się z nami - chętnie pomożemy!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/business/pricing')}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center group cursor-pointer"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Wróć do cennika
                        </button>

                        <button
                            onClick={() => router.push('/business')}
                            className="w-full text-gray-600 py-3 px-6 rounded-xl font-medium hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Strona główna
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

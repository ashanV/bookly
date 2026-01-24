"use client";

import { useRouter } from 'next/navigation';
import { Crown, Zap, Rocket, Star, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Subscription status banner for business dashboard
 * Shows current plan and upgrade CTA based on subscription level
 */
export default function SubscriptionBanner({ business }) {
    const router = useRouter();

    // Get subscription info
    const subscription = business?.subscription;
    const plan = subscription?.plan || 'free';
    const status = subscription?.status || 'inactive';
    const isActive = ['active', 'trialing'].includes(status);
    const isTrialing = status === 'trialing';

    // Plan configurations
    const planConfig = {
        free: {
            icon: Sparkles,
            title: 'Plan Darmowy',
            subtitle: 'Korzystasz z ograniczonej wersji Bookly',
            description: 'Odblokuj pełny potencjał swojego biznesu! Uzyskaj dostęp do nielimitowanych rezerwacji, powiadomień SMS, płatności online i wielu innych funkcji.',
            cta: 'Wybierz plan',
            gradient: 'from-gray-600 to-gray-700',
            bgGradient: 'from-gray-50 to-slate-100',
            border: 'border-gray-200',
            showUpgrade: true
        },
        starter: {
            icon: Zap,
            title: 'Plan Starter',
            subtitle: isTrialing ? '🎉 Okres próbny' : 'Aktywna subskrypcja',
            description: 'Rozwijaj swój biznes szybciej! Przejdź na Professional i odblokuj CRM, zaawansowane raporty, marketing SMS/Email i więcej.',
            cta: 'Ulepsz do Professional',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50',
            border: 'border-blue-200',
            showUpgrade: true
        },
        professional: {
            icon: Crown,
            title: 'Plan Professional',
            subtitle: isTrialing ? '🎉 Okres próbny' : 'Aktywna subskrypcja',
            description: 'Dla maksymalnej mocy! Przejdź na Enterprise i uzyskaj nielimitowany zespół, dedykowanego managera, white-label i pełny dostęp API.',
            cta: 'Ulepsz do Enterprise',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50',
            border: 'border-purple-200',
            showUpgrade: true
        },
        enterprise: {
            icon: Rocket,
            title: 'Plan Enterprise',
            subtitle: isTrialing ? '🎉 Okres próbny' : 'Aktywna subskrypcja',
            description: 'Korzystasz z pełnej wersji Bookly ze wszystkimi funkcjami. Dziękujemy za zaufanie!',
            cta: null,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-50 to-orange-50',
            border: 'border-amber-200',
            showUpgrade: false
        }
    };

    const config = planConfig[plan] || planConfig.free;
    const Icon = config.icon;

    const handleUpgrade = () => {
        router.push('/business/pricing');
    };

    return (
        <div className={`bg-gradient-to-r ${config.bgGradient} rounded-2xl shadow-lg border ${config.border} p-6 mb-6`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left side - Plan info */}
                <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
                            {isTrialing && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    14 dni trial
                                </span>
                            )}
                            {plan !== 'free' && isActive && !isTrialing && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    Aktywny
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 max-w-xl">{config.description}</p>
                    </div>
                </div>

                {/* Right side - CTA button */}
                {config.showUpgrade && (
                    <button
                        onClick={handleUpgrade}
                        className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer whitespace-nowrap`}
                    >
                        {plan === 'free' ? <Star className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        {config.cta}
                    </button>
                )}

                {/* Enterprise - Manage subscription button */}
                {plan === 'enterprise' && isActive && (
                    <button
                        onClick={() => router.push('/business/dashboard/settings')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:shadow-md transition-all cursor-pointer"
                    >
                        Zarządzaj subskrypcją
                    </button>
                )}
            </div>

            {/* Past due warning */}
            {status === 'past_due' && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm font-medium">
                        ⚠️ Płatność nieudana. Zaktualizuj metodę płatności, aby uniknąć utraty dostępu.
                    </p>
                </div>
            )}
        </div>
    );
}

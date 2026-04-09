'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations('AdminLogin');
    const { adminLogin, isAdminAuthenticated, loading: authLoading } = useAdminAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAdminAuthenticated) {
            router.push('/admin');
        }
    }, [authLoading, isAdminAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await adminLogin(email, password, pin);

            if (result.success) {
                router.push('/admin');
            } else {
                setError(result.error || t('invalidCredentials'));
            }
        } catch (err) {
            setError(t('serverError'));
        } finally {
            setLoading(false);
        }
    };

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPin(value);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
                        <p className="text-purple-200 text-sm mt-2">{t('subtitle')}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="admin-email" className="text-sm font-medium text-gray-300">{t('emailLabel')}</label>
                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('emailPlaceholder')}
                                required
                                autoFocus
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="admin-password" className="text-sm font-medium text-gray-300">{t('passwordLabel')}</label>
                            <div className="relative">
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('passwordPlaceholder')}
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* PIN */}
                        <div className="space-y-2">
                            <label htmlFor="admin-pin" className="text-sm font-medium text-gray-300">{t('pinLabel')}</label>
                            <input
                                id="admin-pin"
                                type="text"
                                inputMode="numeric"
                                value={pin}
                                onChange={handlePinChange}
                                placeholder={t('pinPlaceholder')}
                                required
                                maxLength={6}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || pin.length !== 6}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('loggingInButton')}
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    {t('loginButton')}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        <p className="text-xs text-gray-500 text-center">
                            {t('footerText')}
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        {t('backHome')}
                    </a>
                </div>
            </div>
        </div>
    );
}

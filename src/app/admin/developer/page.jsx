'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Activity, Database, Cpu, HardDrive, Wifi, CheckCircle, XCircle, RefreshCw, ToggleLeft, ToggleRight, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminDeveloperPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [healthData, setHealthData] = useState({
        services: [],
        stats: [],
        timestamp: null
    });

    const [featureFlags, setFeatureFlags] = useState({
        newBookingFlow: true,
        darkMode: true,
        betaFeatures: false,
        analyticsV2: true,
    });

    const fetchHealthStatus = useCallback(async (isManual = false) => {
        if (isManual) setIsLoading(true);
        try {
            const res = await fetch('/api/admin/system/health');
            if (!res.ok) throw new Error('Błąd pobierania statusu');
            const data = await res.json();
            setHealthData(data);
            setError(null);
        } catch (err) {
            console.error('Fetch health error:', err);
            setError('Nie udało się pobrać statusu systemowego');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealthStatus();
        const interval = setInterval(() => {
            fetchHealthStatus();
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [fetchHealthStatus]);

    const toggleFlag = (key) => {
        setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'degraded':
            case 'unhealthy':
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'not_configured':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'healthy': return 'Sprawny';
            case 'degraded': return 'Obciążony';
            case 'unhealthy':
            case 'error': return 'Błąd';
            case 'not_configured': return 'Brak konfiguracji';
            default: return 'Sprawdzanie...';
        }
    };

    const getStatIcon = (iconName) => {
        const icons = { Cpu, HardDrive, Activity, Wifi };
        const Icon = icons[iconName] || Activity;
        return <Icon className="w-5 h-5 text-cyan-400" />;
    };

    return (
        <>
            <AdminHeader title="Developer Panel" subtitle="Narzędzia i monitoring" />

            <div className="p-6 space-y-6">
                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {healthData.stats.length > 0 ? (
                        healthData.stats.map((stat, i) => (
                            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatIcon(stat.icon)}
                                    <span className="text-sm text-gray-400">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 animate-pulse">
                                <div className="h-4 w-24 bg-gray-800 rounded mb-3" />
                                <div className="h-8 w-16 bg-gray-800 rounded" />
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Health Status */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <Activity className="w-5 h-5 text-green-400" />
                                Status usług
                            </h2>
                            <button
                                onClick={() => fetchHealthStatus(true)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Odśwież teraz"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            {healthData.services.length > 0 ? (
                                healthData.services.map(service => (
                                    <div key={service.name} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(service.status)}
                                            <div>
                                                <span className="text-gray-300 block">{service.name}</span>
                                                <span className={`text-[10px] uppercase font-bold ${service.status === 'healthy' ? 'text-green-500' : 'text-red-500'
                                                    }`}>
                                                    {getStatusText(service.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">{service.latency}</span>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 bg-gray-800 rounded-full" />
                                            <div className="h-4 w-24 bg-gray-800 rounded" />
                                        </div>
                                        <div className="h-4 w-12 bg-gray-800 rounded" />
                                    </div>
                                ))
                            )}
                        </div>

                        {healthData.timestamp && (
                            <p className="mt-4 text-[10px] text-gray-600 text-right">
                                Ostatnia aktualizacja: {new Date(healthData.timestamp).toLocaleTimeString()}
                            </p>
                        )}
                    </div>

                    {/* Feature Flags */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                            <ToggleRight className="w-5 h-5 text-purple-400" />
                            Feature Flags
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(featureFlags).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between py-2">
                                    <span className="text-gray-300 font-mono text-sm">{key}</span>
                                    <button
                                        onClick={() => toggleFlag(key)}
                                        className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-600' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cache Actions */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                        <Database className="w-5 h-5 text-blue-400" />
                        Cache
                    </h2>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Wyczyść cache
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
                            <Database className="w-4 h-4" />
                            Podgląd kluczy
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

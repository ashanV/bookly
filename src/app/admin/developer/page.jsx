'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Activity, Database, Cpu, HardDrive, Wifi, CheckCircle, XCircle, RefreshCw, ToggleRight, AlertCircle, Loader2, Save, Type, Hash, Megaphone, Trash2, FileText, Folder, Eye, Search, Key, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function AdminDeveloperPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [healthData, setHealthData] = useState({
        services: [],
        external: {
            cloudinary: { status: 'checking', message: '' },
            nodemailer: { status: 'checking', message: '' },
            pusher: { status: 'checking', message: '' },
            googleCalendar: { status: 'checking', message: '' }
        },
        stats: [],
        timestamp: null
    });
    // Store history for charts: { cpu: [], memory: [] }
    const [statsHistory, setStatsHistory] = useState({ cpu: [], memory: [] });

    const [featureFlags, setFeatureFlags] = useState(null);
    const [flagsLoading, setFlagsLoading] = useState(true);
    const [flagsSaving, setFlagsSaving] = useState(false);
    const [flagsError, setFlagsError] = useState(null);

    const fetchHealthStatus = useCallback(async (isManual = false) => {
        if (isManual) setIsLoading(true);
        try {
            const res = await fetch('/api/admin/system/health');
            if (!res.ok) throw new Error('Błąd pobierania statusu');
            const data = await res.json();
            setHealthData(data);

            // Update history
            if (data.stats) {
                const cpuStat = data.stats.find(s => s.icon === 'Cpu');
                const memStat = data.stats.find(s => s.icon === 'HardDrive');

                setStatsHistory(prev => {
                    const newCpU = [...prev.cpu, { value: cpuStat?.rawValue || 0 }].slice(-15);
                    const newMem = [...prev.memory, { value: memStat?.rawValue || 0 }].slice(-15);
                    return { cpu: newCpU, memory: newMem };
                });
            }

            setError(null);
        } catch (err) {
            console.error('Fetch health error:', err);
            setError('Nie udało się pobrać statusu systemowego');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFeatureFlags = useCallback(async () => {
        setFlagsLoading(true);
        try {
            const res = await fetch('/api/admin/system/feature-flags');
            if (!res.ok) throw new Error('Błąd pobierania flag');
            const data = await res.json();
            setFeatureFlags(data.flags);
            setFlagsError(null);
        } catch (err) {
            console.error('Fetch flags error:', err);
            setFlagsError('Nie udało się pobrać flag');
        } finally {
            setFlagsLoading(false);
        }
    }, []);

    const updateFlag = async (key, value) => {
        // Optimistic update
        setFeatureFlags(prev => ({ ...prev, [key]: value }));

        // Auto-save to API
        try {
            const updates = { [key]: value };
            const res = await fetch('/api/admin/system/feature-flags', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Błąd zapisu');
            const data = await res.json();
            setFeatureFlags(data.flags); // Sync with server response
        } catch (err) {
            console.error('Auto-save flag error:', err);
            // Revert on error
            setFeatureFlags(prev => ({ ...prev, [key]: !value }));
        }
    };

    // --- Cache Explorer Logic ---
    const [cacheKeys, setCacheKeys] = useState([]);
    const [cacheLoading, setCacheLoading] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [keyDetails, setKeyDetails] = useState(null);
    const [keyDetailsLoading, setKeyDetailsLoading] = useState(false);
    const [cacheSearch, setCacheSearch] = useState('');

    const fetchCacheKeys = useCallback(async () => {
        setCacheLoading(true);
        try {
            const res = await fetch('/api/admin/system/cache');
            const data = await res.json();
            setCacheKeys(data.keys || []);
        } catch (err) {
            console.error('Fetch cache keys error:', err);
        } finally {
            setCacheLoading(false);
        }
    }, []);

    const fetchKeyDetails = async (key) => {
        setSelectedKey(key);
        setKeyDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/system/cache/detail?key=${encodeURIComponent(key)}`);
            const data = await res.json();
            setKeyDetails(data);
        } catch (err) {
            console.error('Fetch key details error:', err);
            setKeyDetails(null);
        } finally {
            setKeyDetailsLoading(false);
        }
    };

    const deleteKey = async (key) => {
        if (!confirm(`Czy na pewno usunąć klucz ${key}?`)) return;
        try {
            await fetch(`/api/admin/system/cache/detail?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
            setCacheKeys(prev => prev.filter(k => k !== key));
            if (selectedKey === key) {
                setSelectedKey(null);
                setKeyDetails(null);
            }
        } catch (err) {
            console.error('Delete key error:', err);
        }
    };

    const clearCachePattern = async (pattern, label) => {
        if (!confirm(`Czy na pewno wyczyścić cache dla: ${label}?`)) return;
        try {
            await fetch('/api/admin/system/cache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pattern })
            });
            fetchCacheKeys(); // Refresh list
        } catch (err) {
            console.error('Clear cache error:', err);
        }
    };

    // Group keys by prefix (simple splitting by ':')
    const groupedKeys = React.useMemo(() => {
        const groups = {};
        const filtered = cacheKeys.filter(k => k.toLowerCase().includes(cacheSearch.toLowerCase()));

        filtered.forEach(key => {
            const parts = key.split(':');
            const prefix = parts.length > 1 ? parts[0] : 'other';
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(key);
        });
        return groups;
    }, [cacheKeys, cacheSearch]);

    useEffect(() => {
        fetchCacheKeys();
    }, [fetchCacheKeys]);

    useEffect(() => {
        fetchHealthStatus();
        fetchFeatureFlags();
        const interval = setInterval(() => {
            fetchHealthStatus();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchHealthStatus, fetchFeatureFlags]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'degraded':
            case 'unhealthy':
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'not_configured':
                return <AlertCircle className="w-5 h-5 text-amber-500" />;
            default:
                return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'degraded': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'unhealthy':
            case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'not_configured': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    const StatusCard = ({ name, status, message, type = 'service', latency }) => (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5 ${getStatusColor(status)} bg-opacity-5`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getStatusColor(status)} bg-opacity-10`}>
                    {type === 'service' ? <Database className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="font-semibold text-white text-sm">{name}</h3>
                    <p className="text-xs opacity-70 mt-0.5">{message || (status === 'healthy' ? 'Działa poprawnie' : 'Problem')}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex justify-end mb-1">{getStatusIcon(status)}</div>
                {latency && <span className="text-xs font-mono opacity-60">{latency}</span>}
            </div>
        </div>
    );

    // Simple Sparkline Component - Fixed size to prevent Recharts warnings
    const Sparkline = ({ data, color = "#10b981", isAlert = false }) => {
        if (!data || data.length < 2) return null;
        return (
            <div className="h-10 w-24 ml-auto">
                <LineChart width={96} height={40} data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isAlert ? "#ef4444" : color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                </LineChart>
            </div>
        );
    };

    return (
        <>
            <AdminHeader title="Developer Panel" subtitle="Centrum sterowania systemem" />

            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                {/* System Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {healthData.stats.map((stat, i) => {
                        const isHighUsage = stat.rawValue && stat.rawValue > 90 && (stat.icon === 'Cpu' || stat.icon === 'HardDrive');
                        let chartData = null;
                        if (stat.icon === 'Cpu') chartData = statsHistory.cpu;
                        if (stat.icon === 'HardDrive') chartData = statsHistory.memory;

                        return (
                            <div key={i} className={`bg-gray-900 border ${isHighUsage ? 'border-red-500/50 animate-pulse' : 'border-gray-800'} rounded-2xl p-5 hover:border-gray-700 transition-colors`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        {stat.icon === 'Cpu' && <Cpu className={`w-4 h-4 ${isHighUsage ? 'text-red-500' : ''}`} />}
                                        {stat.icon === 'HardDrive' && <HardDrive className={`w-4 h-4 ${isHighUsage ? 'text-red-500' : ''}`} />}
                                        {stat.icon === 'Activity' && <Activity className="w-4 h-4" />}
                                        {stat.icon === 'Wifi' && <Wifi className="w-4 h-4" />}
                                        <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                    {chartData && <Sparkline data={chartData} isAlert={isHighUsage} />}
                                </div>
                                <p className={`text-2xl font-bold tracking-tight ${isHighUsage ? 'text-red-500' : 'text-white'}`}>{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Status Column */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        Status Systemu
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Monitoring usług wewnętrznych i zewnętrznych
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchHealthStatus(true)}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Odśwież wszystko"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                {/* Internal Services */}
                                {healthData.services.map((service, i) => (
                                    <StatusCard
                                        key={i}
                                        name={service.name}
                                        status={service.status}
                                        latency={service.latency}
                                        type="service"
                                    />
                                ))}

                                {/* External APIs */}
                                <StatusCard
                                    name="Cloudinary"
                                    status={healthData.external.cloudinary.status}
                                    message={healthData.external.cloudinary.message}
                                    type="external"
                                />
                                <StatusCard
                                    name="Nodemailer SMTP"
                                    status={healthData.external.nodemailer.status}
                                    message={healthData.external.nodemailer.message}
                                    type="external"
                                />
                                <StatusCard
                                    name="Pusher"
                                    status={healthData.external.pusher.status}
                                    message={healthData.external.pusher.message}
                                    type="external"
                                />
                                <StatusCard
                                    name="Google Calendar"
                                    status={healthData.external.googleCalendar.status}
                                    message={healthData.external.googleCalendar.message}
                                    type="external"
                                />
                            </div>

                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        </div>

                        {/* Feature Flags V2 */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                                        <ToggleRight className="w-5 h-5 text-purple-500" />
                                        Feature Flags V2
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Zmiany zapisują się automatycznie</p>
                                </div>
                            </div>

                            {flagsLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
                            ) : flagsError ? (
                                <p className="text-red-400 text-sm">{flagsError}</p>
                            ) : featureFlags && (
                                <div className="space-y-4">
                                    {/* Boolean Flags - Redesigned to be cleaner */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { key: 'maintenanceMode', label: 'Tryb Konserwacji', desc: 'Blokuje dostęp do całej strony' },
                                            { key: 'paymentsEnabled', label: 'Płatności Online', desc: 'Włącza system płatności' },
                                            { key: 'bookingsEnabled', label: 'System Rezerwacji', desc: 'Umożliwia nowe rezerwacje' },
                                            { key: 'registrationEnabled', label: 'Rejestracja', desc: 'Pozwala na tworzenie kont' },
                                            { key: 'chatEnabled', label: 'Czat Supportu', desc: 'System czatu na żywo' },
                                            { key: 'maxBookingsEnabled', label: 'Limit Rezerwacji', desc: 'Dzienny limit bezpieczeństwa' }
                                        ].map(({ key, label, desc }) => (
                                            <div
                                                key={key}
                                                onClick={() => updateFlag(key, !featureFlags[key])}
                                                className={`group cursor-pointer flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${featureFlags[key]
                                                    ? (key === 'maintenanceMode' ? 'bg-red-500/10 border-red-500/30' : 'bg-purple-500/10 border-purple-500/30')
                                                    : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600'
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={`text-sm font-bold transition-colors ${featureFlags[key] ? (key === 'maintenanceMode' ? 'text-red-400' : 'text-purple-400') : 'text-gray-300'}`}>
                                                        {label}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{desc}</span>
                                                </div>
                                                <div className={`w-10 h-5 rounded-full transition-all duration-300 relative ${featureFlags[key] ? (key === 'maintenanceMode' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]') : 'bg-gray-700'}`}>
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${featureFlags[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Global Alert Section - Live Update */}
                                    <div className="mt-8 border-t border-gray-800/50 pt-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-500/20 rounded-xl">
                                                    <AlertCircle className="w-5 h-5 text-pink-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold">Alert Globalny</h3>
                                                    <p className="text-xs text-gray-500">Zarządzaj komunikatem dla wszystkich użytkowników</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {featureFlags.announcementEnabled && (
                                                    <button
                                                        onClick={() => updateFlag('announcementEnabled', false)}
                                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-gray-700 transition-all"
                                                    >
                                                        Wyłącz Alert
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        // Save all alert fields together
                                                        setFlagsSaving(true);
                                                        try {
                                                            const updates = {
                                                                announcementEnabled: true,
                                                                announcementText: featureFlags.announcementText,
                                                                announcementType: featureFlags.announcementType
                                                            };
                                                            const res = await fetch('/api/admin/system/feature-flags', {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify(updates)
                                                            });
                                                            if (!res.ok) throw new Error('Błąd zapisu');
                                                            const data = await res.json();
                                                            setFeatureFlags(data.flags);
                                                        } catch (err) {
                                                            console.error('Alert save error:', err);
                                                        } finally {
                                                            setFlagsSaving(false);
                                                        }
                                                    }}
                                                    disabled={flagsSaving || !featureFlags.announcementText}
                                                    className="flex items-center gap-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(219,39,119,0.3)] transition-all"
                                                >
                                                    {flagsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                                                    {featureFlags.announcementEnabled ? 'Aktualizuj Alert' : 'Opublikuj Alert'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                            <div className="lg:col-span-3 space-y-4">
                                                <div className="relative">
                                                    <label className="absolute -top-2 left-3 px-2 bg-gray-900 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Treść Alertu</label>
                                                    <textarea
                                                        value={featureFlags.announcementText || ''}
                                                        onChange={(e) => setFeatureFlags(prev => ({ ...prev, announcementText: e.target.value }))}
                                                        placeholder="Wpisz treść ważnego komunikatu dla wszystkich użytkowników..."
                                                        rows={3}
                                                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-gray-700 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <label className="absolute -top-2 left-3 px-2 bg-gray-900 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Typ Alertu</label>
                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        {['info', 'warning', 'error', 'success'].map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => setFeatureFlags(prev => ({ ...prev, announcementType: type }))}
                                                                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${featureFlags.announcementType === type
                                                                    ? (type === 'info' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' :
                                                                        type === 'warning' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                                                                            type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                                                                                'bg-emerald-500/20 border-emerald-500/50 text-emerald-400')
                                                                    : 'bg-gray-800/30 border-gray-800 text-gray-600 hover:border-gray-700'
                                                                    }`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cache Explorer Section */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col h-[600px]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                                        <Database className="w-5 h-5 text-emerald-500" />
                                        Zaawansowany Cache Explorer
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Przeglądaj i zarządzaj kluczami Redis</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchCacheKeys()}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${cacheLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-1 gap-6 overflow-hidden">
                                {/* Sidebar - Keys List */}
                                <div className="w-1/3 flex flex-col gap-4 border-r border-gray-800 pr-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Szukaj klucza..."
                                            value={cacheSearch}
                                            onChange={(e) => setCacheSearch(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                        {cacheLoading ? (
                                            <div className="text-center py-4 text-gray-500 text-xs">Ładowanie kluczy...</div>
                                        ) : Object.keys(groupedKeys).length === 0 ? (
                                            <div className="text-center py-4 text-gray-500 text-xs">Brak kluczy</div>
                                        ) : (
                                            Object.entries(groupedKeys).map(([prefix, keys]) => (
                                                <div key={prefix}>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 sticky top-0 bg-gray-900 py-1">
                                                        <Folder className="w-3 h-3" />
                                                        {prefix} ({keys.length})
                                                    </div>
                                                    <div className="space-y-1">
                                                        {keys.map(key => (
                                                            <button
                                                                key={key}
                                                                onClick={() => fetchKeyDetails(key)}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-all font-mono ${selectedKey === key
                                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                                                                    }`}
                                                                title={key}
                                                            >
                                                                {key}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Main - Key Details */}
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {selectedKey ? (
                                        <div className="flex-1 flex flex-col gap-4 h-full">
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-800 rounded-lg">
                                                        <Key className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="text-sm font-bold text-white truncate max-w-[300px]" title={selectedKey}>{selectedKey}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            TTL: {keyDetails?.ttl === -1 ? 'Brak (Permanent)' : `${keyDetails?.ttl}s`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteKey(selectedKey)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                    title="Usuń klucz"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex-1 bg-gray-950 rounded-xl p-4 overflow-auto border border-gray-800 relative group">
                                                {keyDetailsLoading ? (
                                                    <div className="flex justify-center items-center h-full">
                                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                                    </div>
                                                ) : (
                                                    <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
                                                        {typeof keyDetails?.value === 'object'
                                                            ? JSON.stringify(keyDetails.value, null, 2)
                                                            : String(keyDetails?.value)
                                                        }
                                                    </pre>
                                                )}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-gray-800 text-[10px] px-2 py-1 rounded text-gray-400">JSON</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4">
                                            <Database className="w-12 h-12 opacity-20" />
                                            <div className="text-center">
                                                <p className="text-sm font-medium">Wybierz klucz z listy</p>
                                                <p className="text-xs opacity-60">Szczegóły pojawią się tutaj</p>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => clearCachePattern('api:*', 'API Cache')}
                                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-400 transition-all border border-gray-700"
                                                >
                                                    Wyczyść Cache API
                                                </button>
                                                <button
                                                    onClick={() => clearCachePattern('session:*', 'Sesje')}
                                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-400 transition-all border border-gray-700"
                                                >
                                                    Wyczyść Sesje
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Tools */}
                    <div className="space-y-6">


                        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Tryb Developerski</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Aktywne środowisko: <span className="text-white font-mono">development</span>
                            </p>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>Next.js v14.0.0</p>
                                <p>React v18.3.0</p>
                                <p>Node {process.version}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

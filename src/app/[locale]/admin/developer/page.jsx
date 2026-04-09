'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Activity, Database, Cpu, HardDrive, Wifi, CheckCircle, XCircle, RefreshCw, ToggleRight, AlertCircle, Loader2, Save, Type, Hash, Megaphone, Trash2, FileText, Folder, Eye, Search, Key, Clock, Shield, Table2, Terminal, Pause, Play } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { pusherClient } from '@/lib/pusher-client';

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

    // --- Logs State ---
    const [logs, setLogs] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const logsEndRef = React.useRef(null);

    const clearLogs = () => setLogs([]);
    const togglePause = () => setIsPaused(!isPaused);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (!isPaused && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isPaused]);

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

    // --- Database Explorer Logic ---
    const [dbStats, setDbStats] = useState([]);
    const [dbLoading, setDbLoading] = useState(false);
    const [integrityIssues, setIntegrityIssues] = useState(null);
    const [integrityLoading, setIntegrityLoading] = useState(false);
    const [queries, setQueries] = useState([]);
    const [queriesLoading, setQueriesLoading] = useState(false);
    const [activeDbTab, setActiveDbTab] = useState('stats'); // stats, integrity, queries

    const fetchDbStats = useCallback(async () => {
        setDbLoading(true);
        try {
            const res = await fetch('/api/admin/database/stats');
            const data = await res.json();
            setDbStats(data.stats || []);
        } catch (err) {
            console.error('DB Stats error:', err);
        } finally {
            setDbLoading(false);
        }
    }, []);

    const runIntegrityCheck = async () => {
        setIntegrityLoading(true);
        try {
            const res = await fetch('/api/admin/database/integrity', { method: 'POST' });
            const data = await res.json();
            setIntegrityIssues(data.issues || []);
        } catch (err) {
            console.error('Integrity check error:', err);
        } finally {
            setIntegrityLoading(false);
        }
    };

    const fetchSlowQueries = useCallback(async () => {
        setQueriesLoading(true);
        try {
            const res = await fetch('/api/admin/database/queries');
            const data = await res.json();
            setQueries(data.queries || []);
        } catch (err) {
            console.error('Queries error:', err);
        } finally {
            setQueriesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeDbTab === 'stats') fetchDbStats();
        if (activeDbTab === 'queries') fetchSlowQueries();
    }, [activeDbTab, fetchDbStats, fetchSlowQueries]);

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

        // Pusher subscription for real-time updates
        const channel = pusherClient.subscribe('admin-stats');

        channel.bind('system-health', (data) => {
            // Update health data directly from Pusher event without polling
            setHealthData(data);

            // Update history logic reused
            if (data.stats) {
                const cpuStat = data.stats.find(s => s.icon === 'Cpu');
                const memStat = data.stats.find(s => s.icon === 'HardDrive');

                setStatsHistory(prev => {
                    const newCpU = [...prev.cpu, { value: cpuStat?.rawValue || 0 }].slice(-15);
                    const newMem = [...prev.memory, { value: memStat?.rawValue || 0 }].slice(-15);
                    return { cpu: newCpU, memory: newMem };
                });
            }
        });

        return () => {
            channel.unbind('system-health');
            pusherClient.unsubscribe('admin-stats');
        };
    }, [fetchHealthStatus, fetchFeatureFlags]);

    // --- Logs Subscription ---
    useEffect(() => {
        const logChannel = pusherClient.subscribe('admin-logs');
        logChannel.bind('log-error', (data) => {
            if (!isPaused) {
                setLogs(prev => [...prev.slice(-99), data]);
            }
        });

        return () => {
            logChannel.unbind('log-error');
            pusherClient.unsubscribe('admin-logs');
        };
    }, [isPaused]);

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

                        {/* Database Explorer Section */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col min-h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                                        <Database className="w-5 h-5 text-blue-500" />
                                        Database Explorer (MongoDB)
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Status, spójność danych i wydajność</p>
                                </div>
                                <div className="flex gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
                                    {[
                                        { id: 'stats', label: 'Statystyki', icon: Table2 },
                                        { id: 'integrity', label: 'Spójność', icon: Shield },
                                        { id: 'queries', label: 'Slow Queries', icon: Activity },
                                        { id: 'logs', label: 'Debugger', icon: Terminal }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveDbTab(tab.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeDbTab === tab.id
                                                ? 'bg-gray-800 text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            <tab.icon className="w-3.5 h-3.5" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {activeDbTab === 'stats' && (
                                    <div className="h-full flex flex-col">
                                        <div className="flex justify-end mb-4">
                                            <button onClick={fetchDbStats} className="text-gray-500 hover:text-white transition-colors">
                                                <RefreshCw className={`w-4 h-4 ${dbLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        {dbLoading ? (
                                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-xl border border-gray-800">
                                                <table className="w-full text-left text-xs bg-gray-950">
                                                    <thead className="bg-gray-900 text-gray-400 font-bold uppercase tracking-wider">
                                                        <tr>
                                                            <th className="p-3">Kolekcja</th>
                                                            <th className="p-3 text-right">Dokumenty</th>
                                                            <th className="p-3 text-right">Rozmiar</th>
                                                            <th className="p-3 text-right">Avg Obj</th>
                                                            <th className="p-3 text-right">Indeksy</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-800 text-gray-300">
                                                        {dbStats.map((stat) => (
                                                            <tr key={stat.name} className="hover:bg-gray-900/50 transition-colors">
                                                                <td className="p-3 font-mono text-blue-400">{stat.name}</td>
                                                                <td className="p-3 text-right font-mono">{stat.count.toLocaleString()}</td>
                                                                <td className="p-3 text-right font-mono">{(stat.size / 1024 / 1024).toFixed(2)} MB</td>
                                                                <td className="p-3 text-right font-mono">{Math.round(stat.avgObjSize)} B</td>
                                                                <td className="p-3 text-right font-mono">{stat.indexes}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeDbTab === 'integrity' && (
                                    <div className="space-y-6">
                                        <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-6 text-center">
                                            <Shield className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                            <h3 className="text-white font-bold mb-1">Sprawdź integralność danych</h3>
                                            <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
                                                Skanuje bazę danych w poszukiwaniu osieroconych rezerwacji, konwersacji bez użytkowników
                                                i innych niespójności logicznych.
                                            </p>
                                            <button
                                                onClick={runIntegrityCheck}
                                                disabled={integrityLoading}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                            >
                                                {integrityLoading ? (
                                                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sprawdzanie...</span>
                                                ) : 'Uruchom Skanowanie'}
                                            </button>
                                        </div>

                                        {integrityIssues && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2 border-l-2 border-blue-500">
                                                    Wyniki skanowania ({integrityIssues.length})
                                                </h3>
                                                {integrityIssues.length === 0 ? (
                                                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="font-bold text-sm">Wszystko wygląda dobrze! Nie znaleziono problemów.</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {integrityIssues.map((issue, i) => (
                                                            <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4">
                                                                <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <h4 className="font-bold text-red-400 text-sm">{issue.type}</h4>
                                                                    <p className="text-gray-300 text-sm mt-1">{issue.message}</p>
                                                                    {issue.details && (
                                                                        <pre className="mt-2 p-2 bg-black/30 rounded border border-red-500/20 text-[10px] font-mono text-gray-400 overflow-x-auto">
                                                                            {JSON.stringify(issue.details, null, 2)}
                                                                        </pre>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeDbTab === 'queries' && (
                                    <div className="h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-xs text-gray-500">
                                                Wymaga włączonego profilowania MongoDB (level 1 lub 2)
                                            </div>
                                            <button onClick={fetchSlowQueries} className="text-gray-500 hover:text-white transition-colors">
                                                <RefreshCw className={`w-4 h-4 ${queriesLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        {queriesLoading ? (
                                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                                        ) : queries.length === 0 ? (
                                            <div className="text-center py-10 text-gray-500 text-sm bg-gray-950 rounded-xl border border-gray-800">
                                                Brak zarejestrowanych wolnych zapytań lub profilowanie wyłączone.
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-xl border border-gray-800">
                                                <table className="w-full text-left text-xs bg-gray-950">
                                                    <thead className="bg-gray-900 text-gray-400 font-bold uppercase tracking-wider">
                                                        <tr>
                                                            <th className="p-3">Data</th>
                                                            <th className="p-3">Operacja</th>
                                                            <th className="p-3">Kolekcja</th>
                                                            <th className="p-3 text-right">Czas (ms)</th>
                                                            <th className="p-3">Query</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-800 text-gray-300">
                                                        {queries.map((q, i) => (
                                                            <tr key={i} className="hover:bg-gray-900/50 transition-colors">
                                                                <td className="p-3 text-gray-500 font-mono">{new Date(q.ts).toLocaleTimeString()}</td>
                                                                <td className="p-3 font-bold text-white">{q.op}</td>
                                                                <td className="p-3 text-blue-400">{q.ns}</td>
                                                                <td className={`p-3 text-right font-mono font-bold ${q.millis > 100 ? 'text-red-500' : 'text-amber-500'}`}>{q.millis}ms</td>
                                                                <td className="p-3 font-mono text-gray-500 max-w-xs truncate" title={JSON.stringify(q.query)}>{JSON.stringify(q.query)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Technical Log Stream Section */}
                        {activeDbTab === 'logs' && (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col min-h-[500px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                                            <Terminal className="w-5 h-5 text-purple-500" />
                                            Debugger (Stream Logów)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">Podgląd błędów serwera w czasie rzeczywistym</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={togglePause}
                                            className={`p-2 rounded-lg border transition-colors ${isPaused ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                                            title={isPaused ? "Wznów stream" : "Zatrzymaj stream"}
                                        >
                                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={clearLogs}
                                            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors"
                                            title="Wyczyść konsolę"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-black rounded-xl border border-gray-800 p-4 font-mono text-xs overflow-y-auto max-h-[600px] shadow-inner font-ligatures-none">
                                    {logs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                            <Terminal className="w-8 h-8 mb-2 opacity-50" />
                                            <p>Oczekiwanie na logi serwera...</p>
                                            <span className="text-[10px] opacity-50 mt-1">Wywołaj błąd backendu, aby zobaczyć output.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {logs.map((log, index) => (
                                                <div key={index} className="group relative pl-3 border-l-2 border-red-500/50 hover:border-red-500 transition-colors">
                                                    <div className="flex items-baseline gap-2 text-[10px] text-gray-500 mb-0.5">
                                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                        <span className="text-red-500 font-bold uppercase">[{log.level}]</span>
                                                    </div>
                                                    <div className="text-gray-300 whitespace-pre-wrap break-words">
                                                        {log.messages.map((msg, i) => {
                                                            // Handle object/error rendering safely
                                                            if (typeof msg === 'object' && msg !== null) {
                                                                if (msg.stack) {
                                                                    return (
                                                                        <details key={i} className="mt-1">
                                                                            <summary className="cursor-pointer text-red-400 hover:text-red-300 font-bold hover:underline decoration-dotted truncate">
                                                                                {msg.message || 'Error Details'}
                                                                            </summary>
                                                                            <pre className="mt-2 p-2 bg-gray-900/50 rounded text-[10px] text-gray-400 overflow-x-auto border border-gray-800">
                                                                                {msg.stack}
                                                                            </pre>
                                                                        </details>
                                                                    );
                                                                }
                                                                return <pre key={i} className="inline-block text-amber-500">{JSON.stringify(msg, null, 2)}</pre>;
                                                            }
                                                            // Fallback for stringified JSON from backend proxy
                                                            try {
                                                                const parsed = JSON.parse(msg);
                                                                if (parsed && parsed.stack) {
                                                                    return (
                                                                        <details key={i} className="mt-1">
                                                                            <summary className="cursor-pointer text-red-400 hover:text-red-300 font-bold hover:underline decoration-dotted truncate">
                                                                                {parsed.message || 'Error Details'}
                                                                            </summary>
                                                                            <pre className="mt-2 p-2 bg-gray-900/50 rounded text-[10px] text-gray-400 overflow-x-auto border border-gray-800">
                                                                                {parsed.stack}
                                                                            </pre>
                                                                        </details>
                                                                    );
                                                                }
                                                                return <span key={i}>{msg} </span>;
                                                            } catch (e) {
                                                                return <span key={i}>{msg} </span>;
                                                            }
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={logsEndRef} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
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

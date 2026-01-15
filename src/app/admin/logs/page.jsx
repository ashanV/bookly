'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
    Search, Filter, User, Clock, AlertCircle, CheckCircle, Info,
    ChevronDown, ChevronUp, ArrowRight, Shield, Database, Layout, Mail
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [filter, setFilter] = useState('all');

    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });


    const [activeTab, setActiveTab] = useState('logs');
    const [timelineEvents, setTimelineEvents] = useState([]);

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs(1);
        } else if (activeTab === 'timeline') {
            fetchTimelineEvents();
        }
    }, [activeTab]);

    const fetchTimelineEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/business/timeline');
            const data = await res.json();
            if (data.success) {
                setTimelineEvents(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
        } finally {
            setLoading(false);
        }
    };



    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/logs?page=${page}&limit=20`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchLogs(newPage);
        }
    };

    const toggleExpand = (id) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };



    const getActionConfig = (action, type) => {
        // Logika kategorii i ikon
        if (action === 'admin_login')
            return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <Shield className="w-4 h-4" />, label: 'LOGOWANIE UDANE' };
        if (action === 'admin_login_failed')
            return { color: 'text-red-400', bg: 'bg-red-500/10', icon: <Shield className="w-4 h-4" />, label: 'LOGOWANIE NIEUDANE' };

        if (action === 'user_registered')
            return { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <User className="w-4 h-4" />, label: 'REJESTRACJA' };
        if (action === 'business_created')
            return { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: <CheckCircle className="w-4 h-4" />, label: 'NOWY BIZNES' };
        if (action === 'client_created')
            return { color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: <User className="w-4 h-4" />, label: 'NOWY KLIENT' };
        if (action === 'employee_created')
            return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: <User className="w-4 h-4" />, label: 'NOWY PRACOWNIK' };

        if (action.includes('create') || action.includes('grant'))
            return { color: 'text-green-400', bg: 'bg-green-500/10', icon: <CheckCircle className="w-4 h-4" />, label: 'UTWORZONO' };
        if (action.includes('update') || action.includes('edit') || action.includes('change'))
            return { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Info className="w-4 h-4" />, label: 'EDYTOWANO' };
        if (action.includes('delete') || action.includes('remove') || action.includes('revoke'))
            return { color: 'text-red-400', bg: 'bg-red-500/10', icon: <AlertCircle className="w-4 h-4" />, label: 'USUNIĘTO' };
        if (action.includes('login') || action.includes('auth'))
            return { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Shield className="w-4 h-4" />, label: 'AUTORYZACJA' };

        return { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: <Database className="w-4 h-4" />, label: 'INFO' };
    };

    const getTargetLink = (type, id) => {
        if (!id) return null;
        switch (type) {
            case 'user': return `/admin/users/${id}`;
            case 'business': return `/admin/businesses/${id}`;
            default: return null;
        }
    };

    const renderPagination = () => {
        const { page, totalPages } = pagination;
        if (totalPages <= 1) return null;

        const pages = [];
        pages.push(1);

        let start = Math.max(2, page - 1);
        let end = Math.min(totalPages - 1, page + 1);

        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);

        return (
            <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4 bg-gray-900/50">
                <div className="text-sm text-gray-500">
                    Strona <span className="text-white font-medium">{page}</span> z <span className="text-white font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Poprzednia
                    </button>

                    {pages.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof p === 'number' ? handlePageChange(p) : null}
                            disabled={p === '...'}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors min-w-[32px] ${p === page
                                ? 'bg-purple-600 text-white'
                                : p === '...'
                                    ? 'text-gray-500 cursor-default'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Następna
                    </button>
                </div>
            </div>
        );
    };

    const renderDiff = (details) => {
        if (!details) return <span className="text-gray-500 italic">Brak szczegółów</span>;

        // Jeśli details ma strukturę diff { old: ..., new: ... }
        if (details.old !== undefined || details.new !== undefined) {
            return (
                <div className="mt-3 bg-gray-950 rounded-lg border border-gray-800 p-4 font-mono text-xs overflow-x-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-red-400 mb-2 font-bold border-b border-gray-800 pb-1">WARTOŚĆ PIERWOTNA</div>
                            <pre className="text-red-300/80 whitespace-pre-wrap">
                                {JSON.stringify(details.old, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <div className="text-green-400 mb-2 font-bold border-b border-gray-800 pb-1">WARTOŚĆ NOWA</div>
                            <pre className="text-green-300/80 whitespace-pre-wrap">
                                {JSON.stringify(details.new, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            );
        }

        // Fallback dla zwykłego tekstu lub obiektu
        return (
            <div className="mt-2 text-gray-400 bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-xs whitespace-pre-wrap">
                {typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
            </div>
        );
    };



    const renderTimeline = () => {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Historia Biznesowa</h3>
                            <p className="text-sm text-gray-500">Kluczowe wydarzenia w cyklu życia firm</p>
                        </div>
                    </div>

                    <div className="relative border-l-2 border-gray-800 ml-4 space-y-8">
                        {timelineEvents.map((event, idx) => {
                            let icon = <Info className="w-4 h-4" />;
                            let color = 'text-gray-400';
                            let bg = 'bg-gray-800';
                            let title = 'Zdarzenie';

                            if (event.action === 'business_created') {
                                icon = <CheckCircle className="w-4 h-4" />;
                                color = 'text-green-400';
                                bg = 'bg-green-500/10';
                                title = 'Nowa Rejestracja Firmy';
                            } else if (event.action === 'business_deleted') {
                                icon = <AlertCircle className="w-4 h-4" />;
                                color = 'text-red-400';
                                bg = 'bg-red-500/10';
                                title = 'Usunięcie Firmy';
                            } else if (event.action === 'payment_success') {
                                icon = <span className="font-bold text-xs">$</span>;
                                color = 'text-emerald-400';
                                bg = 'bg-emerald-500/10';
                                title = 'Płatność Zaakceptowana';
                            } else if (event.action === 'payment_failed') {
                                icon = <AlertCircle className="w-4 h-4" />;
                                color = 'text-red-400';
                                bg = 'bg-red-500/10';
                                title = 'Błąd Płatności';
                            } else if (event.action === 'subscription_cancelled') {
                                icon = <Info className="w-4 h-4" />;
                                color = 'text-orange-400';
                                bg = 'bg-orange-500/10';
                                title = 'Anulowanie Subskrypcji';
                            }

                            return (
                                <div key={event._id || idx} className="relative pl-8">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-gray-900 ${bg} ${color} flex items-center justify-center`}>
                                        {/* Dot */}
                                    </div>
                                    <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${bg} ${color}`}>
                                                    {icon}
                                                </div>
                                                <span className={`font-medium ${color}`}>{title}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(event.timestamp).toLocaleString('pl-PL')}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            <p className="mb-1"><span className="text-gray-500">Firma:</span> {event.details?.companyName || event.userEmail}</p>
                                            {event.details?.city && <p className="mb-1"><span className="text-gray-500">Miasto:</span> {event.details.city}</p>}
                                            {event.details?.amount && <p><span className="text-gray-500">Kwota:</span> {event.details.amount} PLN</p>}
                                            {event.details?.reason && <p><span className="text-gray-500">Powód:</span> {event.details.reason}</p>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {timelineEvents.length === 0 && (
                            <div className="pl-8 text-gray-500 italic">Brak zdarzeń do wyświetlenia.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };



    return (
        <>
            <AdminHeader title="Logi Systemowe" subtitle="Historia aktywności i zdarzeń w systemie" />

            <div className="px-6 border-b border-gray-800">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'logs' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Logi Systemowe
                        {activeTab === 'logs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'timeline' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Business Timeline
                        {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
                    </button>
                </div>
            </div>

            <div className="p-6">
                {activeTab === 'timeline' ? renderTimeline() : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Szukaj po ID, emailu, akcji..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            {/* Placeholder na filtry - do implementacji w przyszłości */}
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden ring-1 ring-white/5">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/80">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Użytkownik</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Akcja</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cel</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Czas</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="h-8 bg-gray-800 rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                Brak logów do wyświetlenia
                                            </td>
                                        </tr>
                                    ) : logs.map(log => {
                                        const config = getActionConfig(log.action);
                                        const targetUrl = getTargetLink(log.targetType, log.targetId);
                                        const isExpanded = expandedLogId === log._id;

                                        return (
                                            <React.Fragment key={log._id}>
                                                <tr
                                                    onClick={() => toggleExpand(log._id)}
                                                    className={`group cursor-pointer transition-colors ${isExpanded ? 'bg-gray-800/40' : 'hover:bg-gray-800/30'}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${config.bg} ${config.color}`}>
                                                            {config.icon}
                                                            {config.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-200 font-medium">{log.userEmail}</span>
                                                            <span className="text-xs text-gray-500 capitalize">{log.userRole}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-300 font-mono">{log.action}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {targetUrl ? (
                                                            <Link
                                                                href={targetUrl}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 hover:underline"
                                                            >
                                                                {log.targetType}
                                                                <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-gray-500 capitalize">
                                                                {log.targetType || '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(log.timestamp).toLocaleString('pl-PL')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="bg-gray-900/30">
                                                        <td colSpan={6} className="px-6 pb-6 pt-0 border-b border-gray-800">
                                                            <div className="pl-4 border-l-2 border-gray-700 ml-2 mt-2">
                                                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Szczegóły operacji</h4>
                                                                {renderDiff(log.details)}

                                                                <div className="mt-4 flex gap-6 text-xs text-gray-600 font-mono">
                                                                    <span>ID: {log._id}</span>
                                                                    {log.ip && <span>IP: {log.ip}</span>}
                                                                    {log.userAgent && <span className="truncate max-w-xs" title={log.userAgent}>UA: {log.userAgent}</span>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {renderPagination()}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}


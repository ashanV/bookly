'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { FileText, Search, Filter, User, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setTimeout(() => {
            setLogs([
                { id: '1', action: 'admin_login', user: 'admin@bookly.pl', role: 'admin', details: 'Logowanie do panelu', timestamp: '2024-05-15T10:30:00', type: 'info' },
                { id: '2', action: 'user_banned', user: 'admin@bookly.pl', role: 'admin', details: 'Zablokowano: jan.kowalski@email.com', timestamp: '2024-05-15T10:25:00', type: 'warning' },
                { id: '3', action: 'business_verified', user: 'mod@bookly.pl', role: 'moderator', details: 'Zweryfikowano: Salon Piękna', timestamp: '2024-05-15T09:45:00', type: 'success' },
                { id: '4', action: 'settings_changed', user: 'admin@bookly.pl', role: 'admin', details: 'Zmiana prowizji: 10% → 12%', timestamp: '2024-05-14T16:30:00', type: 'warning' },
                { id: '5', action: 'cache_cleared', user: 'dev@bookly.pl', role: 'developer', details: 'Wyczyszczono cache Redis', timestamp: '2024-05-14T14:20:00', type: 'info' },
                { id: '6', action: 'role_granted', user: 'admin@bookly.pl', role: 'admin', details: 'Nadano rolę moderator: anna.nowak@email.com', timestamp: '2024-05-14T11:00:00', type: 'success' },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-500/20 text-red-400';
            case 'moderator': return 'bg-orange-500/20 text-orange-400';
            case 'developer': return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <>
            <AdminHeader title="Logi audytu" subtitle="Historia wszystkich akcji administracyjnych" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj w logach..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors">
                        <Filter className="w-4 h-4" />
                        Eksportuj CSV
                    </button>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Akcja</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Użytkownik</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Rola</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Szczegóły</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Ładowanie...</td></tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(log.type)}
                                            <span className="text-white font-mono text-sm">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <User className="w-4 h-4 text-gray-500" />
                                            {log.user}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadge(log.role)}`}>
                                            {log.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{log.details}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Clock className="w-4 h-4" />
                                            {new Date(log.timestamp).toLocaleString('pl-PL')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

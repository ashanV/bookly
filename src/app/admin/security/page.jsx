'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
    Shield, Mail, User, CheckCircle, AlertCircle, Search
} from 'lucide-react';

export default function AdminSecurityPage() {
    const [loading, setLoading] = useState(true);

    // Security Monitor State
    const [securityStats, setSecurityStats] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);

    useEffect(() => {
        const initdata = async () => {
            setLoading(true);
            await Promise.all([fetchSecurityStats(), fetchSessions()]);
            setLoading(false);
        };
        initdata();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/admin/security/sessions');
            const data = await res.json();
            if (data.success) {
                setActiveSessions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    const fetchSecurityStats = async () => {
        try {
            const res = await fetch('/api/admin/security/stats');
            const data = await res.json();
            if (data.success) {
                setSecurityStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch security stats:', error);
        }
    };

    const handleRevokeSession = async (userId) => {
        if (!confirm('Czy na pewno chcesz wylogować tego użytkownika ze wszystkich urządzeń?')) return;

        try {
            const res = await fetch('/api/admin/security/sessions/revoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Sesja została unieważniona.');
                fetchSessions(); // Refresh list
            } else {
                alert('Błąd: ' + data.error);
            }
        } catch (error) {
            console.error('Revoke failed:', error);
            alert('Wystąpił błąd podczas wylogowywania.');
        }
    };

    const renderSessions = () => {
        return (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Aktywni Administratorzy</h3>
                        <p className="text-sm text-gray-500">Zarządzanie sesjami i dostępem administratorów</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSessions.map((session) => (
                        <div key={session._id} className="bg-gray-950/50 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400">
                                            {session.firstName?.charAt(0)}{session.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-200">{session.firstName} {session.lastName}</div>
                                            <div className="text-xs text-gray-500">{session.email}</div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${session.isAdminActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-700/50 text-gray-500'}`}>
                                        {session.isAdminActive ? 'AKTYWNY' : 'OFFLINE'}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Rola:</span>
                                        <span className="text-gray-300 capitalize">{session.adminRole}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Ostatnie logowanie:</span>
                                        <span className="text-gray-300">
                                            {session.lastAdminLogin ? new Date(session.lastAdminLogin).toLocaleString('pl-PL') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">IP:</span>
                                        <span className="text-gray-300 font-mono">{session.lastIp || '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Przeglądarka:</span>
                                        <span className="text-gray-300 truncate max-w-[120px]" title={session.lastUserAgent}>
                                            {session.lastUserAgent ? (session.lastUserAgent.includes('Chrome') ? 'Chrome' : 'Inna') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRevokeSession(session._id)}
                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Shield className="w-3 h-3" />
                                Wyloguj wszędzie
                            </button>
                        </div>
                    ))}
                    {activeSessions.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500 italic">Brak danych o sesjach.</div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <AdminHeader title="Centrum Bezpieczeństwa" subtitle="Monitoring zagrożeń i sesji" />
                <div className="p-6">
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        Ładowanie danych bezpieczeństwa...
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminHeader title="Centrum Bezpieczeństwa" subtitle="Monitoring zagrożeń i sesji" />

            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                {/* Active Sessions Section */}
                {renderSessions()}

                {/* Security Stats Section */}
                {securityStats && (
                    <div className="space-y-6">
                        {/* 1. Failed Logins Map */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Mapa Nieudanych Logowań</h3>
                                    <p className="text-sm text-gray-500">Adresy IP z największą liczbą błędnych prób logowania</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-left">
                                            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Adres IP</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Liczba prób</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Ostatnia próba</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Atakowane konta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {securityStats.failedLogins.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-800/30">
                                                <td className="py-4 font-mono text-red-400">{item._id || 'Nieznane IP'}</td>
                                                <td className="py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold">
                                                        {item.count}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-gray-400">
                                                    {new Date(item.lastAttempt).toLocaleString('pl-PL')}
                                                </td>
                                                <td className="py-4 text-sm text-gray-500">
                                                    {item.emails.join(', ')}
                                                </td>
                                            </tr>
                                        ))}
                                        {securityStats.failedLogins.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-gray-500 italic">Brak podejrzanych aktywności w ostatnim czasie.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 2. PIN Audit */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Historia PINów</h3>
                                        <p className="text-sm text-gray-500">Ostatnio wysłane kody dostępu</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {securityStats.pinAudit.map(log => (
                                        <div key={log._id} className="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg border border-gray-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {log.userRole.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-200">Do: {log.details.targetEmail}</div>
                                                    <div className="text-xs text-gray-500">Przez: {log.userEmail}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 text-right">
                                                <div>{new Date(log.timestamp).toLocaleDateString('pl-PL')}</div>
                                                <div>{new Date(log.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {securityStats.pinAudit.length === 0 && (
                                        <p className="text-center text-gray-500 py-4 text-sm">Brak wysłanych PINów</p>
                                    )}
                                </div>
                            </div>

                            {/* 3. Permission Changes */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Zmiany Uprawnień</h3>
                                        <p className="text-sm text-gray-500">Nadanie i odebranie ról administracyjnych</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {securityStats.permissionChanges.map(log => (
                                        <div key={log._id} className="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg border border-gray-800/50">
                                            <div className="flex items-center gap-3">
                                                {log.action === 'role_granted' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-200">
                                                        {log.action === 'role_granted' ? 'Nadano' : 'Odebrano'}: {log.details.role || log.details.previousRole}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Dla: {log.details.targetEmail}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(log.timestamp).toLocaleDateString('pl-PL')}
                                            </div>
                                        </div>
                                    ))}
                                    {securityStats.permissionChanges.length === 0 && (
                                        <p className="text-center text-gray-500 py-4 text-sm">Brak zmian w uprawnieniach</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

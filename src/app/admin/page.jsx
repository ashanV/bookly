'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
    Users,
    Building2,
    Calendar,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle
} from 'lucide-react';

// Stat Card Component
function StatCard({ title, value, change, changeType, icon: Icon, color }) {
    const isPositive = changeType === 'positive';

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400">{title}</p>
        </div>
    );
}

// Recent Activity Item
function ActivityItem({ action, user, time, type }) {
    const getTypeStyles = () => {
        switch (type) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400';
            case 'error': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="flex items-center gap-4 py-3">
            <div className={`w-2 h-2 rounded-full ${getTypeStyles().split(' ')[0].replace('/20', '')}`}></div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{action}</p>
                <p className="text-xs text-gray-500">{user}</p>
            </div>
            <p className="text-xs text-gray-500 flex-shrink-0">{time}</p>
        </div>
    );
}

export default function AdminDashboardPage() {
    const { adminUser, isAdmin, isModerator, isDeveloper } = useAdminAuth();
    const [stats, setStats] = useState({
        users: 0,
        businesses: 0,
        reservations: 0,
        tickets: 0
    });

    // Mock data - in real app, fetch from API
    useEffect(() => {
        // Simulate loading stats
        setStats({
            users: 1247,
            businesses: 89,
            reservations: 3421,
            tickets: 12
        });
    }, []);

    const recentActivity = [
        { action: 'Nowy użytkownik zarejestrowany', user: 'jan.kowalski@email.com', time: '2 min temu', type: 'success' },
        { action: 'Biznes oczekuje na weryfikację', user: 'Salon Piękna Sp. z o.o.', time: '15 min temu', type: 'warning' },
        { action: 'Zgłoszenie otrzymane', user: 'anna.nowak@email.com', time: '1h temu', type: 'info' },
        { action: 'Rezerwacja anulowana', user: 'piotr.wisniewski@email.com', time: '2h temu', type: 'error' },
        { action: 'Nowa recenzja dodana', user: 'maria.kowalczyk@email.com', time: '3h temu', type: 'success' },
    ];

    return (
        <>
            <AdminHeader
                title="Dashboard"
                subtitle={`Witaj, ${adminUser?.firstName || 'Admin'}!`}
            />

            <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(isAdmin || isModerator) && (
                        <>
                            <StatCard
                                title="Użytkownicy"
                                value={stats.users.toLocaleString()}
                                change={12}
                                changeType="positive"
                                icon={Users}
                                color="bg-blue-600"
                            />
                            <StatCard
                                title="Biznesy"
                                value={stats.businesses}
                                change={5}
                                changeType="positive"
                                icon={Building2}
                                color="bg-purple-600"
                            />
                            <StatCard
                                title="Rezerwacje (miesiąc)"
                                value={stats.reservations.toLocaleString()}
                                change={-3}
                                changeType="negative"
                                icon={Calendar}
                                color="bg-green-600"
                            />
                            <StatCard
                                title="Otwarte zgłoszenia"
                                value={stats.tickets}
                                icon={MessageSquare}
                                color="bg-orange-600"
                            />
                        </>
                    )}

                    {isDeveloper && (
                        <>
                            <StatCard
                                title="API Requests (24h)"
                                value="45.2K"
                                change={8}
                                changeType="positive"
                                icon={TrendingUp}
                                color="bg-cyan-600"
                            />
                            <StatCard
                                title="Avg Response Time"
                                value="124ms"
                                change={-5}
                                changeType="positive"
                                icon={Clock}
                                color="bg-green-600"
                            />
                            <StatCard
                                title="Error Rate"
                                value="0.02%"
                                change={-15}
                                changeType="positive"
                                icon={AlertTriangle}
                                color="bg-red-600"
                            />
                            <StatCard
                                title="Active Sessions"
                                value="892"
                                icon={Users}
                                color="bg-purple-600"
                            />
                        </>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Ostatnia aktywność</h2>
                        <div className="divide-y divide-gray-800">
                            {recentActivity.map((activity, index) => (
                                <ActivityItem key={index} {...activity} />
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            Zobacz wszystkie →
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Szybkie akcje</h2>
                        <div className="space-y-3">
                            {(isAdmin || isModerator) && (
                                <>
                                    <a
                                        href="/admin/users"
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <Users className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm text-gray-300 group-hover:text-white">Zarządzaj użytkownikami</span>
                                    </a>
                                    <a
                                        href="/admin/businesses"
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <Building2 className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm text-gray-300 group-hover:text-white">Weryfikuj biznesy</span>
                                    </a>
                                    <a
                                        href="/admin/support"
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <MessageSquare className="w-5 h-5 text-orange-400" />
                                        <span className="text-sm text-gray-300 group-hover:text-white">Otwarte zgłoszenia</span>
                                    </a>
                                </>
                            )}

                            {isAdmin && (
                                <a
                                    href="/admin/roles"
                                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                                >
                                    <Users className="w-5 h-5 text-red-400" />
                                    <span className="text-sm text-gray-300 group-hover:text-white">Zarządzaj rolami</span>
                                </a>
                            )}

                            {isDeveloper && (
                                <>
                                    <a
                                        href="/admin/developer"
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <Clock className="w-5 h-5 text-cyan-400" />
                                        <span className="text-sm text-gray-300 group-hover:text-white">API Monitor</span>
                                    </a>
                                    <a
                                        href="/admin/logs"
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                        <span className="text-sm text-gray-300 group-hover:text-white">Logi systemowe</span>
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Role info */}
                <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <h3 className="font-medium text-white">Twoja rola: <span className="text-purple-400 capitalize">{adminUser?.adminRole}</span></h3>
                    </div>
                    <p className="text-sm text-gray-400">
                        {isAdmin && 'Masz pełny dostęp do wszystkich funkcji panelu administracyjnego.'}
                        {isModerator && 'Możesz zarządzać użytkownikami, biznesami i obsługiwać zgłoszenia.'}
                        {isDeveloper && 'Masz dostęp do narzędzi deweloperskich, logów i monitoringu API.'}
                    </p>
                </div>
            </div>
        </>
    );
}

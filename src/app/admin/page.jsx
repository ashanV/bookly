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
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/dashboard/stats');
                const data = await response.json();

                if (data.stats) {
                    setStats(data.stats);
                }

                if (data.recentActivity) {
                    setRecentActivity(data.recentActivity.map(log => ({
                        action: formatAction(log.action),
                        user: log.userEmail || 'System',
                        time: getRelativeTime(new Date(log.timestamp)),
                        type: getActionType(log.action)
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper to format action names
    const formatAction = (action) => {
        const formatMap = {
            'user_registered': 'Nowy użytkownik zarejestrowany',
            'business_created': 'Nowy biznes utworzony',
            'business_verified': 'Biznes zweryfikowany',
            'reservation_cancelled': 'Rezerwacja anulowana',
            'ticket_created': 'Zgłoszenie otrzymane',
            'ticket_viewed': 'Zgłoszenie wyświetlone',
            'admin_login': 'Logowanie administratora',
            'admin_login_failed': 'Nieudane logowanie admina'
        };
        return formatMap[action] || action.replace(/_/g, ' ');
    };

    // Helper for relative time
    const getRelativeTime = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} sek. temu`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min. temu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
        return `${Math.floor(diffInSeconds / 86400)} dni temu`;
    };

    // Helper for action type styles
    const getActionType = (action) => {
        if (action.includes('error') || action.includes('failed') || action.includes('cancelled')) return 'error';
        if (action.includes('warning') || action.includes('deleted')) return 'warning';
        if (action.includes('success') || action.includes('registered') || action.includes('created') || action.includes('verified')) return 'success';
        return 'info';
    };

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
                                value={loading ? "..." : stats.users.toLocaleString()}
                                change={12} // To be implemented: calculate real change
                                changeType="positive"
                                icon={Users}
                                color="bg-blue-600"
                            />
                            <StatCard
                                title="Biznesy"
                                value={loading ? "..." : stats.businesses}
                                change={5} // To be implemented
                                changeType="positive"
                                icon={Building2}
                                color="bg-purple-600"
                            />
                            <StatCard
                                title="Rezerwacje (miesiąc)"
                                value={loading ? "..." : stats.reservations.toLocaleString()}
                                change={-3} // To be implemented
                                changeType="negative"
                                icon={Calendar}
                                color="bg-green-600"
                            />
                            <StatCard
                                title="Otwarte zgłoszenia"
                                value={loading ? "..." : stats.tickets}
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
                            {loading ? (
                                <p className="text-gray-400 text-center py-4">Ładowanie...</p>
                            ) : recentActivity.length > 0 ? (
                                recentActivity.map((activity, index) => (
                                    <ActivityItem key={index} {...activity} />
                                ))
                            ) : (
                                <p className="text-gray-400 text-center py-4">Brak ostatniej aktywności</p>
                            )}
                        </div>
                        <a
                            href="/admin/logs"
                            className="block w-full mt-4 py-2 text-sm text-center text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Zobacz wszystkie →
                        </a>
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

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Building2,
    Calendar,
    MessageSquare,
    DollarSign,
    Settings,
    Code,
    FileText,
    Shield,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PERMISSIONS } from '@/lib/adminPermissions';

const menuItems = [
    {
        path: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: null // dostępne dla wszystkich
    },
    {
        path: '/admin/users',
        label: 'Użytkownicy',
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW
    },
    {
        path: '/admin/businesses',
        label: 'Biznesy',
        icon: Building2,
        permission: PERMISSIONS.BUSINESSES_VIEW
    },
    {
        path: '/admin/reservations',
        label: 'Rezerwacje',
        icon: Calendar,
        permission: PERMISSIONS.RESERVATIONS_VIEW
    },
    {
        path: '/admin/support',
        label: 'Zgłoszenia',
        icon: MessageSquare,
        permission: PERMISSIONS.SUPPORT_VIEW
    },
    {
        divider: true
    },
    {
        path: '/admin/finance',
        label: 'Finanse',
        icon: DollarSign,
        permission: PERMISSIONS.FINANCE_VIEW
    },
    {
        path: '/admin/settings',
        label: 'Ustawienia',
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW
    },
    {
        path: '/admin/roles',
        label: 'Role',
        icon: Shield,
        permission: PERMISSIONS.ROLES_VIEW
    },
    {
        divider: true
    },
    {
        path: '/admin/developer',
        label: 'Developer',
        icon: Code,
        permission: PERMISSIONS.DEV_API_MONITOR
    },
    {
        path: '/admin/security',
        label: 'Bezpieczeństwo',
        icon: Shield,
        permission: PERMISSIONS.LOGS_VIEW
    },
    {
        path: '/admin/logs',
        label: 'Logi',
        icon: FileText,
        permission: PERMISSIONS.LOGS_VIEW
    },
];

export default function AdminSidebar({ collapsed, onToggle }) {
    const pathname = usePathname();
    const router = useRouter();
    const { adminUser, hasPermission, adminLogout } = useAdminAuth();

    const handleLogout = async () => {
        await adminLogout();
        router.push('/');
    };

    const getRoleBadge = () => {
        switch (adminUser?.adminRole) {
            case 'admin':
                return { text: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
            case 'moderator':
                return { text: 'Moderator', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
            case 'developer':
                return { text: 'Developer', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
            default:
                return { text: 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
        }
    };

    const roleBadge = getRoleBadge();

    // State for support stats
    const [unreadTickets, setUnreadTickets] = React.useState(0);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/support/stats');
                const data = await res.json();
                if (data.summary?.totalOpen) {
                    setUnreadTickets(data.summary.totalOpen);
                }
            } catch (error) {
                console.error('Failed to fetch sidebar stats:', error);
            }
        };

        if (adminUser) {
            fetchStats();
            const interval = setInterval(fetchStats, 60000);
            return () => clearInterval(interval);
        }
    }, [adminUser]);

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 z-50 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-white truncate">Admin Panel</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                                {roleBadge.text}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {menuItems.map((item, index) => {
                        if (item.divider) {
                            return <li key={`divider-${index}`} className="my-3 border-t border-gray-800" />;
                        }

                        // Check permission
                        if (item.permission && !hasPermission(item.permission)) {
                            return null;
                        }

                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        const isSupport = item.path === '/admin/support';

                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${isActive
                                        ? 'bg-purple-600/20 text-purple-400'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="truncate flex-1 flex items-center justify-between">
                                            {item.label}
                                            {isSupport && unreadTickets > 0 && (
                                                <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                                    {unreadTickets}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                    {collapsed && isSupport && unreadTickets > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-800">
                {/* User info */}
                {!collapsed && adminUser && (
                    <div className="mb-3 px-3 py-2 bg-gray-800/50 rounded-xl">
                        <p className="text-sm font-medium text-white truncate">
                            {adminUser.firstName} {adminUser.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{adminUser.email}</p>
                    </div>
                )}

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    title={collapsed ? 'Wyloguj' : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Wyloguj</span>}
                </button>

                {/* Collapse toggle */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-3 px-3 py-2 mt-2 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm">Zwiń</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}

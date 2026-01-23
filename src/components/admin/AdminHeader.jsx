'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminHeader({ title, subtitle }) {
    const [activeAdmins, setActiveAdmins] = React.useState([]);
    const { adminUser } = useAdminAuth();

    React.useEffect(() => {
        const fetchActiveAdmins = async () => {
            try {
                const res = await fetch('/api/admin/active-admin');
                const data = await res.json();
                if (data.users) {
                    setActiveAdmins(data.users);
                }
            } catch (error) {
                console.error('Failed to fetch active admins:', error);
            }
        };

        fetchActiveAdmins();
        const interval = setInterval(fetchActiveAdmins, 60000); // Update every 60s
        return () => clearInterval(interval);
    }, []);

    const displayedAdmins = React.useMemo(() => {
        if (!adminUser) return activeAdmins;

        const admins = [...activeAdmins];
        const isUserInList = admins.some(u =>
            (u._id && adminUser._id && u._id.toString() === adminUser._id.toString())
        );

        if (!isUserInList && adminUser._id) {
            admins.push({
                ...adminUser,
                role: adminUser.adminRole
            });
        }

        return admins.map(admin => ({
            ...admin,
            isCurrentUser: adminUser._id && admin._id === adminUser._id
        }));
    }, [activeAdmins, adminUser]);

    return (
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Title */}
                <div>
                    <h1 className="text-xl font-bold text-white">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    {/* Active Users Counter */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-gray-800 rounded-full cursor-help hover:bg-gray-800 transition-colors">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-gray-300">
                                {displayedAdmins.length} online
                            </span>
                        </div>

                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-3 border-b border-gray-800">
                                <p className="text-xs font-medium text-gray-400">Aktywni administratorzy</p>
                            </div>
                            <div className="max-h-64 overflow-y-auto py-2">
                                {displayedAdmins.length > 0 ? (
                                    displayedAdmins.map((user, idx) => (
                                        <div key={user._id || idx} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800/50">
                                            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-white truncate">
                                                    {user.firstName} {user.lastName}{user.isCurrentUser && ' (you)'}
                                                </p>
                                                <p className="text-xs text-purple-400 capitalize truncate">
                                                    {user.role}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                        Brak aktywnych
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            className="w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User avatar */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-medium text-white">
                                {adminUser?.firstName} {adminUser?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{adminUser?.adminRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

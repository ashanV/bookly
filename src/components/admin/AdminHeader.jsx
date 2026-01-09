'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminHeader({ title, subtitle }) {
    const { adminUser } = useAdminAuth();

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

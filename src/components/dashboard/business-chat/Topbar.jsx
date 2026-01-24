"use client";

import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Topbar = ({ onMenuClick }) => {
    const pathname = usePathname();

    const getPageTitle = (path) => {
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/calendar')) return 'Kalendarz';
        if (path.includes('/crm')) return 'Klienci';
        if (path.includes('/services')) return 'Usługi';
        if (path.includes('/settings')) return 'Ustawienia';
        return 'Dashboard';
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                    {getPageTitle(pathname)}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar - Hidden on mobile */}
                <div className="hidden md:flex items-center relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input
                        type="text"
                        placeholder="Szukaj..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all w-64"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-full transition-colors">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium text-sm">
                            JD
                        </div>
                        <span className="hidden md:block text-sm font-medium text-gray-700">
                            Jan Doe
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;

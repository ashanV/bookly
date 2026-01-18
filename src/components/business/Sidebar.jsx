"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Scissors,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Store,
    Megaphone,
    DollarSign,
    BookCheck,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/business/dashboard' },
        { name: 'Kalendarz', icon: Calendar, path: '/business/dashboard/calendar' },
        { name: 'Rezerwacje', icon: BookCheck, path: '/business/dashboard/reservations' },
        { name: 'Klienci', icon: Users, path: '/business/dashboard/clients' },
        { name: 'Zespół', icon: Users, path: '/business/dashboard/team' },
        { name: 'Usługi', icon: Scissors, path: '/business/dashboard/services' },
        { name: 'Wiadomości', icon: MessageSquare, path: '/business/messages' },
        { name: 'Marketing', icon: Megaphone, path: '/business/dashboard/marketing' },
        { name: 'Finanse', icon: DollarSign, path: '/business/dashboard/finance' },
        { name: 'Ustawienia', icon: Settings, path: '/business/dashboard/settings' },
    ];

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <motion.aside
            initial={{ width: 260 }}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
            className="h-screen bg-white border-r border-gray-100/50 flex flex-col sticky top-0 z-40 shadow-sm"
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-gray-50">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-xl text-gray-900 whitespace-nowrap"
                            >
                                Bookly
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className="block"
                        >
                            <div
                                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                  ${isActive
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                `}
                            >
                                <item.icon
                                    className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                                    strokeWidth={1.5}
                                />

                                {!isCollapsed && (
                                    <span className="font-medium text-sm whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Button */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;

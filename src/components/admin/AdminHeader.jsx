'use client';

import React from 'react';
import { Bell, Search, User, MessageSquare, LogOut, ChevronDown } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';

export default function AdminHeader({ title, subtitle }) {
    const [activeAdmins, setActiveAdmins] = React.useState([]);
    const { adminUser, adminLogout } = useAdminAuth();
    const router = useRouter();

    // Notifications state
    const [unreadTickets, setUnreadTickets] = React.useState(0);
    const [rawServerCount, setRawServerCount] = React.useState(0);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);

    // Profile state
    const [showProfile, setShowProfile] = React.useState(false);
    const profileRef = React.useRef(null);

    // Search functionality
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showResults, setShowResults] = React.useState(false);
    const searchRef = React.useRef(null);

    const searchablePages = [
        { label: 'Dashboard', path: '/admin', keywords: ['home', 'główna', 'panel'] },
        { label: 'Użytkownicy', path: '/admin/users', keywords: ['users', 'clients', 'klienci'] },
        { label: 'Biznesy', path: '/admin/businesses', keywords: ['business', 'firmy', 'partnerzy'] },
        { label: 'Rezerwacje', path: '/admin/reservations', keywords: ['reservations', 'bookings', 'wizyty'] },
        { label: 'Zgłoszenia', path: '/admin/support', keywords: ['support', 'tickets', 'pomoc', 'kontakt'] },
        { label: 'Finanse', path: '/admin/finance', keywords: ['finance', 'money', 'płatności', 'zarobki'] },
        { label: 'Ustawienia', path: '/admin/settings', keywords: ['settings', 'config', 'konfiguracja'] },
        { label: 'Role', path: '/admin/roles', keywords: ['roles', 'permissions', 'uprawnienia'] },
        { label: 'Developer', path: '/admin/developer', keywords: ['dev', 'api', 'system'] },
        { label: 'Bezpieczeństwo', path: '/admin/security', keywords: ['security', 'security logs', 'zabezpieczenia'] },
        { label: 'Logi', path: '/admin/logs', keywords: ['logs', 'history', 'historia'] },
    ];

    const filteredPages = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return searchablePages.filter(page =>
            page.label.toLowerCase().includes(query) ||
            page.keywords.some(k => k.toLowerCase().includes(query))
        );
    }, [searchQuery]);

    // Search results click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Notifications click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSelect = (path) => {
        router.push(path);
        setSearchQuery('');
        setShowResults(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filteredPages.length > 0) {
            handleSearchSelect(filteredPages[0].path);
        }
    };

    // Helper to get today's storage key
    const getStorageKey = () => {
        const today = new Date().toISOString().split('T')[0];
        return `admin_notif_seen_${today}`;
    };

    const handleNotificationClick = () => {
        router.push('/admin/support');
        setShowNotifications(false);
        // Mark as read immediately on click
        const key = getStorageKey();
        localStorage.setItem(key, rawServerCount.toString());
        setUnreadTickets(0);
    };

    const toggleNotifications = () => {
        const nextState = !showNotifications;
        setShowNotifications(nextState);

        if (nextState) {
            // Opening dropdown - mark as read
            const key = getStorageKey();
            localStorage.setItem(key, rawServerCount.toString());
            setUnreadTickets(0);
        }
    };

    // ... fetch active admins ...

    // Fetch notifications stats
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/support/stats');
                const data = await res.json();
                if (data.summary) {
                    const serverCount = data.summary.newToday || 0;
                    setRawServerCount(serverCount);

                    // Calculate unread based on stored seen count
                    const key = getStorageKey();
                    const storedSeen = parseInt(localStorage.getItem(key) || '0', 10);

                    // If server has MORE than we saw, show difference. 
                    // If server has fewer (maybe deleted?), reset logic or just show 0.
                    const unread = Math.max(0, serverCount - storedSeen);
                    setUnreadTickets(unread);
                }
            } catch (error) {
                console.error('Failed to fetch notification stats:', error);
            }
        };

        if (adminUser) {
            fetchStats();
            const interval = setInterval(fetchStats, 60000); // 1 min
            return () => clearInterval(interval);
        }
    }, [adminUser]);

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
                    <div className="relative hidden md:block" ref={searchRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            onKeyDown={handleKeyDown}
                            className="w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />

                        {/* Search Results Dropdown */}
                        {showResults && searchQuery.trim() && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                {filteredPages.length > 0 ? (
                                    <div className="py-2">
                                        {filteredPages.map((page) => (
                                            <button
                                                key={page.path}
                                                onClick={() => handleSearchSelect(page.path)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-800/50 flex items-center gap-3 transition-colors group"
                                            >
                                                <Search className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                                                <div>
                                                    <p className="text-sm text-gray-200 group-hover:text-white font-medium">{page.label}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{page.path}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        Brak wyników
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={toggleNotifications}
                            className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadTickets > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-400">Powiadomienia</p>
                                    {unreadTickets > 0 && <span className="text-xs font-bold text-red-500">{unreadTickets} nowe</span>}
                                </div>
                                <div className="py-2">
                                    {unreadTickets > 0 ? (
                                        <button
                                            onClick={handleNotificationClick}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-800/50 flex items-start gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">Nowe zgłoszenia</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Masz {unreadTickets} {unreadTickets === 1 ? 'nowe zgłoszenie' : 'nowych zgłoszeń'} dzisiaj.
                                                </p>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="px-4 py-6 text-center">
                                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Bell className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <p className="text-sm text-gray-400">Brak nowych powiadomień</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="relative border-l border-gray-800 pl-4 ml-2" ref={profileRef}>
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-gray-800/50 group"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-gray-900 group-hover:ring-gray-800 transition-all">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                                    {adminUser?.firstName} {adminUser?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{adminUser?.adminRole}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Profile Dropdown */}
                        {showProfile && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-800 bg-gray-800/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate text-lg">
                                                {adminUser?.firstName} {adminUser?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate">{adminUser?.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                                            ${adminUser?.adminRole === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                adminUser?.adminRole === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                                                    adminUser?.adminRole === 'developer' ? 'bg-cyan-500/20 text-cyan-400' :
                                                        'bg-gray-700 text-gray-400'}`}>
                                            {adminUser?.adminRole || 'Rola nieznana'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            adminLogout();
                                            setShowProfile(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors group"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium text-sm">Wyloguj się</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

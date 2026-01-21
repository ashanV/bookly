'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Ban,
    Edit,
    Trash2,
    Eye,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    MoreVertical,
    Shield,
    Briefcase,
    User,
    Clock,
    X,
    Copy,
    Check,
    CreditCard,
    Activity,
    Lock
} from 'lucide-react';

import EditUserModal from '@/components/admin/users/EditUserModal';
import DeleteUserModal from '@/components/admin/users/DeleteUserModal';

import BulkActionsBar from '@/components/admin/users/BulkActionsBar';
import BulkEmailModal from '@/components/admin/users/BulkEmailModal';
import BlockUserModal from '@/components/admin/users/BlockUserModal';
import UnblockUserModal from '@/components/admin/users/UnblockUserModal';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });

    // Selection State
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    // Modals State
    const [selectedUser, setSelectedUser] = useState(null); // For single actions
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Block Modal
    const [blockModalState, setBlockModalState] = useState({ isOpen: false, user: null, count: 0 });
    // Unblock Modal
    const [unblockModalState, setUnblockModalState] = useState({ isOpen: false, user: null, count: 0 });
    // Delete Modal
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, user: null, count: 0 });

    // Bulk Email Modal
    const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);

    // ... (filters state) ...

    // Bulk Action Handlers
    const handleBulkBlockClick = () => {
        setBlockModalState({ isOpen: true, user: null, count: selectedUsers.size });
    };

    const handleBulkBlockConfirm = async (reason) => {
        for (const userId of selectedUsers) {
            await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: false, blockReason: reason || 'Masowa blokada przez administratora' })
            });
        }
        fetchUsers();
        setSelectedUsers(new Set());
        setBlockModalState({ isOpen: false, user: null, count: 0 });
    };

    const handleBulkUnblockClick = () => {
        setUnblockModalState({ isOpen: true, user: null, count: selectedUsers.size });
    };

    const handleBulkUnblockConfirm = async () => {
        for (const userId of selectedUsers) {
            await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: true })
            });
        }
        fetchUsers();
        setSelectedUsers(new Set());
        setUnblockModalState({ isOpen: false, user: null, count: 0 });
    };

    const handleBulkDeleteClick = () => {
        setDeleteModalState({ isOpen: true, user: null, count: selectedUsers.size });
    };

    const handleBulkDeleteConfirm = async (singleUserId, type) => {
        // If singleUserId is passed (from single delete modal), use it. Otherwise iterate selectedUsers.
        const idsToDelete = singleUserId ? [singleUserId] : Array.from(selectedUsers);

        for (const userId of idsToDelete) {
            await fetch(`/api/admin/users/${userId}?type=${type}`, { method: 'DELETE' });
        }
        fetchUsers();
        setSelectedUsers(new Set());
        setDeleteModalState({ isOpen: false, user: null, count: 0 });
    };

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        adminRole: 'all',
        dateFrom: '',
        dateTo: '',
        lastActive: 'all'
    });

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const activeFilterCount = Object.values(filters).filter(val => val !== 'all' && val !== '').length;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch,
                sort: `${sort.field}:${sort.order}`,
                ...filters
            });

            for (const [key, value] of Object.entries(filters)) {
                if (value === 'all' || value === '') {
                    params.delete(key);
                }
            }

            const res = await fetch(`/api/admin/users?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            setUsers(data.users);
            setPagination(prev => ({ ...prev, ...data.pagination }));
            // Clear selection on page change or filter change to avoid confusion
            setSelectedUsers(new Set());
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, sort, debouncedSearch, filters]);


    const handleSort = (field) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const resetFilters = () => {
        setFilters({
            status: 'all',
            type: 'all',
            adminRole: 'all',
            dateFrom: '',
            dateTo: '',
            lastActive: 'all'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedUsers.size === users.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(u => u.id)));
        }
    };

    const toggleSelectUser = (userId) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Bulk Action Handlers


    const handleBulkExport = () => {
        const selectedData = users.filter(u => selectedUsers.has(u.id));
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Imię,Nazwisko,Email,Telefon,Rola,Status\n"
            + selectedData.map(u => `${u.id},${u.firstName},${u.lastName},${u.email},${u.phone || ''},${u.role},${u.isActive ? 'Aktywny' : 'Zablokowany'}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkEmailSend = async (subject, message) => {
        await fetch('/api/admin/users/bulk/email', {
            method: 'POST',
            body: JSON.stringify({
                userIds: Array.from(selectedUsers),
                subject,
                message
            })
        });
        alert('Wiadomości zostały wysłane.');
        setSelectedUsers(new Set());
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        fetchUsers(); // Refresh list to show updates
    };

    const handleDeleteClick = (user, e) => {
        e.stopPropagation();
        setDeleteModalState({ isOpen: true, user: user, count: 1 });
    }



    const SortIcon = ({ field }) => {
        if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-50" />;
        return <ArrowUpDown className={`w-3 h-3 ${sort.order === 'asc' ? 'text-purple-400' : 'text-purple-400'}`} />;
    };

    const CopyButton = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button onClick={handleCopy} className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-500 hover:text-white" title="Kopiuj">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans pb-24">
            <AdminHeader
                title="Management"
                subtitle="Users"
            />

            <div className="max-w-[1600px] mx-auto p-6 space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Użytkownicy</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Zarządzaj dostępem i rolami dla {pagination.total} użytkowników
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative group w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Szukaj użytkownika..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-[#131B2C] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all ${showFilters || activeFilterCount > 0
                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                    : 'bg-[#131B2C] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filtry</span>
                                {activeFilterCount > 0 && (
                                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-purple-500 text-white rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Filter Panel */}
                    {showFilters && (
                        <div className="bg-[#131B2C] border border-gray-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase">Status Konta</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="all">Wszyscy</option>
                                    <option value="active">Aktywny</option>
                                    <option value="blocked">Zablokowany</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase">Typ Użytkownika</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="all">Wszyscy</option>
                                    <option value="client">Klient</option>
                                    <option value="business">Biznes</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase">Rola Admina</label>
                                <select
                                    value={filters.adminRole}
                                    onChange={(e) => setFilters(prev => ({ ...prev, adminRole: e.target.value, page: 1 }))}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="all">Wszyscy</option>
                                    <option value="none">Brak (Użytkownik)</option>
                                    <option value="admin">Administrator</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="developer">Developer</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase">Ostatnia Aktywność</label>
                                <select
                                    value={filters.lastActive}
                                    onChange={(e) => setFilters(prev => ({ ...prev, lastActive: e.target.value, page: 1 }))}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="all">Wszyscy</option>
                                    <option value="today">Dzisiaj</option>
                                    <option value="7days">Ostatnie 7 dni</option>
                                    <option value="30days">Ostatnie 30 dni</option>
                                    <option value="inactive">Nieaktywni</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase">Od Data Rej.</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value, page: 1 }))}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase">Do Data Rej.</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value, page: 1 }))}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3 lg:col-span-6 flex justify-end mt-2 pt-2 border-t border-gray-800/50">
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-3 h-3" /> Wyczyść filtry
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                {/* Table Container */}
                <div className="bg-[#131B2C] border border-gray-800/60 rounded-xl overflow-hidden shadow-xl shadow-black/20">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800/60 bg-[#161F32]">
                                    <th className="w-[4%] px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={users.length > 0 && selectedUsers.size === users.length}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-700 bg-[#0B0F19] text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                                        />
                                    </th>
                                    <th className="w-[35%] px-6 py-4">
                                        <button
                                            onClick={() => handleSort('lastName')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                                        >
                                            Użytkownik
                                            <SortIcon field="lastName" />
                                        </button>
                                    </th>
                                    <th className="w-[20%] px-6 py-4">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Rola & Status
                                        </div>
                                    </th>
                                    <th className="w-[20%] px-6 py-4">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Kontakt
                                        </div>
                                    </th>
                                    <th className="w-[15%] px-6 py-4">
                                        <button
                                            onClick={() => handleSort('createdAt')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                                        >
                                            Aktywność
                                            <SortIcon field="createdAt" />
                                        </button>
                                    </th>
                                    <th className="w-[10%] px-6 py-4 text-right">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Akcje</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-gray-800/50 text-purple-400 text-sm animate-pulse">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                                Wczytywanie danych...
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            Brak użytkowników spełniających kryteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className={`group border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors ${selectedUsers.has(user.id) ? 'bg-purple-900/10' : ''}`}>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                    className="w-4 h-4 rounded border-gray-700 bg-[#0B0F19] text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-white/5 flex items-center justify-center text-sm font-medium text-white shadow-inner shrink-0">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 items-start">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${user.role === 'business'
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                                        : user.role === 'admin'
                                                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {user.role === 'business' && <Briefcase className="w-3 h-3" />}
                                                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                        {user.role === 'client' && <User className="w-3 h-3" />}
                                                        {user.role === 'business' ? 'Biznes' : user.role === 'admin' ? 'Administrator' : 'Klient'}
                                                    </span>

                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></span>
                                                        <span className={user.isActive ? 'text-gray-400' : 'text-red-400'}>
                                                            {user.isActive ? 'Aktywne konto' : 'Zablokowany'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {user.phone ? (
                                                    <div className="text-sm text-gray-300 font-mono tracking-wide">
                                                        {user.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-600 italic">Brak numeru</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-gray-400" title="Data rejestracji">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    {user.lastAdminLogin && (
                                                        <div className="flex items-center gap-2 text-xs text-purple-400/80" title="Ostatnie logowanie (Admin)">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(user.lastAdminLogin).toLocaleDateString('pl-PL', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                        title="Szczegóły"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedUser(user);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                        title="Edytuj"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(user, e)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Usuń"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-800/60 bg-[#161F32] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Pokaż</span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                                className="bg-[#0B0F19] border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-500">na stronę</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 mr-2">
                                Strona <span className="text-white font-medium">{pagination.page}</span> z {pagination.totalPages}
                            </span>
                            <div className="flex rounded-lg bg-[#0B0F19] border border-gray-800 overflow-hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-gray-800"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BulkActionsBar
                selectedCount={selectedUsers.size}
                onClearSelection={() => setSelectedUsers(new Set())}
                onBlock={handleBulkBlockClick}
                onUnblock={handleBulkUnblockClick}
                onDelete={handleBulkDeleteClick}
                onExport={handleBulkExport}
                onEmail={() => setIsBulkEmailOpen(true)}
            />

            <BulkEmailModal
                isOpen={isBulkEmailOpen}
                onClose={() => setIsBulkEmailOpen(false)}
                selectedCount={selectedUsers.size}
                onSend={handleBulkEmailSend}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSuccess={handleEditSuccess}
            />

            <DeleteUserModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, user: null, count: 0 })}
                user={deleteModalState.user}
                onConfirm={handleBulkDeleteConfirm}
                count={deleteModalState.count}
            />

            <BlockUserModal
                isOpen={blockModalState.isOpen}
                onClose={() => setBlockModalState({ isOpen: false, user: null, count: 0 })}
                user={blockModalState.user}
                onConfirm={handleBulkBlockConfirm}
                count={blockModalState.count}
            />

            <UnblockUserModal
                isOpen={unblockModalState.isOpen}
                onClose={() => setUnblockModalState({ isOpen: false, user: null, count: 0 })}
                user={unblockModalState.user}
                onConfirm={handleBulkUnblockConfirm}
                count={unblockModalState.count}
            />
        </div>
    );
}

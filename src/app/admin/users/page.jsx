'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
    Search,
    Filter,
    MoreVertical,
    Ban,
    Edit,
    Trash2,
    Eye,
    Mail,
    Phone,
    Calendar,
    Shield
} from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Mock data - replace with actual API call
    useEffect(() => {
        setTimeout(() => {
            setUsers([
                { id: '1', firstName: 'Jan', lastName: 'Kowalski', email: 'jan.kowalski@email.com', phone: '+48 123 456 789', createdAt: '2024-01-15', isActive: true, role: 'client' },
                { id: '2', firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@email.com', phone: '+48 987 654 321', createdAt: '2024-02-20', isActive: true, role: 'client' },
                { id: '3', firstName: 'Piotr', lastName: 'Wiśniewski', email: 'piotr.wisniewski@email.com', phone: '+48 555 666 777', createdAt: '2024-03-10', isActive: false, role: 'client' },
                { id: '4', firstName: 'Maria', lastName: 'Zielińska', email: 'maria.zielinska@email.com', phone: '+48 111 222 333', createdAt: '2024-04-05', isActive: true, role: 'business' },
                { id: '5', firstName: 'Tomasz', lastName: 'Lewandowski', email: 'tomasz.lewandowski@email.com', phone: '+48 444 555 666', createdAt: '2024-05-12', isActive: true, role: 'client' },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <AdminHeader
                title="Użytkownicy"
                subtitle={`${users.length} użytkowników w systemie`}
            />

            <div className="p-6 space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj użytkownika..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filtry</span>
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Użytkownik</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Email</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Telefon</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Typ</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Data rejestracji</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Ładowanie...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Nie znaleziono użytkowników
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    {user.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'business'
                                                        ? 'bg-purple-500/20 text-purple-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {user.role === 'business' ? 'Biznes' : 'Klient'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${user.isActive
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {user.isActive ? 'Aktywny' : 'Zablokowany'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Podgląd">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edytuj">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors" title="Zablokuj">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Usuń">
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
                </div>
            </div>
        </>
    );
}

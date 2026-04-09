'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Shield, UserPlus, Search, Trash2, Mail, Clock, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCsrf } from '@/hooks/useCsrf';

export default function AdminRolesPage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const { isAdmin } = useAdminAuth();
    const { secureFetch } = useCsrf();

    // Fetch admins
    const fetchAdmins = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/roles', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.admins || []);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleRemoveRole = async (userId, userName) => {
        if (!confirm(`Czy na pewno chcesz usunąć rolę dla ${userName}?`)) return;

        try {
            const response = await secureFetch(`/api/admin/roles?userId=${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setAdmins(prev => prev.filter(a => a._id !== userId));
            } else {
                const data = await response.json();
                alert(data.error || 'Błąd usuwania roli');
            }
        } catch (error) {
            alert('Błąd połączenia z serwerem');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return { text: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
            case 'moderator': return { text: 'Moderator', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
            case 'developer': return { text: 'Developer', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
            default: return { text: role, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
        }
    };

    const filteredAdmins = admins.filter(a =>
        `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <AdminHeader title="Zarządzanie rolami" subtitle="Administratorzy, moderatorzy i developerzy" />

            <div className="p-6 space-y-6">
                {/* Add button */}
                <div className="flex justify-between items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            Dodaj osobę
                        </button>
                    )}
                </div>

                {/* Admins list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        </div>
                    ) : filteredAdmins.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            {searchQuery ? 'Nie znaleziono pasujących osób' : 'Brak osób z rolami administracyjnymi'}
                        </div>
                    ) : filteredAdmins.map(admin => {
                        const badge = getRoleBadge(admin.adminRole);
                        return (
                            <div key={admin._id?.toString() || admin.email} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {admin.firstName?.[0] || '?'}{admin.lastName?.[0] || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{admin.firstName} {admin.lastName}</h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>
                                                {badge.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Mail className="w-4 h-4" />
                                        {admin.email}
                                    </div>
                                    {admin.lastAdminLogin && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            Ostatnie logowanie: {new Date(admin.lastAdminLogin).toLocaleString('pl-PL')}
                                        </div>
                                    )}
                                </div>

                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRemoveRole(admin._id || admin.id, `${admin.firstName} ${admin.lastName}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Usuń rolę
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Role descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { role: 'Admin', color: 'border-red-500/30 bg-red-500/5', desc: 'Pełny dostęp do wszystkich funkcji systemu, włącznie z zarządzaniem finansami i rolami.' },
                        { role: 'Moderator', color: 'border-orange-500/30 bg-orange-500/5', desc: 'Zarządzanie użytkownikami, biznesami, zgłoszeniami i recenzjami. Brak dostępu do finansów.' },
                        { role: 'Developer', color: 'border-green-500/30 bg-green-500/5', desc: 'Dostęp do narzędzi deweloperskich, logów systemowych, feature flags i monitoringu API.' },
                    ].map(r => (
                        <div key={r.role} className={`border rounded-2xl p-4 ${r.color}`}>
                            <h4 className="font-medium text-white mb-2">{r.role}</h4>
                            <p className="text-sm text-gray-400">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Person Modal */}
            {showAddModal && (
                <AddPersonModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newAdmin) => {
                        setAdmins(prev => [...prev, newAdmin]);
                        setShowAddModal(false);
                    }}
                />
            )}
        </>
    );
}

// Add Person Modal Component
function AddPersonModal({ onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('moderator');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { secureFetch } = useCsrf();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await secureFetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, role })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(data.user);
                }, 2000);
            } else {
                setError(data.error || 'Wystąpił błąd');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserPlus className="w-5 h-5 text-white" />
                        <h2 className="text-lg font-semibold text-white">Dodaj osobę</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                {success ? (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Rola nadana!</h3>
                        <p className="text-gray-400">PIN został wysłany na adres email użytkownika.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email użytkownika</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jan.kowalski@email.com"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500">Użytkownik musi mieć już konto w systemie</p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Rola</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'admin', label: 'Admin', color: 'text-red-400 border-red-500/50' },
                                    { value: 'moderator', label: 'Moderator', color: 'text-orange-400 border-orange-500/50' },
                                    { value: 'developer', label: 'Developer', color: 'text-green-400 border-green-500/50' },
                                ].map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${role === r.value
                                            ? `${r.color} bg-gray-800`
                                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                            <p className="text-sm text-purple-300">
                                <strong>📧 PIN zostanie wysłany</strong> na podany email. Użytkownik użyje go do logowania do panelu admin.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Dodawanie...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Dodaj i wyślij PIN
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

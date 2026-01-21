'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Star,
    Shield,
    CheckCircle,
    Globe,
    Phone,
    Mail,
    Calendar,
    Users,
    Briefcase,
    User,
    Loader2,
    Trash2,
    LayoutDashboard,
    Eye,
    Lock,
    Edit,
    Ban,
    Clock,
    CreditCard,
    Activity,
    Copy,
    Check,
    AlertTriangle,
    Laptop,
    Smartphone,
    Monitor,
    History,
    UserPlus
} from 'lucide-react';

import EditUserModal from '@/components/admin/users/EditUserModal';
import BlockUserModal from '@/components/admin/users/BlockUserModal';
import UnblockUserModal from '@/components/admin/users/UnblockUserModal';
import DeleteUserModal from '@/components/admin/users/DeleteUserModal';
import ResetPasswordModal from '@/components/admin/ResetPasswordModal';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState({ activeSessions: [], history: [] });
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Block Modal State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

    // Unblock Modal State
    const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Reset Password Modal State
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/admin/users/${id}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error(error);
            router.push('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await fetch(`/api/admin/users/${id}/sessions`);
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    const fetchTimeline = async () => {
        try {
            const response = await fetch(`/api/admin/users/${id}/timeline`);
            if (response.ok) {
                const data = await response.json();
                setTimelineEvents(data.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id, router]);

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchSessions();
        }
    }, [activeTab, id]);

    useEffect(() => {
        if (activeTab === 'timeline') {
            fetchTimeline();
        }
    }, [activeTab, id]);

    const handleEditSuccess = () => {
        fetchUser();
    };

    const handleBlockUser = async (reason) => {
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: false,
                    blockReason: reason,
                    // API will handle session invalidation automatically when isActive -> false
                })
            });

            if (!response.ok) throw new Error('Failed to block user');

            setIsBlockModalOpen(false);
            fetchUser();
            if (activeTab === 'sessions') fetchSessions();
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    const handleUnblockUser = async () => {
        if (!confirm('Czy na pewno chcesz odblokować tego użytkownika?')) return;

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: true
                })
            });

            if (!response.ok) throw new Error('Failed to unblock user');

            fetchUser();
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    const handleForceLogout = async () => {
        if (!confirm('Czy na pewno chcesz wylogować wszystkie sesje tego użytkownika?')) return;

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invalidateSessions: true
                })
            });

            if (!response.ok) throw new Error('Failed to logout user sessions');
            fetchUser();
            if (activeTab === 'sessions') fetchSessions();
            alert('Wszystkie sesje użytkownika zostały zakończone.');
        } catch (error) {
            console.error('Error logging out sessions:', error);
        }
    }

    const handleRevokeSession = async (sessionId) => {
        if (!confirm('Czy na pewno chcesz wylogować tę sesję?')) return;

        try {
            const response = await fetch(`/api/admin/users/${id}/sessions`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            if (response.ok) {
                fetchSessions();
            } else {
                alert('Nie udało się wylogować sesji');
            }
        } catch (error) {
            console.error('Error revoking session:', error);
        }
    };

    const handleResetPasswordConfirm = async (action) => {
        const response = await fetch(`/api/admin/users/${id}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to reset password');
        }
        return await response.json();
    };

    const handleDeleteUser = async (userId, type) => {
        const response = await fetch(`/api/admin/users/${userId}?type=${type}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete user');
        }

        router.push('/admin/users');
    };


    const HandleCopy = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button onClick={handleCopy} className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-500 hover:text-white" title="Kopiuj">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
        );
    };

    const getDeviceIcon = (type) => {
        if (type === 'Mobile') return <Smartphone className="w-5 h-5" />;
        if (type === 'Tablet') return <Smartphone className="w-5 h-5" />; // Tablet icon could be clearer but smartphone is ok
        return <Monitor className="w-5 h-5" />;
    };

    // Helper to render icon
    const getEventIcon = (iconName) => {
        switch (iconName) {
            case 'UserPlus': return <UserPlus className="w-4 h-4" />;
            case 'Edit': return <Edit className="w-4 h-4" />;
            case 'Ban': return <Ban className="w-4 h-4" />;
            case 'CheckCircle': return <CheckCircle className="w-4 h-4" />;
            case 'Shield': return <Shield className="w-4 h-4" />;
            case 'Calendar': return <Calendar className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f111a] text-white font-sans">
            {/* Header / Banner Area */}
            <div className="relative h-64 w-full">
                {/* Abstract Banner */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40">
                    <div className="absolute inset-0 bg-[#0f111a]/20 backdrop-blur-3xl"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/40 to-transparent"></div>

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => router.push('/admin/users')}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 rounded-xl text-white backdrop-blur-md transition-all group border border-white/5"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Wróć do listy</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 pb-12">

                {/* Main Identity Card */}
                <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-[#0f111a] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl shadow-purple-900/20">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            {user.isActive ? (
                                <div className="p-1.5 bg-[#0f111a] rounded-full">
                                    <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0f111a] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            ) : (
                                <div className="p-1.5 bg-[#0f111a] rounded-full">
                                    <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-[#0f111a] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 pt-4 md:pt-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{user.firstName} {user.lastName}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                                    <span className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-medium text-sm ${user.stats.isBusinessOwner
                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        {user.stats.isBusinessOwner ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        {user.stats.isBusinessOwner ? 'Partner Biznesowy' : 'Klient Indywidualny'}
                                    </span>
                                    <span className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                        <HandleCopy text={user.email} />
                                    </span>
                                    <span className="flex items-center gap-2 text-sm font-mono text-gray-500">
                                        ID: {user.id}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edytuj
                                </button>
                                {user.isActive ? (
                                    <button
                                        onClick={() => setIsBlockModalOpen(true)}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <Ban className="w-4 h-4" />
                                        Zablokuj
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsUnblockModalOpen(true)}
                                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Odblokuj
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Przegląd
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline'
                            ? 'border-pink-500 text-pink-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Oś Czasu
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'security'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Bezpieczeństwo
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'sessions'
                            ? 'border-amber-500 text-amber-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Laptop className="w-4 h-4" />
                        Sesje
                    </button>
                    {user.stats.isBusinessOwner && (
                        <button
                            onClick={() => router.push('/admin/businesses')} // Redirect or filtered list? For now just example
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-gray-200 transition-colors whitespace-nowrap"
                        >
                            <Briefcase className="w-4 h-4" />
                            Szczegóły Firmy
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Highlights Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                            <div className="p-6 bg-[#131B2C] border border-gray-800/60 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Rezerwacje</span>
                                </div>
                                <div className="text-3xl font-bold text-white pl-1">{user.stats.reservations}</div>
                            </div>
                            <div className="p-6 bg-[#131B2C] border border-gray-800/60 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Dołączono</span>
                                </div>
                                <div className="text-2xl font-bold text-white pl-1">
                                    {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                </div>
                            </div>
                            <div className="p-6 bg-[#131B2C] border border-gray-800/60 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Status</span>
                                </div>
                                <div className={`text-xl font-bold pl-1 ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                    {user.isActive ? 'Aktywne Konto' : 'Zablokowane'}
                                </div>
                            </div>
                        </div>

                        {/* Recent Reservations Table (New) */}
                        <div className="lg:col-span-3">
                            <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    Ostatnie Rezerwacje
                                </h3>

                                {user.lastReservations && user.lastReservations.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                                                    <th className="py-3 font-medium">Firma</th>
                                                    <th className="py-3 font-medium">Usługa</th>
                                                    <th className="py-3 font-medium">Pracownik</th>
                                                    <th className="py-3 font-medium">Data</th>
                                                    <th className="py-3 font-medium">Płatność</th>
                                                    <th className="py-3 font-medium text-right">Cena</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/30 text-sm">
                                                {user.lastReservations.map((res) => (
                                                    <tr key={res._id} className="group hover:bg-gray-800/20 transition-colors">
                                                        <td className="py-4 font-medium text-white">{res.businessName}</td>
                                                        <td className="py-4 text-gray-300">{res.service}</td>
                                                        <td className="py-4 text-gray-400">{res.employeeName}</td>
                                                        <td className="py-4 text-gray-400">
                                                            {new Date(res.date).toLocaleDateString('pl-PL')}
                                                            <span className="ml-2 text-xs text-gray-600">{res.time}</span>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/50 rounded-lg text-xs font-medium text-gray-300 w-fit">
                                                                <CreditCard className="w-3 h-3" />
                                                                <span className="capitalize">{res.paymentMethod || 'Gotówka'}</span>
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-right font-mono text-white">{res.price} PLN</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                                        Ten użytkownik nie posiada jeszcze żadnych rezerwacji.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Left Column: Personal Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-400" />
                                    Dane Osobowe
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Imię i Nazwisko</label>
                                        <div className="text-white font-medium text-lg">{user.firstName} {user.lastName}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Email</label>
                                        <div className="text-white font-medium text-lg flex items-center gap-2">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Telefon</label>
                                        <div className="text-white font-medium text-lg">{user.phone || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Data Urodzenia</label>
                                        <div className="text-white font-medium text-lg">{user.birthDate || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {user.stats.isBusinessOwner && (
                                <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-purple-400" />
                                        Informacje Biznesowe
                                    </h3>
                                    <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Nazwa Firmy</div>
                                            <div className="text-xl font-bold text-white">{user.businessName}</div>
                                        </div>
                                        <button className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                            Zobacz Profil
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Mini Logs? */}
                        <div className="space-y-6">
                            <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    Szybki Podgląd
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-800/50">
                                        <span className="text-gray-400 text-sm">Weryfikacja Email</span>
                                        <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
                                            <CheckCircle className="w-4 h-4" /> Zweryfikowany
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-800/50">
                                        <span className="text-gray-400 text-sm">Rola Systemowa</span>
                                        <span className="text-white text-sm font-medium capitalize">
                                            {user.adminRole || 'Użytkownik'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Ostatnie Logowanie</span>
                                        <span className="text-white text-sm font-medium">
                                            {user.lastAdminLogin ? new Date(user.lastAdminLogin).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-pink-500" />
                                Historia Aktywności
                            </h3>

                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                                {timelineEvents.map((event, idx) => (
                                    <div key={event.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                        {/* Icon */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-800 bg-[#0f111a] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-gray-400 group-hover:text-white group-hover:border-pink-500/50 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all duration-300">
                                            {getEventIcon(event.icon)}
                                        </div>

                                        {/* Card */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900/40 p-5 rounded-2xl border border-gray-800/50 hover:border-pink-500/30 hover:bg-gray-900/60 transition-all duration-300">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-white">{event.title}</div>
                                                <time className="font-mono text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</time>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{event.description}</div>
                                            {event.by && (
                                                <div className="text-xs text-gray-600 border-t border-gray-800 pt-2 mt-2">
                                                    Przez: {event.by}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {timelineEvents.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        Brak zarejestrowanej aktywności.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8 max-w-4xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-500" />
                            Dziennik Bezpieczeństwa
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-black/20 rounded-xl border border-gray-800">
                                    <div className="text-sm text-gray-500 mb-1">Ostatni adres IP</div>
                                    <div className="text-lg font-mono text-white">{user.lastIp || 'Brak danych'}</div>
                                </div>
                                <div className="p-4 bg-black/20 rounded-xl border border-gray-800">
                                    <div className="text-sm text-gray-500 mb-1">User Agent</div>
                                    <div className="text-sm text-gray-300 break-all">{user.lastUserAgent || 'Brak danych'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Akcje Konta</h4>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsResetPasswordModalOpen(true)}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 text-sm"
                                    >
                                        Resetuj hasło
                                    </button>
                                    <button
                                        onClick={handleForceLogout}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors text-sm"
                                    >
                                        Usuń wszystkie sesje
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 rounded-lg transition-colors text-sm flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Usuń konto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Active Sessions */}
                        <div className="space-y-6">
                            <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Laptop className="w-5 h-5 text-amber-500" />
                                        Aktywne Sesje
                                    </h3>
                                    <button
                                        onClick={handleForceLogout}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-medium"
                                    >
                                        Wyloguj ze wszystkich
                                    </button>
                                </div>

                                {sessions.activeSessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {sessions.activeSessions.map((session) => (
                                            <div key={session._id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                                        {getDeviceIcon(session.deviceType)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">
                                                            {session.browser} na {session.os}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                            {session.ip}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRevokeSession(session._id)}
                                                    className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                                                >
                                                    Wyloguj
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                                        Brak aktywnych sesji
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Session History */}
                        <div className="space-y-6">
                            <div className="bg-[#131B2C] border border-gray-800/60 rounded-3xl p-8">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                                    <History className="w-5 h-5 text-gray-400" />
                                    Historia Logowań
                                </h3>

                                {sessions.history.length > 0 ? (
                                    <div className="space-y-0 divide-y divide-gray-800">
                                        {sessions.history.map((session) => (
                                            <div key={session._id} className="py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                                    <div>
                                                        <div className="text-sm text-gray-300">
                                                            {new Date(session.createdAt).toLocaleDateString('pl-PL')}
                                                            <span className="text-gray-500 ml-2 text-xs">
                                                                {new Date(session.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {session.browser} • {session.os}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600 font-mono">
                                                    {session.ip}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Brak historii logowań
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSuccess={handleEditSuccess}
            />

            <BlockUserModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                user={user}
                onConfirm={handleBlockUser}
            />

            <UnblockUserModal
                isOpen={isUnblockModalOpen}
                onClose={() => setIsUnblockModalOpen(false)}
                user={user}
                onConfirm={handleUnblockUser}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                user={user}
                onConfirm={handleDeleteUser}
            />

            <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={() => setIsResetPasswordModalOpen(false)}
                targetName={`${user.firstName} ${user.lastName}`}
                targetEmail={user.email}
                onConfirm={handleResetPasswordConfirm}
            />
        </div >
    );
}




'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import ReservationsStats from '../../../components/admin/reservations/ReservationsStats';
import {
    Search, Filter, Calendar, Clock, User, Building2, XCircle, Eye,
    ChevronLeft, ChevronRight, ArrowUpDown, CheckSquare, Square,
    MoreVertical, CreditCard, ExternalLink, Edit2, Trash2, Mail, Phone
} from 'lucide-react';

export default function AdminReservationsPage() {
    // State
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20);
    const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
    const [selectedReservations, setSelectedReservations] = useState([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch Data
    const fetchReservations = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort: `${sort.field}:${sort.order}`,
                search: searchQuery,
                status: statusFilter
            });

            const res = await fetch(`/api/admin/reservations?${queryParams}`);
            const data = await res.json();

            if (res.ok) {
                setReservations(data.reservations);
                setTotalPages(data.pagination.totalPages);
            } else {
                console.error('Failed to fetch reservations:', data.error);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => fetchReservations(), 300);
        return () => clearTimeout(timeoutId);
    }, [page, sort, searchQuery, statusFilter]);

    // Handlers
    const handleSort = (field) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    };

    const toggleSelectAll = () => {
        if (selectedReservations.length === reservations.length) {
            setSelectedReservations([]);
        } else {
            setSelectedReservations(reservations.map(r => r.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedReservations(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20 decoration-slice';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const StatusBadge = ({ status }) => {
        const labels = {
            completed: 'Zrealizowane',
            confirmed: 'Potwierdzone',
            pending: 'Oczekujące',
            cancelled: 'Anulowane'
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusStyle(status)}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Rezerwacje" subtitle="Panel zarządzania rezerwacjami" />

            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto w-full">
                <ReservationsStats />

                {/* Main Content Card */}
                <div className="bg-[#0f111a] border border-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-320px)] min-h-[500px]">

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 p-3 border-b border-gray-800 bg-[#13151f]">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Szukaj (klient, nr ref)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-[#0a0b10] border border-gray-700 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-[#0a0b10] border border-gray-700 text-gray-300 text-xs rounded-md px-3 py-1.5 focus:border-purple-500 focus:outline-none cursor-pointer"
                            >
                                <option value="all">Wszystkie statusy</option>
                                <option value="pending">Oczekujące</option>
                                <option value="confirmed">Potwierdzone</option>
                                <option value="completed">Zrealizowane</option>
                                <option value="cancelled">Anulowane</option>
                            </select>

                            <button className="p-1.5 border border-gray-700 rounded-md hover:bg-gray-800 text-gray-400 transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto custom-scrollbar bg-[#0f111a]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#13151f] sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-3 py-3 w-[40px] text-center border-b border-gray-800">
                                        <button onClick={toggleSelectAll} className="flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                                            {selectedReservations.length === reservations.length && reservations.length > 0 ? (
                                                <CheckSquare className="w-4 h-4 text-purple-500" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
                                    {[
                                        { label: 'Klient', key: 'client', width: '25%' },
                                        { label: 'Szczegóły wizyty', key: 'date', width: '25%' },
                                        { label: 'Usługa & Pracownik', key: 'service', width: '20%' },
                                        { label: 'Płatność', key: 'price', width: '15%' },
                                        { label: 'Status', key: 'status', width: '10%' },
                                        { label: '', key: 'actions', width: '5%' }
                                    ].map((col) => (
                                        <th
                                            key={col.key}
                                            className="px-3 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800"
                                            style={{ width: col.width }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs text-gray-500">Ładowanie rezerwacji...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reservations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center text-gray-500 text-sm">
                                            Brak rezerwacji spełniających kryteria wyszukiwania.
                                        </td>
                                    </tr>
                                ) : (
                                    reservations.map((res) => (
                                        <tr
                                            key={res.id}
                                            className={`group hover:bg-[#161822] transition-colors ${selectedReservations.includes(res.id) ? 'bg-purple-500/5' : ''}`}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-3 py-3 text-center align-top">
                                                <button onClick={() => toggleSelect(res.id)} className="mt-1 text-gray-600 hover:text-white transition-colors">
                                                    {selectedReservations.includes(res.id) ? (
                                                        <CheckSquare className="w-4 h-4 text-purple-500" />
                                                    ) : (
                                                        <Square className="w-4 h-4 group-hover:text-gray-500" />
                                                    )}
                                                </button>
                                            </td>

                                            {/* Client Info (Combined) */}
                                            <td className="px-3 py-3 align-top">
                                                <div className="flex gap-3">
                                                    <div className="w-9 h-9 min-w-[36px] rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center text-gray-300 font-bold text-xs uppercase shadow-sm">
                                                        {res.clientName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium text-gray-200 truncate pr-2" title={res.clientName}>
                                                            {res.clientName}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="truncate" title={res.clientEmail}>{res.clientEmail}</span>
                                                        </div>
                                                        <div className="mt-1.5">
                                                            <span className="text-[10px] font-mono text-gray-600 bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5">
                                                                #{res.referenceNumber?.substring(0, 8) || '---'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date & Time (Combined) */}
                                            <td className="px-3 py-3 align-top">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                        {new Date(res.date).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pl-5.5">
                                                        <Clock className="w-3 h-3" />
                                                        {res.time} <span className="text-gray-600">•</span> {res.duration} min
                                                    </div>
                                                    {res.business && (
                                                        <Link href={`/admin/businesses/${res.business.id}`} className="flex items-center gap-1.5 mt-2 pl-0.5 group/biz">
                                                            <Building2 className="w-3.5 h-3.5 text-gray-600 group-hover/biz:text-purple-400 transition-colors" />
                                                            <span className="text-[11px] text-gray-500 group-hover/biz:text-gray-300 transition-colors truncate max-w-[150px]">
                                                                {res.business.name}
                                                            </span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Service & Employee */}
                                            <td className="px-3 py-3 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm text-gray-300 truncate" title={res.service}>
                                                        {res.service}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                        <User className="w-3 h-3 text-gray-600" />
                                                        {res.employee ? `${res.employee.firstName} ${res.employee.lastName}` : 'Nieprzypisany'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Price & Payment */}
                                            <td className="px-3 py-3 align-top">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-sm font-semibold text-gray-200">
                                                        {formatCurrency(res.price)}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-gray-800/50 border border-gray-800">
                                                        <CreditCard className="w-3 h-3 text-gray-500" />
                                                        <span className="text-[10px] text-gray-500 uppercase">{res.paymentMethod || 'Gotówka'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3 align-top">
                                                <StatusBadge status={res.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-3 align-top text-right">
                                                <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors" title="Podgląd">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Akcja">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="border-t border-gray-800 bg-[#13151f] p-3 flex items-center justify-between z-10">
                        <div className="text-[11px] text-gray-500">
                            Wyświetlono <span className="text-gray-300 font-medium">{reservations.length}</span> z <span className="text-gray-300">{selectedReservations.length > 0 ? `(Zaznaczono ${selectedReservations.length})` : 248}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500 mr-2">
                                Strona {page} z {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

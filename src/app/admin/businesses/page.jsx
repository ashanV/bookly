'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import {
    Search,
    Filter,
    ArrowUpDown,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    Star,
    MoreVertical,
    Mail,
    Phone,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { debounce } from 'lodash';

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('date_desc');

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                status: statusFilter,
                verified: verifiedFilter,
                sort: sortOrder
            });

            const response = await fetch(`/api/admin/businesses?${params}`);
            const data = await response.json();

            setBusinesses(data.businesses);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch businesses:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter, verifiedFilter, sortOrder]);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((query) => {
            setSearchQuery(query);
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
        }, 500),
        []
    );

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'status') setStatusFilter(value);
        if (filterType === 'verified') setVerifiedFilter(value);
        if (filterType === 'sort') setSortOrder(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <>
            <AdminHeader
                title="Lista Partnerów"
                description="Zarządzaj firmami, monitoruj status weryfikacji i przeglądaj statystyki."
            />

            <div className="p-6">
                {/* Visual Indicators/Stats (Optional, could be added later) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* ... stats placeholders or removed if not specs ... */}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col xl:flex-row gap-4 mb-8 items-start xl:items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                    <div className="relative w-full xl:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Szukaj firmy, emaila, telefonu..."
                            className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-950 border border-gray-800 text-gray-300 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-purple-500 cursor-pointer hover:border-gray-700 transition-colors"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                value={statusFilter}
                            >
                                <option value="all">Wszystkie statusy</option>
                                <option value="active">Aktywne</option>
                                <option value="blocked">Zablokowane</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                        </div>

                        {/* Verified Filter */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-950 border border-gray-800 text-gray-300 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-purple-500 cursor-pointer hover:border-gray-700 transition-colors"
                                onChange={(e) => handleFilterChange('verified', e.target.value)}
                                value={verifiedFilter}
                            >
                                <option value="all">Weryfikacja</option>
                                <option value="verified">Zweryfikowane</option>
                                <option value="pending">Niezweryfikowane</option>
                            </select>
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-950 border border-gray-800 text-gray-300 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-purple-500 cursor-pointer hover:border-gray-700 transition-colors"
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                value={sortOrder}
                            >
                                <option value="date_desc">Od najnowszych</option>
                                <option value="date_asc">Od najstarszych</option>
                                <option value="rating_desc">Ocena (najwyższa)</option>
                                <option value="rating_asc">Ocena (najniższa)</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
                        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Brak wyników</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Nie znaleziono firm spełniających kryteria wyszukiwania. Spróbuj zmienić filtry lub wpisać inną frazę.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
                        {businesses.map((biz) => (
                            <div key={biz._id} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-900/10 group flex flex-col">
                                {/* Card Header / Cover */}
                                <div className="h-32 bg-gray-800 relative">
                                    {biz.bannerImage ? (
                                        <>
                                            <img src={biz.bannerImage} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {biz.isBlocked ? (
                                            <div className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md border bg-red-600/20 text-red-400 border-red-500/30 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                ZABLOKOWANY
                                            </div>
                                        ) : (
                                            <div className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md border ${biz.isActive
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                {biz.isActive ? 'Aktywny' : 'Nieaktywny'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mt-4 mb-4">
                                        {biz.profileImage ? (
                                            <img src={biz.profileImage} alt="Logo" className="w-20 h-20 rounded-xl border-4 border-gray-900 bg-gray-800 object-cover shadow-lg" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-xl border-4 border-gray-900 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                {biz.companyName.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        {biz.isVerified && (
                                            <div className="mt-11" title="Zweryfikowany">
                                                <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors" title={biz.companyName}>
                                        {biz.companyName}
                                    </h3>
                                    <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-gray-800 rounded text-xs border border-gray-700">
                                            {biz.category}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                        <span className="truncate max-w-[120px]" title={biz.city}>{biz.city}</span>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-400 mb-6 bg-gray-950/30 p-3 rounded-xl border border-gray-800/50">
                                        <div className="flex items-center gap-2" title="Ocena">
                                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                                            <span className="text-gray-300 font-medium">{biz.averageRating}</span>
                                            <span className="text-xs text-gray-600">({biz.reviewsCount})</span>
                                        </div>
                                        <div className="flex items-center gap-2" title="Dołączył">
                                            <Clock className="w-3.5 h-3.5 text-gray-600" />
                                            <span className="text-xs">{new Date(biz.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2 truncate" title={biz.email}>
                                            <Mail className="w-3.5 h-3.5 text-gray-600" />
                                            <span className="text-xs truncate">{biz.email}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto"></div>

                                    {/* Footer / Actions */}
                                    <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
                                        <Link
                                            href={`/admin/businesses/${biz._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-purple-900/20"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Szczegóły
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && businesses.length > 0 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="text-sm text-gray-400 font-medium px-4">
                            Strona <span className="text-white">{pagination.page}</span> z {pagination.totalPages}
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

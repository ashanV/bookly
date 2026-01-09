'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    MapPin,
    Star,
    Calendar,
    Clock
} from 'lucide-react';

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setTimeout(() => {
            setBusinesses([
                { id: '1', name: 'Salon Piękna', category: 'Fryzjer', city: 'Warszawa', rating: 4.8, reviews: 124, verified: true, createdAt: '2024-01-10' },
                { id: '2', name: 'Beauty Studio', category: 'Kosmetyka', city: 'Kraków', rating: 4.5, reviews: 89, verified: true, createdAt: '2024-02-15' },
                { id: '3', name: 'Barber Shop Pro', category: 'Barber', city: 'Gdańsk', rating: 4.9, reviews: 256, verified: true, createdAt: '2024-02-20' },
                { id: '4', name: 'Nowy Salon', category: 'Fryzjer', city: 'Poznań', rating: 0, reviews: 0, verified: false, createdAt: '2024-05-01' },
                { id: '5', name: 'Masaż & SPA', category: 'SPA', city: 'Wrocław', rating: 4.7, reviews: 67, verified: false, createdAt: '2024-04-28' },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const filteredBusinesses = businesses.filter(biz => {
        const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            biz.city.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'verified' && biz.verified) ||
            (filter === 'pending' && !biz.verified);
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <AdminHeader
                title="Biznesy"
                subtitle={`${businesses.filter(b => !b.verified).length} oczekuje na weryfikację`}
            />

            <div className="p-6 space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj biznesu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'verified', 'pending'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm transition-colors ${filter === f
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {f === 'all' && 'Wszystkie'}
                                {f === 'verified' && 'Zweryfikowane'}
                                {f === 'pending' && 'Oczekujące'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Businesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-gray-500">Ładowanie...</div>
                    ) : filteredBusinesses.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">Nie znaleziono biznesów</div>
                    ) : (
                        filteredBusinesses.map(biz => (
                            <div key={biz.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-white">{biz.name}</h3>
                                        <p className="text-sm text-gray-400">{biz.category}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${biz.verified
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {biz.verified ? 'Zweryfikowany' : 'Oczekuje'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        {biz.city}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        {biz.rating > 0 ? `${biz.rating} (${biz.reviews} opinii)` : 'Brak opinii'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(biz.createdAt).toLocaleDateString('pl-PL')}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors text-sm">
                                        <Eye className="w-4 h-4" />
                                        Podgląd
                                    </button>
                                    {!biz.verified && (
                                        <>
                                            <button className="p-2 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors" title="Zatwierdź">
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors" title="Odrzuć">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

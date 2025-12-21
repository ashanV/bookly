import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Star, Phone, Mail, Tag, X, ArrowUpDown, ChevronDown } from 'lucide-react';

export default function ClientList({ onSelectClient, selectedClientId }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);

    // Mock data for clients
    const clients = [
        {
            id: 1,
            firstName: 'Anna',
            lastName: 'Kowalska',
            email: 'anna.kowalska@example.com',
            phone: '+48 123 456 789',
            avatar: 'AK',
            tags: ['VIP', 'Stały klient'],
            lastVisit: '2023-11-15',
            totalSpent: 1250,
            visits: 12,
            rating: 5,
            notes: 'Preferuje kawę z mlekiem owsianym. Uczulenie na orzechy.',
            status: 'active'
        },
        {
            id: 2,
            firstName: 'Jan',
            lastName: 'Nowak',
            email: 'jan.nowak@example.com',
            phone: '+48 987 654 321',
            avatar: 'JN',
            tags: ['Nowy'],
            lastVisit: '2023-11-10',
            totalSpent: 150,
            visits: 1,
            rating: 4,
            notes: '',
            status: 'active'
        },
        {
            id: 3,
            firstName: 'Maria',
            lastName: 'Wiśniewska',
            email: 'maria.wisniewska@example.com',
            phone: '+48 555 666 777',
            avatar: 'MW',
            tags: ['Problematic'],
            lastVisit: '2023-10-05',
            totalSpent: 450,
            visits: 3,
            rating: 3,
            notes: 'Często spóźnia się na wizyty.',
            status: 'active'
        },
        {
            id: 4,
            firstName: 'Piotr',
            lastName: 'Zieliński',
            email: 'piotr.zielinski@example.com',
            phone: '+48 111 222 333',
            avatar: 'PZ',
            tags: ['VIP'],
            lastVisit: '2023-11-18',
            totalSpent: 3200,
            visits: 24,
            rating: 5,
            notes: 'Zawsze rezerwuje na 2 godziny.',
            status: 'active'
        },
        {
            id: 5,
            firstName: 'Katarzyna',
            lastName: 'Lewandowska',
            email: 'katarzyna.lewandowska@example.com',
            phone: '+48 444 555 666',
            avatar: 'KL',
            tags: [],
            lastVisit: '2023-09-20',
            totalSpent: 80,
            visits: 1,
            rating: 0,
            notes: '',
            status: 'inactive'
        }
    ];

    // Get all unique tags from clients
    const allTags = [...new Set(clients.flatMap(c => c.tags))];

    // Filter and sort clients
    const filteredClients = clients
        .filter(client => {
            // Search filter
            const matchesSearch = !searchTerm ||
                client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.includes(searchTerm);

            // Status filter
            const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

            // Tag filter
            const matchesTag = !tagFilter || client.tags.includes(tagFilter);

            return matchesSearch && matchesStatus && matchesTag;
        })
        .sort((a, b) => {
            let aValue = '';
            let bValue = '';

            switch (sortBy) {
                case 'name':
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                    break;
                case 'spent':
                    return sortOrder === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
                case 'visits':
                    return sortOrder === 'asc' ? a.visits - b.visits : b.visits - a.visits;
                case 'rating':
                    return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
                default:
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            }

            return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setTagFilter('');
        setSortBy('name');
        setSortOrder('asc');
    };

    const activeFiltersCount = [
        searchTerm,
        statusFilter !== 'all' ? statusFilter : null,
        tagFilter
    ].filter(Boolean).length;

    return (
        <div className="flex flex-col h-full">
            {/* Search and Filter Header */}
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Szukaj klienta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 py-2 px-3 ${activeFiltersCount > 0 ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-600 border-slate-200'} hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors border w-full`}
                        >
                            <Filter size={16} />
                            Filtry {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilters && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-20">
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="all">Wszyscy</option>
                                        <option value="active">Aktywni</option>
                                        <option value="inactive">Nieaktywni</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tag</label>
                                    <select
                                        value={tagFilter}
                                        onChange={(e) => setTagFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="">Wszystkie tagi</option>
                                        {allTags.map((tag, idx) => (
                                            <option key={idx} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sortuj wg</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        >
                                            <option value="name">Nazwa</option>
                                            <option value="spent">Wydatki</option>
                                            <option value="visits">Wizyty</option>
                                            <option value="rating">Ocena</option>
                                        </select>
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
                                        >
                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                        </button>
                                    </div>
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        Wyczyść wszystkie filtry
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="flex items-center justify-center gap-2 py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-violet-200">
                        <Plus size={16} />
                        Dodaj
                    </button>
                </div>

                {/* Active Filter Badges */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                                "{searchTerm}"
                                <X size={12} className="cursor-pointer" onClick={() => setSearchTerm('')} />
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {statusFilter === 'active' ? 'Aktywni' : 'Nieaktywni'}
                                <X size={12} className="cursor-pointer" onClick={() => setStatusFilter('all')} />
                            </span>
                        )}
                        {tagFilter && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                {tagFilter}
                                <X size={12} className="cursor-pointer" onClick={() => setTagFilter('')} />
                            </span>
                        )}
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    onClick={() => onSelectClient(client)}
                                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors group ${selectedClientId === client.id ? 'bg-violet-50 hover:bg-violet-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${selectedClientId === client.id
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-md transition-all'
                                            }`}>
                                            {client.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`font-semibold truncate ${selectedClientId === client.id ? 'text-violet-900' : 'text-slate-900'
                                                    }`}>
                                                    {client.firstName} {client.lastName}
                                                </h3>
                                                {client.rating > 0 && (
                                                    <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                                        <Star size={10} fill="currentColor" />
                                                        {client.rating}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {client.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${tag === 'VIP' ? 'bg-amber-100 text-amber-700' :
                                                            tag === 'Problematic' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-4">
                            <Search size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">Nie znaleziono klientów</p>
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center font-medium">
                    {filteredClients.length} / {clients.length} klientów • {clients.filter(c => c.tags.includes('VIP')).length} VIP
                </div>
            </div>
        </div>
    );
}

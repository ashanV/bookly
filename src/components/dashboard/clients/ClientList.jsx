import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Loader2, ArrowDownUp, Minus, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, onConfirm, count, isDeleting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={24} className="text-red-600" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Usuń {count > 1 ? `${count} klientów` : 'klienta'}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                    Czy na pewno chcesz usunąć {count > 1 ? `wybranych ${count} klientów` : 'wybranego klienta'}?
                    Ta operacja jest nieodwracalna i wszystkie powiązane dane zostaną trwale usunięte.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        Usuń
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ClientList({ onSelectClient, selectedClientId, businessId, onClientCountChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [selectedClients, setSelectedClients] = useState([]);
    const [showBulkEditDropdown, setShowBulkEditDropdown] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // API state
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch clients from API
    const fetchClients = async () => {
        if (!businessId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                businessId,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(tagFilter && { tag: tagFilter }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await fetch(`/api/clients?${params.toString()}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setClients(data.clients || []);
            } else {
                const data = await response.json();
                setError(data.error || 'Błąd pobierania klientów');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchClients, 300);
        return () => clearTimeout(timer);
    }, [businessId, searchTerm, statusFilter, tagFilter]);

    // Update client count when clients change
    useEffect(() => {
        if (onClientCountChange) {
            onClientCountChange(clients.length);
        }
    }, [clients.length, onClientCountChange]);

    // Get all unique tags from clients
    const allTags = [...new Set(clients.flatMap(c => c.tags || []))];

    // Sort clients
    const sortedClients = [...clients].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
                const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
                return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
            case 'totalSpent':
                return sortOrder === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
            case 'createdAt':
                const aDate = new Date(a.createdAt);
                const bDate = new Date(b.createdAt);
                return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
            default:
                return 0;
        }
    });

    const toggleSelectAll = () => {
        if (selectedClients.length === sortedClients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(sortedClients.map(c => c.id));
        }
    };

    const toggleSelectClient = (id) => {
        setSelectedClients(prev =>
            prev.includes(id)
                ? prev.filter(cid => cid !== id)
                : [...prev, id]
        );
    };

    const clearSelection = () => {
        setSelectedClients([]);
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            // Delete each selected client
            for (const clientId of selectedClients) {
                await fetch(`/api/clients/${clientId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            }
            setSelectedClients([]);
            setShowDeleteModal(false);
            fetchClients(); // Refresh list
        } catch (err) {
            setError('Błąd podczas usuwania klientów');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const day = date.getDate();
        const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const sortOptions = [
        { value: 'createdAt', label: 'Data utworzenia (od najnowszej)', order: 'desc' },
        { value: 'createdAt', label: 'Data utworzenia (od najstarszej)', order: 'asc' },
        { value: 'name', label: 'Nazwa (A-Z)', order: 'asc' },
        { value: 'name', label: 'Nazwa (Z-A)', order: 'desc' },
        { value: 'totalSpent', label: 'Sprzedaż (od najwyższej)', order: 'desc' },
        { value: 'totalSpent', label: 'Sprzedaż (od najniższej)', order: 'asc' },
    ];

    const currentSortLabel = sortOptions.find(
        opt => opt.value === sortBy && opt.order === sortOrder
    )?.label || 'Data utworzenia (od najnowszej)';

    const isAllSelected = selectedClients.length === sortedClients.length && sortedClients.length > 0;
    const isSomeSelected = selectedClients.length > 0 && selectedClients.length < sortedClients.length;

    return (
        <div className="flex flex-col">
            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                count={selectedClients.length}
                isDeleting={isDeleting}
            />

            {/* Selection Action Bar - appears when items are selected */}
            {selectedClients.length > 0 && (
                <div className="flex items-center justify-between mb-4 py-3 px-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        {/* Checkbox indicator */}
                        <button
                            onClick={toggleSelectAll}
                            className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center hover:bg-violet-700 transition-colors"
                        >
                            <Minus size={14} className="text-white" />
                        </button>

                        {/* Selection count */}
                        <span className="text-sm text-slate-700">
                            wybrano {selectedClients.length}
                        </span>

                        {/* Deselect link */}
                        <button
                            onClick={clearSelection}
                            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                        >
                            Odznacz
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Bulk Edit Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkEditDropdown(!showBulkEditDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Edycja zbiorcza
                                <ChevronDown size={14} />
                            </button>

                            {showBulkEditDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowBulkEditDropdown(false)} />
                                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20 w-48">
                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            Dodaj tag
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            Usuń tag
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            Zmień status
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={handleDeleteClick}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                            Usuń
                        </button>
                    </div>
                </div>
            )}

            {/* Search and Filter Row - hide when selection is active */}
            {selectedClients.length === 0 && (
                <div className="flex items-center gap-3 mb-6">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Imię i nazwisko, adres e-mail li..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all text-sm"
                        />
                    </div>

                    {/* Filters Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <SlidersHorizontal size={16} />
                            Filtry
                        </button>

                        {showFilters && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                                <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-20 w-64">
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
                                    {allTags.length > 0 && (
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
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {currentSortLabel}
                            <ArrowDownUp size={14} />
                        </button>

                        {showSortDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20 w-72">
                                    {sortOptions.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setSortOrder(option.order);
                                                setShowSortDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${sortBy === option.value && sortOrder === option.order
                                                    ? 'text-violet-600 font-medium'
                                                    : 'text-slate-700'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[40px_1fr_180px_100px_100px_140px] gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                                if (el) el.indeterminate = isSomeSelected;
                            }}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                    </div>
                    <div>Imię i nazwisko klienta</div>
                    <div>Numer telefonu komórkowego</div>
                    <div className="text-center">Opinie</div>
                    <div className="text-center">Sprzedaż</div>
                    <div className="flex items-center gap-1">
                        Utworzono
                        <ChevronDown size={12} className={sortBy === 'createdAt' ? 'text-slate-900' : 'text-slate-400'} />
                    </div>
                </div>

                {/* Table Body */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-violet-600 mb-2" />
                        <p className="text-sm text-slate-500">Ładowanie klientów...</p>
                    </div>
                ) : sortedClients.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {sortedClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => onSelectClient(client)}
                                className={`grid grid-cols-[40px_1fr_180px_100px_100px_140px] gap-4 px-4 py-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedClientId === client.id ? 'bg-violet-50' : ''
                                    } ${selectedClients.includes(client.id) ? 'bg-violet-50/50' : ''}`}
                            >
                                {/* Checkbox */}
                                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.includes(client.id)}
                                        onChange={() => toggleSelectClient(client.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                    />
                                </div>

                                {/* Name and Email */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm flex-shrink-0">
                                        {client.avatar || `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900 truncate">
                                            {client.firstName} {client.lastName}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate">
                                            {client.email || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center text-sm text-slate-600">
                                    {client.phone || '-'}
                                </div>

                                {/* Reviews */}
                                <div className="flex items-center justify-center text-sm text-slate-600">
                                    {client.rating > 0 ? client.rating : '-'}
                                </div>

                                {/* Sales */}
                                <div className="flex items-center justify-center text-sm text-slate-600">
                                    {client.totalSpent > 0 ? `${client.totalSpent} zł` : '0 zł'}
                                </div>

                                {/* Created Date */}
                                <div className="flex items-center text-sm text-slate-600">
                                    {formatDate(client.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm mb-4">Nie znaleziono klientów</p>
                        <Link
                            href="/business/dashboard/clients/add"
                            className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            Dodaj pierwszego klienta
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="py-4 text-center text-sm text-slate-500">
                Wyświetlasz {sortedClients.length > 0 ? '1' : '0'}–{sortedClients.length} z {clients.length} wyników
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Store, ChevronDown, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/Toast';
import { canAddLocation, getLimitErrorMessage } from '@/lib/subscriptionLimits';
import LocationDetails from './LocationDetails';

export default function LocationsSection({
    businessId,
    businessName,
    address,
    city,
    phone: businessPhone,
    avgRating = 0,
    reviewCount = 0,
    onBack,
    onSidebarClick,
    onAddClick,
    activeTab = 'locations'
}) {
    const [showDropdown, setShowDropdown] = React.useState(null);
    const [showHeaderDropdown, setShowHeaderDropdown] = React.useState(false);
    const [viewMode, setViewMode] = React.useState('list'); // 'list' | 'details'
    const [selectedLocation, setSelectedLocation] = React.useState(null);
    const [locations, setLocations] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Fetch locations on mount
    useEffect(() => {
        if (businessId) {
            fetchLocations();
        }
    }, [businessId]);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/businesses/${businessId}/locations`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Błąd pobierania lokalizacji');
            }

            setSubscription(data.subscription);

            // Combine primary location with additional locations
            const additionalLocations = data.locations || [];

            // Create primary location object from business props
            const primaryLocation = {
                id: 'primary',
                name: businessName || 'Lokalizacja główna',
                phone: businessPhone || '',
                email: '',
                address: {
                    street: address || '',
                    city: city || '',
                },
                noAddress: !address && !city,
                isPrimary: true,
                isOriginal: true // Flag to identify this is from Business model
            };

            // Always show primary location first, then all additional locations
            if (address || city) {
                setLocations([primaryLocation, ...additionalLocations]);
            } else {
                setLocations(additionalLocations);
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
            setError(err.message);

            // Still show primary location on error
            if (address || city) {
                setLocations([{
                    id: 'primary',
                    name: businessName || 'Lokalizacja główna',
                    address: { street: address, city: city },
                    isPrimary: true,
                    isOriginal: true
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper to format address display
    const formatAddress = (loc) => {
        if (loc.noAddress) return 'Brak stałego adresu';
        const addr = loc.address;
        if (!addr) return 'Brak adresu';
        const parts = [addr.street, addr.city].filter(Boolean);
        return parts.join(', ') || 'Brak adresu';
    };

    // Delete location
    const handleDeleteLocation = async (locationId) => {
        if (locationId === 'primary') {
            toast.error('Nie można usunąć głównej lokalizacji');
            return;
        }

        if (!confirm('Czy na pewno chcesz usunąć tę lokalizację?')) {
            setShowDropdown(null);
            return;
        }

        setDeleting(locationId);
        try {
            const csrfRes = await fetch('/api/csrf');
            const csrfData = await csrfRes.json();

            const response = await fetch(`/api/businesses/${businessId}/locations/${locationId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-Token': csrfData.csrfToken
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Błąd usuwania lokalizacji');
            }

            toast.success('Lokalizacja została usunięta');
            // Remove from local state
            setLocations(prev => prev.filter(loc => loc.id !== locationId));
        } catch (err) {
            console.error('Error deleting location:', err);
            toast.error(err.message || 'Błąd usuwania lokalizacji');
        } finally {
            setDeleting(null);
            setShowDropdown(null);
        }
    };

    // Check limits
    const canAddMore = !loading && (subscription ? canAddLocation({ subscription }, locations.length) : true);

    // Update location handler
    const handleUpdateLocation = (updatedLocation) => {
        // Update list
        setLocations(prev => prev.map(loc =>
            loc.id === updatedLocation.id ? { ...loc, ...updatedLocation } : loc
        ));

        // Update selected view
        if (selectedLocation && selectedLocation.id === updatedLocation.id) {
            setSelectedLocation(prev => ({ ...prev, ...updatedLocation }));
        }
    };

    if (viewMode === 'details' && selectedLocation) {
        return (
            <LocationDetails
                location={selectedLocation}
                businessName={businessName}
                onBack={() => {
                    setViewMode('list');
                    setSelectedLocation(null);
                }}
                onUpdate={handleUpdateLocation}
                onDelete={handleDeleteLocation}
                isDeleting={deleting === selectedLocation.id}
            />
        );
    }

    return (
        <div className="animate-fade-in text-left">
            {/* Breadcrumbs Header */}
            <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700"
                >
                    <ArrowLeft size={16} />
                    Wróć
                </button>
                <span className="text-gray-300">|</span>
                <span>Ustawienia obszaru roboczego</span>
                <span className="text-gray-300">•</span>
                <span className="font-semibold text-gray-900">Konfiguracja firmy</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Konfiguracja firmy</h2>
                        <nav className="space-y-1">
                            <button
                                onClick={() => onSidebarClick('details')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Szczegóły dotyczące firmy
                            </button>
                            <button
                                onClick={() => onSidebarClick('locations')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'locations' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Lokalizacje
                            </button>
                        </nav>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-gray-900 mb-3 px-2 uppercase tracking-wider">Skróty</h2>
                        <nav className="space-y-1">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Menu usług</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Lista produktów</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Karnety</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>Lista klientów</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lokalizacje</h1>
                            <p className="text-gray-500">
                                Zarządzaj informacjami i preferencjami dotyczącymi Twoich lokalizacji. <a href="#" className="text-purple-600 hover:underline">Dowiedz się więcej.</a>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Opcje
                                    <ChevronDown size={16} />
                                </button>
                                {showHeaderDropdown && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-10 animate-fade-in overflow-hidden">
                                        <button
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                            onClick={() => setShowHeaderDropdown(false)}
                                        >
                                            Utwórz link do udostępniania
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={onAddClick}
                                disabled={!canAddMore}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!canAddMore
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                                title={!canAddMore ? 'Osiągnięto limit lokalizacji' : ''}
                            >
                                Dodaj
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && locations.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                            <Store size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak lokalizacji</h3>
                            <p className="text-gray-500 mb-4">Dodaj pierwszą lokalizację swojej firmy.</p>
                            <button
                                onClick={onAddClick}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                                Dodaj lokalizację
                            </button>
                        </div>
                    )}

                    {/* Location Cards */}
                    {!loading && !error && locations.length > 0 && (
                        <div className="space-y-4">
                            {locations.map((loc) => (
                                <div key={loc.id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                                    <div className="p-6 flex items-start gap-6">
                                        {/* Icon */}
                                        <div className="w-20 h-20 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Store size={32} className="text-purple-400" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{loc.name}</h3>
                                                {loc.isOriginal ? (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                                        Główna
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        Dodatkowa
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {formatAddress(loc)}
                                            </p>
                                            {loc.phone && (
                                                <p className="text-sm text-gray-500 mt-1">{loc.phone}</p>
                                            )}
                                        </div>

                                        {/* Options */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowDropdown(showDropdown === loc.id ? null : loc.id)}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Opcje
                                                <ChevronDown size={16} />
                                            </button>

                                            {showDropdown === loc.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 animate-fade-in overflow-hidden">
                                                    <button
                                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50"
                                                        onClick={() => {
                                                            setSelectedLocation(loc);
                                                            setViewMode('details');
                                                            setShowDropdown(null);
                                                        }}
                                                    >
                                                        Zobacz
                                                    </button>
                                                    <button
                                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                                                        onClick={() => handleDeleteLocation(loc.id)}
                                                        disabled={deleting === loc.id}
                                                    >
                                                        {deleting === loc.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                        Usuń lokalizację
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Limit Banner */}
                    {!loading && !canAddMore && locations.length > 0 && (
                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-medium text-amber-900">Osiągnięto limit lokalizacji</h4>
                                    <p className="text-sm text-amber-700">Twoja obecna subskrypcja nie pozwala na dodanie kolejnych lokalizacji.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.href = '/business/dashboard/billing'}
                                className="px-4 py-2 bg-white border border-amber-200 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors shadow-sm whitespace-nowrap"
                            >
                                Ulepsz plan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

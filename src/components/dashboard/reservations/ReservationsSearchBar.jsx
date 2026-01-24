'use client';

import React, { useState } from 'react';
import { Search, Calendar, Filter, ChevronDown } from 'lucide-react';

export default function ReservationsSearchBar({
  searchTerm,
  onSearchChange,
  onCurrentMonthClick,
  onFiltersClick,
  showFilters,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  statusFilter,
  dateFilter,
  employeeFilter,
  serviceFilter,
  onStatusFilterChange,
  onDateFilterChange,
  onEmployeeFilterChange,
  onServiceFilterChange,
  availableServices,
  availableEmployees,
  onClearFilters
}) {
  const getSortLabel = () => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' ? 'Data wizyty (od najnowszej)' : 'Data wizyty (od najstarszej)';
    }
    if (sortBy === 'price') {
      return sortOrder === 'desc' ? 'Cena (od najwyższej)' : 'Cena (od najniższej)';
    }
    if (sortBy === 'clientName') {
      return sortOrder === 'desc' ? 'Klient (Z-A)' : 'Klient (A-Z)';
    }
    return 'Data wizyty (od najnowszej)';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        <div className="flex-1 relative w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Szukaj wg numeru referencyjnego"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 bg-white placeholder:text-gray-400 text-sm h-11"
          />
        </div>

        <button
          onClick={onCurrentMonthClick}
          className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium whitespace-nowrap text-sm h-11 shadow-sm"
        >
          <span>Bieżący miesiąc</span>
          <Calendar size={18} className="text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={onFiltersClick}
            className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium whitespace-nowrap text-sm h-11 shadow-sm"
          >
            <span>Filtry</span>
            <Filter size={18} className="text-gray-600" />
          </button>
          {showFilters && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="confirmed">Potwierdzone</option>
                  <option value="pending">Oczekujące</option>
                  <option value="cancelled">Anulowane</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Data</label>
                <select
                  value={dateFilter}
                  onChange={(e) => onDateFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="today">Dzisiaj</option>
                  <option value="tomorrow">Jutro</option>
                  <option value="week">Ten tydzień</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Usługa</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => onServiceFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="">Wszystkie usługi</option>
                  {availableServices.map((service, idx) => (
                    <option key={idx} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pracownik</label>
                <select
                  value={employeeFilter}
                  onChange={(e) => onEmployeeFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="">Wszyscy pracownicy</option>
                  {availableEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sortowanie</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                  >
                    <option value="date">Data</option>
                    <option value="price">Cena</option>
                    <option value="clientName">Klient</option>
                  </select>
                  <button
                    onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl hover:bg-gray-100 transition-all text-sm"
                    title={sortOrder === 'asc' ? 'Rosnąco' : 'Malejąco'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
              <button
                onClick={onClearFilters}
                className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                Wyczyść filtry
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full lg:w-auto">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              onSortChange(newSortBy);
              onSortOrderChange(newSortOrder);
            }}
            className="appearance-none flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium whitespace-nowrap cursor-pointer pr-10 text-sm h-11 shadow-sm w-full lg:w-auto"
          >
            <option value="date-desc">Data wizyty (od najnowszej)</option>
            <option value="date-asc">Data wizyty (od najstarszej)</option>
            <option value="price-desc">Cena (od najwyższej)</option>
            <option value="price-asc">Cena (od najniższej)</option>
            <option value="clientName-asc">Klient (A-Z)</option>
            <option value="clientName-desc">Klient (Z-A)</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center gap-1">
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}


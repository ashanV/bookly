'use client';

import React, { useState } from 'react';
import { Search, Calendar, Filter, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('BusinessReservationsSearch');
  const getSortLabel = () => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' ? t('sortDateDesc') : t('sortDateAsc');
    }
    if (sortBy === 'price') {
      return sortOrder === 'desc' ? t('sortPriceDesc') : t('sortPriceAsc');
    }
    if (sortBy === 'clientName') {
      return sortOrder === 'desc' ? t('sortClientDesc') : t('sortClientAsc');
    }
    return t('sortDateDesc');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        <div className="flex-1 relative w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 bg-white placeholder:text-gray-400 text-sm h-11"
          />
        </div>

        <button
          onClick={onCurrentMonthClick}
          className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium whitespace-nowrap text-sm h-11 shadow-sm"
        >
          <span>{t('currentMonth')}</span>
          <Calendar size={18} className="text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={onFiltersClick}
            className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium whitespace-nowrap text-sm h-11 shadow-sm"
          >
            <span>{t('filters')}</span>
            <Filter size={18} className="text-gray-600" />
          </button>
          {showFilters && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('statusLabel')}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="all">{t('statusAll')}</option>
                  <option value="confirmed">{t('statusConfirmed')}</option>
                  <option value="pending">{t('statusPending')}</option>
                  <option value="cancelled">{t('statusCancelled')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('dateLabel')}</label>
                <select
                  value={dateFilter}
                  onChange={(e) => onDateFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="all">{t('dateAll')}</option>
                  <option value="today">{t('dateToday')}</option>
                  <option value="tomorrow">{t('dateTomorrow')}</option>
                  <option value="week">{t('dateWeek')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('serviceLabel')}</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => onServiceFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="">{t('allServices')}</option>
                  {availableServices.map((service, idx) => (
                    <option key={idx} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('employeeLabel')}</label>
                <select
                  value={employeeFilter}
                  onChange={(e) => onEmployeeFilterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                >
                  <option value="">{t('allEmployees')}</option>
                  {availableEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('sortLabel')}</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                  >
                    <option value="date">{t('sortDate')}</option>
                    <option value="price">{t('sortPrice')}</option>
                    <option value="clientName">{t('sortClient')}</option>
                  </select>
                  <button
                    onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl hover:bg-gray-100 transition-all text-sm"
                    title={sortOrder === 'asc' ? t('sortAsc') : t('sortDesc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
              <button
                onClick={onClearFilters}
                className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                {t('clearFilters')}
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
            <option value="date-desc">{t('sortDateDesc')}</option>
            <option value="date-asc">{t('sortDateAsc')}</option>
            <option value="price-desc">{t('sortPriceDesc')}</option>
            <option value="price-asc">{t('sortPriceAsc')}</option>
            <option value="clientName-asc">{t('sortClientAsc')}</option>
            <option value="clientName-desc">{t('sortClientDesc')}</option>
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


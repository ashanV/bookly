'use client';

import React from 'react';
import { Clock, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ReservationsTable({
  reservations,
  loading,
  onReservationClick,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusText,
  getStatusIcon,
  formatDate,
  formatDateTime
}) {
  const t = useTranslations('BusinessReservationsTable');
  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} h ${mins > 0 ? `${mins} min` : ''}`.trim();
    }
    return `${mins} min`;
  };

  const formatPrice = (price) => {
    if (!price) return '0,00 zł';
    return `${parseFloat(price).toFixed(2).replace('.', ',')} zł`;
  };

  const getReferenceNumber = (referenceNumber, id) => {
    // Use saved reference number from database if it exists
    if (referenceNumber) {
      return `#${referenceNumber}`;
    }
    // Fallback for old reservations without reference number
    if (id) {
      const str = id.toString();
      return `#${str.slice(-8).toUpperCase()}`;
    }
    return '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-100">
            <tr>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colRef')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colClient')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colService')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colCreatedBy')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colCreatedDate')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colBookedDate')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colDuration')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colEmployee')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colPrice')}
              </th>
              <th className="px-10 py-4 text-left text-xs font-bold text-gray-900 tracking-tight">
                {t('colStatus')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center text-gray-400 text-sm">
                  {t('noReservations')}
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => {
                const StatusIcon = getStatusIcon(reservation.status);
                return (
                  <tr
                    key={reservation.id || reservation._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-10 py-5">
                      <button
                        onClick={() => onReservationClick(reservation)}
                        className="text-[#6366F1] hover:underline font-medium text-sm"
                      >
                        {getReferenceNumber(reservation.referenceNumber, reservation._id || reservation.id)}
                      </button>
                    </td>
                    <td className="px-10 py-5">
                      <button
                        onClick={() => onReservationClick(reservation)}
                        className="text-[#6366F1] hover:underline font-medium text-sm"
                      >
                        {reservation.client || '-'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-gray-900 text-sm">
                      {reservation.service || '-'}
                    </td>
                    <td className="px-6 py-5 text-gray-700 text-sm">
                      {reservation.createdBy || '-'}
                    </td>
                    <td className="px-6 py-5 text-gray-700 text-sm">
                      {reservation.createdAt ? formatDateTime(reservation.createdAt) : '-'}
                    </td>
                    <td className="px-6 py-5 text-gray-700 text-sm">
                      {reservation.date && reservation.time
                        ? formatDateTime(new Date(`${reservation.date}T${reservation.time}`))
                        : '-'}
                    </td>
                    <td className="px-6 py-5 text-gray-700 text-sm">
                      {formatDuration(reservation.duration)}
                    </td>
                    <td className="px-6 py-5 text-gray-700 text-sm">
                      {reservation.employee ? (
                        <div className="flex items-center gap-2">
                          <span>{reservation.employee.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-gray-900 font-medium text-sm">
                      {formatPrice(reservation.price)}
                    </td>
                    <td className="px-10 py-5">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${reservation.status === 'confirmed' || reservation.status === 'Zarezerwowana'
                        ? 'bg-[#EDF2FF] text-[#4A68F6]'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {reservations.length > 0 && (
        <div className="px-6 py-6 text-center text-sm text-gray-400">
          {t('showing', { count: reservations.length, total: reservations.length })}
        </div>
      )}
    </div>
  );
}


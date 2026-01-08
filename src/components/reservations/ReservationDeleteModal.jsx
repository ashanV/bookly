'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ReservationDeleteModal({
  reservation,
  onClose,
  onConfirm,
  formatDate
}) {
  if (!reservation) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Usuń rezerwację</h2>
              <p className="text-sm text-gray-500">Ta akcja jest nieodwracalna</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Czy na pewno chcesz usunąć rezerwację dla <strong>{reservation.client}</strong>
            {' '}z dnia <strong>{formatDate(reservation.date)}</strong> o godzinie <strong>{reservation.time}</strong>?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              Anuluj
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
            >
              Usuń
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { XCircle } from 'lucide-react';

export default function ReservationEditModal({
  reservation,
  editForm,
  onClose,
  onSave,
  onFormChange
}) {
  if (!reservation) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edytuj rezerwację</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usługa
              </label>
              <input
                type="text"
                value={editForm.service || ''}
                onChange={(e) => onFormChange({ ...editForm, service: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={editForm.status || 'pending'}
                onChange={(e) => onFormChange({ ...editForm, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">Oczekująca</option>
                <option value="confirmed">Potwierdzona</option>
                <option value="cancelled">Anulowana</option>
                <option value="completed">Zakończona</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={editForm.date || ''}
                onChange={(e) => onFormChange({ ...editForm, date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Godzina
              </label>
              <input
                type="time"
                value={editForm.time || ''}
                onChange={(e) => onFormChange({ ...editForm, time: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Czas trwania (min)
              </label>
              <input
                type="number"
                value={editForm.duration || ''}
                onChange={(e) => onFormChange({ ...editForm, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cena (zł)
              </label>
              <input
                type="number"
                value={editForm.price || ''}
                onChange={(e) => onFormChange({ ...editForm, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notatki
            </label>
            <textarea
              value={editForm.notes || ''}
              onChange={(e) => onFormChange({ ...editForm, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Dodaj notatki do rezerwacji..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              Anuluj
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


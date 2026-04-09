'use client';

import React from 'react';
import { XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ReservationEditModal({
  reservation,
  editForm,
  onClose,
  onSave,
  onFormChange
}) {
  const t = useTranslations('BusinessReservationEdit');
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
            <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
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
                {t('serviceLabel')}
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
                {t('statusLabel')}
              </label>
              <select
                value={editForm.status || 'pending'}
                onChange={(e) => onFormChange({ ...editForm, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">{t('statusPending')}</option>
                <option value="confirmed">{t('statusConfirmed')}</option>
                <option value="cancelled">{t('statusCancelled')}</option>
                <option value="completed">{t('statusCompleted')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('dateLabel')}
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
                {t('timeLabel')}
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
                {t('durationLabel')}
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
                {t('priceLabel')}
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
              {t('notesLabel')}
            </label>
            <textarea
              value={editForm.notes || ''}
              onChange={(e) => onFormChange({ ...editForm, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('notesPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


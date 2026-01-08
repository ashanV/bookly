'use client';

import React from 'react';
import { XCircle, Mail, Phone, Edit, Trash2, AlertCircle } from 'lucide-react';

export default function ReservationDetailModal({
  reservation,
  onClose,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusText,
  formatDate
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
            <h2 className="text-2xl font-bold text-gray-900">Szczegóły rezerwacji</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informacje o kliencie */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {reservation.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{reservation.client}</h3>
                <p className="text-sm text-gray-600">Klient</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Mail className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{reservation.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Phone className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefon</p>
                  <p className="text-sm font-medium text-gray-900">{reservation.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Szczegóły rezerwacji */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Szczegóły wizyty</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Usługa</p>
                <p className="font-semibold text-gray-900">{reservation.service}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Pracownik</p>
                {reservation.employee ? (
                  <div className="flex items-center gap-2">
                    {reservation.employee.avatar && (
                      <img
                        src={reservation.employee.avatar}
                        alt={reservation.employee.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <p className="font-semibold text-gray-900">{reservation.employee.name}</p>
                  </div>
                ) : (
                  <p className="font-semibold text-gray-400">Brak przypisania</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Cena</p>
                <p className="font-bold text-gray-900 text-lg">{reservation.price} zł</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Data</p>
                <p className="font-semibold text-gray-900">{formatDate(reservation.date)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Godzina</p>
                <p className="font-semibold text-gray-900">{reservation.time}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Czas trwania</p>
                <p className="font-semibold text-gray-900">{reservation.duration} min</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Notatki */}
          {reservation.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Notatki</p>
                  <p className="text-sm text-yellow-900">{reservation.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Akcje */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                onClose();
                onEdit(reservation);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Edit size={18} />
              Edytuj
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(reservation);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
            >
              <Trash2 size={18} />
              Usuń
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


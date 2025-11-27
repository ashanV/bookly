"use client";

import React from 'react';
import { Plus, Edit2, Trash2, Briefcase, Save } from 'lucide-react';

export default function ServicesSection({
    services,
    showServiceForm,
    newService,
    editingServiceId,
    onShowServiceFormChange,
    onNewServiceChange,
    onAddService,
    onEditService,
    onDeleteService,
    onCancelEdit,
    onSaveServices
}) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Usługi</h2>
                    <p className="text-sm text-gray-500 mt-1">Zarządzaj ofertą swojej firmy</p>
                </div>
                <button
                    onClick={() => onShowServiceFormChange(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj Usługę
                </button>
            </div>

            {showServiceForm && (
                <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">{editingServiceId ? 'Edytuj Usługę' : 'Nowa Usługa'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Nazwa usługi</label>
                            <input
                                type="text"
                                value={newService.name}
                                onChange={(e) => onNewServiceChange({ ...newService, name: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="np. Strzyżenie męskie"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Czas trwania (min)</label>
                            <input
                                type="number"
                                value={newService.duration}
                                onChange={(e) => onNewServiceChange({ ...newService, duration: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="np. 45"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Cena (PLN)</label>
                            <input
                                type="number"
                                value={newService.price}
                                onChange={(e) => onNewServiceChange({ ...newService, price: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="np. 100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Opis (opcjonalnie)</label>
                            <input
                                type="text"
                                value={newService.description}
                                onChange={(e) => onNewServiceChange({ ...newService, description: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Krótki opis usługi"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onAddService}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                            {editingServiceId ? 'Zapisz Zmiany' : 'Dodaj'}
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                            Anuluj
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {services.map((service) => (
                    <div key={service.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-lg">
                                {service.name?.charAt(0) ?? String(service.id ?? '?').charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{service.name}</h4>
                                <p className="text-sm text-gray-500">{service.duration} min • {service.price} PLN</p>
                                {service.description && (
                                    <p className="text-xs text-gray-400 mt-1">{service.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEditService(service)}
                                className="p-2 hover:bg-purple-50 rounded-lg transition-all group"
                            >
                                <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                            </button>
                            <button
                                onClick={() => onDeleteService(service.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                            >
                                <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && !showServiceForm && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Brak usług</h3>
                    <p className="text-gray-500">Dodaj pierwszą usługę, aby klienci mogli się umawiać.</p>
                </div>
            )}

            {services.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onSaveServices}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Zapisz Usługi
                    </button>
                </div>
            )}
        </div>
    );
}


'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Search, Filter, Calendar, Clock, User, Building2, XCircle, Eye } from 'lucide-react';

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setReservations([
                { id: '1', client: 'Jan Kowalski', business: 'Salon Piękna', service: 'Strzyżenie męskie', date: '2024-05-15', time: '10:00', status: 'completed', price: 60 },
                { id: '2', client: 'Anna Nowak', business: 'Beauty Studio', service: 'Manicure hybrydowy', date: '2024-05-16', time: '14:30', status: 'confirmed', price: 120 },
                { id: '3', client: 'Piotr Wiśniewski', business: 'Barber Shop Pro', service: 'Strzyżenie + broda', date: '2024-05-17', time: '11:00', status: 'pending', price: 80 },
                { id: '4', client: 'Maria Zielińska', business: 'Masaż & SPA', service: 'Masaż relaksacyjny', date: '2024-05-18', time: '16:00', status: 'cancelled', price: 150 },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completed': return { text: 'Zakończona', color: 'bg-green-500/20 text-green-400' };
            case 'confirmed': return { text: 'Potwierdzona', color: 'bg-blue-500/20 text-blue-400' };
            case 'pending': return { text: 'Oczekuje', color: 'bg-yellow-500/20 text-yellow-400' };
            case 'cancelled': return { text: 'Anulowana', color: 'bg-red-500/20 text-red-400' };
            default: return { text: status, color: 'bg-gray-500/20 text-gray-400' };
        }
    };

    return (
        <>
            <AdminHeader title="Rezerwacje" subtitle="Zarządzanie wszystkimi rezerwacjami" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj rezerwacji..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Klient</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Biznes</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Usługa</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Data i godzina</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Cena</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Ładowanie...</td></tr>
                            ) : reservations.map(res => {
                                const status = getStatusInfo(res.status);
                                return (
                                    <tr key={res.id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <User className="w-4 h-4 text-gray-500" />
                                                {res.client}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                                {res.business}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{res.service}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {res.date}
                                                <Clock className="w-4 h-4 text-gray-500 ml-2" />
                                                {res.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{res.price} zł</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>{status.text}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Eye className="w-4 h-4" /></button>
                                                {res.status !== 'cancelled' && res.status !== 'completed' && (
                                                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><XCircle className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

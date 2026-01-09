'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminFinancePage() {
    const stats = [
        { label: 'Przychód miesięczny', value: '45 230 zł', change: '+12%', positive: true },
        { label: 'Prowizje', value: '4 523 zł', change: '+8%', positive: true },
        { label: 'Wypłaty do biznesów', value: '40 707 zł', change: '+15%', positive: true },
        { label: 'Średnia wartość rezerwacji', value: '87 zł', change: '-3%', positive: false },
    ];

    const transactions = [
        { id: '1', business: 'Salon Piękna', amount: 1250, type: 'payout', date: '2024-05-15' },
        { id: '2', business: 'Beauty Studio', amount: 890, type: 'payout', date: '2024-05-14' },
        { id: '3', business: 'Barber Shop Pro', amount: 2100, type: 'payout', date: '2024-05-13' },
    ];

    return (
        <>
            <AdminHeader title="Finanse" subtitle="Przegląd finansowy platformy" />

            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                            <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <span className={`flex items-center text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Ostatnie wypłaty</h2>
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{tx.business}</p>
                                        <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('pl-PL')}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-white">{tx.amount.toLocaleString()} zł</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

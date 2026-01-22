
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, CalendarCheck, Clock, CheckCircle, CheckCheck, XCircle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReservationsStats() {
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        revenueMonth: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/reservations/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: 'Wszystkie rezerwacje',
            value: stats.total,
            icon: Calendar,
            description: 'Łączna liczba',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            title: 'Dziś',
            value: stats.today,
            icon: CalendarCheck,
            description: 'Rezerwacje na dzisiaj',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            title: 'Oczekujące',
            value: stats.pending,
            icon: Clock,
            description: 'Status: pending',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20'
        },
        {
            title: 'Potwierdzone',
            value: stats.confirmed,
            icon: CheckCircle,
            description: 'Status: confirmed',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        },
        {
            title: 'Zrealizowane',
            value: stats.completed,
            icon: CheckCheck,
            description: 'Status: completed',
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            title: 'Anulowane',
            value: stats.cancelled,
            icon: XCircle,
            description: 'Status: cancelled',
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20'
        },
        {
            title: 'Przychód (miesiąc)',
            value: `${stats.revenueMonth} zł`,
            icon: DollarSign,
            description: 'Suma wartości zrealizowanych',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            isWide: true
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-900/50 rounded-2xl animate-pulse border border-gray-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} p-4 transition-transform hover:scale-[1.02]`}
                >
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded-lg bg-gray-900/40 ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

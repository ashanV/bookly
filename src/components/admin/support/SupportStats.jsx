'use client';

import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Activity, Users, AlertCircle, Clock } from 'lucide-react';
import { useCsrf } from '@/hooks/useCsrf';

export default function SupportStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { secureFetch } = useCsrf();

    // Initial fetch
    useEffect(() => {
        fetchStats();
    }, []);

    // Set up polling interval (every 5 minutes)
    useEffect(() => {
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/support/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-gray-900/50 rounded-2xl mb-8"></div>;
    if (!stats) return null;

    const COLORS = ['#9333ea', '#db2777', '#ea580c', '#ca8a04', '#16a34a'];

    return (
        <div className="mb-8 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Nowe dzisiaj</p>
                        <h4 className="text-2xl font-bold text-white">{stats.summary.newToday}</h4>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Wszystkie otwarte</p>
                        <h4 className="text-2xl font-bold text-white">{stats.summary.totalOpen}</h4>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Nieprzypisane</p>
                        <h4 className="text-2xl font-bold text-white">{stats.summary.unassigned}</h4>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets Trend */}
                <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 p-5 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-6">Zgłoszenia (ostatnie 14 dni)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.ticketsOverTime}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(val) => val.slice(5)} // Show MM-DD
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#9333ea"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-6">Kategorie</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.categoryDistribution} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#d1d5db', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {stats.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

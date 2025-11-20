import React, { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Download,
    FileText,
    CreditCard,
    Calendar,
    Filter,
    ChevronDown,
    PieChart,
    BarChart3
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load charts
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function Financials() {
    const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'

    // Mock data
    const revenueData = [
        { name: '1 Lis', value: 1200 },
        { name: '5 Lis', value: 1900 },
        { name: '10 Lis', value: 1500 },
        { name: '15 Lis', value: 2800 },
        { name: '20 Lis', value: 2200 },
        { name: '25 Lis', value: 3500 },
        { name: '30 Lis', value: 3100 },
    ];

    const invoices = [
        { id: 'FV/2023/11/001', client: 'Anna Kowalska', date: '2023-11-15', amount: 120, status: 'paid' },
        { id: 'FV/2023/11/002', client: 'Jan Nowak', date: '2023-11-14', amount: 80, status: 'paid' },
        { id: 'FV/2023/11/003', client: 'Firma XYZ', date: '2023-11-12', amount: 1500, status: 'pending' },
        { id: 'FV/2023/11/004', client: 'Maria Wiśniewska', date: '2023-11-10', amount: 350, status: 'paid' },
        { id: 'FV/2023/11/005', client: 'Piotr Zieliński', date: '2023-11-08', amount: 120, status: 'overdue' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Opłacona</span>;
            case 'pending':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Oczekuje</span>;
            case 'overdue':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Przeterminowana</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                            <DollarSign size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +12%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">45,280 zł</h3>
                    <p className="text-slate-500 text-sm mt-1">Przychód w tym miesiącu</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <FileText size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +5%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">124</h3>
                    <p className="text-slate-500 text-sm mt-1">Wystawionych faktur</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <CreditCard size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-slate-500 text-sm font-medium bg-slate-50 px-2 py-1 rounded-lg">
                            0%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">1,250 zł</h3>
                    <p className="text-slate-500 text-sm mt-1">Średnia wartość koszyka</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                            <TrendingDown size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-rose-600 text-sm font-medium bg-rose-50 px-2 py-1 rounded-lg">
                            <TrendingDown size={14} /> -2%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">3,400 zł</h3>
                    <p className="text-slate-500 text-sm mt-1">Koszty operacyjne</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Przychody</h3>
                            <p className="text-sm text-slate-500">Analiza finansowa</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {range === 'week' ? 'Tydzień' : range === 'month' ? 'Miesiąc' : 'Rok'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Szybkie akcje</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-600 shadow-sm group-hover:text-violet-600 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-900">Nowa faktura</p>
                                    <p className="text-xs text-slate-500">Wystaw dokument</p>
                                </div>
                            </div>
                            <ChevronDown className="-rotate-90 text-slate-400" size={20} />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-600 shadow-sm group-hover:text-violet-600 transition-colors">
                                    <Download size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-900">Raport miesięczny</p>
                                    <p className="text-xs text-slate-500">Pobierz PDF</p>
                                </div>
                            </div>
                            <ChevronDown className="-rotate-90 text-slate-400" size={20} />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-600 shadow-sm group-hover:text-violet-600 transition-colors">
                                    <CreditCard size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-900">Terminal płatniczy</p>
                                    <p className="text-xs text-slate-500">Konfiguracja</p>
                                </div>
                            </div>
                            <ChevronDown className="-rotate-90 text-slate-400" size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Ostatnie faktury</h3>
                    <button className="text-violet-600 font-medium text-sm hover:text-violet-700">Zobacz wszystkie</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Numer</th>
                                <th className="px-6 py-4 font-medium">Klient</th>
                                <th className="px-6 py-4 font-medium">Data wystawienia</th>
                                <th className="px-6 py-4 font-medium">Kwota</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.id}</td>
                                    <td className="px-6 py-4 text-slate-600">{invoice.client}</td>
                                    <td className="px-6 py-4 text-slate-600">{invoice.date}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.amount} zł</td>
                                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-violet-600 transition-colors p-1">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

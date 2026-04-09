'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { DollarSign, TrendingUp, CreditCard, ShoppingBag, Loader2, FileText, Search, Filter, Download, Settings, Save } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

export default function AdminFinancePage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30days');

    // Data States
    const [statsData, setStatsData] = useState({
        stats: { totalRevenue: 0, platformRevenue: 0, avgTicket: 0, commissionRate: 10 },
        paymentMethods: [],
        recentTransactions: [],
        chartData: []
    });
    const [unsettledData, setUnsettledData] = useState([]);
    const [payoutsHistory, setPayoutsHistory] = useState([]);

    // Transactions State
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transactionFilters, setTransactionFilters] = useState({
        startDate: '',
        endDate: '',
        paymentMethod: '',
        businessId: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        totalPages: 1,
        total: 0
    });
    const [businessesList, setBusinessesList] = useState([]); // For filter dropdown

    // Settings State
    const [config, setConfig] = useState({
        commissionRate: 10,
        currency: 'PLN'
    });
    const [configLoading, setConfigLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch Dashboard Data
    useEffect(() => {
        if (activeTab === 'dashboard') {
            const fetchStats = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/admin/finance/stats?range=${timeRange}`);
                    if (!res.ok) throw new Error('Failed to fetch finance stats');
                    const json = await res.json();
                    setStatsData(json);
                } catch (error) {
                    console.error('Error loading finance stats:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [activeTab, timeRange]);

    // Fetch Unsettled Data
    useEffect(() => {
        if (activeTab === 'unsettled') {
            const fetchUnsettled = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/admin/finance/unsettled');
                    if (!res.ok) throw new Error('Failed to fetch unsettled stats');
                    const json = await res.json();
                    setUnsettledData(json);
                } catch (error) {
                    console.error('Error loading unsettled stats:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUnsettled();
        }
    }, [activeTab]);

    // Fetch History Data
    useEffect(() => {
        if (activeTab === 'history') {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/admin/finance/payouts');
                    if (!res.ok) throw new Error('Failed to fetch payouts history');
                    const json = await res.json();
                    setPayoutsHistory(json);
                } catch (error) {
                    console.error('Error loading payouts history:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
    }, [activeTab]);

    // Fetch Transactions Data
    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
            fetchBusinessesList();
        }
    }, [activeTab, pagination.page, transactionFilters]);

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...transactionFilters
            });

            // Remove empty filters
            if (!transactionFilters.paymentMethod) queryParams.delete('paymentMethod');
            if (!transactionFilters.businessId) queryParams.delete('businessId');
            if (!transactionFilters.startDate) queryParams.delete('startDate');
            if (!transactionFilters.endDate) queryParams.delete('endDate');

            const res = await fetch(`/api/admin/finance/transactions?${queryParams}`);
            if (!res.ok) throw new Error('Failed to fetch transactions');
            const json = await res.json();

            setTransactions(json.data);
            setPagination(prev => ({
                ...prev,
                totalPages: json.pagination.pages,
                total: json.pagination.total
            }));
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const fetchBusinessesList = async () => {
        if (businessesList.length > 0) return;
        try {
            const res = await fetch('/api/admin/businesses');
            if (res.ok) {
                const json = await res.json();
                setBusinessesList(json);
            }
        } catch (error) {
            console.error('Error loading businesses:', error);
        }
    };

    // Fetch Config Data
    useEffect(() => {
        if (activeTab === 'settings') {
            const fetchConfig = async () => {
                setConfigLoading(true);
                try {
                    const res = await fetch('/api/admin/system/config');
                    if (!res.ok) throw new Error('Failed to fetch config');
                    const json = await res.json();
                    setConfig({
                        commissionRate: json.commissionRate || 10,
                        currency: json.currency || 'PLN'
                    });
                } catch (error) {
                    console.error('Error loading config:', error);
                } finally {
                    setConfigLoading(false);
                }
            };
            fetchConfig();
        }
    }, [activeTab]);

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/system/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Failed to save config');

            alert('Ustawienia zostały zapisane.');
            // Refresh stats if needed since commission rate changed
            if (activeTab === 'dashboard') {
                // Trigger refresh logic if implemented, or just let next fetch handle it
            }

        } catch (error) {
            console.error('Save error:', error);
            alert('Błąd podczas zapisywania ustawień.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportCSV = () => {
        const csvData = transactions.map(tx => ({
            Data: new Date(tx.date).toLocaleString('pl-PL'),
            Klient: tx.client,
            Email_Klienta: tx.clientEmail,
            Biznes: tx.business,
            Kwota: tx.amount,
            Prowizja: tx.commission,
            Zysk_Netto: tx.amount - tx.commission,
            Metoda_Platnosci: tx.paymentMethod,
            Status: tx.status
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transakcje_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSettle = async (business) => {
        if (!confirm(`Czy na pewno chcesz rozliczyć ${business.companyName} na kwotę ${formatCurrency(business.payoutAmount)}?`)) return;

        try {
            const res = await fetch('/api/admin/finance/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.businessId,
                    amount: business.payoutAmount,
                    commissionAmount: business.commissionAmount,
                    periodStart: business.periodStart,
                    periodEnd: business.periodEnd,
                    reservationsCount: business.reservationsCount,
                    notes: 'Automatyczne rozliczenie'
                })
            });

            if (!res.ok) throw new Error('Failed to create payout');

            // Refresh list
            const updatedUnsettled = unsettledData.filter(item => item.businessId !== business.businessId);
            setUnsettledData(updatedUnsettled);
            alert('Rozliczono pomyślnie!');

        } catch (error) {
            console.error('Payout error:', error);
            alert('Błąd podczas rozliczania.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const statsConfig = [
        {
            label: 'Całkowity Przychód (GMV)',
            value: formatCurrency(statsData.stats.totalRevenue),
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        {
            label: `Przychód Platformy (${statsData.stats.commissionRate}%)`,
            value: formatCurrency(statsData.stats.platformRevenue),
            icon: TrendingUp,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        },
        {
            label: 'Średnia Wartość Koszyka',
            value: formatCurrency(statsData.stats.avgTicket),
            icon: ShoppingBag,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20'
        },
        {
            label: 'Transakcje (Ilość)',
            value: statsData.stats.totalRevenue > 0 ? Math.round(statsData.stats.totalRevenue / (statsData.stats.avgTicket || 1)) : 0,
            icon: CreditCard,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/20'
        },
    ];

    return (
        <>
            <AdminHeader title="Finanse" subtitle="Zarządzaj finansami i wypłatami" />

            <div className="px-6 border-b border-gray-800">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Przegląd
                        {activeTab === 'dashboard' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('unsettled')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'unsettled' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Do Rozliczenia
                        {activeTab === 'unsettled' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Historia Wypłat
                        {activeTab === 'history' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'transactions' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Transakcje
                        {activeTab === 'transactions' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'settings' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Konfiguracja
                        {activeTab === 'settings' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                        )}
                    </button>

                </div>
            </div>

            <div className="p-6 space-y-6">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'dashboard' && (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {statsConfig.map((stat, i) => (
                                        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Payment Methods */}
                                    <div className="lg:col-span-1 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                        <h2 className="text-lg font-semibold text-white mb-4">Metody Płatności</h2>
                                        {statsData.paymentMethods.length > 0 ? (
                                            <div className="space-y-4">
                                                {statsData.paymentMethods.map((method, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                            <span className="text-gray-300 capitalize">{method._id || 'Nieznana'}</span>
                                                        </div>
                                                        <span className="font-medium text-white">{method.count} trans.</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Brak danych o płatnościach</p>
                                        )}
                                    </div>

                                    {/* Recent Transactions */}
                                    <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                        <h2 className="text-lg font-semibold text-white mb-4">Ostatnie Transakcje</h2>
                                        <div className="space-y-3">
                                            {statsData.recentTransactions.length > 0 ? (
                                                statsData.recentTransactions.map(tx => (
                                                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                                                <CreditCard className="w-5 h-5 text-green-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white">{tx.business}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(tx.date).toLocaleDateString('pl-PL', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-white">{formatCurrency(tx.amount)}</p>
                                                            <p className="text-xs text-gray-500 capitalize">{tx.method}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">Brak ostatnich transakcji</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Chart */}
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold text-white">
                                            Wzrost Przychodów ({timeRange === '30days' ? 'Ostatnie 30 dni' : 'Ostatnie 12 miesięcy'})
                                        </h2>
                                        <div className="flex bg-gray-800 rounded-lg p-1">
                                            <button
                                                onClick={() => setTimeRange('30days')}
                                                className={`px-3 py-1 text-sm rounded-md transition-all ${timeRange === '30days'
                                                    ? 'bg-blue-600 text-white shadow'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                30 Dni
                                            </button>
                                            <button
                                                onClick={() => setTimeRange('12months')}
                                                className={`px-3 py-1 text-sm rounded-md transition-all ${timeRange === '12months'
                                                    ? 'bg-blue-600 text-white shadow'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                12 Miesięcy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={statsData.chartData}>
                                                <defs>
                                                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#9ca3af"
                                                    tickFormatter={(value) => {
                                                        if (timeRange === '12months') {
                                                            return new Date(value + '-01').toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
                                                        }
                                                        return new Date(value).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
                                                    }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    stroke="#9ca3af"
                                                    tickFormatter={(value) => `${value} zł`}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                                                    itemStyle={{ color: '#e5e7eb' }}
                                                    formatter={(value) => [`${value} zł`, '']}
                                                    labelFormatter={(label) => {
                                                        if (timeRange === '12months') {
                                                            return new Date(label + '-01').toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
                                                        }
                                                        return new Date(label).toLocaleDateString('pl-PL');
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="gmv"
                                                    name="Przychód Całkowity (GMV)"
                                                    stroke="#4ade80"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorGmv)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="commission"
                                                    name="Prowizja"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorCommission)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'unsettled' && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-gray-800">
                                    <h2 className="text-lg font-semibold text-white">Do Rozliczenia</h2>
                                    <p className="text-sm text-gray-400">Biznesy z zakończonymi rezerwacjami oczekujące na wypłatę</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-400 text-sm">
                                                <th className="p-4 font-medium">Biznes</th>
                                                <th className="p-4 font-medium">Rezerwacje</th>
                                                <th className="p-4 font-medium">Okres</th>
                                                <th className="p-4 font-medium">GMV</th>
                                                <th className="p-4 font-medium">Prowizja</th>
                                                <th className="p-4 font-medium text-green-400">Do Wypłaty</th>
                                                <th className="p-4 font-medium text-right">Akcja</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {unsettledData.length > 0 ? (
                                                unsettledData.map((item) => (
                                                    <tr key={item.businessId} className="hover:bg-gray-800/30 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-medium text-white">{item.companyName}</div>
                                                            <div className="text-xs text-gray-500">{item.email}</div>
                                                        </td>
                                                        <td className="p-4 text-gray-300">{item.reservationsCount}</td>
                                                        <td className="p-4 text-sm text-gray-400">
                                                            {new Date(item.periodStart).toLocaleDateString('pl-PL')} - {new Date(item.periodEnd).toLocaleDateString('pl-PL')}
                                                        </td>
                                                        <td className="p-4 text-gray-300">{formatCurrency(item.totalGMV)}</td>
                                                        <td className="p-4 text-blue-400">{formatCurrency(item.commissionAmount)}</td>
                                                        <td className="p-4 font-bold text-green-400">{formatCurrency(item.payoutAmount)}</td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => handleSettle(item)}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                Rozlicz
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                                        Brak nierozliczonych środków
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-gray-800">
                                    <h2 className="text-lg font-semibold text-white">Historia Wypłat</h2>
                                    <p className="text-sm text-gray-400">Archiwum zrealizowanych rozliczeń</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-400 text-sm">
                                                <th className="p-4 font-medium">Data</th>
                                                <th className="p-4 font-medium">Biznes</th>
                                                <th className="p-4 font-medium">Kwota wypłacona</th>
                                                <th className="p-4 font-medium">Prowizja</th>
                                                <th className="p-4 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {payoutsHistory.length > 0 ? (
                                                payoutsHistory.map((payout) => (
                                                    <tr key={payout._id} className="hover:bg-gray-800/30 transition-colors">
                                                        <td className="p-4 text-gray-300">
                                                            {new Date(payout.createdAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-medium text-white">{payout.businessId?.companyName || 'Nieznany'}</div>
                                                        </td>
                                                        <td className="p-4 font-bold text-green-400">{formatCurrency(payout.amount)}</td>
                                                        <td className="p-4 text-blue-400">{formatCurrency(payout.commissionAmount)}</td>
                                                        <td className="p-4">
                                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium uppercase">
                                                                {payout.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                                        Brak historii wypłat
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="space-y-6">
                                {/* Filters */}
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex flex-wrap gap-4 items-center">
                                        {/* Date Range */}
                                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                                            <span className="text-gray-400 text-sm">Od:</span>
                                            <input
                                                type="date"
                                                className="bg-transparent text-white text-sm outline-none"
                                                value={transactionFilters.startDate}
                                                onChange={(e) => setTransactionFilters({ ...transactionFilters, startDate: e.target.value, page: 1 })}
                                            />
                                            <span className="text-gray-400 text-sm ml-2">Do:</span>
                                            <input
                                                type="date"
                                                className="bg-transparent text-white text-sm outline-none"
                                                value={transactionFilters.endDate}
                                                onChange={(e) => setTransactionFilters({ ...transactionFilters, endDate: e.target.value, page: 1 })}
                                            />
                                        </div>

                                        {/* Payment Method */}
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <select
                                                className="bg-gray-800 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none border border-transparent focus:border-blue-500 appearance-none"
                                                value={transactionFilters.paymentMethod}
                                                onChange={(e) => setTransactionFilters({ ...transactionFilters, paymentMethod: e.target.value, page: 1 })}
                                            >
                                                <option value="">Wszystkie metody</option>
                                                <option value="karta">Karta</option>
                                                <option value="blik">BLIK</option>
                                                <option value="online">Online</option>
                                                <option value="gotówka">Gotówka</option>
                                            </select>
                                        </div>

                                        {/* Business Filter (Simple Select for now) */}
                                        {businessesList.length > 0 && (
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <select
                                                    className="bg-gray-800 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none border border-transparent focus:border-blue-500 appearance-none max-w-[200px]"
                                                    value={transactionFilters.businessId}
                                                    onChange={(e) => setTransactionFilters({ ...transactionFilters, businessId: e.target.value, page: 1 })}
                                                >
                                                    <option value="">Wszystkie biznesy</option>
                                                    {businessesList.map(b => (
                                                        <option key={b._id} value={b._id}>{b.companyName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleExportCSV}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Eksportuj CSV
                                    </button>
                                </div>

                                {/* Table */}
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-800/50 text-gray-400 text-sm">
                                                    <th className="p-4 font-medium">Data</th>
                                                    <th className="p-4 font-medium">Klient</th>
                                                    <th className="p-4 font-medium">Biznes</th>
                                                    <th className="p-4 font-medium">Kwota</th>
                                                    <th className="p-4 font-medium">Prowizja</th>
                                                    <th className="p-4 font-medium">Status</th>
                                                    <th className="p-4 font-medium">Metoda</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800">
                                                {transactionsLoading ? (
                                                    <tr>
                                                        <td colSpan="7" className="p-8 text-center">
                                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                                        </td>
                                                    </tr>
                                                ) : transactions.length > 0 ? (
                                                    transactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                                                            <td className="p-4 text-gray-300 text-sm">
                                                                {new Date(tx.date).toLocaleDateString('pl-PL', {
                                                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="font-medium text-white text-sm">{tx.client}</div>
                                                                <div className="text-xs text-gray-500">{tx.clientEmail}</div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="text-white text-sm">{tx.business}</div>
                                                            </td>
                                                            <td className="p-4 font-bold text-white text-sm">{formatCurrency(tx.amount)}</td>
                                                            <td className="p-4 text-blue-400 text-sm">{formatCurrency(tx.commission)}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase ${tx.status === 'Rozliczono'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                                    }`}>
                                                                    {tx.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="text-sm text-gray-400 capitalize">{tx.paymentMethod}</span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                                            Brak transakcji spełniających kryteria
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="p-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
                                        <div>
                                            Strona {pagination.page} z {pagination.totalPages} ({pagination.total} wyników)
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                                disabled={pagination.page === 1}
                                                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                                            >
                                                Poprzednia
                                            </button>
                                            <button
                                                onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                                            >
                                                Następna
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-blue-500/20 rounded-xl">
                                            <Settings className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Konfiguracja Finansowa</h2>
                                            <p className="text-gray-400 text-sm">Zarządzaj globalnymi ustawieniami finansowymi platformy</p>
                                        </div>
                                    </div>

                                    {configLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveConfig} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Prowizja platformy (%)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                        value={config.commissionRate}
                                                        onChange={(e) => setConfig({ ...config, commissionRate: parseFloat(e.target.value) })}
                                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                                        %
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Ta wartość będzie pobierana od każdej zrealizowanej rezerwacji.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Waluta serwisu
                                                </label>
                                                <select
                                                    value={config.currency}
                                                    onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                                >
                                                    <option value="PLN">PLN (Polski Złoty)</option>
                                                    <option value="EUR">EUR (Euro)</option>
                                                    <option value="USD">USD (Dolar Amerykański)</option>
                                                </select>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Główna waluta, w której odbywają się wszystkie transakcje.
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-gray-800 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                                                >
                                                    {saving ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Save className="w-5 h-5" />
                                                    )}
                                                    {saving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}

                    </>
                )}
            </div>
        </>
    );
}

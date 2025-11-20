"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  Settings,
  LogOut,
  Star,
  Eye,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load heavy chart components
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const RePieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth('/business/auth');
  const [businessData, setBusinessData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week');
  const [stats, setStats] = useState({
    totalReservations: 247,
    todayReservations: 12,
    totalClients: 156,
    revenue: 45280,
    avgRating: 4.8,
    completionRate: 94
  });

  const [chartData] = useState({
    revenue: [
      { name: 'Pn', value: 4200 },
      { name: 'Wt', value: 5800 },
      { name: 'Śr', value: 6500 },
      { name: 'Cz', value: 7200 },
      { name: 'Pt', value: 8100 },
      { name: 'Sb', value: 9500 },
      { name: 'Nd', value: 7800 }
    ],
    reservations: [
      { name: 'Pn', rezerwacje: 8, anulowane: 1 },
      { name: 'Wt', rezerwacje: 12, anulowane: 2 },
      { name: 'Śr', rezerwacje: 15, anulowane: 1 },
      { name: 'Cz', rezerwacje: 18, anulowane: 0 },
      { name: 'Pt', rezerwacje: 22, anulowane: 2 },
      { name: 'Sb', rezerwacje: 28, anulowane: 3 },
      { name: 'Nd', rezerwacje: 20, anulowane: 1 }
    ],
    services: [
      { name: 'Strzyżenie', value: 45 },
      { name: 'Koloryzacja', value: 30 },
      { name: 'Stylizacja', value: 15 },
      { name: 'Pielęgnacja', value: 10 }
    ]
  });

  const [recentReservations] = useState([
    {
      id: 1,
      client: 'Anna Kowalska',
      service: 'Strzyżenie + Stylizacja',
      time: '14:00',
      date: 'Dzisiaj',
      price: 180,
      status: 'confirmed',
      avatar: 'AK'
    },
    {
      id: 2,
      client: 'Jan Nowak',
      service: 'Strzyżenie męskie',
      time: '15:30',
      date: 'Dzisiaj',
      price: 80,
      status: 'pending',
      avatar: 'JN'
    },
    {
      id: 3,
      client: 'Maria Wiśniewska',
      service: 'Koloryzacja',
      time: '16:00',
      date: 'Dzisiaj',
      price: 250,
      status: 'confirmed',
      avatar: 'MW'
    },
    {
      id: 4,
      client: 'Piotr Zieliński',
      service: 'Strzyżenie + Broda',
      time: '17:00',
      date: 'Jutro',
      price: 120,
      status: 'confirmed',
      avatar: 'PZ'
    }
  ]);

  const [topServices] = useState([
    { name: 'Strzyżenie damskie', bookings: 89, revenue: 12450, trend: 12 },
    { name: 'Koloryzacja', bookings: 54, revenue: 18900, trend: 8 },
    { name: 'Strzyżenie męskie', bookings: 76, revenue: 6080, trend: -3 },
    { name: 'Stylizacja ślubna', bookings: 12, revenue: 4800, trend: 15 }
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/business/auth');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user && user.role === 'business') {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      const response = await fetch('/api/auth/verify', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setBusinessData(data.user);
      }
    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/business/auth');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Potwierdzona';
      case 'pending': return 'Oczekująca';
      case 'cancelled': return 'Anulowana';
      default: return 'Nieznany';
    }
  };

  const COLORS = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Ładowanie dashboardu...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'business') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Witaj, {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Calendar size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Search size={20} />
              </button>
              <button
                onClick={() => router.push('/business/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informacje o firmie */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="text-white" size={36} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {businessData?.companyName || user?.companyName || 'Twoja Firma'}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {businessData?.category || 'Kategoria'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="font-semibold text-gray-900">{stats.avgRating}</span>
                    <span className="text-gray-500 text-sm">(156 opinii)</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/business/settings')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Edit size={18} />
              Edytuj profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Lokalizacja</p>
                <p className="text-gray-900 font-semibold">
                  {businessData?.city || 'Miasto'}, {businessData?.address || 'Adres'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Telefon</p>
                <p className="text-gray-900 font-semibold">{user?.phone || businessData?.phone || '+48 123 456 789'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                <p className="text-gray-900 font-semibold">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="text-white" size={26} />
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <TrendingUp size={16} />
                <span className="text-sm font-bold">+12%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalReservations}</h3>
            <p className="text-sm text-gray-500 font-medium">Wszystkie rezerwacje</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">+23 w tym tygodniu</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="text-white" size={26} />
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <TrendingUp size={16} />
                <span className="text-sm font-bold">+8%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.todayReservations}</h3>
            <p className="text-sm text-gray-500 font-medium">Rezerwacje dzisiaj</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">3 nadchodzące</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="text-white" size={26} />
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <TrendingUp size={16} />
                <span className="text-sm font-bold">+15%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalClients}</h3>
            <p className="text-sm text-gray-500 font-medium">Aktywni klienci</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">8 nowych w tym miesiącu</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="text-white" size={26} />
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <TrendingUp size={16} />
                <span className="text-sm font-bold">+24%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.revenue.toLocaleString()} zł</h3>
            <p className="text-sm text-gray-500 font-medium">Przychód w tym miesiącu</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Cel: 50,000 zł</p>
            </div>
          </div>
        </div>

        {/* Wykresy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Wykres przychodów */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Przychody tygodniowe</h3>
                <p className="text-sm text-gray-500 mt-1">Ostatnie 7 dni</p>
              </div>
              <div className="flex gap-2">
                {['day', 'week', 'month'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === filter
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {filter === 'day' ? 'Dzień' : filter === 'week' ? 'Tydzień' : 'Miesiąc'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData.revenue}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9333ea"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rozkład usług */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Popularne usługi</h3>
                <p className="text-sm text-gray-500 mt-1">Rozkład procentowy</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={chartData.services}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.services.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {chartData.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{service.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{service.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ostatnie rezerwacje */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ostatnie rezerwacje</h3>
                <p className="text-sm text-gray-500 mt-1">Nadchodzące wizyty</p>
              </div>
              <button
                onClick={() => router.push('/business/reservations')}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium"
              >
                Zobacz wszystkie
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {reservation.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{reservation.client}</p>
                      <p className="text-sm text-gray-500">{reservation.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-600">{reservation.date}, {reservation.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{reservation.price} zł</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top usługi i Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Szybkie akcje</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/business/reservations')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">Rezerwacje</span>
                  </div>
                  <ArrowUpRight className="text-purple-600" size={18} />
                </button>
                <button
                  onClick={() => router.push('/business/calendar')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">Kalendarz</span>
                  </div>
                  <ArrowUpRight className="text-blue-600" size={18} />
                </button>
                <button
                  onClick={() => router.push('/business/settings')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">Ustawienia</span>
                  </div>
                  <ArrowUpRight className="text-green-600" size={18} />
                </button>
                <button
                  onClick={() => router.push('/business/crm')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">CRM & Klienci</span>
                  </div>
                  <ArrowUpRight className="text-rose-600" size={18} />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Eye className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">Podgląd profilu</span>
                  </div>
                  <ArrowUpRight className="text-orange-600" size={18} />
                </button>
              </div>
            </div>

            {/* Top usługi */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Najpopularniejsze usługi</h3>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">{service.name}</span>
                      <div className="flex items-center gap-1">
                        {service.trend > 0 ? (
                          <TrendingUp size={14} className="text-green-600" />
                        ) : (
                          <TrendingDown size={14} className="text-red-600" />
                        )}
                        <span className={`text-xs font-bold ${service.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(service.trend)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{service.bookings} rezerwacji</span>
                      <span className="font-semibold text-gray-900">{service.revenue.toLocaleString()} zł</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500 group-hover:scale-105"
                        style={{ width: `${(service.bookings / 89) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wykres rezerwacji */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rezerwacje vs Anulowania</h3>
              <p className="text-sm text-gray-500 mt-1">Ostatnie 7 dni</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <Download size={18} />
              <span className="text-sm font-medium">Eksportuj</span>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.reservations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="rezerwacje" fill="#9333ea" radius={[8, 8, 0, 0]} />
              <Bar dataKey="anulowane" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
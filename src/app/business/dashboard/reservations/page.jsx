'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Building2,
  Settings,
  LogOut,
  Star,
  DollarSign
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load heavy chart components
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function ReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth('/business/auth');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [deletingReservation, setDeletingReservation] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'business') {
      fetchReservations();
    }
  }, [isAuthenticated, user]);

  // Debounced search - refetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.role === 'business') {
        fetchReservations();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, dateFilter, employeeFilter, serviceFilter, sortBy, sortOrder]);

  const fetchReservations = async () => {
    try {
      setLoading(true);

      // Build query parameters for server-side filtering
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (serviceFilter) params.append('service', serviceFilter);
      if (employeeFilter) params.append('employeeId', employeeFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      // Date range filter
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('startDate', today);
        params.append('endDate', today);
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        params.append('startDate', tomorrowStr);
        params.append('endDate', tomorrowStr);
      } else if (dateFilter === 'week') {
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        params.append('startDate', today);
        params.append('endDate', weekFromNow.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/reservations/list?${params.toString()}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        // Extract unique services and employees for filter dropdowns
        const services = [...new Set(data.reservations.map(r => r.service).filter(Boolean))];
        const employees = data.reservations
          .map(r => r.employee)
          .filter((e, i, arr) => e && arr.findIndex(emp => emp?.id === e?.id) === i);

        setAvailableServices(services);
        setAvailableEmployees(employees);

        // Transformacja danych z API do formatu używanego w komponencie
        const transformedReservations = data.reservations.map(res => ({
          id: res._id || res.id,
          _id: res._id,
          client: res.clientName,
          email: res.clientEmail,
          phone: res.clientPhone,
          service: res.service,
          date: new Date(res.date).toISOString().split('T')[0],
          time: res.time,
          duration: res.duration,
          price: res.price,
          status: res.status,
          notes: res.notes || '',
          avatar: res.clientName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
          employee: res.employee
        }));
        setReservations(transformedReservations);
      } else {
        console.error('Błąd pobierania rezerwacji');
      }
    } catch (error) {
      console.error('Błąd pobierania rezerwacji:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data - fallback (można usunąć po testach)
  const mockReservations = [
    {
      id: 1,
      client: 'Anna Kowalska',
      email: 'anna.kowalska@email.com',
      phone: '+48 123 456 789',
      service: 'Strzyżenie + Stylizacja',
      date: '2025-11-07',
      time: '14:00',
      duration: 90,
      price: 180,
      status: 'confirmed',
      avatar: 'AK',
      notes: 'Klientka preferuje krótsze fryzury'
    },
    {
      id: 2,
      client: 'Jan Nowak',
      email: 'jan.nowak@email.com',
      phone: '+48 234 567 890',
      service: 'Strzyżenie męskie',
      date: '2025-11-07',
      time: '15:30',
      duration: 45,
      price: 80,
      status: 'pending',
      avatar: 'JN',
      notes: ''
    },
    {
      id: 3,
      client: 'Maria Wiśniewska',
      email: 'maria.w@email.com',
      phone: '+48 345 678 901',
      service: 'Koloryzacja',
      date: '2025-11-07',
      time: '16:00',
      duration: 120,
      price: 250,
      status: 'confirmed',
      avatar: 'MW',
      notes: 'Uczulenie na amoniak'
    },
    {
      id: 4,
      client: 'Piotr Zieliński',
      email: 'p.zielinski@email.com',
      phone: '+48 456 789 012',
      service: 'Strzyżenie + Broda',
      date: '2025-11-08',
      time: '10:00',
      duration: 60,
      price: 120,
      status: 'confirmed',
      avatar: 'PZ',
      notes: ''
    },
    {
      id: 5,
      client: 'Katarzyna Lewandowska',
      email: 'k.lewandowska@email.com',
      phone: '+48 567 890 123',
      service: 'Stylizacja ślubna',
      date: '2025-11-08',
      time: '12:00',
      duration: 180,
      price: 400,
      status: 'confirmed',
      avatar: 'KL',
      notes: 'Ślub o 16:00, próba wcześniej'
    },
    {
      id: 6,
      client: 'Tomasz Wójcik',
      email: 'tomasz.wojcik@email.com',
      phone: '+48 678 901 234',
      service: 'Strzyżenie męskie',
      date: '2025-11-08',
      time: '14:30',
      duration: 45,
      price: 80,
      status: 'cancelled',
      avatar: 'TW',
      notes: 'Odwołane przez klienta'
    },
    {
      id: 7,
      client: 'Agnieszka Dąbrowska',
      email: 'a.dabrowska@email.com',
      phone: '+48 789 012 345',
      service: 'Balayage',
      date: '2025-11-09',
      time: '10:00',
      duration: 150,
      price: 350,
      status: 'confirmed',
      avatar: 'AD',
      notes: ''
    },
    {
      id: 8,
      client: 'Michał Kamiński',
      email: 'm.kaminski@email.com',
      phone: '+48 890 123 456',
      service: 'Strzyżenie + Styling',
      date: '2025-11-09',
      time: '13:00',
      duration: 75,
      price: 150,
      status: 'pending',
      avatar: 'MK',
      notes: ''
    }
  ];

  const stats = [
    {
      label: 'Wszystkie rezerwacje',
      value: reservations.length || 0,
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'blue'
    },
    {
      label: 'Potwierdzone',
      value: reservations.filter(r => r.status === 'confirmed').length,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Oczekujące',
      value: reservations.filter(r => r.status === 'pending').length,
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Anulowane',
      value: reservations.filter(r => r.status === 'cancelled').length,
      change: '+2%',
      trend: 'up',
      icon: XCircle,
      color: 'red'
    }
  ];

  const weekData = [
    { name: 'Pn', rezerwacje: 8 },
    { name: 'Wt', rezerwacje: 12 },
    { name: 'Śr', rezerwacje: 15 },
    { name: 'Cz', rezerwacje: 18 },
    { name: 'Pt', rezerwacje: 22 },
    { name: 'Sb', rezerwacje: 28 },
    { name: 'Nd', rezerwacje: 20 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  // Server-side filtering is used - no client-side filtering needed
  // Just use the reservations directly as they come filtered from the API

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return 'Dzisiaj';
    if (dateOnly.getTime() === tomorrow.getTime()) return 'Jutro';

    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-orange-500',
      red: 'from-red-500 to-red-600'
    };
    return colors[color] || colors.blue;
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setEditForm({
      service: reservation.service,
      date: reservation.date,
      time: reservation.time,
      duration: reservation.duration,
      price: reservation.price,
      status: reservation.status,
      notes: reservation.notes
    });
    setSelectedReservation(null);
  };

  const handleDelete = (reservation) => {
    setDeletingReservation(reservation);
    setSelectedReservation(null);
  };

  const handleSaveEdit = async () => {
    if (!editingReservation) return;

    try {
      const response = await fetch('/api/reservations/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: editingReservation.id || editingReservation._id,
          ...editForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Aktualizacja lokalnej listy rezerwacji
        const reservationId = editingReservation.id || editingReservation._id;
        const index = reservations.findIndex(r => (r.id || r._id) === reservationId);
        if (index !== -1) {
          reservations[index] = { ...reservations[index], ...editForm };
        }
        setEditingReservation(null);
        setEditForm({});
        // Odświeżenie danych
        fetchReservations();
      } else {
        alert('Błąd podczas zapisywania zmian: ' + (data.error || 'Nieznany błąd'));
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error);
      alert('Wystąpił błąd podczas zapisywania zmian');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReservation) return;

    try {
      const reservationId = deletingReservation.id || deletingReservation._id;
      const response = await fetch(`/api/reservations/cancel?id=${reservationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Usunięcie z lokalnej listy
        const reservationId = deletingReservation.id || deletingReservation._id;
        const index = reservations.findIndex(r => (r.id || r._id) === reservationId);
        if (index !== -1) {
          reservations.splice(index, 1);
        }
        setDeletingReservation(null);
        // Odświeżenie danych
        fetchReservations();
      } else {
        alert('Błąd podczas usuwania: ' + (data.error || 'Nieznany błąd'));
      }
    } catch (error) {
      console.error('Błąd podczas usuwania:', error);
      alert('Wystąpił błąd podczas usuwania rezerwacji');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/business/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Rezerwacje
                </h1>
                <p className="text-sm text-gray-500">
                  Zarządzaj wszystkimi rezerwacjami
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
              <button
                onClick={() => router.push('/business/dashboard/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={async () => {
                  await logout();
                  router.push('/business/auth');
                }}
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
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getStatColor(stat.color)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={26} />
                  </div>
                  <div className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-3 py-1 rounded-lg`}>
                    {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-bold">{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Wykres tygodniowy */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rezerwacje w tym tygodniu</h3>
              <p className="text-sm text-gray-500 mt-1">Trend tygodniowy</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <Download size={18} />
              <span className="text-sm font-medium">Eksportuj</span>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData}>
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
              <Bar dataKey="rezerwacje" fill="#9333ea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filtry i wyszukiwanie */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Szukaj po nazwisku, usłudze lub emailu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all font-medium text-gray-700"
                >
                  <Filter size={20} />
                  Filtry
                  <ChevronDown size={16} />
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-10">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">Wszystkie</option>
                        <option value="confirmed">Potwierdzone</option>
                        <option value="pending">Oczekujące</option>
                        <option value="cancelled">Anulowane</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">Wszystkie</option>
                        <option value="today">Dzisiaj</option>
                        <option value="tomorrow">Jutro</option>
                        <option value="week">Ten tydzień</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Usługa</label>
                      <select
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Wszystkie usługi</option>
                        {availableServices.map((service, idx) => (
                          <option key={idx} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pracownik</label>
                      <select
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Wszyscy pracownicy</option>
                        {availableEmployees.map((employee) => (
                          <option key={employee.id} value={employee.id}>{employee.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sortowanie</label>
                      <div className="flex gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="date">Data</option>
                          <option value="price">Cena</option>
                          <option value="clientName">Klient</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
                          title={sortOrder === 'asc' ? 'Rosnąco' : 'Malejąco'}
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setDateFilter('all');
                        setServiceFilter('');
                        setEmployeeFilter('');
                        setSortBy('date');
                        setSortOrder('asc');
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      Wyczyść filtry
                    </button>
                  </div>
                )}
              </div>

              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                <Download size={20} />
                <span className="hidden sm:inline">Eksportuj</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista rezerwacji */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Wszystkie rezerwacje ({reservations.length})
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Zarządzaj rezerwacjami klientów
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usługa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pracownik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data i godzina
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Czas trwania
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map((reservation) => {
                    const StatusIcon = getStatusIcon(reservation.status);
                    return (
                      <tr
                        key={reservation.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                              {reservation.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{reservation.client}</p>
                              <p className="text-sm text-gray-500">{reservation.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{reservation.service}</p>
                        </td>
                        <td className="px-6 py-4">
                          {reservation.employee ? (
                            <div className="flex items-center gap-2">
                              {reservation.employee.avatar && (
                                <img
                                  src={reservation.employee.avatar}
                                  alt={reservation.employee.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              )}
                              <div
                                className={`w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold ${reservation.employee.avatar ? 'hidden' : ''}`}
                              >
                                {reservation.employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{reservation.employee.name}</p>
                                {reservation.employee.position && (
                                  <p className="text-xs text-gray-500">{reservation.employee.position}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Brak przypisania</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <p className="font-medium text-gray-900">{formatDate(reservation.date)}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={14} />
                              {reservation.time}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{reservation.duration} min</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{reservation.price} zł</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                            <StatusIcon size={14} />
                            {getStatusText(reservation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReservation(reservation);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(reservation);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(reservation);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal szczegółów rezerwacji */}
      {selectedReservation && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Szczegóły rezerwacji</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
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
                    {selectedReservation.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedReservation.client}</h3>
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
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Phone className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telefon</p>
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.phone}</p>
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
                    <p className="font-semibold text-gray-900">{selectedReservation.service}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Pracownik</p>
                    {selectedReservation.employee ? (
                      <div className="flex items-center gap-2">
                        {selectedReservation.employee.avatar && (
                          <img
                            src={selectedReservation.employee.avatar}
                            alt={selectedReservation.employee.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <p className="font-semibold text-gray-900">{selectedReservation.employee.name}</p>
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-400">Brak przypisania</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Cena</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedReservation.price} zł</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Data</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedReservation.date)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Godzina</p>
                    <p className="font-semibold text-gray-900">{selectedReservation.time}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Czas trwania</p>
                    <p className="font-semibold text-gray-900">{selectedReservation.duration} min</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusText(selectedReservation.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notatki */}
              {selectedReservation.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Notatki</p>
                      <p className="text-sm text-yellow-900">{selectedReservation.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Akcje */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleEdit(selectedReservation)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  <Edit size={18} />
                  Edytuj
                </button>
                <button
                  onClick={() => {
                    setSelectedReservation(null);
                    handleDelete(selectedReservation);
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
      )}

      {/* Modal edycji rezerwacji */}
      {editingReservation && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setEditingReservation(null);
            setEditForm({});
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edytuj rezerwację</h2>
                <button
                  onClick={() => {
                    setEditingReservation(null);
                    setEditForm({});
                  }}
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
                    Usługa
                  </label>
                  <input
                    type="text"
                    value={editForm.service || ''}
                    onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status || 'pending'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pending">Oczekująca</option>
                    <option value="confirmed">Potwierdzona</option>
                    <option value="cancelled">Anulowana</option>
                    <option value="completed">Zakończona</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Godzina
                  </label>
                  <input
                    type="time"
                    value={editForm.time || ''}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Czas trwania (min)
                  </label>
                  <input
                    type="number"
                    value={editForm.duration || ''}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cena (zł)
                  </label>
                  <input
                    type="number"
                    value={editForm.price || ''}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notatki
                </label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Dodaj notatki do rezerwacji..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingReservation(null);
                    setEditForm({});
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Zapisz zmiany
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal potwierdzenia usuwania */}
      {deletingReservation && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeletingReservation(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Usuń rezerwację</h2>
                  <p className="text-sm text-gray-500">Ta akcja jest nieodwracalna</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Czy na pewno chcesz usunąć rezerwację dla <strong>{deletingReservation.client}</strong>
                {' '}z dnia <strong>{formatDate(deletingReservation.date)}</strong> o godzinie <strong>{deletingReservation.time}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingReservation(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Settings,
  LogOut,
  Star,
  Eye,
  Plus,
  Bell,
  Edit
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth('/business/auth');
  const [businessData, setBusinessData] = useState(null);
  const [stats, setStats] = useState({
    totalReservations: 0,
    todayReservations: 0,
    totalClients: 0,
    revenue: 0
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'business') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Witaj, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/business/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {businessData?.companyName || user?.companyName || 'Twoja Firma'}
                </h2>
                <p className="text-gray-500 mt-1">
                  {businessData?.category || 'Kategoria'} • {businessData?.companyType || 'Typ działalności'}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Edit size={18} />
              Edytuj profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <MapPin className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Lokalizacja</p>
                <p className="text-gray-900 font-medium">
                  {businessData?.city || 'Miasto'}, {businessData?.address || 'Adres'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="text-gray-900 font-medium">{user?.phone || businessData?.phone || 'Brak'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalReservations}</h3>
            <p className="text-sm text-gray-500 mt-1">Wszystkie rezerwacje</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.todayReservations}</h3>
            <p className="text-sm text-gray-500 mt-1">Dzisiaj</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalClients}</h3>
            <p className="text-sm text-gray-500 mt-1">Klienci</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.revenue} zł</h3>
            <p className="text-sm text-gray-500 mt-1">Przychód</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ostatnie rezerwacje */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ostatnie rezerwacje</h3>
              <button
                onClick={() => router.push('/business/reservations')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Zobacz wszystkie
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Rezerwacja #{item}</p>
                      <p className="text-sm text-gray-500">Dzisiaj, 14:00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">150 zł</p>
                    <p className="text-sm text-gray-500">Nadchodząca</p>
                  </div>
                </div>
              ))}
              {stats.todayReservations === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
                  <p>Brak rezerwacji</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Szybkie akcje</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/business/reservations')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Calendar className="text-purple-600" size={20} />
                <span className="font-medium text-gray-900">Rezerwacje</span>
              </button>
              <button
                onClick={() => router.push('/business/calendar')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Clock className="text-purple-600" size={20} />
                <span className="font-medium text-gray-900">Kalendarz</span>
              </button>
              <button
                onClick={() => router.push('/business/settings')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Settings className="text-purple-600" size={20} />
                <span className="font-medium text-gray-900">Ustawienia</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <Eye className="text-purple-600" size={20} />
                <span className="font-medium text-gray-900">Podgląd profilu</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Twoje usługi</h4>
              <div className="flex flex-wrap gap-2">
                {businessData?.services?.slice(0, 3).map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {service}
                  </span>
                ))}
                {(!businessData?.services || businessData.services.length === 0) && (
                  <p className="text-sm text-gray-500">Brak usług</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

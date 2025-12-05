"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DayPicker } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  ArrowLeft,
  Building2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import 'react-day-picker/dist/style.css';

function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated, logout } = useAuth('/business/auth');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/business/auth');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user && user.role === 'business') {
      fetchReservations();
      checkGoogleCalendarConnection();
    }
  }, [user, currentMonth]);

  useEffect(() => {
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');

    if (success === 'connected') {
      setNotification({ type: 'success', message: 'Pomyślnie połączono z Google Calendar!' });
      checkGoogleCalendarConnection();
      // Usunięcie parametru z URL
      router.replace('/business/dashboard/calendar');
    } else if (error) {
      const errorMessages = {
        auth_failed: 'Autoryzacja nie powiodła się',
        callback_failed: 'Błąd podczas połączenia z Google Calendar',
        business_not_found: 'Nie znaleziono biznesu'
      };
      setNotification({
        type: 'error',
        message: errorMessages[error] || 'Wystąpił błąd'
      });
      // Usunięcie parametru z URL
      router.replace('/business/dashboard/calendar');
    }
  }, [searchParams, router]);

  // Auto-ukrywanie powiadomienia po 5 sekundach
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await fetch(
        `/api/reservations/list?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`,
        {
          credentials: 'include',
          method: 'GET'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Błąd pobierania rezerwacji:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGoogleCalendarConnection = async () => {
    try {
      const response = await fetch('/api/google-calendar/status', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleCalendarConnected(data.connected || false);
      }
    } catch (error) {
      console.error('Błąd sprawdzania połączenia z Google Calendar:', error);
    }
  };

  const handleGoogleCalendarConnect = async () => {
    try {
      window.location.href = '/api/google-calendar/auth';
    } catch (error) {
      console.error('Błąd połączenia z Google Calendar:', error);
    }
  };

  const handleSyncToGoogleCalendar = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Synchronizacja zakończona! Utworzono ${data.created || 0} wydarzeń.`);
        fetchReservations();
        checkGoogleCalendarConnection();
      } else {
        const error = await response.json();
        alert(`Błąd synchronizacji: ${error.error || 'Nieznany błąd'}`);
      }
    } catch (error) {
      console.error('Błąd synchronizacji:', error);
      alert('Wystąpił błąd podczas synchronizacji');
    } finally {
      setIsSyncing(false);
    }
  };

  const getReservationsForDate = (date) => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return isSameDay(reservationDate, date);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Potwierdzona';
      case 'pending': return 'Oczekująca';
      case 'cancelled': return 'Anulowana';
      case 'completed': return 'Zakończona';
      default: return 'Nieznany';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/business/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Ładowanie kalendarza...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'business') {
    return null;
  }

  const selectedDateReservations = getReservationsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Kalendarz
                </h1>
                <p className="text-sm text-gray-500">
                  Zarządzaj rezerwacjami
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {googleCalendarConnected ? (
                <button
                  onClick={handleSyncToGoogleCalendar}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  < RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">{isSyncing ? 'Synchronizowanie...' : 'Synchronizuj z Google'}</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleCalendarConnect}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Cloud size={18} />
                  <span className="hidden sm:inline">Połącz z Google Calendar</span>
                </button>
              )}
              <button
                onClick={() => router.push('/business/dashboard/settings')}
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
        {/* Powiadomienia */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg ${notification.type === 'success'
            ? 'bg-green-50 border-2 border-green-200 text-green-800'
            : 'bg-red-50 border-2 border-red-200 text-red-800'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kalendarz */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {format(currentMonth, 'MMMM yyyy', { locale: pl })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Dzisiaj
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={pl}
              className="w-full"
              modifiers={{
                hasReservations: reservations.map(r => new Date(r.date))
              }}
              modifiersClassNames={{
                hasReservations: 'has-reservations'
              }}
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                day_selected: 'bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white',
                day_today: 'bg-purple-100 text-purple-900 font-bold',
                day_outside: 'text-gray-400 opacity-50',
                day_disabled: 'text-gray-300',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
              }}
            />

            <style jsx global>{`
              .has-reservations::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background-color: #9333ea;
                border-radius: 50%;
              }
            `}</style>
          </div>

          {/* Lista rezerwacji */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: pl })}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedDateReservations.length} {selectedDateReservations.length === 1 ? 'rezerwacja' : 'rezerwacji'}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : selectedDateReservations.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">Brak rezerwacji na ten dzień</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {selectedDateReservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reservation) => (
                    <div
                      key={reservation._id}
                      onClick={() => setSelectedReservation(reservation)}
                      className={`p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all ${getStatusColor(reservation.status)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(reservation.status)}
                          <span className="text-xs font-medium">
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                        {reservation.googleCalendarSynced && (
                          <Cloud size={14} className="text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} />
                        <span className="font-semibold">{reservation.time}</span>
                        <span className="text-xs text-gray-600">({reservation.duration} min)</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{reservation.service}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} />
                        <span className="text-sm">{reservation.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} />
                        <span className="text-sm">{reservation.clientPhone}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300">
                        <span className="text-sm font-semibold">{reservation.price} zł</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal szczegółów rezerwacji */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReservation(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Szczegóły rezerwacji</h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Usługa</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.service}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data</label>
                    <p className="text-gray-900">{format(new Date(selectedReservation.date), 'd MMMM yyyy', { locale: pl })}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Godzina</label>
                    <p className="text-gray-900">{selectedReservation.time}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Klient</label>
                  <p className="text-gray-900">{selectedReservation.clientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedReservation.clientEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p className="text-gray-900">{selectedReservation.clientPhone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Cena</label>
                  <p className="text-2xl font-bold text-purple-600">{selectedReservation.price} zł</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedReservation.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusText(selectedReservation.status)}
                    </span>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notatki</label>
                    <p className="text-gray-900">{selectedReservation.notes}</p>
                  </div>
                )}

                {selectedReservation.googleCalendarSynced && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Cloud size={18} className="text-blue-600" />
                    <span className="text-sm text-blue-700">Zsynchronizowane z Google Calendar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Ładowanie kalendarza...</p>
        </div>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}


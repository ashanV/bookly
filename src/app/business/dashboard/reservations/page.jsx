'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import ReservationsHeader from '@/components/dashboard/reservations/ReservationsHeader';
import ReservationsSearchBar from '@/components/dashboard/reservations/ReservationsSearchBar';
import ReservationsTable from '@/components/dashboard/reservations/ReservationsTable';
import ReservationDetailModal from '@/components/dashboard/reservations/ReservationDetailModal';
import ReservationEditModal from '@/components/dashboard/reservations/ReservationEditModal';
import ReservationDeleteModal from '@/components/dashboard/reservations/ReservationDeleteModal';

export default function ReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth('/business/auth');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
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
      } else if (dateFilter === 'currentMonth') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        params.append('startDate', firstDay.toISOString().split('T')[0]);
        params.append('endDate', lastDay.toISOString().split('T')[0]);
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
        const createdByName = user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.name || 'System';

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
          employee: res.employee,
          createdAt: res.createdAt ? new Date(res.createdAt) : new Date(),
          createdBy: createdByName,
          referenceNumber: res.referenceNumber || null
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


  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Zarezerwowana';
      case 'pending': return 'Oczekująca';
      case 'cancelled': return 'Anulowana';
      case 'completed': return 'Zakończona';
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

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleCurrentMonthClick = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFilter('currentMonth');
    // This will trigger the useEffect to refetch with date range
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReservationsHeader
          onBack={() => router.push('/business/dashboard')}
          onExport={handleExport}
        />

        <ReservationsSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCurrentMonthClick={handleCurrentMonthClick}
          onFiltersClick={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSortBy}
          onSortOrderChange={setSortOrder}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          employeeFilter={employeeFilter}
          serviceFilter={serviceFilter}
          onStatusFilterChange={setStatusFilter}
          onDateFilterChange={setDateFilter}
          onEmployeeFilterChange={setEmployeeFilter}
          onServiceFilterChange={setServiceFilter}
          availableServices={availableServices}
          availableEmployees={availableEmployees}
          onClearFilters={() => {
            setStatusFilter('all');
            setDateFilter('all');
            setServiceFilter('');
            setEmployeeFilter('');
            setSortBy('date');
            setSortOrder('desc');
          }}
        />

        <ReservationsTable
          reservations={reservations}
          loading={loading}
          onReservationClick={setSelectedReservation}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          getStatusIcon={getStatusIcon}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      </div>

      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        formatDate={formatDate}
      />

      <ReservationEditModal
        reservation={editingReservation}
        editForm={editForm}
        onClose={() => {
          setEditingReservation(null);
          setEditForm({});
        }}
        onSave={handleSaveEdit}
        onFormChange={setEditForm}
      />

      <ReservationDeleteModal
        reservation={deletingReservation}
        onClose={() => setDeletingReservation(null)}
        onConfirm={handleConfirmDelete}
        formatDate={formatDate}
      />
    </div>
  );
}

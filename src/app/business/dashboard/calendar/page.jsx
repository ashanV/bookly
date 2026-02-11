"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, isSameDay, addDays, subDays, addWeeks, startOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import DailyCalendar from '@/components/dashboard/calendar/DailyCalendar';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  RefreshCw,
  Plus,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
  User as UserIcon,
  RotateCcw,
  LayoutList,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuth('/business/auth');

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [viewType, setViewType] = useState('Dzień');

  // Authentication Check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/business/auth');
    }
  }, [loading, isAuthenticated, router]);

  // Initial Data Fetch
  useEffect(() => {
    if (user && user.role === 'business') {
      fetchBusinessData();
      fetchReservations();
    }
  }, [user, currentMonth]);

  // Fetch Employees
  const fetchBusinessData = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/businesses/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.business?.employees) {
          setEmployees(data.business.employees);
          // Initialize selection with all employees
          setSelectedEmployeeIds(data.business.employees.map(e => e._id));
        }
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedEmployeeIds(employees.map(e => e._id));
  };

  const clearAll = () => {
    setSelectedEmployeeIds([]);
  };

  // Fetch Reservations
  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await fetch(
        `/api/reservations/list?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReservations();
  };

  const jumpTo = (weeks) => {
    const newDate = addWeeks(new Date(), weeks);
    setSelectedDate(newDate);
    setCurrentMonth(newDate);
    setIsDatePickerOpen(false);
  };

  const handleResetView = () => {
    setSelectedDate(new Date());
    setViewType('Dzień');
    // Optional: Reset other filters if needed
  };

  const handleViewChange = (type) => {
    setViewType(type);
    setIsViewDropdownOpen(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  if (!isAuthenticated) return null;

  const todayReservations = reservations.filter(r => isSameDay(new Date(r.date), selectedDate));
  const filteredEmployees = employees.filter(e => selectedEmployeeIds.includes(e._id));

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-gray-900" onClick={() => { setIsDatePickerOpen(false); setIsTeamDropdownOpen(false); setIsViewDropdownOpen(false); }}>
      {/* Top Toolbar */}
      <header className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 z-50 relative" onClick={e => e.stopPropagation()}>

        {/* Left: Navigation Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Dzisiaj
          </button>

          <div className="flex items-center bg-white border border-gray-300 rounded-full px-1 py-1 shadow-sm relative">
            <button
              onClick={() => {
                if (viewType === 'Miesiąc') {
                  setSelectedDate(subDays(selectedDate, 30)); // Rough month jump, or use subMonths if available. 
                  // Ideally use subMonths from date-fns but need to import it. 
                  // Let's check imports. Just subDays(30) is risky. 
                  // Actually, I can use addWeeks(..., -4) or improved logic.
                  // Wait, I should import addMonths/subMonths.
                  // For now let's reuse subDays if I don't want to re-import.
                  // But date-fns is powerful.
                  // Let's stick to subDays(28) or similar? No.
                  // I'll update the imports first in next step if needed. 
                  // Or I assume subDays logic is temporary.
                  // Actually, let's use the native setMonth.
                  const d = new Date(selectedDate);
                  d.setMonth(d.getMonth() - 1);
                  setSelectedDate(d);
                  return;
                }
                let diff = 1;
                if (viewType === '3 dni') diff = 3;
                if (viewType === 'Tydzień') diff = 7;
                setSelectedDate(subDays(selectedDate, diff));
              }}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

            {/* Date Trigger for Modal */}
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="px-3 text-sm font-semibold text-gray-900 min-w-[120px] text-center hover:bg-gray-50 rounded-md transition-colors"
            >
              {(() => {
                if (viewType === '3 dni') {
                  return `${format(selectedDate, 'd MMM', { locale: pl })} - ${format(addDays(selectedDate, 2), 'd MMM, yyyy', { locale: pl })}`;
                }
                if (viewType === 'Tydzień') {
                  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
                  return `${format(start, 'd MMM', { locale: pl })} - ${format(addDays(start, 6), 'd MMM, yyyy', { locale: pl })}`;
                }
                if (viewType === 'Miesiąc') {
                  return format(selectedDate, 'MMMM yyyy', { locale: pl });
                }
                return format(selectedDate, 'EEE, d MMM', { locale: pl });
              })()}
            </button>

            <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
            <button
              onClick={() => {
                if (viewType === 'Miesiąc') {
                  const d = new Date(selectedDate);
                  d.setMonth(d.getMonth() + 1);
                  setSelectedDate(d);
                  return;
                }
                let diff = 1;
                if (viewType === '3 dni') diff = 3;
                if (viewType === 'Tydzień') diff = 7;
                setSelectedDate(addDays(selectedDate, diff));
              }}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            {/* Date Picker Popover */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-[750px] z-[100] animate-in fade-in zoom-in-95 duration-200 cursor-auto" onClick={e => e.stopPropagation()}>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  numberOfMonths={2}
                  pagedNavigation
                  locale={pl}
                  className="custom-fresha-picker"
                  classNames={{
                    months: "flex gap-12",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-lg font-bold text-gray-900 capitalize",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-400 rounded-md w-10 font-normal text-[0.8rem] capitalize",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-600 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900 font-bold",
                  }}
                />

                {/* Footer Quick Actions */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                  {[1, 2, 3, 4, 5].map(week => (
                    <button
                      key={week}
                      onClick={() => jumpTo(week)}
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      Za {week} {week === 1 ? 'tydzień' : week < 5 ? 'tygodnie' : 'tygodni'}
                    </button>
                  ))}
                  <button className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2">
                    Więcej <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Employee Filter Dropdown */}
          <div className="flex items-center gap-2 ml-4 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-1.5 bg-white border ${isTeamDropdownOpen ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-300'} rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm`}
            >
              {selectedEmployeeIds.length === employees.length ? (
                <>Cały zespół <ChevronDown size={14} className={`transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} /></>
              ) : selectedEmployeeIds.length === 1 ? (
                (() => {
                  const emp = employees.find(e => e._id === selectedEmployeeIds[0]);
                  return (
                    <>
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                        {emp?.avatar && (emp.avatar.startsWith('http') || emp.avatar.startsWith('/')) ? (
                          <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{emp?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span>{emp?.name}</span>
                      <ChevronDown size={14} className={`transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  );
                })()
              ) : (
                <>{selectedEmployeeIds.length} pracowników <ChevronDown size={14} className={`transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} /></>
              )}
            </button>

            {isTeamDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    <UserIcon size={16} /> Pracownicy na zmianie
                  </button>
                  <button
                    onClick={selectAll}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-3 ${selectedEmployeeIds.length === employees.length ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <UserIcon size={16} /> Cały zespół
                  </button>
                  <div className="flex items-center gap-3 px-3 py-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                      {user?.firstName?.[0] || 'T'}{user?.lastName?.[0] || 'Y'}
                    </div>
                    <span className="text-sm font-medium">{user?.firstName || 'Ty'} (Ty)</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-bold text-gray-900">Pracownicy</span>
                    <button onClick={clearAll} className="text-xs font-semibold text-purple-600 hover:text-purple-700">Wyczyść wszystko</button>
                  </div>
                  <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                    {employees.map(emp => (
                      <div
                        key={emp._id}
                        onClick={() => { setSelectedEmployeeIds([emp._id]); setIsTeamDropdownOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${selectedEmployeeIds.includes(emp._id) ? 'bg-purple-600' : 'bg-gray-200'}`}
                          onClick={(e) => { e.stopPropagation(); toggleEmployee(emp._id); }}
                        >
                          {selectedEmployeeIds.includes(emp._id) && <Check size={14} className="text-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                          {emp.avatar && (emp.avatar.startsWith('http') || emp.avatar.startsWith('/')) ? (
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 flex-1">{emp.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 text-gray-600 shadow-sm ml-2">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" onClick={() => router.push('/business/dashboard/settings')}>
            <Settings size={20} />
          </button>

          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Calendar size={20} />
          </button>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm ml-2 hidden">
            {/* Hidden original Day button */}
          </button>

          {/* Grouped Refresh and View Dropdown */}
          <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm ml-2 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-gray-50 rounded-l-full border-r border-gray-300 text-gray-600 transition-colors"
              title="Resetuj widok"
            >
              <RotateCcw size={18} />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="flex items-center gap-2 px-4 py-1.5 hover:bg-gray-50 rounded-r-full text-sm font-semibold text-gray-700 transition-colors min-w-[90px] justify-between"
              >
                {viewType} <ChevronDown size={14} className={`transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isViewDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1">
                    <button onClick={() => handleViewChange('Dzień')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                      <LayoutList size={16} /> Dzień
                    </button>
                    <button onClick={() => handleViewChange('3 dni')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                      <CalendarDays size={16} /> 3 dni
                    </button>
                    <button onClick={() => handleViewChange('Tydzień')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                      <CalendarRange size={16} /> Tydzień
                    </button>
                    <button onClick={() => handleViewChange('Miesiąc')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                      <Calendar size={16} /> Miesiąc
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm ml-2">
            Dodaj <ChevronDown size={14} />
          </button>
        </div>
      </header>

      {/* Main Calendar Area - Clean and Full Width */}
      <div className="flex-1 overflow-hidden relative bg-white">
        <DailyCalendar
          date={selectedDate}
          employees={filteredEmployees}
          reservations={todayReservations}
          onReservationClick={(res) => console.log('Reservation clicked:', res)}
          onEmptySlotClick={() => { }}
          viewType={viewType}
          onViewChange={handleViewChange}
          onEmployeeFilter={(employeeId) => setSelectedEmployeeIds([employeeId])}
        />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarContent />
    </Suspense>
  );
}

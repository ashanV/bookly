import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Plus, Info, PenLine, Trash2, Repeat, MapPin, UserCog, Briefcase, UserPlus, CalendarOff, Settings, ChevronDown, Palmtree, Building, MoreVertical, Edit2 } from 'lucide-react';
import {
    format,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfMonth,
    endOfMonth,
    getDay,
    isWithinInterval,
    addDays
} from 'date-fns';
import { pl } from 'date-fns/locale';
import EmployeeSelectionModal from './EmployeeSelectionModal';
import VacationModal from './VacationModal';
import ShiftModal from './ShiftModal';
import RecurringShiftsPage from './RecurringShiftsPage';
import ConfirmationModal from './ConfirmationModal'; // Assuming this is a new component

const DAYS_MAP = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    0: 'sunday'
};

// const VACATION_TYPES_MAP = { // This map is removed as per the diff
//     'vacation': 'Urlop wypoczynkowy',
//     'sick': 'Zwolnienie lekarskie',
//     'unpaid': 'Urlop bezpłatny',
//     'other': 'Inny'
// };

export default function WorkSchedule({ employees = [], openingHours, onEmployeeUpdate, businessName, onAddEmployee, onEditClick, onUpdateShifts, onAddVacation, onUpdateVacation, onDeleteVacation }) {
    const t = useTranslations('BusinessWorkSchedule');
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date()); // Added from diff

    // Employee Selection Modal State
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [visibleEmployeeIds, setVisibleEmployeeIds] = useState([]);

    // Vacation Modal State
    const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
    const [vacationModalEmployeeId, setVacationModalEmployeeId] = useState(null);
    const [vacationModalData, setVacationModalData] = useState(null);

    // Interactive Calendar Cells State
    const [hoveredCell, setHoveredCell] = useState(null); // { employeeId, dayIndex }
    const [activeCellDropdown, setActiveCellDropdown] = useState(null); // { employeeId, dayIndex, day }
    const [activeVacationDropdown, setActiveVacationDropdown] = useState(null); // { vacationId }

    // Shift Modal State
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [shiftModalEmployee, setShiftModalEmployee] = useState(null);
    const [shiftModalDate, setShiftModalDate] = useState(null);

    // Delete Shift Confirmation Modal State
    const [deleteShiftModal, setDeleteShiftModal] = useState(null); // { employeeId, date, shiftIndex }

    // Recurring Shifts Page State
    const [isRecurringShiftsOpen, setIsRecurringShiftsOpen] = useState(false);
    const [recurringShiftsEmployee, setRecurringShiftsEmployee] = useState(null);

    // Day Header Tooltip State
    const [hoveredDay, setHoveredDay] = useState(null);

    // Initialize visible employees when employees prop changes
    useEffect(() => {
        if (employees.length > 0 && visibleEmployeeIds.length === 0) {
            setVisibleEmployeeIds(employees.map(e => e.id));
        }
    }, [employees]);

    const dropdownRef = useRef(null);
    const calendarRef = useRef(null);
    const addDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null);
            }
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
            if (addDropdownRef.current && !addDropdownRef.current.contains(event.target)) {
                setIsAddDropdownOpen(false);
            }
            // Close cell dropdown when clicking outside
            // Check if click is not on a plus button or dropdown
            const isClickOnCellButton = event.target.closest('button')?.querySelector('.lucide-plus');
            const isClickOnCellDropdown = event.target.closest('[data-cell-dropdown]');
            if (!isClickOnCellButton && !isClickOnCellDropdown) {
                setActiveCellDropdown(null);
            }

            // Close vacation dropdown
            const isClickOnVacation = event.target.closest('[data-vacation-block]');
            const isClickOnVacationDropdown = event.target.closest('[data-vacation-dropdown]');
            if (!isClickOnVacation && !isClickOnVacationDropdown) {
                setActiveVacationDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

    const handleDateSelect = (date) => {
        setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
        setIsCalendarOpen(false);
    };

    const handleDeleteAllShifts = (employee) => {
        if (confirm(t('deleteAllShiftsConfirm', { employeeName: employee.name }))) {
            const updatedEmployee = JSON.parse(JSON.stringify(employee));
            if (updatedEmployee.availability) {
                Object.keys(updatedEmployee.availability).forEach(key => {
                    updatedEmployee.availability[key] = {
                        ...updatedEmployee.availability[key],
                        closed: true,
                        open: '00:00',
                        close: '00:00'
                    };
                });
            }
            if (onEmployeeUpdate) {
                const updatedEmployees = employees.map(emp =>
                    emp.id === employee.id ? updatedEmployee : emp
                );
                onEmployeeUpdate(updatedEmployees);
            }
            setActiveDropdownId(null);
        }
    };

    const handleDeleteVacation = (employeeId, vacationId) => {
        if (confirm(t('deleteVacationConfirm'))) {
            const updatedEmployees = employees.map(emp => {
                if (emp.id === employeeId) {
                    return {
                        ...emp,
                        vacations: emp.vacations.filter(v => v.id !== vacationId)
                    };
                }
                return emp;
            });
            if (onEmployeeUpdate) {
                onEmployeeUpdate(updatedEmployees);
            }
            setActiveVacationDropdown(null);
        }
    };

    const handleEditVacation = (employeeId, vacation) => {
        setVacationModalEmployeeId(employeeId);
        setVacationModalData(vacation);
        setIsVacationModalOpen(true);
        setActiveVacationDropdown(null);
    };

    const getEmployeeHours = (employee, date) => {
        const dayIndex = getDay(date);
        const dayKey = DAYS_MAP[dayIndex];
        const dateStr = format(date, 'yyyy-MM-dd');

        // Check for day-specific shifts first (manual overrides)
        const dayShifts = employee.dayShifts?.[dateStr];
        if (dayShifts && dayShifts.length > 0) {
            return dayShifts;
        }

        // Check for recurring shifts (multiple shifts per day)
        const recurringDaySchedule = employee.recurringShifts?.[dayKey];
        if (recurringDaySchedule?.enabled && recurringDaySchedule.shifts?.length > 0) {
            return recurringDaySchedule.shifts.map((shift, idx) => ({
                id: `recurring-${dayKey}-${idx}`,
                start: shift.start,
                end: shift.end
            }));
        }

        // Fall back to simple weekly schedule (single shift)
        const schedule = employee.availability?.[dayKey];
        if (!schedule || schedule.closed) return null;
        return [{ id: 'default', start: schedule.open, end: schedule.close }];
    };

    const handleEmployeeSelectionSave = (selectedIds) => {
        setVisibleEmployeeIds(selectedIds);
    };

    const handleVacationSave = (vacationData) => {
        const updatedEmployees = employees.map(emp => {
            if (emp.id === vacationData.employeeId) {
                return {
                    ...emp,
                    vacations: vacationData.id
                        ? emp.vacations.map(v => v.id === vacationData.id ? {
                            ...v,
                            type: vacationData.type,
                            startDate: vacationData.startDate,
                            startTime: vacationData.startTime,
                            endDate: vacationData.endDate,
                            endTime: vacationData.endTime,
                            recurring: vacationData.recurring,
                            notes: vacationData.notes
                        } : v)
                        : [
                            ...(emp.vacations || []),
                            {
                                id: Date.now(),
                                type: vacationData.type,
                                startDate: vacationData.startDate,
                                startTime: vacationData.startTime,
                                endDate: vacationData.endDate,
                                endTime: vacationData.endTime,
                                recurring: vacationData.recurring,
                                notes: vacationData.notes
                            }
                        ]
                };
            }
            return emp;
        });

        if (onEmployeeUpdate) {
            onEmployeeUpdate(updatedEmployees);
        }
    };

    const handleOpenShiftModal = (employee, day) => {
        setShiftModalEmployee(employee);
        setShiftModalDate(day);
        setIsShiftModalOpen(true);
        setActiveCellDropdown(null);
    };

    const handleShiftSave = (shiftData) => {
        const updatedEmployees = employees.map(emp => {
            if (emp.id === shiftData.employeeId) {
                return {
                    ...emp,
                    dayShifts: {
                        ...emp.dayShifts,
                        [shiftData.date]: shiftData.shifts
                    }
                };
            }
            return emp;
        });
        if (onEmployeeUpdate) {
            onEmployeeUpdate(updatedEmployees);
        }
    };

    const handleDeleteShift = () => {
        if (!deleteShiftModal) return;

        const { employeeId, date, shiftIndex } = deleteShiftModal;
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayIndex = getDay(date);
        const dayKey = DAYS_MAP[dayIndex];

        const updatedEmployees = employees.map(emp => {
            if (emp.id === employeeId) {
                // Check if this is a day-specific shift
                const dayShifts = emp.dayShifts?.[dateStr];
                if (dayShifts && dayShifts.length > 0) {
                    const newShifts = dayShifts.filter((_, idx) => idx !== shiftIndex);
                    return {
                        ...emp,
                        dayShifts: {
                            ...emp.dayShifts,
                            [dateStr]: newShifts
                        }
                    };
                }

                // Check if this is a recurring shift
                const recurringDaySchedule = emp.recurringShifts?.[dayKey];
                if (recurringDaySchedule?.enabled && recurringDaySchedule.shifts?.length > 0) {
                    const newShifts = recurringDaySchedule.shifts.filter((_, idx) => idx !== shiftIndex);
                    return {
                        ...emp,
                        recurringShifts: {
                            ...emp.recurringShifts,
                            [dayKey]: {
                                ...recurringDaySchedule,
                                shifts: newShifts,
                                enabled: newShifts.length > 0
                            }
                        }
                    };
                }
            }
            return emp;
        });

        if (onEmployeeUpdate) {
            onEmployeeUpdate(updatedEmployees);
        }
        setDeleteShiftModal(null);
    };

    const handleOpenRecurringShifts = (employee) => {
        setRecurringShiftsEmployee(employee);
        setIsRecurringShiftsOpen(true);
        setActiveCellDropdown(null);
        setActiveDropdownId(null);
    };

    const handleRecurringShiftsSave = (data) => {
        const updatedEmployees = employees.map(emp => {
            if (emp.id === data.employeeId) {
                return {
                    ...emp,
                    availability: data.availability,
                    recurringShifts: data.recurringShifts
                };
            }
            return emp;
        });
        if (onEmployeeUpdate) {
            onEmployeeUpdate(updatedEmployees);
        }
    };

    const visibleEmployees = employees.filter(emp => visibleEmployeeIds.includes(emp.id));

    // Calendar Picker Logic
    const monthStart = startOfMonth(pickerDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
    });

    // Hour Calculation Helpers
    const calculateDurationInMinutes = (start, end) => {
        if (!start || !end) return 0;
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    };

    const formatMinutesToHours = (minutes) => {
        if (minutes <= 0) return '0 min';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours} ${t('hoursShort')}`;
        return `${hours} ${t('hoursShort')} ${mins} ${t('minsShort')}`;
    };

    const getDailyTotalMinutes = (day) => {
        let totalMinutes = 0;
        visibleEmployees.forEach(employee => {
            const shifts = getEmployeeHours(employee, day);
            if (shifts) {
                shifts.forEach(shift => {
                    totalMinutes += calculateDurationInMinutes(shift.start, shift.end);
                });
            }
        });
        return totalMinutes;
    };

    const getEmployeeWeeklyMinutes = (employee) => {
        let totalMinutes = 0;
        weekDays.forEach(day => {
            const shifts = getEmployeeHours(employee, day);
            if (shifts) {
                shifts.forEach(shift => {
                    totalMinutes += calculateDurationInMinutes(shift.start, shift.end);
                });
            }
        });
        return totalMinutes;
    };

    const getVacationTypeTranslation = (type) => {
        return t(`vacationTypes.${type}`, { defaultValue: type });
    };

    const totalWorkTime = useMemo(() => {
        const totalMinutes = getDailyTotalMinutes(selectedDate);
        return {
            hours: Math.floor(totalMinutes / 60),
            minutes: totalMinutes % 60
        };
    }, [selectedDate, visibleEmployees]);


    return (
        <div className="bg-white min-h-screen p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={18} />
                        {t('options')}
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={18} />
                            {t('add')}
                            <ChevronDown size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                            <button
                                onClick={() => setIsVacationModalOpen(true)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Palmtree size={16} /> {t('vacation')}
                            </button>
                            <button
                                onClick={() => {
                                    if (onAddEmployee) onAddEmployee();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <UserPlus size={16} /> {t('newEmployee')}
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Building size={16} /> {t('closingDates')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Week Navigation */}
            <div className="flex justify-between items-center mb-6 relative">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
                        {t('week')} {format(weekDays[0], 'd')} - {format(weekDays[6], 'd.MM.yyyy')}
                    </h2>
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button className="px-3 py-1.5 text-xs font-bold bg-white text-blue-600 rounded-md shadow-sm">{t('day')}</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">{t('3days')}</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">{t('week')}</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">{t('month')}</button>
                    </div>
                </div>
                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button
                        onClick={handlePrevWeek}
                        className="p-2 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-gray-900 hover:shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 py-1 font-medium text-gray-700 border-l border-r border-gray-200 mx-1">
                        {t('week')}
                    </div>
                    <button
                        onClick={() => {
                            setPickerDate(currentWeekStart);
                            setIsCalendarOpen(!isCalendarOpen);
                        }}
                        className="px-4 py-1 font-medium text-gray-900 min-w-[160px] text-center hover:bg-white rounded-md transition-all hover:shadow-sm"
                    >
                        {format(weekStart, 'd', { locale: pl })} - {format(weekEnd, 'd MMM, yyyy', { locale: pl })}
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="p-2 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-gray-900 hover:shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Calendar Popover */}
                {isCalendarOpen && (
                    <div ref={calendarRef} className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50 w-80 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <button onClick={() => setPickerDate(subMonths(pickerDate, 1))} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-gray-900 capitalize">
                                {format(pickerDate, 'LLLL yyyy', { locale: pl })}
                            </span>
                            <button onClick={() => setPickerDate(addMonths(pickerDate, 1))} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                            {[t('monShort'), t('tueShort'), t('wedShort'), t('thuShort'), t('friShort'), t('satShort'), t('sunShort')].map(day => (
                                <div key={day} className="text-xs font-medium text-gray-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => {
                                const isSelected = isWithinInterval(day, { start: weekStart, end: weekEnd });
                                const isCurrentMonth = isSameMonth(day, pickerDate);
                                const isStart = isSameDay(day, weekStart);
                                const isEnd = isSameDay(day, weekEnd);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDateSelect(day)}
                                        className={`
                      h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                      ${isSelected ? 'bg-blue-50 text-blue-700' : ''}
                      ${(isStart || isEnd) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-105' : ''}
                    `}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <EmployeeSelectionModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                employees={employees}
                selectedEmployeeIds={visibleEmployeeIds}
                onSave={handleEmployeeSelectionSave}
                businessName={businessName}
            />

            <VacationModal
                isOpen={isVacationModalOpen}
                onClose={() => {
                    setIsVacationModalOpen(false);
                    setVacationModalEmployeeId(null);
                    setVacationModalData(null);
                }}
                employees={employees}
                onSave={handleVacationSave}
                initialEmployeeId={vacationModalEmployeeId}
                initialData={vacationModalData}
            />

            <ShiftModal
                isOpen={isShiftModalOpen}
                onClose={() => {
                    setIsShiftModalOpen(false);
                    setShiftModalEmployee(null);
                    setShiftModalDate(null);
                }}
                employee={shiftModalEmployee}
                date={shiftModalDate}
                onSave={handleShiftSave}
                existingShifts={shiftModalEmployee && shiftModalDate ? getEmployeeHours(shiftModalEmployee, shiftModalDate) : []}
            />

            {/* Delete Shift Confirmation Modal */}
            {deleteShiftModal && (
                <ConfirmationModal
                    isOpen={!!deleteShiftModal}
                    onClose={() => setDeleteShiftModal(null)}
                    onConfirm={handleDeleteShift}
                    title={t('deleteShiftTitle')}
                    description={t('deleteShiftConfirm')}
                    cancelText={t('cancel')}
                    confirmText={t('delete')}
                />
            )}

            {/* Schedule Table */}
            <div className="bg-white">
                {/* Table Header */}
                <div className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-gray-200">
                    <div className="p-4 flex items-center gap-2">
                        <span className="font-bold text-gray-900">{t('employee')}</span>
                        <button
                            onClick={() => setIsEmployeeModalOpen(true)}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            {t('change')}
                        </button>
                    </div>
                    {weekDays.map((day, index) => (
                        <div
                            key={day.toString()}
                            className="p-4 text-center relative group"
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            <div className="font-bold text-gray-900 capitalize text-sm">
                                {format(day, 'EEE, d MMM', { locale: pl })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {formatMinutesToHours(getDailyTotalMinutes(day))}
                            </div>

                            {/* Tooltip */}
                            {hoveredDay && isSameDay(hoveredDay, day) && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 text-left pointer-events-none">
                                    <div className="font-bold mb-2 text-sm capitalize">
                                        {format(day, 'EEEE, d MMM', { locale: pl })}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <span>{t('bookable')}:</span>
                                        </div>
                                        <div className="pl-4 font-bold text-sm">
                                            {formatMinutesToHours(getDailyTotalMinutes(day))}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            <span>{t('nonBookable')}: 0 {t('minsShort')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Employee Rows */}
                <div className="divide-y divide-gray-100">
                    {visibleEmployees.map((employee) => (
                        <div key={employee.id} className="grid grid-cols-[250px_repeat(7,1fr)] group">
                            {/* Employee Info Column */}
                            <div className="p-4 flex items-center gap-3 border-r border-gray-50">
                                {employee.avatarImage ? (
                                    <img
                                        src={employee.avatarImage}
                                        alt={employee.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                                        {employee.avatar || employee.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-900 truncate text-sm">{employee.name}</div>
                                    <div className="text-xs text-gray-500">{formatMinutesToHours(getEmployeeWeeklyMinutes(employee))}</div>
                                </div>
                                <button
                                    onClick={() => setActiveDropdownId(activeDropdownId === employee.id ? null : employee.id)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                                >
                                    <PenLine size={16} />
                                </button>

                                {/* Employee Dropdown */}
                                {activeDropdownId === employee.id && (
                                    <div ref={dropdownRef} className="absolute left-[240px] mt-8 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleOpenRecurringShifts(employee)}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Repeat size={16} className="text-gray-400" />
                                                {t('setRecurringShifts')}
                                            </button>
                                            <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                                <MapPin size={16} className="text-gray-400" />
                                                {t('removeFromLocation')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (onEditClick) onEditClick(employee.id);
                                                    setActiveDropdownId(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <UserCog size={16} className="text-gray-400" />
                                                {t('editEmployeeInfo')}
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button
                                                onClick={() => handleDeleteAllShifts(employee)}
                                                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                                            >
                                                <Trash2 size={16} />
                                                {t('deleteAllShifts')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Shift Cells */}
                            {weekDays.map((day, dayIndex) => {
                                const hours = getEmployeeHours(employee, day);
                                const vacations = employee.vacations?.filter(v =>
                                    isWithinInterval(day, {
                                        start: new Date(v.startDate),
                                        end: new Date(v.endDate)
                                    })
                                ) || [];

                                const isCellDropdownOpen = activeCellDropdown?.employeeId === employee.id && activeCellDropdown?.dayIndex === dayIndex;
                                const isVacationDropdownOpen = vacations.some(v => activeVacationDropdown?.vacationId === v.id && activeVacationDropdown?.dayIndex === dayIndex && activeVacationDropdown?.employeeId === employee.id);
                                const isAnyDropdownOpen = isCellDropdownOpen || isVacationDropdownOpen;
                                const isHovered = hoveredCell?.employeeId === employee.id && hoveredCell?.dayIndex === dayIndex;

                                return (
                                    <div
                                        key={day.toString()}
                                        className={`p-1 border-l border-gray-50 relative min-h-[5rem] h-auto transition-all flex flex-col justify-center ${isAnyDropdownOpen ? 'z-50' : 'z-0'}`}
                                        onMouseEnter={() => setHoveredCell({ employeeId: employee.id, dayIndex })}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    >
                                        <div className="flex flex-col gap-1 w-full relative z-10">
                                            {/* Vacation Blocks */}
                                            {vacations.map((vacation) => (
                                                <div
                                                    key={vacation.id}
                                                    data-vacation-block
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveVacationDropdown(
                                                            activeVacationDropdown?.vacationId === vacation.id &&
                                                                activeVacationDropdown?.dayIndex === dayIndex &&
                                                                activeVacationDropdown?.employeeId === employee.id
                                                                ? null
                                                                : { vacationId: vacation.id, dayIndex, employeeId: employee.id }
                                                        );
                                                    }}
                                                    className={`w-full min-h-[5rem] p-2 rounded-lg border border-gray-200 text-xs text-gray-700 shadow-sm relative group/vacation cursor-pointer hover:border-gray-300 transition-colors flex flex-col justify-center items-center text-center ${activeVacationDropdown?.vacationId === vacation.id && activeVacationDropdown?.dayIndex === dayIndex && activeVacationDropdown?.employeeId === employee.id ? 'ring-2 ring-blue-600 ring-offset-1 z-20' : 'z-10'}`}
                                                    style={{
                                                        backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 10px, #f8fafc 10px, #f8fafc 20px)'
                                                    }}
                                                >
                                                    <div className="font-semibold text-gray-800 relative z-10">{getVacationTypeTranslation(vacation.type)}</div>
                                                    <div className="text-[11px] text-gray-500 relative z-10">{vacation.startTime} - {vacation.endTime}</div>

                                                    {/* Vacation Dropdown */}
                                                    {activeVacationDropdown?.vacationId === vacation.id && activeVacationDropdown?.dayIndex === dayIndex && activeVacationDropdown?.employeeId === employee.id && (
                                                        <div data-vacation-dropdown className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditVacation(employee.id, vacation);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <PenLine size={14} className="text-gray-400" />
                                                                    {t('edit')}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteVacation(employee.id, vacation.id);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    {t('delete')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Shift Cells */}
                                            {hours && hours.length > 0 && hours.map((shift, shiftIndex) => {
                                                const isThisShiftActive = activeCellDropdown?.dayIndex === dayIndex &&
                                                    activeCellDropdown?.employeeId === employee.id &&
                                                    activeCellDropdown?.shiftIndex === shiftIndex &&
                                                    activeCellDropdown?.trigger === 'cell';

                                                return (
                                                    <div
                                                        key={shift.id || shiftIndex}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveCellDropdown(
                                                                isThisShiftActive
                                                                    ? null
                                                                    : { employeeId: employee.id, dayIndex, day, trigger: 'cell', shiftIndex }
                                                            );
                                                        }}
                                                        className={`min-h-[3.5rem] w-full bg-[#f0f5ff] rounded-lg flex items-center justify-center text-sm font-medium text-gray-900 relative group/shift cursor-pointer hover:bg-[#e6edff] transition-all border border-transparent hover:border-blue-200 ${isThisShiftActive ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
                                                    >
                                                        <span className={`transition-all duration-200 pointer-events-none ${isHovered || isThisShiftActive ? '-translate-y-2' : ''}`}>
                                                            {shift.start} - {shift.end}
                                                        </span>

                                                        {/* Add Button Overlay - only on last shift */}
                                                        {shiftIndex === hours.length - 1 && (isHovered || isCellDropdownOpen) && (
                                                            <div className="absolute inset-x-0 bottom-1 h-5 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 z-10">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveCellDropdown(
                                                                            activeCellDropdown?.dayIndex === dayIndex && activeCellDropdown?.employeeId === employee.id && activeCellDropdown?.trigger === 'plus'
                                                                                ? null
                                                                                : { employeeId: employee.id, dayIndex, day, trigger: 'plus' }
                                                                        );
                                                                    }}
                                                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${isCellDropdownOpen && activeCellDropdown.trigger === 'plus' ? 'bg-blue-600 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                                                                >
                                                                    <Plus size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Empty Cell */}
                                            {(!hours || hours.length === 0) && !vacations.length && (
                                                <div className="min-h-[3.5rem] w-full flex items-center justify-center rounded-md hover:bg-gray-50 transition-colors">
                                                    {(isHovered || isCellDropdownOpen) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveCellDropdown({ employeeId: employee.id, dayIndex, day, trigger: 'plus' });
                                                            }}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCellDropdownOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600'}`}
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Cell Dropdown */}
                                        {isCellDropdownOpen && (
                                            <div data-cell-dropdown className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="py-1">
                                                    {activeCellDropdown.trigger === 'plus' ? (
                                                        // Dropdown for Plus Button (Add Shift)
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenShiftModal(employee, activeCellDropdown.day);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Plus size={16} className="text-gray-400" />
                                                                {t('addShift')}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenRecurringShifts(employee);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Repeat size={16} className="text-gray-400" />
                                                                {t('setRecurringShifts')}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveCellDropdown(null);
                                                                    setVacationModalEmployeeId(employee.id);
                                                                    setIsVacationModalOpen(true);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Briefcase size={16} className="text-gray-400" />
                                                                {t('addVacation')}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        // Dropdown for Cell Click (Edit Shift)
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenShiftModal(employee, activeCellDropdown.day);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <PenLine size={16} className="text-gray-400" />
                                                                {t('editThisDay')}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenRecurringShifts(employee);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Repeat size={16} className="text-gray-400" />
                                                                {t('setRecurringShifts')}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveCellDropdown(null);
                                                                    setVacationModalEmployeeId(employee.id);
                                                                    setIsVacationModalOpen(true);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Briefcase size={16} className="text-gray-400" />
                                                                {t('addVacation')}
                                                            </button>
                                                            <div className="h-px bg-gray-100 my-1"></div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteShiftModal({
                                                                        employeeId: employee.id,
                                                                        date: activeCellDropdown.day,
                                                                        shiftIndex: activeCellDropdown.shiftIndex
                                                                    });
                                                                    setActiveCellDropdown(null);
                                                                }}
                                                                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                                                            >
                                                                <Trash2 size={16} />
                                                                {t('deleteThisShift')}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
                <div className="flex gap-4 items-start">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Info size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">{t('infoTitle')}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                            {t('infoFooter')}{' '}
                            <button className="text-blue-600 font-bold hover:underline">{t('clickHere')}</button>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recurring Shifts Page */}
            <RecurringShiftsPage
                isOpen={isRecurringShiftsOpen}
                onClose={() => {
                    setIsRecurringShiftsOpen(false);
                    setRecurringShiftsEmployee(null);
                }}
                employee={recurringShiftsEmployee}
                onSave={handleRecurringShiftsSave}
            />
        </div>
    );
}

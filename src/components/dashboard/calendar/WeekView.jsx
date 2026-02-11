import React, { useState, useEffect, useRef } from 'react';
import { format, addMinutes, isSameDay, addDays, isSunday, isBefore, startOfDay, startOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Clock, Plus, LayoutList, CalendarDays, CalendarRange, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import QuickActionPopover from './QuickActionPopover';
import EmployeeMenuPopover from './EmployeeMenuPopover';

const TIME_SLOT_DURATION = 15; // minutes
const START_HOUR = 8;
const END_HOUR = 20;
const PIXELS_PER_MINUTE = 2.5; // Controls height of time slots

export default function WeekView({ date, employees = [], reservations = [], onReservationClick, onEmptySlotClick, onViewChange, onEmployeeFilter }) {
    const containerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeEmployeeId, setActiveEmployeeId] = useState(null);
    const [hoveredCell, setHoveredCell] = useState({ employeeId: null, dayIndex: null });
    const [anchorRect, setAnchorRect] = useState(null);

    // Quick Action Popover State
    const [quickAction, setQuickAction] = useState({ isOpen: false, x: 0, y: 0, date: null, employeeId: null });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.employee-dropdown-trigger') && !event.target.closest('.employee-dropdown-menu')) {
                // Handled by Popover
            }
        };
        // document.addEventListener('mousedown', handleClickOutside);
        // return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate 7 days starting from Monday of the selected week
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Generate time slots (for single view)
    const timeSlots = [];
    for (let i = START_HOUR * 60; i < END_HOUR * 60; i += TIME_SLOT_DURATION) {
        const hours = Math.floor(i / 60);
        const minutes = i % 60;
        timeSlots.push({ hours, minutes });
    }

    // Update current time indicator
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to 8:00 on mount (for single view)
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [employees.length, date]); // Re-run when view mode might change

    const getReservationStyle = (reservation) => {
        const start = new Date(reservation.date + 'T' + reservation.time);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = reservation.duration || 60;

        return {
            top: `${(startMinutes - (START_HOUR * 60)) * PIXELS_PER_MINUTE}px`,
            height: `${duration * PIXELS_PER_MINUTE}px`,
        };
    };

    const getCurrentTimePosition = (targetDate) => {
        const now = currentTime;
        if (!isSameDay(now, targetDate)) return null;
        const minutes = now.getHours() * 60 + now.getMinutes();
        return (minutes - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
    };

    const handleSlotClick = (e, date, hours, minutes, employeeId) => {
        // Prevent event from bubbling if it's a direct click on grid
        e.stopPropagation();

        const clickDate = new Date(date);
        if (hours !== undefined && minutes !== undefined) {
            clickDate.setHours(hours);
            clickDate.setMinutes(minutes);
        }

        // Open Popover
        const x = e.clientX;
        const y = e.clientY;

        setQuickAction({
            isOpen: true,
            x,
            y,
            date: clickDate,
            employeeId
        });
    };

    const handleQuickAction = (action) => {
        if (onEmptySlotClick) {
            onEmptySlotClick(quickAction.date, quickAction.employeeId, action);
        }
        setQuickAction(prev => ({ ...prev, isOpen: false }));
    };

    const handleEmployeeClick = (e, employeeId) => {
        e.stopPropagation();
        if (activeEmployeeId === employeeId) {
            setActiveEmployeeId(null);
            setAnchorRect(null);
        } else {
            setActiveEmployeeId(employeeId);
            setAnchorRect(e.currentTarget.getBoundingClientRect());
        }
    };

    // Helper for multi-view time parsing
    function parseReservationTime(dateStr, timeStr) {
        try {
            return new Date(`${dateStr}T${timeStr}`);
        } catch (e) {
            return new Date();
        }
    }

    // --- RENDER SINGLE EMPLOYEE VIEW (Vertical Grid) ---
    if (employees.length === 1) {
        const targetEmployee = employees[0];

        return (
            <div className="flex flex-col h-full bg-white overflow-hidden relative">
                <QuickActionPopover
                    isOpen={quickAction.isOpen}
                    x={quickAction.x}
                    y={quickAction.y}
                    date={quickAction.date}
                    onClose={() => setQuickAction(prev => ({ ...prev, isOpen: false }))}
                    onAction={handleQuickAction}
                />

                <EmployeeMenuPopover
                    isOpen={!!activeEmployeeId && !!anchorRect}
                    anchorRect={anchorRect}
                    employeeId={activeEmployeeId}
                    onClose={() => { setActiveEmployeeId(null); setAnchorRect(null); }}
                    onViewChange={onViewChange}
                    onEmployeeFilter={onEmployeeFilter}
                />

                {/* Header - Employee & Days */}
                <div className="flex border-b border-gray-200">
                    {/* Employee Info Header (Top Left) */}
                    <div className="w-20 lg:w-[88px] flex-shrink-0 border-r border-gray-100 bg-white flex items-center justify-center p-2">
                        <div className="relative">
                            <div
                                className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg relative overflow-hidden cursor-pointer employee-dropdown-trigger"
                                onClick={(e) => handleEmployeeClick(e, targetEmployee._id)}
                            >
                                {targetEmployee.avatar && (targetEmployee.avatar.startsWith('http') || targetEmployee.avatar.startsWith('/')) ? (
                                    <img src={targetEmployee.avatar} alt={targetEmployee.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{targetEmployee.name ? targetEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="flex-1 flex overflow-hidden">
                        {days.map((day, index) => {
                            const isNonWorking = isSunday(day);
                            const isToday = isSameDay(day, new Date());
                            const isBeforeToday = isBefore(day, startOfDay(new Date()));

                            return (
                                <div
                                    key={index}
                                    className={`flex-1 min-w-[120px] p-4 text-center border-r border-gray-100 last:border-r-0 transition-colors duration-200
                                        ${isNonWorking ? 'bg-[#f3f4f6]' : 'bg-white'}
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                            ${isToday ? 'bg-purple-600 text-white' : isBeforeToday ? 'text-gray-300' : 'text-gray-900'}
                                        `}>
                                            {format(day, 'd', { locale: pl })}
                                        </div>
                                        <div className={`text-sm font-bold capitalize
                                            ${isToday ? 'text-purple-600' : isBeforeToday ? 'text-gray-300' : 'text-gray-900'}
                                        `}>
                                            {format(day, 'EEEE', { locale: pl })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Grid */}
                <div ref={containerRef} className="flex-1 overflow-y-auto relative">
                    <div className="flex relative min-h-full">
                        {/* Time Sidebar */}
                        <div className="w-20 lg:w-[88px] flex-shrink-0 border-r border-gray-100 bg-white z-20 sticky left-0 text-xs text-gray-500 font-bold select-none shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                            {timeSlots.map(({ hours, minutes }) => (
                                <div
                                    key={`${hours}:${minutes}`}
                                    className="relative border-b border-gray-50 box-border flex justify-center pt-1"
                                    style={{ height: `${TIME_SLOT_DURATION * PIXELS_PER_MINUTE}px` }}
                                >
                                    {minutes === 0 && (
                                        <span className="-mt-2.5 bg-white px-1">
                                            {hours.toString().padStart(2, '0')}:00
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* Current Time Pill in Sidebar */}
                            <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                                {(() => {
                                    const now = currentTime;
                                    const minutes = now.getHours() * 60 + now.getMinutes();
                                    const top = (minutes - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
                                    if (top >= 0 && top < (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE) {
                                        return (
                                            <div
                                                className="absolute right-0 translate-x-1/2 z-50 flex items-center justify-center pointer-events-none"
                                                style={{ top: `${top}px`, marginTop: '-10px' }}
                                            >
                                                <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-50">
                                                    {format(currentTime, 'HH:mm')}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>

                        {/* Day Columns */}
                        <div className="flex-1 flex relative">
                            {days.map((day, dayIndex) => {
                                const isNonWorking = isSunday(day);

                                return (
                                    <div key={dayIndex} className={`flex-1 min-w-[120px] border-r border-gray-100 last:border-r-0 relative group z-10 ${isNonWorking ? 'bg-gray-50' : 'bg-white'}`}>

                                        {/* Background Pattern for Non-Working */}
                                        {isNonWorking && (
                                            <div className="absolute inset-0 pointer-events-none z-0"
                                                style={{
                                                    backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 50%, #f3f4f6 50%, #f3f4f6 75%, transparent 75%, transparent)',
                                                    backgroundSize: '12px 12px',
                                                    opacity: 1
                                                }}
                                            ></div>
                                        )}

                                        {/* Time Slots Grid */}
                                        {timeSlots.map(({ hours, minutes }) => (
                                            <div
                                                key={`${hours}:${minutes}`}
                                                onClick={(e) => handleSlotClick(e, day, hours, minutes, targetEmployee._id)}
                                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-crosshair box-border relative"
                                                style={{ height: `${TIME_SLOT_DURATION * PIXELS_PER_MINUTE}px` }}
                                            >
                                                {/* Add Button on Hover */}
                                                {!isNonWorking && (
                                                    <div className="absolute inset-x-0 inset-y-0 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-purple-50 flex items-center justify-center transition-all z-0">
                                                        <Plus size={16} className="text-purple-400" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Current Time Line */}
                                        {getCurrentTimePosition(day) !== null && (
                                            <div
                                                className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                                                style={{ top: `${getCurrentTimePosition(day)}px` }}
                                            >
                                                <div className="w-full h-[1px] bg-red-600 shadow-[0_0_4px_rgba(220,38,38,0.4)]"></div>
                                            </div>
                                        )}

                                        {/* Reservations */}
                                        {reservations
                                            .filter(r => (r.employeeId === targetEmployee._id) && isSameDay(new Date(r.date), day))
                                            .map((reservation) => (
                                                <div
                                                    key={reservation._id}
                                                    onClick={(e) => { e.stopPropagation(); onReservationClick(reservation); }}
                                                    className={`absolute inset-x-1 rounded-md p-2 border-l-4 shadow-sm cursor-pointer hover:brightness-95 transition-all overflow-hidden z-10 text-xs
                                                        ${reservation.status === 'confirmed' ? 'bg-green-100 border-green-500 text-green-800' :
                                                            reservation.status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                                                                reservation.status === 'cancelled' ? 'bg-red-100 border-red-500 text-red-800' :
                                                                    'bg-blue-100 border-blue-500 text-blue-800'}
                                                    `}
                                                    style={getReservationStyle(reservation)}
                                                >
                                                    <div className="font-bold flex items-center justify-between">
                                                        <span>{reservation.service}</span>
                                                        {reservation.status === 'pending' && <Clock size={12} />}
                                                    </div>
                                                    <div className="truncate opacity-90">{reservation.clientName}</div>
                                                    <div className="truncate opacity-75">{reservation.time} - {format(addMinutes(new Date(reservation.date + 'T' + reservation.time), reservation.duration), 'HH:mm')}</div>
                                                </div>
                                            ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER MULTI EMPLOYEE VIEW (Original Matrix) ---
    return (
        <div className="flex flex-col h-full bg-white overflow-hidden relative">
            <QuickActionPopover
                isOpen={quickAction.isOpen}
                x={quickAction.x}
                y={quickAction.y}
                date={quickAction.date}
                onClose={() => setQuickAction(prev => ({ ...prev, isOpen: false }))}
                onAction={handleQuickAction}
            />

            <EmployeeMenuPopover
                isOpen={!!activeEmployeeId && !!anchorRect}
                anchorRect={anchorRect}
                employeeId={activeEmployeeId}
                onClose={() => { setActiveEmployeeId(null); setAnchorRect(null); }}
                onViewChange={onViewChange}
                onEmployeeFilter={onEmployeeFilter}
            />

            {/* Header - Days */}
            <div className="flex border-b border-gray-200">
                <div className="w-[214px] flex-shrink-0 border-r border-gray-100 bg-white">
                    {/* Empty Top-Left Corner */}
                </div>
                <div className="flex-1 flex overflow-hidden">
                    {days.map((day, index) => {
                        const isNonWorking = isSunday(day);
                        const isHighlighted = hoveredCell.dayIndex === index;
                        const isToday = isSameDay(day, new Date());
                        const isBeforeToday = isBefore(day, startOfDay(new Date()));

                        return (
                            <div
                                key={index}
                                className={`flex-1 min-w-[150px] p-4 text-center border-r border-gray-100 last:border-r-0 transition-colors duration-200
                                    ${isNonWorking ? 'bg-[#f3f4f6]' : 'bg-white'}
                                    ${isHighlighted ? 'bg-blue-50/50' : ''}
                                `}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                        ${isToday ? 'bg-purple-600 text-white' : isBeforeToday ? 'text-gray-300' : 'text-gray-900'}
                                    `}>
                                        {format(day, 'd', { locale: pl })}
                                    </div>
                                    <div className={`text-sm font-bold capitalize
                                        ${isToday ? 'text-purple-600' : isBeforeToday ? 'text-gray-300' : 'text-gray-900'}
                                    `}>
                                        {format(day, 'EEEE', { locale: pl })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Matrix Grid */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="flex flex-col min-w-full">
                    {employees.map(employee => {
                        const isEmployeeHighlighted = hoveredCell.employeeId === employee._id;

                        return (
                            <div key={employee._id} className="flex border-b border-gray-100 min-h-[150px]">
                                {/* Employee Info (Left Sidebar) */}
                                <div
                                    className={`w-[214px] flex-shrink-0 border-r border-gray-100 p-4 flex flex-col items-center justify-center gap-2 sticky left-0 z-50 transition-colors duration-200
                                    ${isEmployeeHighlighted ? 'bg-blue-50/30' : 'bg-white'}
                                `}
                                >
                                    <div
                                        className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors employee-dropdown-trigger w-full relative"
                                        onClick={(e) => handleEmployeeClick(e, employee._id)}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg relative overflow-hidden">
                                            {employee.avatar && (employee.avatar.startsWith('http') || employee.avatar.startsWith('/')) ? (
                                                <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{employee.name ? employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-bold text-gray-900 text-sm text-center">{employee.name}</h3>
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${activeEmployeeId === employee._id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Days Columns for this Employee */}
                                {days.map((day, dayIndex) => {
                                    const isNonWorking = isSunday(day);

                                    return (
                                        <div
                                            key={dayIndex}
                                            className="flex-1 border-r border-gray-100 relative p-2 min-w-[150px]"
                                            style={{
                                                backgroundColor:
                                                    (hoveredCell.dayIndex === dayIndex && hoveredCell.employeeId === employee._id)
                                                        ? (isNonWorking ? '#e5e7eb' : '#faf5ff') // Purple-50 for working, Gray for non-working
                                                        : (isNonWorking ? '#f3f4f6' : 'white'),
                                                backgroundImage: isNonWorking
                                                    ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)'
                                                    : 'none'
                                            }}
                                            onMouseEnter={() => setHoveredCell({ employeeId: employee._id, dayIndex: dayIndex })}
                                            onMouseLeave={() => setHoveredCell({ employeeId: null, dayIndex: null })}
                                            onClick={(e) => {
                                                // Handle click on empty space in matrix view
                                                // Default to 8:00 AM for matrix view clicks
                                                handleSlotClick(e, day, 8, 0, employee._id);
                                            }}
                                        >
                                            {/* Render Reservations for this Employee + Day */}
                                            {reservations
                                                .filter(r => (r.employeeId === employee._id) && isSameDay(new Date(r.date), day))
                                                .map((reservation) => (
                                                    <div
                                                        key={reservation._id}
                                                        onClick={(e) => { e.stopPropagation(); onReservationClick(reservation); }}
                                                        className={`mb-2 rounded-md p-2 border-l-4 shadow-sm cursor-pointer hover:brightness-95 transition-all text-xs z-10 relative
                                                        ${reservation.status === 'confirmed' ? 'bg-green-100 border-green-500 text-green-800' :
                                                                reservation.status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                                                                    reservation.status === 'cancelled' ? 'bg-red-100 border-red-500 text-red-800' :
                                                                        'bg-blue-100 border-blue-500 text-blue-800'}
                                                    `}
                                                    >
                                                        <div className="font-bold flex items-center justify-between">
                                                            <span>{reservation.service}</span>
                                                            {reservation.status === 'pending' && <Clock size={12} />}
                                                        </div>
                                                        <div className="truncate opacity-90">{reservation.clientName}</div>
                                                        <div className="truncate opacity-75">{reservation.time} - {format(addMinutes(parseReservationTime(reservation.date, reservation.time), reservation.duration), 'HH:mm')}</div>
                                                    </div>
                                                ))}

                                            {/* Hover Plus Icon */}
                                            {!isNonWorking && hoveredCell.dayIndex === dayIndex && hoveredCell.employeeId === employee._id && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <Plus size={24} className="text-purple-400" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

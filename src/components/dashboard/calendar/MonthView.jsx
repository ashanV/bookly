import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isSunday, isBefore, startOfDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Clock, Plus, ChevronDown } from 'lucide-react';
import QuickActionPopover from './QuickActionPopover';
import EmployeeMenuPopover from './EmployeeMenuPopover';

export default function MonthView({ date, employees = [], reservations = [], onReservationClick, onEmptySlotClick, onViewChange, onEmployeeFilter }) {
    const [hoveredDay, setHoveredDay] = useState(null);
    const [activeEmployeeId, setActiveEmployeeId] = useState(null);
    const [anchorRect, setAnchorRect] = useState(null);

    // Quick Action Popover State
    const [quickAction, setQuickAction] = useState({ isOpen: false, x: 0, y: 0, date: null, employeeId: null });

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

    const handleDayClick = (e, day) => {
        // If clicks are not on reservation
        e.stopPropagation();

        const x = e.clientX;
        const y = e.clientY;

        // Use 8:00 AM as default time for Month View clicks (or just the day)
        const clickDate = new Date(day);
        clickDate.setHours(8, 0, 0, 0);

        setQuickAction({
            isOpen: true,
            x,
            y,
            date: clickDate,
            employeeId: employees.length === 1 ? employees[0]._id : null // Auto-select employee if single view
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

            {/* Employee Header (Only added if single employee view or simple list, effectively mimicking DayView header style) */}
            <div className="flex border-b border-gray-200">
                <div className="flex-1 flex relative">
                    {(employees.length > 0 ? employees : []).map((employee) => (
                        <div key={employee._id} className="flex-1 min-w-[200px] p-2 text-center border-r border-gray-100 last:border-r-0 bg-white relative">
                            <div
                                className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors employee-dropdown-trigger"
                                onClick={(e) => handleEmployeeClick(e, employee._id)}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm relative overflow-hidden">
                                    {employee.avatar && (employee.avatar.startsWith('http') || employee.avatar.startsWith('/')) ? (
                                        <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{employee.name ? employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <h3 className="font-bold text-gray-900 text-sm">{employee.name}</h3>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${activeEmployeeId === employee._id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Default Column if no employees */}
                    {employees.length === 0 && (
                        <div className="flex-1 p-2 text-center border-r border-gray-100 bg-white">
                            <span className="text-sm font-medium text-gray-500">Wszyscy pracownicy</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Header - Weekdays */}
            <div className="grid grid-cols-7 border-b border-gray-200">
                {weekDays.map((day) => (
                    <div key={day} className="p-3 text-sm font-semibold text-gray-700 text-left capitalize bg-white">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 auto-rows-fr min-h-full border-l border-gray-200">
                    {calendarDays.map((day, index) => {
                        const isNonWorking = isSunday(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        const isBeforeToday = isBefore(day, startOfDay(new Date()));
                        const dayReservations = reservations.filter(r => isSameDay(new Date(r.date), day));

                        const isHovered = hoveredDay && isSameDay(day, hoveredDay);

                        return (
                            <div
                                key={day.toString()}
                                onClick={(e) => handleDayClick(e, day)}
                                className={`
                                    min-h-[120px] border-b border-r border-gray-200 p-2 relative flex flex-col gap-1 transition-colors cursor-pointer
                                    ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'}
                                    ${isNonWorking && isCurrentMonth ? 'bg-[#f3f4f6]' : ''}
                                    ${isHovered ? 'z-10' : ''}
                                `}
                                style={{
                                    backgroundColor:
                                        isHovered
                                            ? (isNonWorking ? '#e5e7eb' : '#faf5ff')
                                            : (!isCurrentMonth ? '#f9fafb' : (isNonWorking ? '#f3f4f6' : 'white')),
                                    backgroundImage: (isNonWorking && isCurrentMonth) || (isNonWorking && isHovered)
                                        ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)'
                                        : 'none',
                                    outline: isHovered ? '2px solid #a855f7' : 'none',
                                    zIndex: isHovered ? 10 : 'auto'
                                }}
                                onMouseEnter={() => setHoveredDay(day)}
                                onMouseLeave={() => setHoveredDay(null)}
                            >
                                {/* Date Number */}
                                <div className="flex justify-between items-start relative z-20 pointer-events-none">
                                    <div className={`
                                        w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                                        ${isToday ? 'bg-purple-600 text-white' : (isBeforeToday && isCurrentMonth ? 'text-gray-400' : 'text-gray-900')}
                                        ${!isCurrentMonth && !isToday ? 'text-gray-300' : ''}
                                    `}>
                                        {format(day, 'd')} {isToday && format(day, 'MMM', { locale: pl })}
                                    </div>
                                </div>

                                {/* Reservations Preview */}
                                <div className="flex flex-col gap-1 mt-1 overflow-hidden relative z-20">
                                    {dayReservations.slice(0, 4).map(res => (
                                        <div
                                            key={res._id}
                                            onClick={(e) => { e.stopPropagation(); onReservationClick(res); }}
                                            className={`
                                                px-1.5 py-0.5 text-[10px] rounded cursor-pointer truncate font-medium
                                                ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'}
                                            `}
                                        >
                                            {format(new Date(`${res.date}T${res.time}`), 'HH:mm')} {res.clientName}
                                        </div>
                                    ))}
                                    {dayReservations.length > 4 && (
                                        <div className="text-[10px] text-gray-500 pl-1">
                                            + {dayReservations.length - 4} więcej
                                        </div>
                                    )}
                                </div>

                                {/* Hover Plus Icon */}
                                {isHovered && !isNonWorking && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <Plus size={32} className="text-purple-400 opacity-100" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

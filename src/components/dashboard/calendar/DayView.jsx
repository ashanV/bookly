import React, { useState, useEffect, useRef } from 'react';
import { format, addMinutes, isSameDay } from 'date-fns';
import { Clock, Plus, LayoutList, CalendarDays, CalendarRange, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import QuickActionPopover from './QuickActionPopover';
import EmployeeMenuPopover from './EmployeeMenuPopover';

const TIME_SLOT_DURATION = 15; // minutes
const START_HOUR = 0;
const END_HOUR = 24;
const PIXELS_PER_MINUTE = 2.5; // Controls height of time slots (roughly 150px per hour)

export default function DayView({ date, employees = [], reservations = [], onReservationClick, onEmptySlotClick, onViewChange, onEmployeeFilter }) {
    const containerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeEmployeeId, setActiveEmployeeId] = useState(null);
    const [anchorRect, setAnchorRect] = useState(null);

    // Quick Action Popover State
    const [quickAction, setQuickAction] = useState({ isOpen: false, x: 0, y: 0, date: null, employeeId: null });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.employee-dropdown-trigger') && !event.target.closest('.employee-dropdown-menu')) {
                // Handled by Popover now, but if we need to reset state:
                // setActiveEmployeeId(null);
            }
        };
        // document.addEventListener('mousedown', handleClickOutside);
        // return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate time slots
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

    // Scroll to 8:00 on mount
    useEffect(() => {
        if (containerRef.current) {
            const startScroll = (8 * 60) * PIXELS_PER_MINUTE; // 8:00 AM
            containerRef.current.scrollTop = startScroll;
        }
    }, []);

    const getReservationStyle = (reservation) => {
        const start = new Date(reservation.date + 'T' + reservation.time);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = reservation.duration || 60;

        return {
            top: `${(startMinutes - (START_HOUR * 60)) * PIXELS_PER_MINUTE}px`,
            height: `${duration * PIXELS_PER_MINUTE}px`,
        };
    };

    const getCurrentTimePosition = (targetDate = date) => {
        const now = currentTime;
        if (!isSameDay(now, targetDate)) return null;
        const minutes = now.getHours() * 60 + now.getMinutes();
        return (minutes - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
    };

    const handleSlotClick = (e, employeeId, hours, minutes) => {
        const clickDate = new Date(date);
        clickDate.setHours(hours);
        clickDate.setMinutes(minutes);

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
        if (activeEmployeeId === employeeId) {
            setActiveEmployeeId(null);
            setAnchorRect(null);
        } else {
            setActiveEmployeeId(employeeId);
            setAnchorRect(e.currentTarget.getBoundingClientRect());
        }
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
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

            {/* Header - Employees */}
            <div className="flex border-b border-gray-200">
                <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white"></div> {/* Time column header placeholder */}
                <div className="flex-1 flex relative">
                    {employees.map((employee) => (
                        <div key={employee._id} className="flex-1 min-w-[200px] p-4 text-center border-r border-gray-100 last:border-r-0 bg-white relative">
                            <div
                                className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors employee-dropdown-trigger"
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
                                    <h3 className="font-bold text-gray-900 text-sm">{employee.name}</h3>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${activeEmployeeId === employee._id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Default Column if no employees */}
                    {employees.length === 0 && (
                        <div className="flex-1 min-w-[200px] p-4 text-center border-r border-gray-100 bg-white">
                            <span className="text-sm font-medium text-gray-500">Wszyscy pracownicy</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div ref={containerRef} className="flex-1 overflow-y-auto relative">
                <div className="flex relative min-h-full">
                    {/* Time Sidebar */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white z-20 sticky left-0 text-xs text-gray-500 font-bold select-none shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
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
                        {getCurrentTimePosition() !== null && (
                            <div
                                className="absolute right-0 translate-x-1/2 z-50 flex items-center justify-center pointer-events-none"
                                style={{ top: `${getCurrentTimePosition()}px`, marginTop: '-10px' }}
                            >
                                <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-50">
                                    {format(currentTime, 'HH:mm')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid Columns */}
                    <div className="flex-1 flex relative">
                        {/* Closed Hours Background (Global) */}
                        <div className="absolute inset-0 pointer-events-none z-0"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 50%, #f3f4f6 50%, #f3f4f6 75%, transparent 75%, transparent)',
                                backgroundSize: '12px 12px',
                                opacity: 1
                            }}>
                        </div>

                        {/* Open Hours White Overlay (Simplification: Open 8-18 for all days for now) */}
                        <div className="absolute inset-x-0 bg-white z-0"
                            style={{
                                top: `${(8 * 60 - (START_HOUR * 60)) * PIXELS_PER_MINUTE}px`, /* Opens 8:00 */
                                height: `${(18 - 8) * 60 * PIXELS_PER_MINUTE}px` /* Duration 10h */
                            }}>
                        </div>

                        {/* Current Time Indicator Line */}
                        {getCurrentTimePosition() !== null && (
                            <div
                                className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                                style={{ top: `${getCurrentTimePosition()}px` }}
                            >
                                <div className="w-full h-[1px] bg-red-600 shadow-[0_0_4px_rgba(220,38,38,0.4)]"></div>
                            </div>
                        )}

                        {(employees.length > 0 ? employees : [{ _id: 'all', firstName: 'Wszyscy' }]).map((employee) => (
                            <div key={employee._id} className="flex-1 min-w-[200px] border-r border-gray-100 last:border-r-0 relative group z-10">
                                {/* Transparent Grid for Interaction */}
                                {timeSlots.map(({ hours, minutes }) => (
                                    <div
                                        key={`${hours}:${minutes}`}
                                        onClick={(e) => handleSlotClick(e, employee._id, hours, minutes)}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-crosshair box-border relative"
                                        style={{ height: `${TIME_SLOT_DURATION * PIXELS_PER_MINUTE}px` }}
                                    >
                                        {/* Add Button on Hover */}
                                        <div className="absolute inset-x-0 inset-y-0 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-purple-50 flex items-center justify-center transition-all z-0">
                                            <Plus size={16} className="text-purple-400" />
                                        </div>
                                    </div>
                                ))}

                                {/* Reservations for this Employee */}
                                {reservations
                                    .filter(r => employees.length === 0 || r.employeeId === employee._id || !r.employeeId) // Fallback for no employee assigned
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
                                            <div className="truncate opacity-75">{reservation.time} - {format(addMinutes(parseReservationTime(reservation.date, reservation.time), reservation.duration), 'HH:mm')}</div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

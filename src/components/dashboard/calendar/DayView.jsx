import React, { useState, useEffect, useRef } from 'react';
import { format, addMinutes, isSameDay } from 'date-fns';
import { Clock, Plus, LayoutList, CalendarDays, CalendarRange, Calendar as CalendarIcon, ChevronDown, User } from 'lucide-react';
import QuickActionPopover from './QuickActionPopover';
import EmployeeMenuPopover from './EmployeeMenuPopover';

const TIME_SLOT_DURATION = 15; // minutes
const START_HOUR = 0;
const END_HOUR = 24;
const PIXELS_PER_MINUTE = 2.5; // Controls height of time slots (roughly 150px per hour)

export default function DayView({ date, employees = [], reservations = [], draftVisit = null, onReservationClick, onEmptySlotClick, onViewChange, onEmployeeFilter, onReservationResize, onReservationDrop }) {
    const containerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeEmployeeId, setActiveEmployeeId] = useState(null);
    const [anchorRect, setAnchorRect] = useState(null);

    // Resize state
    const resizeRef = useRef(null);
    const [resizingId, setResizingId] = useState(null);
    const [resizeDuration, setResizeDuration] = useState(null);

    // Drag state
    const dragRef = useRef(null); // { reservationId, reservation, startX, startY, startAbsoluteY, isDragging, ghostTop, ghostEmployeeId }
    const [draggingId, setDraggingId] = useState(null);
    const [dragGhost, setDragGhost] = useState(null); // { top (minutes from midnight), employeeId, reservation }
    const columnRefsMap = useRef({}); // { [employeeId]: DOMElement }

    // Hover Popover State
    const [hoveredReservation, setHoveredReservation] = useState(null);
    const hoverTimeoutRef = useRef(null);

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

    // --- Resize handlers ---
    const justResizedRef = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizeRef.current) return;
            e.preventDefault();

            // Account for scroll position so resize works while scrolling
            const scrollTop = containerRef.current ? containerRef.current.scrollTop : 0;
            const currentAbsoluteY = e.clientY + scrollTop;
            const deltaY = currentAbsoluteY - resizeRef.current.startAbsoluteY;
            const deltaMinutes = deltaY / PIXELS_PER_MINUTE;

            // Snap to 15-minute increments
            let newDuration = resizeRef.current.originalDuration + Math.round(deltaMinutes / 15) * 15;
            if (newDuration < 15) newDuration = 15;
            if (newDuration > 480) newDuration = 480; // max 8h
            resizeRef.current.currentDuration = newDuration;
            setResizeDuration(newDuration);
        };

        const handleMouseUp = () => {
            if (!resizeRef.current) return;
            const { reservationId, originalDuration, currentDuration } = resizeRef.current;
            resizeRef.current = null;
            setResizingId(null);
            setResizeDuration(null);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // Flag to prevent click from opening sidebar
            justResizedRef.current = true;
            setTimeout(() => { justResizedRef.current = false; }, 300);

            if (currentDuration !== originalDuration && onReservationResize) {
                onReservationResize(reservationId, currentDuration);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onReservationResize]);

    // --- Drag handlers ---
    useEffect(() => {
        const DRAG_THRESHOLD = 5;

        const handleDragMouseMove = (e) => {
            if (!dragRef.current) return;
            const { startX, startY, isDragging } = dragRef.current;

            // Check threshold before starting actual drag
            if (!isDragging) {
                const dx = Math.abs(e.clientX - startX);
                const dy = Math.abs(e.clientY - startY);
                if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
                dragRef.current.isDragging = true;
                setDraggingId(dragRef.current.reservationId);
                document.body.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none';
            }

            e.preventDefault();

            // Calculate new time based on mouse Y + scroll
            const scrollTop = containerRef.current ? containerRef.current.scrollTop : 0;
            const containerRect = containerRef.current?.getBoundingClientRect();
            const relativeY = e.clientY - (containerRect?.top || 0) + scrollTop;
            let minutesFromMidnight = relativeY / PIXELS_PER_MINUTE;
            // Snap to 15-minute increments
            minutesFromMidnight = Math.round(minutesFromMidnight / 15) * 15;
            if (minutesFromMidnight < 0) minutesFromMidnight = 0;
            if (minutesFromMidnight > 23 * 60 + 45) minutesFromMidnight = 23 * 60 + 45;

            // Determine which employee column the mouse is over
            let targetEmployeeId = dragRef.current.reservation.employeeId;
            const employeeList = employees.length > 0 ? employees : [{ _id: 'all' }];
            for (const emp of employeeList) {
                const colEl = columnRefsMap.current[emp._id];
                if (colEl) {
                    const colRect = colEl.getBoundingClientRect();
                    if (e.clientX >= colRect.left && e.clientX <= colRect.right) {
                        targetEmployeeId = emp._id;
                        break;
                    }
                }
            }

            dragRef.current.ghostMinutes = minutesFromMidnight;
            dragRef.current.ghostEmployeeId = targetEmployeeId;

            setDragGhost({
                top: minutesFromMidnight,
                employeeId: targetEmployeeId,
                reservation: dragRef.current.reservation,
            });
        };

        const handleDragMouseUp = () => {
            if (!dragRef.current) return;
            const { isDragging, reservation, ghostMinutes, ghostEmployeeId } = dragRef.current;
            dragRef.current = null;
            setDraggingId(null);
            setDragGhost(null);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            if (!isDragging) return; // Just a click, not a drag

            // Prevent click after drag
            justResizedRef.current = true;
            setTimeout(() => { justResizedRef.current = false; }, 300);

            // Calculate new time string
            const newHours = Math.floor(ghostMinutes / 60);
            const newMins = ghostMinutes % 60;
            const newTime = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;

            // Only call if something changed
            const timeChanged = newTime !== reservation.time;
            const employeeChanged = ghostEmployeeId !== reservation.employeeId;

            if ((timeChanged || employeeChanged) && onReservationDrop) {
                onReservationDrop(reservation._id, newTime, ghostEmployeeId);
            }
        };

        window.addEventListener('mousemove', handleDragMouseMove);
        window.addEventListener('mouseup', handleDragMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleDragMouseMove);
            window.removeEventListener('mouseup', handleDragMouseUp);
        };
    }, [onReservationDrop, employees]);

    const handleTileMouseDown = (e, reservation) => {
        // Don't start drag if clicking the resize handle
        if (e.target.closest('[data-resize-handle]')) return;
        // Don't start drag during resize
        if (resizeRef.current) return;

        dragRef.current = {
            reservationId: reservation._id,
            reservation,
            startX: e.clientX,
            startY: e.clientY,
            isDragging: false,
            ghostMinutes: 0,
            ghostEmployeeId: reservation.employeeId,
        };
    };

    const handleResizeStart = (e, reservation) => {
        e.stopPropagation();
        e.preventDefault();
        const scrollTop = containerRef.current ? containerRef.current.scrollTop : 0;
        resizeRef.current = {
            reservationId: reservation._id,
            startAbsoluteY: e.clientY + scrollTop,
            originalDuration: reservation.duration || 60,
            currentDuration: reservation.duration || 60,
        };
        setResizingId(reservation._id);
        setResizeDuration(reservation.duration || 60);
        document.body.style.cursor = 's-resize';
        document.body.style.userSelect = 'none';
    };

    function parseReservationTime(dateStr, timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date(dateStr);
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return date;
    }

    const getReservationStyle = (reservation) => {
        const start = parseReservationTime(reservation.date, reservation.time);
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

    // --- Hover Handlers ---
    const handleTileMouseEnter = (e, reservation) => {
        if (resizingId || draggingId) return; // Don't show hover during drag/resize
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredReservation({
                reservation,
                rect,
                employeeInfo: employees.find(emp => emp._id === reservation.employeeId) || { name: 'Brak pracownika' }
            });
        }, 400); // 400ms delay to prevent flashing
    };

    const handleTileMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredReservation(null);
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

            {/* Hover Popover */}
            {hoveredReservation && (
                <div 
                    className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col overflow-hidden pointer-events-none w-72"
                    style={{
                        top: Math.max(10, hoveredReservation.rect.top - 10) + 'px',
                        left: Math.min(window.innerWidth - 300, hoveredReservation.rect.right + 10) + 'px',
                    }}
                >
                    {/* Header */}
                    <div className="bg-blue-600 text-white px-4 py-2.5 flex justify-between items-center text-sm font-medium">
                        <span>
                            {hoveredReservation.reservation.time} - {format(addMinutes(parseReservationTime(hoveredReservation.reservation.date, hoveredReservation.reservation.time), hoveredReservation.reservation.duration), 'HH:mm')}
                        </span>
                        <span>
                            {hoveredReservation.reservation.status === 'confirmed' ? 'Zarezerwowana' :
                             hoveredReservation.reservation.status === 'pending' ? 'Oczekująca' :
                             hoveredReservation.reservation.status === 'cancelled' ? 'Anulowana' : 'Inny'}
                        </span>
                    </div>
                    {/* Body */}
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-500">
                                <User size={20} />
                            </div>
                            <span className="font-semibold text-gray-800 text-base">{hoveredReservation.reservation.clientName || 'Bez rezerwacji'}</span>
                        </div>
                        
                        <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800 text-[13px]">{hoveredReservation.reservation.service}</span>
                                <span className="text-gray-500 text-[11px] mt-0.5">
                                    {hoveredReservation.employeeInfo.name?.split(' ')[0]} {hoveredReservation.employeeInfo.name?.split(' ').slice(1).join(' ').charAt(0)}. • {hoveredReservation.reservation.duration} min
                                </span>
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                                {hoveredReservation.reservation.price ? `${hoveredReservation.reservation.price} zł` : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

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
                            <div
                                key={employee._id}
                                ref={(el) => { if (el) columnRefsMap.current[employee._id] = el; }}
                                className="flex-1 min-w-[200px] border-r border-gray-100 last:border-r-0 relative group z-10"
                            >
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
                                    .map((reservation) => {
                                        const isResizing = resizingId === reservation._id;
                                        const displayDuration = isResizing ? resizeDuration : reservation.duration;
                                        const style = isResizing
                                            ? { ...getReservationStyle(reservation), height: `${displayDuration * PIXELS_PER_MINUTE}px` }
                                            : getReservationStyle(reservation);

                                        const isDragging = draggingId === reservation._id;

                                        return (
                                        <div
                                            key={reservation._id}
                                            onMouseDown={(e) => handleTileMouseDown(e, reservation)}
                                            onMouseEnter={(e) => handleTileMouseEnter(e, reservation)}
                                            onMouseLeave={handleTileMouseLeave}
                                            onClick={(e) => { if (!isResizing && !justResizedRef.current && !isDragging) { e.stopPropagation(); onReservationClick(reservation); } }}
                                            className={`absolute inset-x-1 rounded-md p-2 border-l-4 shadow-sm cursor-grab hover:brightness-95 transition-colors overflow-hidden z-10 text-xs group/tile
                                                ${isDragging ? 'opacity-30' : ''}
                                                ${reservation.status === 'confirmed' ? 'bg-green-100 border-green-500 text-green-800' :
                                                    reservation.status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                                                        reservation.status === 'cancelled' ? 'bg-red-100 border-red-500 text-red-800' :
                                                            'bg-blue-100 border-blue-500 text-blue-800'}
                                            `}
                                            style={style}
                                        >
                                            <div className="font-bold flex items-center justify-between">
                                                <span>{reservation.service}</span>
                                                {reservation.status === 'pending' && <Clock size={12} />}
                                            </div>
                                            <div className="truncate opacity-90">{reservation.clientName}</div>
                                            <div className="truncate opacity-75">
                                                {reservation.time} - {format(addMinutes(parseReservationTime(reservation.date, reservation.time), displayDuration), 'HH:mm')}
                                            </div>

                                            {/* Resize Handle */}
                                            <div
                                                data-resize-handle="true"
                                                onMouseDown={(e) => handleResizeStart(e, reservation)}
                                                className="absolute bottom-0 left-0 right-0 h-3 cursor-s-resize flex items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity z-20"
                                                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.08))' }}
                                            >
                                                <div className="w-8 h-[3px] rounded-full bg-gray-400/70"></div>
                                            </div>
                                        </div>
                                        );
                                    })}

                                {/* Draft Visit Preview (Ghost Block) */}
                                {draftVisit && draftVisit.date && draftVisit.employeeId === employee._id && isSameDay(new Date(draftVisit.date), date) && (
                                    <div
                                        className={`absolute inset-x-1 rounded-md p-2 border-l-[3px] shadow-sm z-10 text-xs text-blue-900 border-blue-500 overflow-hidden pointer-events-none transition-all duration-300`}
                                        style={{
                                            backgroundColor: '#dbeafe', // fallback bg-blue-100
                                            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.08) 8px, rgba(59, 130, 246, 0.15) 8px, rgba(59, 130, 246, 0.15) 16px)',
                                            top: `${(new Date(draftVisit.date).getHours() * 60 + new Date(draftVisit.date).getMinutes() - (START_HOUR * 60)) * PIXELS_PER_MINUTE}px`,
                                            height: `${(draftVisit.services.length > 0 ? draftVisit.services.reduce((acc, s) => acc + s.duration, 0) : TIME_SLOT_DURATION) * PIXELS_PER_MINUTE}px`,
                                            borderLeftColor: '#6366f1' // Indigo border from screenshot
                                        }}
                                    >
                                        <div className="font-medium flex items-center justify-between opacity-90 truncate leading-tight">
                                            <span>
                                                {format(new Date(draftVisit.date), 'HH:mm')} - {format(addMinutes(new Date(draftVisit.date), draftVisit.services.length > 0 ? draftVisit.services.reduce((acc, s) => acc + s.duration, 0) : TIME_SLOT_DURATION), 'HH:mm')} 
                                                {' '} {draftVisit.client ? `${draftVisit.client.firstName} ${draftVisit.client.lastName}` : 'Bez rezerwacji'}
                                            </span>
                                        </div>
                                        {draftVisit.services.length > 0 && (
                                            <div className="truncate opacity-80 mt-0.5 font-medium">
                                                {draftVisit.services.map(s => s.name).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Drag Ghost Preview */}
                    {dragGhost && (() => {
                        const ghost = dragGhost;
                        const colEl = columnRefsMap.current[ghost.employeeId];
                        if (!colEl) return null;
                        const gridEl = colEl.parentElement;
                        const colRect = colEl.getBoundingClientRect();
                        const gridRect = gridEl?.getBoundingClientRect();
                        const leftOffset = colRect.left - (gridRect?.left || 0);
                        const duration = ghost.reservation.duration || 60;
                        const ghostH = Math.floor(ghost.top / 60);
                        const ghostM = ghost.top % 60;
                        const endMinutes = ghost.top + duration;
                        const endH = Math.floor(endMinutes / 60);
                        const endM = endMinutes % 60;

                        return (
                            <div
                                className="absolute rounded-md p-2 border-l-4 border-indigo-500 shadow-lg z-50 text-xs pointer-events-none"
                                style={{
                                    top: `${ghost.top * PIXELS_PER_MINUTE}px`,
                                    height: `${duration * PIXELS_PER_MINUTE}px`,
                                    left: `${leftOffset + 4}px`,
                                    width: `${colRect.width - 8}px`,
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                    border: '2px dashed #6366f1',
                                    borderLeftWidth: '4px',
                                    borderLeftStyle: 'solid',
                                }}
                            >
                                <div className="font-bold text-indigo-800">{ghost.reservation.service}</div>
                                <div className="text-indigo-700 opacity-80">{ghost.reservation.clientName}</div>
                                <div className="text-indigo-600 opacity-70">
                                    {String(ghostH).padStart(2,'0')}:{String(ghostM).padStart(2,'0')} - {String(endH).padStart(2,'0')}:{String(endM).padStart(2,'0')}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

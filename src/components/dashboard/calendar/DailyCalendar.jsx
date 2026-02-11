import React from 'react';
import DayView from './DayView';
import ThreeDayView from './ThreeDayView';
import WeekView from './WeekView';
import MonthView from './MonthView';

export default function DailyCalendar({ date, employees = [], reservations = [], onReservationClick, onEmptySlotClick, viewType = 'Dzień', onViewChange, onEmployeeFilter }) {
    if (viewType === '3 dni') {
        return (
            <ThreeDayView
                date={date}
                employees={employees}
                reservations={reservations}
                onReservationClick={onReservationClick}
                onViewChange={onViewChange}
                onEmployeeFilter={onEmployeeFilter}
            />
        );
    }

    if (viewType === 'Tydzień') {
        return (
            <WeekView
                date={date}
                employees={employees}
                reservations={reservations}
                onReservationClick={onReservationClick}
                onViewChange={onViewChange}
                onEmployeeFilter={onEmployeeFilter}
            />
        );
    }

    if (viewType === 'Miesiąc') {
        return (
            <MonthView
                date={date}
                employees={employees}
                reservations={reservations}
                onReservationClick={onReservationClick}
                onViewChange={onViewChange}
                onEmployeeFilter={onEmployeeFilter}
            />
        );
    }

    return (
        <DayView
            date={date}
            employees={employees}
            reservations={reservations}
            onReservationClick={onReservationClick}
            onEmptySlotClick={onEmptySlotClick}
            onViewChange={onViewChange}
            onEmployeeFilter={onEmployeeFilter}
        />
    );
}

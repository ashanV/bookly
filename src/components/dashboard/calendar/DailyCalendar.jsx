import React from 'react';
import DayView from './DayView';
import ThreeDayView from './ThreeDayView';
import WeekView from './WeekView';
import MonthView from './MonthView';

export default function DailyCalendar({ date, employees = [], reservations = [], draftVisit = null, onReservationClick, onEmptySlotClick, viewType = 'Dzień', onViewChange, onEmployeeFilter, onReservationResize, onReservationDrop }) {
    if (viewType === '3 dni') {
        return (
            <ThreeDayView
                date={date}
                employees={employees}
                reservations={reservations}
                draftVisit={draftVisit}
                onReservationClick={onReservationClick}
                onEmptySlotClick={onEmptySlotClick}
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
                draftVisit={draftVisit}
                onReservationClick={onReservationClick}
                onEmptySlotClick={onEmptySlotClick}
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
                draftVisit={draftVisit}
                onReservationClick={onReservationClick}
                onEmptySlotClick={onEmptySlotClick}
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
            draftVisit={draftVisit}
            onReservationClick={onReservationClick}
            onEmptySlotClick={onEmptySlotClick}
            onViewChange={onViewChange}
            onEmployeeFilter={onEmployeeFilter}
            onReservationResize={onReservationResize}
            onReservationDrop={onReservationDrop}
        />
    );
}

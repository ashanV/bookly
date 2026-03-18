import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function DatePickerPopover({ isOpen, date, onClose, onDateSelect }) {
    const [currentMonth, setCurrentMonth] = useState(date || new Date());
    const popoverRef = useRef(null);

    useEffect(() => {
        if (date) setCurrentMonth(date);
    }, [date]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-base font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy', { locale: pl }).replace(/^\w/, (c) => c.toUpperCase())}
                </h2>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronRight size={20} className="text-gray-600" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-xs font-medium text-gray-500 mb-2">
                    {format(addDays(startDate, i), 'EEE', { locale: pl }) + '.'}
                </div>
            );
        }
        return <div className="grid grid-cols-7 gap-1">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const isSelected = isSameDay(day, date);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day}
                        onClick={() => {
                            onDateSelect(cloneDay);
                            onClose();
                        }}
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm cursor-pointer transition-colors
                            ${!isCurrentMonth ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:bg-gray-100'}
                            ${isSelected ? 'bg-indigo-500 text-white hover:bg-indigo-600' : ''}
                        `}
                    >
                        <span>{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    return (
        <div 
            ref={popoverRef}
            className="absolute top-[80px] left-8 z-50 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-4 w-[300px]"
        >
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}

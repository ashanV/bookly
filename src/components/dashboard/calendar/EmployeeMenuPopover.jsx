import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { LayoutList, CalendarDays, CalendarRange, Calendar as CalendarIcon, X } from 'lucide-react';

export default function EmployeeMenuPopover({
    isOpen,
    anchorRect,
    onClose,
    employeeId,
    onViewChange,
    onEmployeeFilter
}) {
    const t = useTranslations('BusinessEmployeeMenu');
    const popoverRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Use mousedown to capture before click
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen || !anchorRect) return null;

    // Calculate position
    // Default: bottom-left aligned with anchor, or centered if small
    // Try to center it relative to anchor width
    const width = 256; // w-64
    let left = anchorRect.left + (anchorRect.width / 2) - (width / 2);
    let top = anchorRect.bottom + 8; // small gap

    // Boundary checks
    if (typeof window !== 'undefined') {
        if (left + width > window.innerWidth - 10) {
            left = window.innerWidth - width - 10;
        }
        if (left < 10) left = 10;
    }

    const style = {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
    };

    const content = (
        <div
            ref={popoverRef}
            className="bg-white rounded-xl shadow-xl border border-gray-100 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                    <span>{t('view')}</span>
                </div>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('day'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <LayoutList size={16} /> {t('dayView')}
                </button>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('3days'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarDays size={16} /> {t('threeDayView')}
                </button>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('week'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarRange size={16} /> {t('weekView')}
                </button>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('month'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarIcon size={16} /> {t('monthView')}
                </button>
            </div>

            <div className="h-[1px] bg-gray-100 my-1"></div>

            <div className="p-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('options')}</div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    {t('addVisit')}
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    {t('addTimeBlock')}
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    {t('editShift')}
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    {t('addVacation')}
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    {t('viewEmployee')}
                </button>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }
    return null;
}

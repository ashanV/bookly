import React, { useEffect, useRef } from 'react';
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
    const popoverRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                // Check if click was on the trigger (optional, usually handled by parent toggle)
                // But for safety, we close. Parent should handle re-opening if clicked again.
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

        // If bottom overflows, flip to top?
        // We'll keep it simple for now, portal usually sits on top well.
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
                    <span>Widok</span>
                </div>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('Dzień'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <LayoutList size={16} /> Widok dnia
                </button>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('3 dni'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarDays size={16} /> Widok 3-dniowy
                </button>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('Tydzień'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarRange size={16} /> Widok tygodnia
                </button>
                <button
                    onClick={() => { onEmployeeFilter(employeeId); onViewChange('Miesiąc'); onClose(); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarIcon size={16} /> Widok miesiąca
                </button>
            </div>

            <div className="h-[1px] bg-gray-100 my-1"></div>

            <div className="p-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opcje</div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    Dodaj wizytę
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    Dodaj blokadę czasu
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    Edytuj zmianę
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    Dodaj urlop
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3">
                    Wyświetl pracownika
                </button>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }
    return null;
}

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, CalendarPlus, Users, Ban } from 'lucide-react';

export default function QuickActionPopover({ isOpen, x, y, date, onClose, onAction, position = 'right' }) {
    const popoverRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Add event listener with capture to ensure we catch clicks even if propagation stopped elsewhere
        // But for portals, bubbled events work normally. Using standard click is usually fine.
        // However, if the calendar stops propagation, we might need mousedown on document.
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Adjust position if it flows offscreen (basic implementation)
    // For now, simpler is better. We place it at (x, y).
    // Using portal means (0,0) is top-left of window.

    // We can try to keep it within viewport limits
    const style = {
        left: `${x}px`,
        top: `${y}px`,
        transform: position === 'right' ? 'translate(10px, -50%)' : 'translate(-50%, 10px)', // Default right or below
        maxHeight: '300px',
    };

    // If x is too close to right edge (e.g. within 300px), flip to left
    if (typeof window !== 'undefined' && x > window.innerWidth - 300) {
        style.transform = 'translate(calc(-100% - 10px), -50%)';
    }
    // If y is too close to bottom, move up
    if (typeof window !== 'undefined' && y > window.innerHeight - 200) {
        style.top = `${y - 200}px`; // Crude adjustment
    }

    const content = (
        <div
            ref={popoverRef}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-100 z-[9999] w-64 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={style}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside popover from closing it or triggering calendar slots
        >
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                <span className="font-bold text-gray-900">
                    {date && format(date, 'HH:mm')}
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={16} />
                </button>
            </div>
            <div className="p-1">
                <button
                    onClick={() => onAction('visit')}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <CalendarPlus size={16} strokeWidth={2} />
                    Dodaj wizytę
                </button>
                <button
                    onClick={() => onAction('group_visit')}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <Users size={16} strokeWidth={2} />
                    Dodaj wizytę grupową
                </button>
                <button
                    onClick={() => onAction('time_block')}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-3 transition-colors"
                >
                    <Ban size={16} strokeWidth={2} />
                    Dodaj blokadę czasu
                </button>
            </div>
            <div className="p-2 border-t border-gray-100 mt-1">
                <button className="w-full text-left px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                    Ustawienia szybkich czynności
                </button>
            </div>
        </div>
    );

    // Render to document.body to escape any overflow:hidden containers
    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }
    return null;
}

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function ServiceItem({ service, color, onEdit, onDelete }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format duration
    const formatDuration = (min) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (h > 0 && m > 0) return `${h} h ${m} min`;
        if (h > 0) return `${h} h`;
        return `${m} min`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group relative flex">
            {/* Colored strip on the left with rounded corners */}
            <div
                className="w-1.5 absolute left-0 top-0 bottom-0 rounded-l-xl"
                style={{ backgroundColor: color || '#38bdf8' }} // Fallback to sky-400
            ></div>

            <div className="flex-1 p-5 pl-7 flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{service.name}</h4>
                    <p className="text-gray-500 text-sm mt-1">{formatDuration(service.duration)}</p>
                    {service.description && (
                        <p className="text-gray-400 text-xs mt-2 max-w-md truncate">{service.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <span className="font-semibold text-gray-900">{service.price} zł</span>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => { setShowMenu(false); onEdit(service); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edytuj
                                </button>
                                <button
                                    onClick={() => { setShowMenu(false); onDelete(service.id); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Usuń
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

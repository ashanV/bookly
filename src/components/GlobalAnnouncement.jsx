'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Info, AlertTriangle, CheckCircle, Megaphone } from 'lucide-react';

export default function GlobalAnnouncement() {
    const [announcement, setAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await fetch('/api/admin/system/config');
                if (!res.ok) return;

                const data = await res.json();

                if (data.announcement?.enabled && data.announcement.text) {
                    setAnnouncement(data.announcement);
                    setIsVisible(true);
                } else {
                    setAnnouncement(null);
                }
            } catch (error) {
                // Silent error
            }
        };

        // Initial fetch
        fetchAnnouncement();

        // Real-time updates with Pusher
        const { pusherClient } = require('@/lib/pusher-client');

        const channel = pusherClient.subscribe('system-updates');
        channel.bind('config-updated', (data) => {
            console.log('GlobalAnnouncement: Real-time update received', data);

            if (data.announcement?.enabled && data.announcement.text) {
                setAnnouncement(data.announcement);
                setIsVisible(true);
            } else {
                setAnnouncement(null);
            }
        });

        return () => {
            pusherClient.unsubscribe('system-updates');
        };
    }, []); // No dependencies - runs once

    if (!announcement || !isVisible) return null;

    const styles = {
        info: 'bg-blue-600 border-blue-400/30 text-white',
        warning: 'bg-amber-500 border-amber-300/30 text-white',
        error: 'bg-red-600 border-red-400/30 text-white',
        success: 'bg-emerald-600 border-emerald-400/30 text-white'
    };

    const icons = {
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        success: <CheckCircle className="w-5 h-5" />
    };

    return (
        <div className={`relative z-[100] border-b ${styles[announcement.type] || styles.info} transition-all duration-500 animate-in slide-in-from-top-full`}>
            <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-1 bg-white/20 rounded-lg">
                            {icons[announcement.type] || <Megaphone className="w-5 h-5" />}
                        </div>
                        <p className="text-sm font-medium">
                            {announcement.text}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                        title="Zamknij"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

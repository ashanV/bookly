'use client';

import { useState, useEffect } from 'react';
import AdminLoginModal from '@/components/admin/AdminLoginModal';

/**
 * Global keyboard shortcut listener for admin panel access
 * Listens for Ctrl+Shift+A to open admin login modal
 */
export default function AdminShortcutListener() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Shift+A
            if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <AdminLoginModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        />
    );
}

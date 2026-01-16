'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { adminUser, loading, isAdminAuthenticated, canAccess } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAdminAuthenticated) {
            router.push('/admin/login');
        }
    }, [loading, isAdminAuthenticated, router]);

    // Check section access
    useEffect(() => {
        if (!loading && isAdminAuthenticated && !canAccess(pathname)) {
            router.push('/admin'); // Redirect to dashboard if no access
        }
    }, [loading, isAdminAuthenticated, pathname, canAccess, router]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-gray-400">Ładowanie panelu...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAdminAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                {children}
            </main>
            <Toaster position="bottom-right" theme="dark" />
        </div>
    );
}

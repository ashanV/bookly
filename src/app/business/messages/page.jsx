'use client';

import React from 'react';
import BusinessMessages from '@/components/business/BusinessMessages';
import { useAuth } from '@/hooks/useAuth';

export default function BusinessMessagesPage() {
    const { user, loading, isAuthenticated } = useAuth('/business/auth');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'business') {
        return null;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Wiadomości</h1>
                <p className="text-gray-500 text-sm">Centrum komunikacji z supportem</p>
            </div>
            <BusinessMessages />
        </div>
    );
}

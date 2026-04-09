"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import PlanningConfigSection from '@/components/dashboard/settings/planning/PlanningConfigSection';

export default function PlanningSettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [businessData, setBusinessData] = useState(null);

    useEffect(() => {
        if (user) {
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        if (user?.id) {
            try {
                const response = await fetch(`/api/businesses/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBusinessData(data.business);
                }
            } catch (error) {
                console.error('Failed to fetch business data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const saveBusinessProfile = async (updates = {}) => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika.");
            return { success: false };
        }

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) return { success: true };
            const data = await response.json();
            throw new Error(data.error || 'Błąd zapisywania danych');
        } catch (error) {
            toast.error(error.message || 'Wystąpił błąd podczas zapisywania');
            return { success: false, error: error.message };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 font-medium">Ładowanie ustawień...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PlanningConfigSection
                    businessData={businessData}
                    onBack={() => router.push('/business/dashboard/settings')}
                    onUpdateBusiness={(updates) => {
                        // Handle navigation request from shortcut
                        if (updates === 'hours') {
                            // Navigate to hours section - for now, redirect to main settings
                            router.push('/business/dashboard/settings?section=hours');
                            return;
                        }
                        // Standard update
                        return saveBusinessProfile(updates).then(() => {
                            setBusinessData(prev => ({ ...prev, ...updates }));
                        });
                    }}
                />
            </div>
        </div>
    );
}

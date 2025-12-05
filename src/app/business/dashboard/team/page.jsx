"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import WorkSchedule from '@/components/team/WorkSchedule';
import TeamList from '@/components/team/TeamList';
import { Users, CalendarDays } from 'lucide-react';

export default function TeamPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('employees');

    // Data state
    const [employees, setEmployees] = useState([]);
    const [services, setServices] = useState([]);
    const [openingHours, setOpeningHours] = useState([
        { day: 'Poniedziałek', key: 'monday', open: '09:00', close: '17:00', closed: false },
        { day: 'Wtorek', key: 'tuesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Środa', key: 'wednesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Czwartek', key: 'thursday', open: '09:00', close: '17:00', closed: false },
        { day: 'Piątek', key: 'friday', open: '09:00', close: '17:00', closed: false },
        { day: 'Sobota', key: 'saturday', open: '10:00', close: '14:00', closed: false },
        { day: 'Niedziela', key: 'sunday', open: '00:00', close: '00:00', closed: true }
    ]);

    // Employee Form State


    // Availability State
    const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState(null);
    const [showVacationForm, setShowVacationForm] = useState(false);
    const [newVacation, setNewVacation] = useState({ employeeId: null, startDate: '', endDate: '', reason: '' });
    const [showBreakForm, setShowBreakForm] = useState(false);
    const [newBreak, setNewBreak] = useState({ employeeId: null, day: '', startTime: '', endTime: '', reason: '' });
    const [selectedServiceAssignment, setSelectedServiceAssignment] = useState({ employeeId: null, serviceId: null });

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
                    const business = data.business;

                    if (business.employees) setEmployees(business.employees);
                    if (business.services) setServices(business.services);
                    if (business.workingHours) {
                        const mappedHours = openingHours.map(day => ({
                            ...day,
                            ...business.workingHours[day.key]
                        }));
                        setOpeningHours(mappedHours);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch business data:', error);
                toast.error('Nie udało się pobrać danych firmy');
            } finally {
                setLoading(false);
            }
        }
    };



    // Employee Management
    const saveEmployees = async (updatedEmployees) => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        const normalizedEmployees = updatedEmployees.map(emp => ({
            ...emp,
            assignedServices: (emp.assignedServices || []).map(as => {
                if (typeof as === 'string') {
                    const service = services.find(s => s.id === as);
                    if (service) {
                        return {
                            serviceId: as,
                            duration: service.duration,
                            price: service.price,
                            available: true
                        };
                    }
                    return null;
                }
                return as;
            }).filter(Boolean)
        }));

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees: normalizedEmployees }),
            });

            if (response.ok) {
                setEmployees(updatedEmployees);
                toast.success('Lista pracowników została zaktualizowana!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji pracowników');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };



    const deleteEmployee = async (id) => {
        if (confirm('Czy na pewno chcesz usunąć tego pracownika?')) {
            const updatedEmployees = employees.filter(emp => emp.id !== id);
            await saveEmployees(updatedEmployees);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 font-medium">Ładowanie zespołu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('employees')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'employees'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users size={18} />
                    Pracownicy
                </button>
                <button
                    onClick={() => setActiveTab('availability')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'availability'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <CalendarDays size={18} />
                    Grafik i Dostępność
                </button>
            </div>

            {/* Content */}
            {activeTab === 'employees' ? (
                <TeamList
                    employees={employees}
                    onAddClick={() => router.push('/business/dashboard/team/add')}
                    onDeleteClick={deleteEmployee}
                    onEmployeeUpdate={saveEmployees}
                    onEditClick={(id) => router.push(`/business/dashboard/team/${id}`)}
                    onViewScheduleClick={() => setActiveTab('availability')}
                />
            ) : (
                <WorkSchedule
                    employees={employees}
                    openingHours={openingHours}
                    onEmployeeUpdate={saveEmployees}
                    businessName={user?.businessName}
                    onAddEmployee={() => router.push('/business/dashboard/team/add')}
                    onEditClick={(id) => router.push(`/business/dashboard/team/${id}`)}
                />
            )}


        </div>
    );
}

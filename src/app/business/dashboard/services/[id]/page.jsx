"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import ServiceFormLayout from '@/components/services/ServiceFormLayout';
import ServiceBasicInfo from '@/components/services/ServiceBasicInfo';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceEmployees from '@/components/services/ServiceEmployees';

export default function EditServicePage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [categories, setCategories] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Original data for comparison (optional, but good for optimizing PUT)
    const [originalServices, setOriginalServices] = useState([]);
    const [serviceIndex, setServiceIndex] = useState(-1);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        duration: '30',
        employees: []
    });

    useEffect(() => {
        if (user?.id) {
            fetchServiceData();
        }
    }, [user, id]);

    const fetchServiceData = async () => {
        try {
            const response = await fetch(`/api/businesses/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                const business = data.business || {};

                if (business.categories) {
                    setCategories(business.categories);
                }

                if (business.employees) {
                    setEmployees(business.employees);
                }

                if (business.services) {
                    setOriginalServices(business.services);
                    const index = business.services.findIndex(s => s.id === id);
                    if (index !== -1) {
                        setServiceIndex(index);
                        const service = business.services[index];
                        setFormData({
                            name: service.name || '',
                            category: service.category || '',
                            description: service.description || '',
                            price: service.price || '',
                            duration: service.duration || '30',
                            employees: service.employees || []
                        });
                    } else {
                        toast.error('Nie znaleziono usługi');
                        router.push('/business/dashboard/services');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch service:', error);
            toast.error('Błąd pobierania danych');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Wypełnij wymagane pola');
            return;
        }

        setSaving(true);
        try {
            const updatedServices = [...originalServices];
            updatedServices[serviceIndex] = {
                ...updatedServices[serviceIndex],
                ...formData,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration)
            };

            // Sync with employees' assignedServices
            const updatedEmployees = employees.map(emp => {
                const isAssigned = formData.employees.includes(emp.id);
                const assignedServices = emp.assignedServices || [];

                let newAssignedServices;
                if (isAssigned) {
                    // Add or update service
                    const existingServiceIndex = assignedServices.findIndex(s => s.serviceId === id);
                    if (existingServiceIndex !== -1) {
                        // Update existing
                        const updated = [...assignedServices];
                        updated[existingServiceIndex] = {
                            ...updated[existingServiceIndex],
                            price: parseFloat(formData.price),
                            duration: parseInt(formData.duration)
                        };
                        newAssignedServices = updated;
                    } else {
                        // Add new
                        newAssignedServices = [...assignedServices, {
                            serviceId: id,
                            price: parseFloat(formData.price),
                            duration: parseInt(formData.duration)
                        }];
                    }
                } else {
                    // Remove service
                    newAssignedServices = assignedServices.filter(s => s.serviceId !== id);
                }

                return { ...emp, assignedServices: newAssignedServices };
            });

            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    services: updatedServices,
                    employees: updatedEmployees
                })
            });

            if (response.ok) {
                toast.success('Usługa została zaktualizowana');
                router.push('/business/dashboard/services');
            } else {
                toast.error('Błąd zapisu');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Wystąpił błąd połączenia');
        } finally {
            setSaving(false);
        }
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;
    }

    return (
        <ServiceFormLayout
            title="Edytuj usługę"
            onSave={handleSave}
            loading={saving}
            activeSection={activeSection}
            onSectionChange={scrollToSection}
        >
            <ServiceBasicInfo
                data={formData}
                onChange={handleChange}
                categories={categories}
            />
            <ServicePricing
                data={formData}
                onChange={handleChange}
            />
            <ServiceEmployees
                data={formData}
                onChange={handleChange}
                employees={employees}
            />
        </ServiceFormLayout>
    );
}

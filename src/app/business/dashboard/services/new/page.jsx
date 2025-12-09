"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import ServiceFormLayout from '@/components/services/ServiceFormLayout';
import ServiceBasicInfo from '@/components/services/ServiceBasicInfo';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceEmployees from '@/components/services/ServiceEmployees';

export default function NewServicePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        duration: '30',
        employees: []
    });

    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (user?.id) {
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        try {
            const response = await fetch(`/api/businesses/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.business) {
                    setCategories(data.business.categories || []);
                    setEmployees(data.business.employees || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch business data:', error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Wypełnij wymagane pola (Nazwa, Kategoria, Cena)');
            return;
        }

        setLoading(true);
        try {
            // First fetch current services to append to
            const getResponse = await fetch(`/api/businesses/${user.id}`);
            const data = await getResponse.json();
            const currentServices = data.business.services || [];

            const newService = {
                ...formData,
                id: Date.now().toString(),
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration)
            };

            const updatedServices = [...currentServices, newService];

            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ services: updatedServices })
            });

            if (response.ok) {
                toast.success('Usługa została dodana');
                router.push('/business/dashboard/services');
            } else {
                toast.error('Błąd podczas zapisywania');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Wystąpił błąd połączenia');
        } finally {
            setLoading(false);
        }
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <ServiceFormLayout
            title="Nowa usługa"
            onSave={handleSave}
            loading={loading}
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

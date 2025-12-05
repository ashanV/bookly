"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import ServicesSection from '@/components/settings/ServicesSection';

export default function ServicesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: '', price: '', description: '' });
    const [editingServiceId, setEditingServiceId] = useState(null);

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
                    if (business.services) {
                        setServices(business.services);
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

    const addService = () => {
        if (newService.name && newService.duration && newService.price) {
            if (editingServiceId) {
                setServices(services.map(service =>
                    service.id === editingServiceId
                        ? { ...newService, id: editingServiceId, duration: parseInt(newService.duration), price: parseFloat(newService.price) }
                        : service
                ));
                setEditingServiceId(null);
                toast.success('Usługa została zaktualizowana');
            } else {
                setServices([...services, { ...newService, id: Date.now().toString(), duration: parseInt(newService.duration), price: parseFloat(newService.price) }]);
                toast.success('Usługa została dodana');
            }
            setNewService({ name: '', duration: '', price: '', description: '' });
            setShowServiceForm(false);
        } else {
            toast.error('Wypełnij wymagane pola (Nazwa, Czas, Cena)');
        }
    };

    const editService = (service) => {
        setNewService({
            name: service.name,
            duration: service.duration,
            price: service.price,
            description: service.description || ''
        });
        setEditingServiceId(service.id);
        setShowServiceForm(true);
    };

    const deleteService = (id) => {
        if (confirm('Czy na pewno chcesz usunąć tę usługę?')) {
            setServices(services.filter(service => service.id !== id));
        }
    };

    const saveServices = async () => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ services }),
            });

            if (response.ok) {
                toast.success('Usługi zostały zaktualizowane!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji usług');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 font-medium">Ładowanie usług...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ServicesSection
                services={services}
                showServiceForm={showServiceForm}
                newService={newService}
                editingServiceId={editingServiceId}
                onShowServiceFormChange={setShowServiceForm}
                onNewServiceChange={setNewService}
                onAddService={addService}
                onEditService={editService}
                onDeleteService={deleteService}
                onCancelEdit={() => {
                    setShowServiceForm(false);
                    setNewService({ name: '', duration: '', price: '', description: '' });
                    setEditingServiceId(null);
                }}
                onSaveServices={saveServices}
            />
        </div>
    );
}

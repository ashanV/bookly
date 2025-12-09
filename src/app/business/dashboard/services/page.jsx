"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import ServicesSection from '@/components/services/ServicesSection';

export default function ServicesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', category: '', duration: '', price: '', description: '' });
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

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
                    console.log('Fetched business data:', business);
                    console.log('Fetched categories:', business.categories);
                    if (business.services) {
                        setServices(business.services);
                    }
                    if (business.categories) {
                        setCategories(business.categories);
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

    const saveServices = async (currentServices = services, currentCategories = categories) => {
        console.log('saveServices called with:', { currentServices, currentCategories });

        if (!user?.id) {
            console.error('No user ID available');
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        // Sanitize categories to remove helper properties like originalName just in case
        const sanitizedCategories = currentCategories.map(({ originalName, ...rest }) => rest);

        console.log('Sending to API:', { services: currentServices, categories: sanitizedCategories });

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ services: currentServices, categories: sanitizedCategories }),
            });

            const data = await response.json();
            console.log('API Response:', response.status, data);

            if (response.ok) {
                console.log('Saved successfully');
            } else {
                toast.error(data.error || 'Błąd zapisu');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };

    const addService = (serviceData = newService) => {
        // Validation: Name, Category, Duration, Price
        if (serviceData.name && serviceData.duration && serviceData.price && serviceData.category) {
            let updatedServices;
            if (editingServiceId) {
                updatedServices = services.map(service =>
                    service.id === editingServiceId
                        ? { ...serviceData, id: editingServiceId, duration: parseInt(serviceData.duration), price: parseFloat(serviceData.price) }
                        : service
                );
                setServices(updatedServices);
                setEditingServiceId(null);
                toast.success('Usługa została zaktualizowana');
            } else {
                updatedServices = [...services, { ...serviceData, id: Date.now().toString(), duration: parseInt(serviceData.duration), price: parseFloat(serviceData.price) }];
                setServices(updatedServices);
                toast.success('Usługa została dodana');
            }
            setNewService({ name: '', category: '', duration: '', price: '', description: '' });
            setShowServiceForm(false);

            // Auto save
            saveServices(updatedServices, categories);
        } else {
            toast.error('Wypełnij wymagane pola (Nazwa, Kategoria, Czas, Cena)');
        }
    };

    const editService = (service) => {
        router.push(`/business/dashboard/services/${service.id}`);
    };

    const deleteService = (id) => {
        if (confirm('Czy na pewno chcesz usunąć tę usługę?')) {
            const updatedServices = services.filter(service => service.id !== id);
            setServices(updatedServices);
            saveServices(updatedServices, categories);
        }
    };

    const addCategory = (categoryData) => {
        // Check if editing
        if (categoryData.originalName) {
            handleUpdateCategory(categoryData);
        } else {
            // Check for duplicates
            if (categories.some(c => c?.name?.toLowerCase() === categoryData.name?.toLowerCase())) {
                toast.error('Kategoria o tej nazwie już istnieje');
                return;
            }

            // Sanitize data (remove helper props if any)
            const { originalName, ...cleanCategory } = categoryData;
            const newCategories = [...categories, cleanCategory];

            setCategories(newCategories);
            toast.success(`Dodano kategorię: ${categoryData.name}`);

            // Auto save
            saveServices(services, newCategories);
        }
    };

    const handleUpdateCategory = (categoryData) => {
        const { originalName, ...newData } = categoryData;

        // Update services that were in this category
        let newServices = services;
        if (originalName !== newData.name) {
            newServices = services.map(s =>
                s.category === originalName
                    ? { ...s, category: newData.name }
                    : s
            );
            setServices(newServices);
        }

        // Update category metadata
        const newCategories = categories.map(c =>
            c.name === originalName ? newData : c
        );
        setCategories(newCategories);

        setEditingCategory(null);
        toast.success('Kategoria została zaktualizowana');

        // Auto save
        saveServices(newServices, newCategories);
    };

    const handleDeleteCategory = (categoryName) => {
        if (confirm(`Czy na pewno chcesz usunąć kategorię "${categoryName}"? Usługi w tej kategorii nie zostaną usunięte, ale stracą przypisanie.`)) {
            // Remove category from metadata
            const newCategories = categories.filter(c => c.name !== categoryName);
            setCategories(newCategories);

            // Update services to remove category assignment (or set to 'Ogólne' / null)
            const newServices = services.map(s =>
                s.category === categoryName
                    ? { ...s, category: '' } // Or 'Ogólne' if you prefer services to go there
                    : s
            );
            setServices(newServices);
            toast.success('Kategoria usunięta');

            // Auto save
            saveServices(newServices, newCategories);
        }
    };

    const handleEditCategoryStart = (categoryName) => {
        const categoryToEdit = categories.find(c => c.name === categoryName) || { name: categoryName };
        setEditingCategory(categoryToEdit);
    };

    const handleServiceUpdate = (updatedService) => {
        const newServices = services.map(s =>
            s.id === updatedService.id ? updatedService : s
        );
        setServices(newServices);
        // Silent save without toast if purely reordering/moving, or reuse saveServices which might toast. 
        // User likely wants to know it saved or just have it work.
        saveServices(newServices, categories);
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
                categories={categories}
                showServiceForm={showServiceForm}
                newService={newService}
                editingServiceId={editingServiceId}
                onShowServiceFormChange={setShowServiceForm}
                onNewServiceChange={setNewService}
                onAddService={addService}
                onEditService={editService}
                onUpdateService={handleServiceUpdate}
                onDeleteService={deleteService}
                onCancelEdit={() => {
                    setShowServiceForm(false);
                    setNewService({ name: '', category: '', duration: '', price: '', description: '' });
                    setEditingServiceId(null);
                }}
                onSaveServices={() => saveServices(services, categories)}
                onAddCategory={addCategory}
                onDeleteCategory={handleDeleteCategory}
                onEditCategory={handleEditCategoryStart}
                editingCategory={editingCategory}
                onCloseCategoryModal={() => setEditingCategory(null)}
            />
        </div>
    );
}

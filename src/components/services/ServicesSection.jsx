"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, Filter, ArrowUpDown, ChevronDown, Plus,
    Link as LinkIcon, Settings, FileText
} from 'lucide-react';
import Link from 'next/link';
import ServiceCategorySidebar from '@/components/services/ServiceCategorySidebar';
import ServiceList from '@/components/services/ServiceList';
import ServiceModal from '@/components/services/ServiceModal';
import CategoryModal from '@/components/services/CategoryModal';

export default function ServicesSection({
    services,
    categories: propCategories,
    showServiceForm,
    newService,
    editingServiceId,
    onShowServiceFormChange,
    onNewServiceChange,

    onAddService,
    onEditService,
    onUpdateService,
    onDeleteService,
    onCancelEdit,
    onSaveServices,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    editingCategory,
    onCloseCategoryModal
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    // Close options on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Open modal when editingCategory is provided
    useEffect(() => {
        if (editingCategory) {
            setShowCategoryModal(true);
        }
    }, [editingCategory]);

    // Compute categories: merge propCategories (metadata) with actual used categories
    const categories = useMemo(() => {
        const counts = {};
        services.forEach(service => {
            const cat = service.category || 'Ogólne';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        // If we have explicit categories, use them, otherwise just use names
        let merged = [];
        if (propCategories && propCategories.length > 0) {
            // Deduplicate propCategories by name first
            const uniqueProps = Array.from(new Set(propCategories.map(c => c.name)))
                .map(name => propCategories.find(c => c.name === name));

            merged = uniqueProps.map(c => ({
                ...c,
                count: counts[c.name] || 0
            }));

            // Add any "used" categories that are not in explicit list
            Object.keys(counts).forEach(key => {
                if (!merged.find(m => m.name === key)) {
                    merged.push({ name: key, count: counts[key] });
                }
            });
        } else {
            merged = Object.entries(counts).map(([name, count]) => ({ name, count }));
        }

        // Filter out empty or undefined names just in case
        return merged.filter(c => c.name && c.name.trim() !== '');
    }, [services, propCategories]);

    const filteredServices = useMemo(() => {
        return services.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [services, searchQuery]);

    const handleSaveFromModal = (formData) => {
        onAddService(formData);
    };

    const handleAddCategoryClick = () => {
        setShowCategoryModal(true);
    };

    const handleEditCategory = (categoryName) => {
        if (onEditCategory) onEditCategory(categoryName);
    };

    const handleDeleteCategory = (categoryName) => {
        if (onDeleteCategory) onDeleteCategory(categoryName);
    };

    const handleAddServiceToCategory = (categoryName) => {
        onNewServiceChange({ ...newService, category: categoryName });
        onShowServiceFormChange(true);
    };

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu usług</h1>
                    <p className="text-gray-500 mt-1">
                        Wyświetl usługi oferowane przez Twoją firmę i zarządzaj nimi. {' '}
                        <a href="#" className="text-purple-600 hover:underline">Dowiedz się więcej</a>
                    </p>
                </div>

                <div className="flex gap-3 relative" ref={optionsRef}>
                    {/* Opcje Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            Opcje
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} />
                        </button>

                        {showOptions && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="py-1">
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <LinkIcon className="w-4 h-4 text-gray-500" />
                                        Szybki link do rezerwacji
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="py-1">
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                                        Ustaw kolejność menu
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                                        Ustaw kolejność rezerwacji
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <Settings className="w-4 h-4 text-gray-500" />
                                        Ustawienia
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="py-1">
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Pobierz PDF
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Pobierz Excel
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Pobierz CSV
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/business/dashboard/services/new"
                        className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        Dodaj
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Wyszukaj nazwę usługi"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium text-gray-700">
                    <ArrowUpDown className="w-4 h-4" />
                    Ustaw kolejność
                </button>
            </div>

            {/* Main Content: Sidebar + List */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <ServiceCategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onAddCategory={handleAddCategoryClick}
                />

                <ServiceList
                    services={filteredServices}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onEdit={onEditService}
                    onUpdate={onUpdateService}
                    onDelete={onDeleteService}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddServiceToCategory={handleAddServiceToCategory}
                    isSearching={searchQuery.length > 0}
                />
            </div>

            {/* Service Modal */}
            <ServiceModal
                isOpen={showServiceForm}
                onClose={() => onCancelEdit()}
                onSave={handleSaveFromModal}
                initialData={editingServiceId ? newService : null}
                categories={categories.map(c => c.name)}
            />

            {/* Category Modal */}
            <CategoryModal
                isOpen={showCategoryModal}
                onClose={() => {
                    setShowCategoryModal(false);
                    if (onCloseCategoryModal) onCloseCategoryModal();
                }}
                onSave={(categoryData) => {
                    if (onAddCategory) onAddCategory(categoryData);
                    setShowCategoryModal(false);
                    if (onCloseCategoryModal) onCloseCategoryModal();
                }}
                initialData={editingCategory}
            />
        </div>
    );
}

"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ServiceItem from './ServiceItem';
import { MoreHorizontal, Pencil, Trash2, Plus, Archive } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function CategoryHeader({ category, onEdit, onDelete, onAddService }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-between mb-4 relative group">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{category}</h3>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isOpen ? 'bg-gray-100 border-gray-300 text-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                    Opcje
                    <MoreHorizontal className="w-4 h-4" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-1">
                            <button
                                onClick={() => { setIsOpen(false); onEdit(category); }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            >
                                <Pencil className="w-4 h-4" />
                                Zmień
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); onAddService(category); }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Dodaj usługę
                            </button>
                        </div>
                        <div className="h-px bg-gray-100 my-1" />
                        <div className="p-1">
                            <button
                                onClick={() => { setIsOpen(false); /* Archive logic */ }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            >
                                <Archive className="w-4 h-4" />
                                Archiwizuj
                            </button>
                            <button
                                onClick={() => { setIsOpen(false); onDelete(category); }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Trwale usuń
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SortableServiceItem({ service, color, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: service.id, data: { type: 'Service', service } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-manipulation">
            <ServiceItem
                service={service}
                color={color}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}

// Droppable container for each category to ensure we can drop into empty lists
function CategoryDroppable({ id, children }) {
    const { setNodeRef } = useSortable({ id: id, data: { type: 'Category', id } });
    return (
        <div ref={setNodeRef} className="bg-transparent min-h-[50px] rounded-xl transition-colors">
            {children}
        </div>
    );
}

export default function ServiceList({ services: propServices, categories, selectedCategory, onEdit, onUpdate, onDelete, onEditCategory, onDeleteCategory, onAddServiceToCategory }) {
    const [services, setServices] = useState(propServices);
    const [activeId, setActiveId] = useState(null);
    const [dragStartCategory, setDragStartCategory] = useState(null);
    const [emptyCategoriesToKeep, setEmptyCategoriesToKeep] = useState(new Set());

    useEffect(() => {
        setServices(propServices);
    }, [propServices]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group services by category
    const groupedServices = useMemo(() => {
        return services.reduce((acc, service) => {
            const cat = service.category || 'Ogólne';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(service);
            return acc;
        }, {});
    }, [services]);

    const categoryColors = useMemo(() => {
        return (categories || []).reduce((acc, cat) => {
            acc[cat.name] = cat.color;
            return acc;
        }, {});
    }, [categories]);

    // Determine which categories to show
    const categoriesToShow = useMemo(() => {
        if (selectedCategory) return [selectedCategory];

        const categoryNames = new Set();
        if (categories) categories.forEach(c => categoryNames.add(c.name));
        Object.keys(groupedServices).forEach(name => categoryNames.add(name));
        emptyCategoriesToKeep.forEach(name => categoryNames.add(name));
        return Array.from(categoryNames).sort();
    }, [selectedCategory, categories, groupedServices, emptyCategoriesToKeep]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        const service = services.find(s => s.id === event.active.id);
        if (service) {
            setDragStartCategory(service.category || 'Ogólne');
        }
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the active service
        const activeService = services.find(s => s.id === activeId);
        if (!activeService) return;

        // Find over service (if over is an item)
        const overService = services.find(s => s.id === overId);

        // Is over a category container?
        const isOverCategory = categoriesToShow.includes(overId);

        let newCategory = null;

        if (overService) {
            // We are hovering over another service item
            if (activeService.category !== overService.category) {
                newCategory = overService.category || 'Ogólne'; // Fallback
            }
        } else if (isOverCategory) {
            // We are hovering over a category container
            if (activeService.category !== overId) {
                newCategory = overId;
            }
        }

        // If we found a new category, update local state to reflect the move immediately
        if (newCategory) {
            setServices((prevServices) => {
                return prevServices.map(s =>
                    s.id === activeId ? { ...s, category: newCategory } : s
                );
            });
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            setDragStartCategory(null);
            return;
        }

        const activeService = services.find(s => s.id === active.id);
        const originalService = propServices.find(s => s.id === active.id); // Check original prop to see if change persisted

        if (activeService && originalService && activeService.category !== originalService.category) {

            // If we moved out of a category, keep it visible
            if (dragStartCategory && dragStartCategory !== activeService.category) {
                setEmptyCategoriesToKeep(prev => {
                    const next = new Set(prev);
                    next.add(dragStartCategory);
                    return next;
                });
            }

            // Category changed - trigger silent update
            if (onUpdate) {
                onUpdate({ ...activeService, category: activeService.category });
            }
        }
        setDragStartCategory(null);
    };

    const handleDeleteCategoryWrapper = (catName) => {
        setEmptyCategoriesToKeep(prev => {
            const next = new Set(prev);
            next.delete(catName);
            return next;
        });
        if (onDeleteCategory) onDeleteCategory(catName);
    };

    const activeService = services.find(s => s.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex-1 space-y-8 pb-20">
                {categoriesToShow.map(category => (
                    <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CategoryHeader
                            category={category}
                            onEdit={onEditCategory}
                            onDelete={handleDeleteCategoryWrapper}
                            onAddService={onAddServiceToCategory}
                        />

                        <CategoryDroppable id={category}>
                            <SortableContext
                                items={groupedServices[category]?.map(s => s.id) || []}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3 min-h-[10px]">
                                    {groupedServices[category]?.map(service => (
                                        <SortableServiceItem
                                            key={service.id}
                                            service={service}
                                            color={categoryColors[category]}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))}
                                    {(!groupedServices[category] || groupedServices[category].length === 0) && (
                                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                                            <p className="font-medium">Upuść tutaj</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </CategoryDroppable>
                    </div>
                ))}

                {categoriesToShow.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nie znaleziono usług ani kategorii.</p>
                    </div>
                )}

                <DragOverlay>
                    {activeId && activeService ? (
                        <div className="opacity-80 rotate-2 scale-105">
                            <ServiceItem
                                service={activeService}
                                color={categoryColors[activeService.category]}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}

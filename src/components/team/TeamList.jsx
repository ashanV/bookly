import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, MoreHorizontal, Plus, Mail, Phone, Star, UserCog, Calendar, Briefcase, X, ChevronDown, Info, ChevronRight } from 'lucide-react';
import VacationModal from './VacationModal';

export default function TeamList({ employees, onAddClick, onDeleteClick, onEmployeeUpdate, onEditClick, onViewScheduleClick }) {
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const [isSidebarOptionsOpen, setIsSidebarOptionsOpen] = useState(false);
    const sidebarOptionsRef = useRef(null);

    // Vacation Modal State
    const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
    const [vacationModalEmployeeId, setVacationModalEmployeeId] = useState(null);

    // Employee Details Panel State
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null);
            }
            if (sidebarOptionsRef.current && !sidebarOptionsRef.current.contains(event.target)) {
                setIsSidebarOptionsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleVacationSave = (vacationData) => {
        const updatedEmployees = employees.map(emp => {
            if (emp.id === vacationData.employeeId) {
                return {
                    ...emp,
                    vacations: [
                        ...(emp.vacations || []),
                        {
                            id: Date.now(),
                            type: vacationData.type,
                            startDate: vacationData.startDate,
                            startTime: vacationData.startTime,
                            endDate: vacationData.endDate,
                            endTime: vacationData.endTime,
                            recurring: vacationData.recurring,
                            notes: vacationData.notes
                        }
                    ]
                };
            }
            return emp;
        });

        if (onEmployeeUpdate) {
            onEmployeeUpdate(updatedEmployees);
        }
    };
    return (
        <div className="bg-white min-h-screen p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">Pracownicy</h1>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                        {employees.length}
                    </span>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        Opcje
                        <MoreHorizontal size={16} />
                    </button>
                    <button
                        onClick={onAddClick}
                        className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                        Dodaj
                    </button>
                </div>
            </div>

            {/* Activation Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex justify-between items-center">
                <p className="text-amber-900 font-medium">
                    Aktywuj plan, aby nie stracić dostępu po zakończeniu bezpłatnego okresu próbnego za <span className="font-bold">13 dni</span>
                </p>
                <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800">
                    Aktywuj plan
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Szukaj pracowników"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black/5"
                    />
                </div>
                <button className="px-6 py-3 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Filtry
                    <SlidersHorizontal size={18} />
                </button>
                <button className="px-6 py-3 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 ml-auto">
                    Zmień kolejność
                    <ArrowUpDown size={18} />
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-900">
                <div className="w-6">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
                    Nazwa
                    <ArrowUpDown size={14} />
                </div>
                <div>Kontakt</div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
                    Ocena
                    <ArrowUpDown size={14} />
                </div>
                <div className="w-24"></div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {employees.map((employee) => (
                    <div
                        key={employee.id}
                        onClick={() => setSelectedEmployee(employee)}
                        className="grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-4 py-6 items-center hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                        <div className="w-6">
                            <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                        </div>

                        {/* Name & Avatar */}
                        <div className="flex items-center gap-4">
                            {employee.avatarImage ? (
                                <img
                                    src={employee.avatarImage}
                                    alt={employee.name}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-lg border border-blue-100">
                                    {employee.avatar || employee.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900">{employee.name}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-serif">S</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col gap-1">
                            {employee.email && (
                                <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline text-sm font-medium">
                                    {employee.email}
                                </a>
                            )}
                            {employee.phone && (
                                <span className="text-blue-600 text-sm">
                                    {employee.phone}
                                </span>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="text-gray-500 text-sm">
                            Brak opinii
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdownId(activeDropdownId === employee.id ? null : employee.id);
                                    }}
                                    className={`px-4 py-2 border border-gray-200 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeDropdownId === employee.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-white hover:shadow-sm bg-white'}`}
                                >
                                    Opcje
                                    <MoreHorizontal size={16} />
                                </button>

                                {activeDropdownId === employee.id && (
                                    <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    if (onEditClick) onEditClick(employee.id);
                                                    setActiveDropdownId(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <UserCog size={16} className="text-gray-400" />
                                                Zmień
                                            </button>
                                            <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                                <Calendar size={16} className="text-gray-400" />
                                                Wyświetl kalendarz
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (onViewScheduleClick) onViewScheduleClick();
                                                    setActiveDropdownId(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Briefcase size={16} className="text-gray-400" />
                                                Wyświetl grafik pracy
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdownId(null);
                                                    setVacationModalEmployeeId(employee.id);
                                                    setIsVacationModalOpen(true);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Briefcase size={16} className="text-gray-400" />
                                                Dodaj urlop
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <VacationModal
                isOpen={isVacationModalOpen}
                onClose={() => {
                    setIsVacationModalOpen(false);
                    setVacationModalEmployeeId(null);
                }}
                employees={employees}
                onSave={handleVacationSave}
                initialEmployeeId={vacationModalEmployeeId}
            />

            {/* Employee Details Slide-Out Panel */}
            {selectedEmployee && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setSelectedEmployee(null)}
                        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                    ></div>

                    {/* Panel */}
                    <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-2xl z-50 flex animate-in slide-in-from-right duration-300">

                        {/* Left Sidebar */}
                        <div className="w-72 border-r border-gray-100 flex flex-col p-6 bg-white">
                            {/* Avatar & Name */}
                            <div className="flex flex-col items-center text-center mb-8">
                                {selectedEmployee.avatarImage ? (
                                    <img
                                        src={selectedEmployee.avatarImage}
                                        alt={selectedEmployee.name}
                                        className="w-24 h-24 rounded-full object-cover border border-gray-200 mb-4"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-3xl border border-blue-100 mb-4">
                                        {selectedEmployee.avatar || selectedEmployee.name.charAt(0)}
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedEmployee.name}</h2>
                                <div className="relative" ref={sidebarOptionsRef}>
                                    <button
                                        onClick={() => setIsSidebarOptionsOpen(!isSidebarOptionsOpen)}
                                        className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        Opcje
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isSidebarOptionsOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isSidebarOptionsOpen && (
                                        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        if (onEditClick) onEditClick(selectedEmployee.id);
                                                        setIsSidebarOptionsOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Zmień
                                                </button>
                                                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    Wyświetl kalendarz
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (onViewScheduleClick) onViewScheduleClick();
                                                        setIsSidebarOptionsOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Wyświetl grafik pracy
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsSidebarOptionsOpen(false);
                                                        setVacationModalEmployeeId(selectedEmployee.id);
                                                        setIsVacationModalOpen(true);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Dodaj urlop
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`px-4 py-3 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${activeTab === 'summary'
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Podsumowanie
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-4 py-3 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${activeTab === 'profile'
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Profil osobisty
                                </button>
                                <button
                                    onClick={() => setActiveTab('workspace')}
                                    className={`px-4 py-3 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${activeTab === 'workspace'
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Obszar roboczy
                                </button>
                                <button
                                    onClick={() => setActiveTab('pay')}
                                    className={`px-4 py-3 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${activeTab === 'pay'
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Zapłać
                                </button>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1 flex flex-col bg-white">
                            {/* Header */}
                            <div className="p-6 flex justify-between items-center border-b border-gray-50">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {activeTab === 'summary' && 'Podsumowanie'}
                                    {activeTab === 'profile' && 'Profil osobisty'}
                                    {activeTab === 'workspace' && 'Obszar roboczy'}
                                    {activeTab === 'pay' && 'Zapłać'}
                                </h2>
                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                {activeTab === 'summary' && (
                                    <div className="space-y-8">
                                        {/* Panel wyników Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900">Panel wyników</h3>
                                                <button className="text-sm text-indigo-600 hover:underline">Zobacz cały pułpit</button>
                                            </div>
                                            <select className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                <option>Bieżący tydzień</option>
                                                <option>Ostatni miesiąc</option>
                                                <option>Ostatnie 3 miesiące</option>
                                            </select>
                                        </div>

                                        {/* Sprzedaż Card */}
                                        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="font-bold text-gray-900">Sprzedaż</span>
                                                <Info size={16} className="text-gray-400" />
                                            </div>

                                            <div className="text-4xl font-bold text-gray-900 mb-2">0,00 zł</div>

                                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600 mb-8">
                                                <ArrowUpDown size={12} />
                                                0% vs poprzedni okres
                                            </div>

                                            {/* Graph Placeholder */}
                                            <div className="relative h-48 w-full">
                                                {/* Y-Axis Labels */}
                                                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
                                                    <span>4 zł</span>
                                                    <span>3 zł</span>
                                                    <span>2 zł</span>
                                                    <span>1 zł</span>
                                                    <span>0 zł</span>
                                                </div>

                                                {/* Grid Lines */}
                                                <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between">
                                                    <div className="border-t border-dashed border-gray-200 w-full h-0"></div>
                                                    <div className="border-t border-dashed border-gray-200 w-full h-0"></div>
                                                    <div className="border-t border-dashed border-gray-200 w-full h-0"></div>
                                                    <div className="border-t border-dashed border-gray-200 w-full h-0"></div>
                                                    <div className="border-t border-gray-200 w-full h-0"></div>
                                                </div>

                                                {/* X-Axis Labels */}
                                                <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs text-gray-400 pt-2">
                                                    <span>1 gru</span>
                                                    <span>2 gru</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-gray-900">Wizyty</span>
                                                    <Info size={16} className="text-gray-400" />
                                                </div>
                                                <div className="text-3xl font-bold text-gray-900">1</div>
                                            </div>
                                            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-gray-900">Klienci</span>
                                                    <Info size={16} className="text-gray-400" />
                                                </div>
                                                <div className="text-3xl font-bold text-gray-900">0</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="text-center text-gray-500 py-12">
                                        Profil osobisty - w przygotowaniu
                                    </div>
                                )}

                                {activeTab === 'workspace' && (
                                    <div className="text-center text-gray-500 py-12">
                                        Obszar roboczy - w przygotowaniu
                                    </div>
                                )}

                                {activeTab === 'pay' && (
                                    <div className="text-center text-gray-500 py-12">
                                        Zapłać - w przygotowaniu
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

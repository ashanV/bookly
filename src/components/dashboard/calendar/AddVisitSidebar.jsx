import React, { useState } from 'react';
import { X, Search, Clock, UserPlus, Expand, Crosshair, Plus, PersonStanding, ChevronDown, Trash2, Edit2, ArrowLeft, ChevronRight, Heart } from 'lucide-react';

import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { enUS, pl } from 'date-fns/locale';
import DatePickerPopover from './DatePickerPopover';

const fallbackColors = ['#7dd3fc', '#fca5a5', '#d8b4fe', '#fcd34d', '#86efac', '#fdba74', '#5eead4'];

const getFallbackColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return fallbackColors[Math.abs(hash) % fallbackColors.length];
};

const formatDuration = (min, t) => {
    if (!min) return '';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h} ${t('hoursShort')} ${m} ${t('minutesShort')}`;
    if (h > 0) return `${h} ${t('hoursShort')}`;
    return `${m} ${t('minutesShort')}`;
};

export default function AddVisitSidebar({
    isOpen,
    onClose,
    services = [],
    clients = [],
    categories = [],
    draftVisit,
    setDraftVisit,
    employees = [],
    reservations = [],
    business,
    onSave,
    isSaving
}) {
    const t = useTranslations('BusinessCalendar');
    const locale = useLocale();
    const dateLocale = locale === 'pl' ? pl : enUS;
    const [searchTerm, setSearchTerm] = useState('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [isAddingService, setIsAddingService] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [hoveredServiceIdx, setHoveredServiceIdx] = useState(null);
    const [editingServiceIdx, setEditingServiceIdx] = useState(null);
    const [editingForm, setEditingForm] = useState(null);
    
    // Dropdown states for Edit View
    const [isEditingEmployeeDropdownOpen, setIsEditingEmployeeDropdownOpen] = useState(false);
    const [isEditingServiceDropdownOpen, setIsEditingServiceDropdownOpen] = useState(false);
    const [isEditingDurationDropdownOpen, setIsEditingDurationDropdownOpen] = useState(null);
    const [isEditingStartTimeDropdownOpen, setIsEditingStartTimeDropdownOpen] = useState(null);
    
    // Time generators
    const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];
    
    // Generate time slots from business working hours
    const getTimeSlots = () => {
        const slots = [];
        let startHour = 8;
        let startMinute = 0;
        let endHour = 20;
        let endMinute = 0;

        if (business?.workingHours && draftVisit?.date) {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = days[new Date(draftVisit.date).getDay()];
            const daySchedule = business.workingHours[dayName];
            
            if (daySchedule && !daySchedule.closed && daySchedule.open && daySchedule.close) {
                const [oh, om] = daySchedule.open.split(':').map(Number);
                const [ch, cm] = daySchedule.close.split(':').map(Number);
                startHour = oh;
                startMinute = om;
                endHour = ch;
                endMinute = cm;
            }
        }

        let d = new Date();
        d.setHours(startHour, startMinute, 0, 0);
        
        // Calculate occupied time intervals for the selected employee
        const draftDateStr = draftVisit?.date ? format(draftVisit.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const selectedEmployeeId = (editingServiceIdx !== null ? editingForm?.employeeId : draftVisit?.employeeId) || employees[0]?._id;
        
        // Calculate the total duration of the service (to check if the entire slot fits)
        const currentServiceDuration = editingServiceIdx !== null 
            ? (editingForm?.duration || 30)
            : (draftVisit?.services?.reduce((acc, s) => acc + (s.duration || 30), 0) || 30);

        const occupiedIntervals = (reservations || [])
            .filter(res => {
                if (res.status === 'cancelled') return false;
                if (res.employeeId !== selectedEmployeeId) return false;
                if (draftVisit?._id && res._id === draftVisit._id) return false; // Skipping the currently edited reservation
                
                const resDateStr = res.date ? format(new Date(res.date), 'yyyy-MM-dd') : '';
                return resDateStr === draftDateStr;
            })
            .map(res => {
                const [h, m] = res.time.split(':').map(Number);
                const startMins = h * 60 + m;
                const endMins = startMins + (res.duration || 60);
                return { start: startMins, end: endMins };
            });
        
        while (d.getHours() < endHour || (d.getHours() === endHour && d.getMinutes() <= endMinute)) {
             const slotStartMins = d.getHours() * 60 + d.getMinutes();
             const slotEndMins = slotStartMins + currentServiceDuration;

             const hasOverlap = occupiedIntervals.some(interval => {
                 return slotStartMins < interval.end && slotEndMins > interval.start;
             });

             if (!hasOverlap) {
                 slots.push(format(d, 'HH:mm'));
             }
             d.setMinutes(d.getMinutes() + 15);
        }
        return slots;
    };
    const timeSlots = getTimeSlots();

    if (!isOpen) return null;

    const selectedEmployeeId = (editingServiceIdx !== null ? editingForm?.employeeId : draftVisit?.employeeId) || employees[0]?._id;
    const selectedEmployee = employees.find(e => e._id === selectedEmployeeId) || employees[0];

    // Filter clients based on search
    const filteredClients = clients.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        return fullName.includes(clientSearchTerm.toLowerCase()) || 
               (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
               (client.phone && client.phone.includes(clientSearchTerm));
    });

    // Filter services based on search
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group services by category
    const servicesByCategory = filteredServices.reduce((acc, service) => {
        // Handle both object and string formats
        const categoryName = typeof service.category === 'object' && service.category?.name 
            ? service.category.name 
            : service.category || t('otherCategory');
            
        if (!acc[categoryName]) {
            acc[categoryName] = {
                color: (() => {
                    // First try service.category if it's an object with color
                    if (typeof service.category === 'object' && service.category?.color) {
                        return service.category.color;
                    }
                    // Then look up from the categories prop (from API)
                    const matched = categories.find(c => c.name === categoryName);
                    if (matched?.color) return matched.color;
                    // Fallback to hash-based color
                    return getFallbackColor(categoryName);
                })(),
                items: []
            };
        }
        acc[categoryName].items.push(service);
        return acc;
    }, {});

    return (
        <div className="fixed inset-y-0 right-0 h-full flex bg-transparent z-[100] animate-in slide-in-from-right duration-300">
            {/* Floating Buttons on the left of the panel */}
            <div className="relative h-full flex items-start -ml-16 pt-6 pr-4 pointer-events-none">
                <div className="flex flex-col gap-3 pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                    <button className="w-12 h-12 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors">
                        <Expand size={16} strokeWidth={1.5} className="rotate-45" />
                    </button>
                    <button className="w-12 h-12 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors">
                        <Crosshair size={18} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Sidebar Content Wrapper */}
            <div className="h-full flex bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.08)] overflow-hidden">
                
                {/* Left Column - Client Selection */}
                <div className="w-[300px] border-r border-gray-100 bg-white flex flex-col h-full shrink-0">
                    <div className="p-6 pb-4 border-b border-gray-100">
                        <h2 className="text-[20px] font-bold text-gray-900 mb-4 drop-shadow-sm tracking-tight">{t('chooseClient')}</h2>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={t('searchClientPlaceholder')}
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-shadow placeholder:text-gray-400 text-[14px]"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto w-full p-4 space-y-2">
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100 mb-1">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <Plus size={20} strokeWidth={2} />
                            </div>
                            <span className="font-bold text-gray-900 text-[14px]">{t('addNewClient')}</span>
                        </div>

                        <div onClick={() => setDraftVisit(prev => ({ ...prev, client: null }))} className={`flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border ${!draftVisit?.client ? 'border-indigo-200 bg-indigo-50/50' : 'border-transparent hover:border-gray-100'} mb-4`}>
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                <PersonStanding size={22} strokeWidth={1.5} />
                            </div>
                            <span className="font-bold text-gray-900 text-[14px]">{t('noReservation')}</span>
                        </div>

                        <div className="border-b border-gray-100 mt-2 mb-4"></div>

                        {/* REAL CLIENTS */}
                        {filteredClients.map(client => (
                            <div 
                                key={client.id || client._id} 
                                onClick={() => setDraftVisit(prev => ({ ...prev, client }))}
                                className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border ${draftVisit?.client?.id === (client.id || client._id) ? 'border-purple-200 bg-purple-50/50' : 'border-transparent hover:border-gray-100'} group`}
                            >
                                <div className="flex items-center gap-4 truncate">
                                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[18px] shrink-0">
                                        {client.avatar || `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="font-bold text-gray-900 text-[14px] leading-tight truncate">{client.firstName} {client.lastName}</span>
                                        <span className="text-gray-500 text-[13px] truncate">{client.email || client.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {clientSearchTerm && filteredClients.length === 0 && (
                            <div className="text-center py-6 text-gray-500 text-[13px]">
                                {t('noSearchResults')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Service Selection */}
                <div className="w-[420px] bg-white flex flex-col h-full shrink-0">
                    {editingServiceIdx !== null ? (
                        <>
                            <div className="p-8 pb-4 border-b border-gray-100">
                                <button 
                                    onClick={() => setEditingServiceIdx(null)}
                                    className="flex items-center gap-2 text-gray-700 font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-[14px] w-max mb-6"
                                >
                                    <ArrowLeft size={16} />
                                    {t('goBack')}
                                </button>
                                <h2 className="text-[28px] font-bold text-gray-900 drop-shadow-sm tracking-tight">
                                    {t('editService')}
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto w-full px-8 py-6 space-y-6">
                                {/* Service summary box */}
                                <div className="relative">
                                    <div 
                                        className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsEditingServiceDropdownOpen(!isEditingServiceDropdownOpen)}
                                    >
                                        <span className="text-gray-900 font-medium text-[15px]">{editingForm?.name}, {formatDuration(editingForm?.duration, t)}</span>
                                        <ChevronRight size={18} className={`text-gray-500 transition-transform ${isEditingServiceDropdownOpen ? 'rotate-90' : ''}`} />
                                    </div>
                                    
                                    {isEditingServiceDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                            <div className="max-h-[300px] overflow-y-auto p-2">
                                                {services.map(srv => {
                                                    const isSelected = editingForm?._id === srv._id || editingForm?.name === srv.name;
                                                    return (
                                                        <div 
                                                            key={srv._id || srv.name}
                                                            className={`flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : ''}`}
                                                            onClick={() => {
                                                                setEditingForm(prev => ({ 
                                                                    ...prev, 
                                                                    _id: srv._id,
                                                                    name: srv.name, 
                                                                    duration: srv.duration, 
                                                                    price: srv.price 
                                                                }));
                                                                setIsEditingServiceDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className={`text-[14px] font-medium leading-tight ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>{srv.name}</span>
                                                                <span className="text-[13px] text-gray-500 mt-0.5">{formatDuration(srv.duration, t)}</span>
                                                            </div>
                                                            <span className={`text-[14px] font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>{srv.price} zł</span>
                                                        </div>
                                                    );
                                                })}
                                                {services.length === 0 && (
                                                    <div className="p-4 text-center text-sm text-gray-500">{t('noServicesAvailable')}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Employee dropdown */}
                                <div className="relative">
                                    <label className="block text-[14px] font-semibold text-gray-900 mb-2">{t('employee')}</label>
                                    <div className="flex gap-2">
                                        <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                            <Heart size={20} className="text-gray-600" />
                                        </button>
                                        <div 
                                            className="flex-1 border border-gray-200 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsEditingEmployeeDropdownOpen(!isEditingEmployeeDropdownOpen)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0">
                                                    {selectedEmployee ? (selectedEmployee.name ? selectedEmployee.name.substring(0, 2) : 'AA') : 'AA'}
                                                </div>
                                                <span className="text-gray-900 font-medium text-[14px] truncate">{selectedEmployee ? (selectedEmployee.name || t('unknownEmployee')) : t('noEmployee')}</span>
                                            </div>
                                            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isEditingEmployeeDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    
                                    {isEditingEmployeeDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                            <div className="max-h-[200px] overflow-y-auto p-2">
                                                {employees.map(emp => (
                                                    <div 
                                                        key={emp._id}
                                                        className={`flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${editingForm?.employeeId === emp._id ? 'bg-purple-50 text-purple-700' : 'text-gray-900'}`}
                                                        onClick={() => {
                                                            setEditingForm(prev => ({ ...prev, employeeId: emp._id }));
                                                            setIsEditingEmployeeDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0">
                                                            {emp.name ? emp.name.substring(0, 2) : 'AA'}
                                                        </div>
                                                        <span className="font-medium text-[14px] truncate">{emp.name || t('unknownEmployee')}</span>
                                                    </div>
                                                ))}
                                                {employees.length === 0 && (
                                                    <div className="p-4 text-center text-sm text-gray-500">{t('noEmployeesInDb')}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Price & Discount */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-[14px] font-semibold text-gray-900 mb-2">{t('servicePrice')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-[14px]">PLN</span>
                                            <input 
                                                type="number" 
                                                className="w-full border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 font-medium text-[14px] focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-shadow"
                                                value={editingForm?.price || 0}
                                                onChange={(e) => setEditingForm({...editingForm, price: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[14px] font-semibold text-gray-900 mb-2">{t('discount')}</label>
                                        <div className="border border-gray-200 rounded-xl py-3 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="text-gray-900 font-medium text-[14px]">{t('noDiscount')}</span>
                                            <ChevronDown size={18} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Start Time & Duration Segments */}
                                <div className="space-y-4">
                                    {editingForm?.segments?.map((seg, segIdx) => (
                                        <div key={segIdx} className="flex gap-4 relative">
                                            <div className="flex-1 relative">
                                                <label className="block text-[14px] font-semibold text-gray-900 mb-2">{t('startTime')}</label>
                                                <div 
                                                    className="border border-gray-200 rounded-xl py-3 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsEditingStartTimeDropdownOpen(isEditingStartTimeDropdownOpen === segIdx ? null : segIdx)}
                                                >
                                                    <span className="text-gray-900 font-medium text-[14px]">
                                                        {seg.customStartTime || format((() => {
                                                            let d = new Date(draftVisit.date);
                                                            const prevDur = draftVisit.services.slice(0, editingServiceIdx).reduce((acc, s) => acc + s.duration, 0);
                                                            const myPrevSegDur = editingForm.segments.slice(0, segIdx).reduce((acc, s) => acc + s.duration, 0);
                                                            d.setMinutes(d.getMinutes() + prevDur + myPrevSegDur);
                                                            return d;
                                                        })(), 'HH:mm')}
                                                    </span>
                                                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isEditingStartTimeDropdownOpen === segIdx ? 'rotate-180' : ''}`} />
                                                </div>
                                                
                                                {isEditingStartTimeDropdownOpen === segIdx && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                                        <div className="max-h-[200px] overflow-y-auto p-2">
                                                            {timeSlots.map(time => (
                                                                <div 
                                                                    key={time}
                                                                    className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-900 font-medium text-[14px] text-center"
                                                                    onClick={() => {
                                                                        setEditingForm(prev => {
                                                                            const newSegs = [...prev.segments];
                                                                            newSegs[segIdx].customStartTime = time;
                                                                            return { ...prev, segments: newSegs };
                                                                        });
                                                                        setIsEditingStartTimeDropdownOpen(null);
                                                                    }}
                                                                >
                                                                    {time}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 relative">
                                                <label className="block text-[14px] font-semibold text-gray-900 mb-2">{t('duration')}</label>
                                                <div 
                                                    className="border border-gray-200 rounded-xl py-3 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsEditingDurationDropdownOpen(isEditingDurationDropdownOpen === segIdx ? null : segIdx)}
                                                >
                                                    <span className="text-gray-900 font-medium text-[14px]">{formatDuration(seg.duration, t)}</span>
                                                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isEditingDurationDropdownOpen === segIdx ? 'rotate-180' : ''}`} />
                                                </div>
                                                
                                                {isEditingDurationDropdownOpen === segIdx && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                                        <div className="max-h-[200px] overflow-y-auto p-2">
                                                            {durationOptions.map(dur => (
                                                                <div 
                                                                    key={dur}
                                                                    className={`p-2 hover:bg-gray-50 rounded-lg cursor-pointer font-medium text-[14px] ${seg.duration === dur ? 'text-purple-700 bg-purple-50' : 'text-gray-900'}`}
                                                                    onClick={() => {
                                                                        setEditingForm(prev => {
                                                                            const newSegs = [...prev.segments];
                                                                            newSegs[segIdx].duration = dur;
                                                                            return { ...prev, segments: newSegs };
                                                                        });
                                                                        setIsEditingDurationDropdownOpen(null);
                                                                    }}
                                                                >
                                                                    {formatDuration(dur, t)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Remove segment button - simple design on the right */}
                                            {segIdx > 0 && (
                                                <div className="flex flex-col justify-end pb-1.5">
                                                    <button 
                                                        className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 border border-transparent hover:border-red-100"
                                                        title={t('removeTime')}
                                                        onClick={() => setEditingForm(prev => ({
                                                            ...prev,
                                                            segments: prev.segments.filter((_, i) => i !== segIdx)
                                                        }))}
                                                    >
                                                        <X size={20} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    className="flex items-center gap-2 text-gray-700 font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-[14px]"
                                    onClick={() => setEditingForm(prev => ({ 
                                        ...prev, 
                                        segments: [...(prev.segments || []), { duration: 15, customStartTime: null }] 
                                    }))}
                                >
                                    <Plus size={16} />
                                    {t('addTime')}
                                </button>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-gray-900 text-[15px]">{t('total')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 font-medium text-[15px]">{formatDuration(editingForm?.segments?.reduce((acc, s) => acc + s.duration, 0) || 0, t)}</span>
                                        <span className="font-bold text-gray-900 text-[17px]">{editingForm?.price} zł</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        className="w-12 h-12 flex items-center justify-center border border-red-100 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0"
                                        onClick={() => {
                                            const newServices = draftVisit.services.filter((_, i) => i !== editingServiceIdx);
                                            setDraftVisit(prev => ({
                                                ...prev,
                                                services: newServices
                                            }));
                                            setEditingServiceIdx(null);
                                            if (newServices.length === 0) setIsAddingService(true);
                                        }}
                                    >
                                        <Trash2 size={20} className="stroke-[1.5]" />
                                    </button>
                                    <button 
                                        className="flex-1 py-3 bg-[#0a0a0a] rounded-xl font-bold text-white shadow-sm hover:bg-black transition-colors text-[15px]"
                                        onClick={() => {
                                            const newServices = [...draftVisit.services];
                                            const totalDuration = editingForm.segments.reduce((acc, s) => acc + s.duration, 0);
                                            newServices[editingServiceIdx] = {
                                                ...newServices[editingServiceIdx],
                                                price: editingForm.price,
                                                duration: totalDuration,
                                                segments: editingForm.segments,
                                                employeeId: editingForm.employeeId,
                                                customStartTime: editingForm.segments[0].customStartTime
                                            };
                                            
                                            const updatedDraftVisit = {
                                                ...draftVisit,
                                                services: newServices
                                            };

                                            setDraftVisit(updatedDraftVisit);
                                            setEditingServiceIdx(null);
                                            
                                            // Immediate save of changes if editing an existing reservation
                                            if (draftVisit._id && onSave) {
                                                onSave(updatedDraftVisit);
                                            }
                                        }}
                                        disabled={isSaving}
                                    >
                                        {isSaving && draftVisit._id ? t('saving') : t('apply')}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (!draftVisit?.services?.length || isAddingService) ? (
                        <>
                            <div className="p-8 pb-4">
                                <h2 className="text-[28px] font-bold text-gray-900 mb-6 drop-shadow-sm tracking-tight">{t('chooseService')}</h2>
                                
                                <div className="relative group mb-8">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder={t('searchServicePlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-shadow placeholder:text-gray-400 text-[15px]"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto w-full px-8 pb-8">
                                <div className="space-y-8">
                                    {Object.entries(servicesByCategory).map(([categoryName, { color, items }]) => (
                                        <div key={categoryName}>
                                            <div className="flex items-center gap-2 mb-5">
                                                <h3 className="text-lg font-bold text-gray-900">{categoryName}</h3>
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                                    {items.length}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {items.map(service => (
                                                    <div
                                                        key={service._id}
                                                        onClick={() => {
                                                            setDraftVisit(prev => ({
                                                                ...prev,
                                                                services: [...(prev.services || []), service]
                                                            }));
                                                            setIsAddingService(false);
                                                        }}
                                                        className="flex justify-between items-start py-3 cursor-pointer hover:bg-gray-50 pr-4 relative transition-colors group"
                                                    >
                                                        {/* Color bar */}
                                                        <div 
                                                            className="absolute left-0 top-3 bottom-3 w-[4px] rounded-r-md opacity-90 group-hover:opacity-100 transition-opacity" 
                                                            style={{ backgroundColor: color }} 
                                                        />
                                                        
                                                        <div className="pl-[18px] flex flex-col">
                                                            <span className="text-gray-900 text-[15.5px] font-medium leading-snug">{service.name}</span>
                                                            <span className="text-gray-500 text-[13.5px] mt-0.5">{formatDuration(service.duration, t)}</span>
                                                        </div>
                                                        <span className="text-gray-900 text-[15px] font-medium shrink-0 pt-0.5 tracking-tight group-hover:text-purple-700 transition-colors">
                                                            {service.price} zł
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {filteredServices.length === 0 && (
                                        <div className="text-center py-10 text-gray-500">
                                            {t('noMatchingServices')}
                                        </div>
                                    )}
                                    
                                    {services.length === 0 && searchTerm === '' && (
                                        <div className="text-center py-10 text-gray-500 text-[15px]">
                                            {t('noServicesAddInMenu')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-start relative">
                                <div>
                                    <h2 
                                        className="text-[28px] font-bold text-gray-900 drop-shadow-sm tracking-tight lowercase first-letter:uppercase cursor-pointer hover:text-purple-600 transition-colors flex items-center gap-2"
                                        onClick={() => setIsDatePickerOpen(true)}
                                    >
                                        {format(new Date(draftVisit.date), 'EEE. d MMM', { locale: dateLocale }).replace(/\./g, '')}
                                        <ChevronDown size={24} className="text-gray-400 mt-1" />
                                    </h2>
                                    <p className="text-gray-600 text-[14.5px] mt-1 font-medium">
                                        {format(new Date(draftVisit.date), 'HH:mm')} • {t('doesNotRepeat')}
                                    </p>
                                </div>
                                <DatePickerPopover 
                                    isOpen={isDatePickerOpen}
                                    date={new Date(draftVisit.date)}
                                    onClose={() => setIsDatePickerOpen(false)}
                                    onDateSelect={(newDate) => {
                                        // Update the date but keep the original time
                                        const originalDate = new Date(draftVisit.date);
                                        newDate.setHours(originalDate.getHours());
                                        newDate.setMinutes(originalDate.getMinutes());
                                        setDraftVisit(prev => ({ ...prev, date: newDate }));
                                    }}
                                />
                            </div>
                            
                            <div className="flex-1 overflow-y-auto w-full px-8 py-6">
                                <h3 className="text-[17px] font-bold text-gray-900 mb-6">{t('servicesTitle')}</h3>
                                <div className="space-y-5">
                                    {draftVisit.services.map((service, idx) => {
                                        let startTime = new Date(draftVisit.date);
                                        // calculate accumulated duration for this service's start time
                                        const previousDuration = draftVisit.services.slice(0, idx).reduce((acc, s) => acc + s.duration, 0);
                                        startTime.setMinutes(startTime.getMinutes() + previousDuration);

                                        return (
                                            <div 
                                                key={idx} 
                                                className={`flex justify-between items-start py-3 px-4 relative rounded-xl transition-all duration-200 cursor-default
                                                    ${hoveredServiceIdx === idx ? 'bg-gray-50' : 'bg-[#f8fafc]'}
                                                `}
                                                onMouseEnter={() => setHoveredServiceIdx(idx)}
                                                onMouseLeave={() => setHoveredServiceIdx(null)}
                                            >
                                                {/* Blue indicator line on the left */}
                                                <div className="absolute left-1.5 top-2 bottom-2 w-[4px] rounded-full bg-[#bae6fd]" />
                                                
                                                <div className="flex flex-col flex-1 pl-2 pr-4">
                                                    <span className="text-gray-900 text-[15.5px] font-semibold leading-tight">{service.name}</span>
                                                    <div className="flex items-center text-gray-500 text-[13.5px] mt-1.5 font-medium whitespace-nowrap">
                                                        <span>{format(startTime, 'HH:mm')}</span>
                                                        <span className="mx-1.5">•</span>
                                                        <span>{service.duration} {t('minutesShort')}</span>
                                                        <span className="mx-1.5">•</span>
                                                        <span className="truncate max-w-[120px]">
                                                            {employees.find(emp => emp._id === service.employeeId)?.name || selectedEmployee?.name || t('unknownEmployee')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="relative flex items-center justify-end min-w-[70px] h-6 mt-0.5">
                                                    {/* Price - hidden on hover */}
                                                    <span className={`text-gray-900 text-[15px] font-bold tracking-tight transition-all duration-200
                                                        ${hoveredServiceIdx === idx ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                                                    `}>
                                                        {service.price} zł
                                                    </span>

                                                    {/* Action Icons - shown on hover */}
                                                    <div className={`absolute inset-0 flex items-center justify-end gap-3 transition-all duration-200
                                                        ${hoveredServiceIdx === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                                                    `}>
                                                        <button 
                                                            className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                                                            title="Edytuj"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingServiceIdx(idx);
                                                                
                                                                const srv = draftVisit.services[idx];
                                                                setEditingForm({ 
                                                                    ...srv,
                                                                    segments: srv.segments || [{ duration: srv.duration, customStartTime: srv.customStartTime }] 
                                                                });
                                                            }}
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button 
                                                            className="text-gray-600 hover:text-red-600 transition-colors p-1"
                                                            title="Usuń"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newServices = draftVisit.services.filter((_, i) => i !== idx);
                                                                setDraftVisit(prev => ({
                                                                    ...prev,
                                                                    services: newServices
                                                                }));
                                                                if (newServices.length === 0) {
                                                                    setIsAddingService(true);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    <button 
                                        onClick={() => setIsAddingService(true)}
                                        className="mt-6 flex items-center gap-2 text-gray-700 font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-[14px]"
                                    >
                                        <Plus size={16} />
                                        {t('chooseService')}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-gray-900 text-[15px]">{t('total')}</span>
                                    <span className="font-bold text-gray-900 text-[17px]">
                                        {draftVisit.services.reduce((sum, s) => sum + s.price, 0)} zł
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                                        {t('pay')}
                                    </button>
                                    <button 
                                        className="flex-1 py-3 bg-gray-900 rounded-xl font-bold text-white shadow-sm hover:bg-gray-800 transition-colors text-[15px] disabled:opacity-70"
                                        onClick={() => onSave && onSave()}
                                        disabled={isSaving}
                                    >
                                        {isSaving && !draftVisit._id ? t('saving') : t('save')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

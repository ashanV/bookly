import React, { useState } from 'react';
import { X, Calendar, User, Clock, Check, CalendarCheck, MapPin, Play, UserX, Trash2 } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { pl, enUS } from 'date-fns/locale';

export const STATUS_OPTIONS = [
    { value: 'confirmed', label: 'Zarezerwowana', icon: CalendarCheck, color: 'text-blue-600', bgColor: 'bg-blue-600', borderColor: 'border-blue-600', hoverBg: 'hover:bg-blue-50' },
    { value: 'completed', label: 'Zakończona', icon: Check, color: 'text-green-600', bgColor: 'bg-green-600', borderColor: 'border-green-600', hoverBg: 'hover:bg-green-50' },
    { value: 'arrived', label: 'Klient pojawił się', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-600', borderColor: 'border-purple-600', hoverBg: 'hover:bg-purple-50' },
    { value: 'started', label: 'Rozpoczęta', icon: Play, color: 'text-indigo-600', bgColor: 'bg-indigo-600', borderColor: 'border-indigo-600', hoverBg: 'hover:bg-indigo-50' },
    { value: 'no_show', label: 'Nieobecność', icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500', borderColor: 'border-red-500', hoverBg: 'hover:bg-red-50' },
    { value: 'cancelled', label: 'Anulowana', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-600', borderColor: 'border-red-600', hoverBg: 'hover:bg-red-50' },
];

export default function ReservationDetailsSidebar({
    isOpen,
    onClose,
    reservation,
    employeeInfo,
    onStatusChange
}) {
    const t = useTranslations('BusinessCalendar');
    const locale = useLocale();
    const dateLocale = locale === 'pl' ? pl : enUS;
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    if (!isOpen || !reservation) return null;

    const startDateTime = new Date(reservation.date);
    const [hours, minutes] = reservation.time.split(':');
    startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    const endDateTime = addMinutes(startDateTime, reservation.duration || 60);

    const currentStatusOption = STATUS_OPTIONS.find(op => op.value === reservation.status) || STATUS_OPTIONS[0];

    const getStatusKey = (val) => {
        if (val === 'no_show') return 'statusNoShow';
        return `status${val.charAt(0).toUpperCase() + val.slice(1)}`;
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-[400px] bg-white shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-in-out z-[100] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header / StatusBar */}
            <div className={`${currentStatusOption.bgColor} text-white p-6 relative`}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <h2 className="text-2xl font-bold mb-1">
                    {format(startDateTime, 'EEE, d MMM', { locale: dateLocale })}
                </h2>
                <div className="text-white/90 text-sm mb-6 flex items-center gap-1.5">
                    <span>{reservation.time}</span>
                    <span>•</span>
                    <span>{reservation.duration} min</span>
                </div>

                {/* Status Dropdown Trigger */}
                <div className="relative">
                    <button 
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded text-sm font-medium border border-white/20 w-fit"
                    >
                        {t(getStatusKey(currentStatusOption.value))} <span className="ml-1 opacity-70">▼</span>
                    </button>

                    {/* Status Dropdown Menu */}
                    {isStatusDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-100 text-gray-800">
                                {STATUS_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            onStatusChange(reservation._id, option.value);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 ${option.hoverBg} transition-colors
                                            ${reservation.status === option.value ? 'bg-gray-50 font-medium' : ''}
                                            ${option.value === 'no_show' || option.value === 'cancelled' ? 'text-red-600 hover:text-red-700' : 'text-gray-700'}
                                        `}
                                    >
                                        <option.icon size={16} className={option.value === 'no_show' || option.value === 'cancelled' ? 'text-red-500' : 'text-gray-400'} />
                                        <span className="flex-1">{t(getStatusKey(option.value))}</span>
                                        {reservation.status === option.value && <Check size={16} className={option.color} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                {/* Client Section */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{reservation.clientName || t('noReservation')}</h3>
                        {reservation.clientEmail && <p className="text-gray-500 text-sm mt-0.5">{reservation.clientEmail}</p>}
                        {reservation.clientPhone && <p className="text-gray-500 text-sm mt-0.5">{reservation.clientPhone}</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Services Section */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 px-1">{t('servicesTitle')}</h4>
                    <div className="flex gap-4">
                        <div className="w-1 bg-blue-500 rounded-full my-1"></div>
                        <div className="flex-1">
                            <h5 className="font-medium text-gray-800">{reservation.service}</h5>
                            <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                <span>{reservation.time}</span>
                                <span>•</span>
                                <span>{reservation.duration} {t('minutesShort')}</span>
                                <span>•</span>
                                <span>{employeeInfo?.name || t('noEmployee')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="font-medium text-gray-900">{t('total')}</span>
                <span className="font-semibold text-lg text-gray-900">{reservation.price ? `${reservation.price} zł` : t('noPricing')}</span>
            </div>
            
            {/* Payment / Check out button area (placeholder matching screenshot) */}
            <div className="px-6 pb-6 pt-2 flex gap-3 bg-gray-50/50">
                <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <span className="font-bold flex leading-none mb-1 text-xl">⋮</span>
                </button>
                <button className="flex-1 bg-white border border-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    {t('payNow')} <Calendar size={16} />
                </button>
                <button className="flex-1 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors">
                    {t('pay')}
                </button>
            </div>
        </div>
    );
}

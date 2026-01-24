"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User, ChevronDown, ChevronLeft, ChevronRight, Edit2, Loader2, Calendar, X, Plus, MapPin, Check, Home, Briefcase, MoreHorizontal, MoreVertical } from 'lucide-react';
import ReferralClientModal from '@/components/dashboard/clients/ReferralClientModal';
import LanguageSelectionModal from '@/components/dashboard/clients/LanguageSelectionModal';
import AddressModal from '@/components/dashboard/clients/AddressModal';
import ConfirmDeleteModal from '@/components/dashboard/clients/ConfirmDeleteModal';

// Polish month names
const MONTHS_PL = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const DAYS_PL = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'];

// Date Picker Component
function DatePicker({ value, onChange, placeholder = "Dzień i miesiąc" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const containerRef = useRef(null);

    // Parse value to date parts
    const parseValue = (val) => {
        if (!val) return { day: null, month: null };
        const parts = val.split(' ');
        if (parts.length === 2) {
            const day = parseInt(parts[0]);
            const monthIndex = MONTHS_PL.findIndex(m =>
                m.toLowerCase().startsWith(parts[1].toLowerCase())
            );
            return { day, month: monthIndex >= 0 ? monthIndex : null };
        }
        return { day: null, month: null };
    };

    const selectedParts = parseValue(value);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday, but we want Monday = 0)
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday = 0
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Generate calendar days
    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const handleDayClick = (day) => {
        if (day) {
            const formatted = `${day} ${MONTHS_PL[month]}`;
            onChange(formatted);
            setIsOpen(false);
        }
    };

    const navigateMonth = (direction) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const isSelected = (day) => {
        return selectedParts.day === day && selectedParts.month === month;
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all cursor-pointer flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? 'text-slate-900' : 'text-slate-400'}>
                    {value || placeholder}
                </span>
                <Calendar size={18} className="text-slate-400" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-80">
                    {/* Header with navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="font-semibold text-slate-900">
                            {MONTHS_PL[month]}
                        </span>
                        <button
                            type="button"
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS_PL.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => (
                            <div key={i} className="aspect-square">
                                {day && (
                                    <button
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        className={`w-full h-full flex items-center justify-center rounded-full text-sm font-medium transition-colors
                                            ${isSelected(day)
                                                ? 'bg-slate-900 text-white'
                                                : isToday(day)
                                                    ? 'border border-slate-300 text-slate-900 hover:bg-slate-100'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AddClientPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth('/business/auth');
    const [activeSection, setActiveSection] = useState('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedReferralClient, setSelectedReferralClient] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressToDeleteIndex, setAddressToDeleteIndex] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        phonePrefix: '+48',
        birthDate: '',
        birthYear: '',
        gender: '',
        pronouns: '',
        referralSource: 'Bez rezerwacji',
        referredBy: '',
        preferredLanguage: '',
        occupation: '',
        country: '',
        additionalEmail: '',
        additionalPhone: '',
        additionalPhonePrefix: '+48',
        addresses: [],
        emergencyContacts: {
            main: { name: '', relationship: '', email: '', phone: '', phonePrefix: '+48', type: 'main' },
            secondary: { name: '', relationship: '', email: '', phone: '', phonePrefix: '+48', type: 'secondary' }
        },
        consent: {
            notifications: { email: true, sms: true, whatsapp: true },
            marketing: { email: false, sms: false, whatsapp: false }
        },
        tags: [],
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error when user changes input
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (value) => {
        setFormData(prev => ({ ...prev, birthDate: value }));
    };

    const handleReferralClientSelect = (client) => {
        setSelectedReferralClient(client);
        setFormData(prev => ({
            ...prev,
            referredBy: `${client.firstName} ${client.lastName}`,
            referredById: client.id
        }));
    };

    const handleClearReferralClient = () => {
        setSelectedReferralClient(null);
        setFormData(prev => ({
            ...prev,
            referredBy: '',
            referredById: ''
        }));
    };

    const handleLanguageSelect = (language) => {
        setFormData(prev => ({ ...prev, preferredLanguage: language }));
    };

    const handleEmergencyContactChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            emergencyContacts: {
                ...prev.emergencyContacts,
                [type]: {
                    ...prev.emergencyContacts[type],
                    [field]: value
                }
            }
        }));
    };

    const handleConsentChange = (category, type) => {
        setFormData(prev => ({
            ...prev,
            consent: {
                ...prev.consent,
                [category]: {
                    ...prev.consent[category],
                    [type]: !prev.consent[category][type]
                }
            }
        }));
    };

    const handleAddressSave = (address) => {
        if (editingAddressIndex !== null) {
            setFormData(prev => {
                const newAddresses = [...prev.addresses];
                newAddresses[editingAddressIndex] = address;
                return { ...prev, addresses: newAddresses };
            });
            setEditingAddressIndex(null);
        } else {
            setFormData(prev => ({
                ...prev,
                addresses: [...prev.addresses, address]
            }));
        }
        setIsAddressModalOpen(false);
    };

    const handleDeleteAddress = (index) => {
        setAddressToDeleteIndex(index);
        setIsDeleteModalOpen(true);
        setActiveDropdown(null);
    };

    const handleConfirmDeleteAddress = () => {
        if (addressToDeleteIndex !== null) {
            setFormData(prev => ({
                ...prev,
                addresses: prev.addresses.filter((_, i) => i !== addressToDeleteIndex)
            }));
        }
        setIsDeleteModalOpen(false);
        setAddressToDeleteIndex(null);
    };

    const handleEditAddress = (index) => {
        setEditingAddressIndex(index);
        setIsAddressModalOpen(true);
        setActiveDropdown(null);
    };

    const handleNavigation = (id) => {
        setActiveSection(id);
    };

    const validateEmail = (email) => {
        if (!email) return true;
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        if (!phone) return true;
        const phoneRegex = /^[0-9\s\-\(\)]{6,}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async () => {
        // Clear previous errors
        setError('');
        setValidationErrors({});
        const errors = {};

        // Required fields
        if (!formData.firstName.trim()) {
            errors.firstName = 'Imię jest wymagane';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'Nazwisko jest wymagane';
        }

        // Email validation
        if (formData.email && !validateEmail(formData.email)) {
            errors.email = 'Nieprawidłowy format email';
        }
        if (formData.additionalEmail && !validateEmail(formData.additionalEmail)) {
            errors.additionalEmail = 'Nieprawidłowy format email';
        }

        // Phone validation
        if (formData.phone && !validatePhone(formData.phone)) {
            errors.phone = 'Nieprawidłowy format telefonu';
        }
        if (formData.additionalPhone && !validatePhone(formData.additionalPhone)) {
            errors.additionalPhone = 'Nieprawidłowy format telefonu';
        }

        // Check if main email equals additional email
        if (formData.email && formData.additionalEmail &&
            formData.email.trim().toLowerCase() === formData.additionalEmail.trim().toLowerCase()) {
            errors.additionalEmail = 'Dodatkowy email nie może być taki sam jak główny';
        }

        // Check if main phone equals additional phone
        if (formData.phone && formData.additionalPhone) {
            const mainPhone = formData.phone.replace(/\s/g, '');
            const additionalPhone = formData.additionalPhone.replace(/\s/g, '');
            if (mainPhone === additionalPhone && formData.phonePrefix === formData.additionalPhonePrefix) {
                errors.additionalPhone = 'Dodatkowy telefon nie może być taki sam jak główny';
            }
        }

        // Validate Emergency Contacts Duplicates
        const { main, secondary } = formData.emergencyContacts;
        if (main.name || secondary.name) { // Check only if at least one is being added, or better if both exist
            if (main.email && secondary.email && main.email.trim().toLowerCase() === secondary.email.trim().toLowerCase()) {
                // We add it to a specific key or generic
                errors.emergencyDuplicate = 'E-mail kontaktów alarmowych nie może być taki sam';
            }
            if (main.phone && secondary.phone) {
                const mainP = main.phone.replace(/\s/g, '');
                const secP = secondary.phone.replace(/\s/g, '');
                if (mainP === secP && main.phonePrefix === secondary.phonePrefix) {
                    errors.emergencyDuplicate = 'Telefon kontaktów alarmowych nie może być taki sam';
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError('Popraw błędy w formularzu');
            return;
        }

        setIsSubmitting(true);

        try {
            // Transform emergency contacts object to array and filter out empty ones
            const emergencyContactsArray = [
                formData.emergencyContacts.main,
                formData.emergencyContacts.secondary
            ].filter(contact => contact.name || contact.phone || contact.email);

            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    businessId: user?.id,
                    ...formData,
                    emergencyContacts: emergencyContactsArray
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/business/dashboard/clients');
            } else {
                setError(data.error || 'Wystąpił błąd podczas dodawania klienta');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold text-slate-900">Dodaj nowego klienta</h1>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/business/dashboard/clients"
                                className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-full font-medium transition-colors border border-slate-300"
                            >
                                Zamknij
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-black text-white rounded-full hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                Zapisz
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-64 flex-shrink-0 hidden md:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-2 px-2">Profil osobisty</h3>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => handleNavigation('profile')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'profile' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Profil
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('addresses')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'addresses' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Adresy
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('emergency')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'emergency' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Kontakty alarmowe
                                    </button>
                                </nav>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleNavigation('settings')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'settings' ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Ustawienia
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 space-y-12 pb-24">

                        {activeSection === 'profile' && (
                            <>
                                {/* Profile Section */}
                                <section id="profile" className="scroll-mt-24">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Profil</h2>
                                    <p className="text-slate-500 mb-8">Zarządzaj profilem osobistym klienta</p>

                                    <div className="mb-8">
                                        <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-2 relative group cursor-pointer">
                                            <User size={40} />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm text-slate-500 hover:text-violet-600">
                                                <Edit2 size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Imię *</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="np. Jan"
                                                className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 ${validationErrors.firstName ? 'border-red-400' : 'border-slate-300'}`}
                                            />
                                            {validationErrors.firstName && (
                                                <p className="mt-1 text-xs text-red-500">{validationErrors.firstName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Nazwisko *</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="np. Markowska"
                                                className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 ${validationErrors.lastName ? 'border-red-400' : 'border-slate-300'}`}
                                            />
                                            {validationErrors.lastName && (
                                                <p className="mt-1 text-xs text-red-500">{validationErrors.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">E-mail</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="przyklad@domena.com"
                                                className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 ${validationErrors.email ? 'border-red-400' : 'border-slate-300'}`}
                                            />
                                            {validationErrors.email && (
                                                <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Telefon</label>
                                            <div className="flex gap-3">
                                                <div className="relative w-24 flex-shrink-0">
                                                    <select
                                                        name="phonePrefix"
                                                        value={formData.phonePrefix}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900"
                                                    >
                                                        <option>+48</option>
                                                        <option>+1</option>
                                                        <option>+44</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="np. 123 456 789"
                                                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 ${validationErrors.phone ? 'border-red-400' : 'border-slate-300'}`}
                                                />
                                            </div>
                                            {validationErrors.phone && (
                                                <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-slate-900 mb-2">Data urodzenia</label>
                                                <DatePicker
                                                    value={formData.birthDate}
                                                    onChange={handleDateChange}
                                                    placeholder="Dzień i miesiąc"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-sm font-bold text-slate-900 mb-2">Rok</label>
                                                <input
                                                    type="text"
                                                    name="birthYear"
                                                    value={formData.birthYear}
                                                    onChange={handleInputChange}
                                                    placeholder="Rok"
                                                    maxLength={4}
                                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Płeć</label>
                                            <div className="relative">
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-slate-500"
                                                >
                                                    <option value="">Wybierz opcję</option>
                                                    <option value="Kobieta">Kobieta</option>
                                                    <option value="Mężczyzna">Mężczyzna</option>
                                                    <option value="Inna">Inna</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Zaimki</label>
                                            <div className="relative">
                                                <select
                                                    name="pronouns"
                                                    value={formData.pronouns}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-slate-500"
                                                >
                                                    <option value="">Wybierz opcję</option>
                                                    <option value="Ona/Jej">Ona/Jej</option>
                                                    <option value="On/Jego">On/Jego</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="border-t border-slate-200" />

                                {/* Informacje dodatkowe Section */}
                                <section className="scroll-mt-24">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Informacje dodatkowe</h2>
                                    <p className="text-slate-500 mb-8">Zarządzaj danymi klienta.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Źródło polecenia</label>
                                            <div className="relative mb-2">
                                                <select
                                                    name="referralSource"
                                                    value={formData.referralSource}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900"
                                                >
                                                    <option>Bez rezerwacji</option>
                                                    <option>Instagram</option>
                                                    <option>Google</option>
                                                    <option>Polecenie znajomego</option>
                                                    <option>Inne</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-slate-500">Podaj, w jaki sposób ten klient znalazł Twoją firmę. <span className="text-violet-600 cursor-pointer">Dowiedz się więcej</span></p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Polecony przez</label>
                                            <div className="flex gap-2">
                                                <div
                                                    className="relative flex-1 cursor-pointer"
                                                    onClick={() => setIsReferralModalOpen(true)}
                                                >
                                                    {selectedReferralClient ? (
                                                        <>
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-semibold">
                                                                {selectedReferralClient.firstName?.charAt(0)}{selectedReferralClient.lastName?.charAt(0)}
                                                            </div>
                                                            <div className="w-full pl-11 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-slate-900">
                                                                {selectedReferralClient.firstName} {selectedReferralClient.lastName}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClearReferralClient();
                                                                }}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs">
                                                                <User size={12} />
                                                            </div>
                                                            <div className="w-full pl-11 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-400 hover:border-slate-400 transition-colors">
                                                                Wybierz klienta
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsReferralModalOpen(true)}
                                                    className="px-4 py-2 text-violet-600 font-medium hover:bg-violet-50 rounded-lg transition-colors"
                                                >
                                                    Dodaj
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">Wybierz, kto polecił tego klienta Twojej firmie. <span className="text-violet-600 cursor-pointer">Dowiedz się więcej</span></p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2 flex justify-between">
                                                Preferowany język
                                            </label>
                                            <div
                                                className="relative mb-2 cursor-pointer"
                                                onClick={() => setIsLanguageModalOpen(true)}
                                            >
                                                <div className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none transition-all ${formData.preferredLanguage ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {formData.preferredLanguage || "Wybierz język"}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsLanguageModalOpen(true);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-600 font-medium hover:text-violet-700 transition-colors"
                                                >
                                                    Zmień
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500">Ustaw język automatycznych powiadomień klientów. <br /> <span className="text-violet-600 cursor-pointer">Dowiedz się więcej</span></p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2 flex justify-between">
                                                Zawód
                                                <span className="text-slate-400 font-normal">{formData.occupation.length}/255</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="occupation"
                                                value={formData.occupation}
                                                onChange={handleInputChange}
                                                maxLength={255}
                                                placeholder="Wpisz informacje o zawodzie klienta"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Kraj</label>
                                            <div className="relative">
                                                <select
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-slate-500"
                                                >
                                                    <option value="">Wybierz kraj</option>
                                                    <option value="Polska">Polska</option>
                                                    <option value="USA">USA</option>
                                                    <option value="Niemcy">Niemcy</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Dodatkowy adres e-mail</label>
                                            <input
                                                type="email"
                                                name="additionalEmail"
                                                value={formData.additionalEmail}
                                                onChange={handleInputChange}
                                                placeholder="przyklad+1@domena.com"
                                                className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 ${validationErrors.additionalEmail ? 'border-red-400' : 'border-slate-300'}`}
                                            />
                                            {validationErrors.additionalEmail && (
                                                <p className="mt-1 text-xs text-red-500">{validationErrors.additionalEmail}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Dodatkowy telefon</label>
                                            <div className="flex gap-3">
                                                <div className="relative w-24 flex-shrink-0">
                                                    <select
                                                        name="additionalPhonePrefix"
                                                        value={formData.additionalPhonePrefix}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900"
                                                    >
                                                        <option>+48</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="additionalPhone"
                                                    value={formData.additionalPhone}
                                                    onChange={handleInputChange}
                                                    placeholder="np. 123 456 789"
                                                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 ${validationErrors.additionalPhone ? 'border-red-400' : 'border-slate-300'}`}
                                                />
                                            </div>
                                            {validationErrors.additionalPhone && (
                                                <p className="mt-1 text-xs text-red-500">{validationErrors.additionalPhone}</p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <div className="border-t border-slate-200" />

                            </>
                        )}

                        {activeSection === 'addresses' && (
                            /* Addresses Section */
                            <section id="addresses" className="scroll-mt-24">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Adresy</h2>
                                <p className="text-slate-500 mb-8">Zarządzaj adresami klienta</p>

                                {formData.addresses.length > 0 ? (
                                    <div className="space-y-4 mb-6">
                                        {formData.addresses.map((addr, index) => (
                                            <div key={index} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl relative">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white flex flex-shrink-0 items-center justify-center text-slate-900 shadow-sm mt-1">
                                                        {addr.type === 'Dom' && <Home size={18} strokeWidth={2} />}
                                                        {addr.type === 'Praca' && <Briefcase size={18} strokeWidth={2} />}
                                                        {addr.type === 'Inny' && <MoreHorizontal size={18} strokeWidth={2} />}
                                                        {!['Dom', 'Praca', 'Inny'].includes(addr.type) && <MapPin size={18} strokeWidth={2} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 mb-1">{addr.name}</h4>
                                                        <div className="text-sm text-slate-500 space-y-0.5">
                                                            <p>{addr.street} {addr.apartmentNumber}</p>
                                                            <p>{addr.postCode} {addr.city}</p>
                                                            {addr.province && <p>{addr.province}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdown(activeDropdown === index ? null : index);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${activeDropdown === index ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {activeDropdown === index && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setActiveDropdown(null)}
                                                            />
                                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                                                <button
                                                                    onClick={() => handleEditAddress(index)}
                                                                    className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                >
                                                                    Edytuj adres
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAddress(index)}
                                                                    className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    Usuń adres
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full border border-violet-600 flex items-center justify-center">
                                        <Plus size={14} />
                                    </div>
                                    Dodaj nowy adres
                                </button>
                            </section>
                        )}

                        {activeSection === 'emergency' && (
                            <section id="emergency" className="scroll-mt-24">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Kontakty alarmowe</h2>
                                <p className="text-slate-500 mb-8">Zarządzaj kontaktami alarmowymi klienta.</p>

                                {validationErrors.emergencyDuplicate && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                                        {validationErrors.emergencyDuplicate}
                                    </div>
                                )}

                                {/* Main Contact */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-slate-900 mb-4">Główny kontakt</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Imię i nazwisko</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContacts.main.name}
                                                onChange={(e) => handleEmergencyContactChange('main', 'name', e.target.value)}
                                                placeholder="np. Agata Markowska"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Pokrewieństwo</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContacts.main.relationship}
                                                onChange={(e) => handleEmergencyContactChange('main', 'relationship', e.target.value)}
                                                placeholder="np. rodzic"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">E-mail</label>
                                            <input
                                                type="email"
                                                value={formData.emergencyContacts.main.email}
                                                onChange={(e) => handleEmergencyContactChange('main', 'email', e.target.value)}
                                                placeholder="przyklad@domena.com"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Telefon</label>
                                            <div className="flex gap-3">
                                                <div className="relative w-24 flex-shrink-0">
                                                    <select
                                                        value={formData.emergencyContacts.main.phonePrefix}
                                                        onChange={(e) => handleEmergencyContactChange('main', 'phonePrefix', e.target.value)}
                                                        className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900"
                                                    >
                                                        <option>+48</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={formData.emergencyContacts.main.phone}
                                                    onChange={(e) => handleEmergencyContactChange('main', 'phone', e.target.value)}
                                                    placeholder="np. 123 456 789"
                                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 mb-8" />

                                {/* Secondary Contact */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4">Kontakt dodatkowy</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Imię i nazwisko</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContacts.secondary.name}
                                                onChange={(e) => handleEmergencyContactChange('secondary', 'name', e.target.value)}
                                                placeholder="np. Agata Markowska"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Pokrewieństwo</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContacts.secondary.relationship}
                                                onChange={(e) => handleEmergencyContactChange('secondary', 'relationship', e.target.value)}
                                                placeholder="np. rodzic"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">E-mail</label>
                                            <input
                                                type="email"
                                                value={formData.emergencyContacts.secondary.email}
                                                onChange={(e) => handleEmergencyContactChange('secondary', 'email', e.target.value)}
                                                placeholder="przyklad@domena.com"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Telefon</label>
                                            <div className="flex gap-3">
                                                <div className="relative w-24 flex-shrink-0">
                                                    <select
                                                        value={formData.emergencyContacts.secondary.phonePrefix}
                                                        onChange={(e) => handleEmergencyContactChange('secondary', 'phonePrefix', e.target.value)}
                                                        className="w-full px-4 py-2 appearance-none bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium text-slate-900"
                                                    >
                                                        <option>+48</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={formData.emergencyContacts.secondary.phone}
                                                    onChange={(e) => handleEmergencyContactChange('secondary', 'phone', e.target.value)}
                                                    placeholder="np. 123 456 789"
                                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeSection === 'settings' && (
                            <section id="settings" className="scroll-mt-24">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Ustawienia</h2>
                                <p className="text-slate-500 mb-8">Zarządzaj ustawieniami powiadomień i marketingu.</p>

                                {/* Notifications */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-slate-900 mb-2">Powiadomienia o wizytach</h3>
                                    <p className="text-sm text-slate-500 mb-4">Wybierz sposób powiadamiania klienta o spotkaniach</p>
                                    <div className="space-y-3">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => handleConsentChange('notifications', 'email')}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.consent.notifications.email ? 'bg-violet-600 text-white' : 'bg-white border border-slate-300'}`}>
                                                {formData.consent.notifications.email && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-slate-900 group-hover:text-slate-700 transition-colors">Powiadomienia e-mail</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => handleConsentChange('notifications', 'sms')}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.consent.notifications.sms ? 'bg-violet-600 text-white' : 'bg-white border border-slate-300'}`}>
                                                {formData.consent.notifications.sms && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-slate-900 group-hover:text-slate-700 transition-colors">Powiadomienia SMS</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => handleConsentChange('notifications', 'whatsapp')}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.consent.notifications.whatsapp ? 'bg-violet-600 text-white' : 'bg-white border border-slate-300'}`}>
                                                {formData.consent.notifications.whatsapp && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-slate-900 group-hover:text-slate-700 transition-colors">Powiadomienia WhatsApp</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 mb-8" />

                                {/* Marketing */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Wiadomości marketingowe</h3>
                                    <p className="text-sm text-slate-500 mb-4">Zaznacz, jeśli ten klient wyraził zgodę na otrzymywanie powiadomień marketingowych</p>
                                    <div className="space-y-3">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => handleConsentChange('marketing', 'email')}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.consent.marketing.email ? 'bg-violet-600 text-white' : 'bg-white border border-slate-300'}`}>
                                                {formData.consent.marketing.email && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-slate-900 group-hover:text-slate-700 transition-colors">Klient akceptuje wiadomości marketingowe wysyłane e-mailem</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => handleConsentChange('marketing', 'sms')}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.consent.marketing.sms ? 'bg-violet-600 text-white' : 'bg-white border border-slate-300'}`}>
                                                {formData.consent.marketing.sms && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-slate-900 group-hover:text-slate-700 transition-colors">Klient akceptuje powiadomienia marketingowe SMS</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={() => handleConsentChange('marketing', 'whatsapp')}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.consent.marketing.whatsapp ? 'bg-violet-600 text-white' : 'bg-white border border-slate-300'}`}>
                                                {formData.consent.marketing.whatsapp && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-slate-900 group-hover:text-slate-700 transition-colors">Klient wyraża zgodę na otrzymywanie powiadomień marketingowych w aplikacji WhatsApp</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Referral Client Modal */}
            <ReferralClientModal
                isOpen={isReferralModalOpen}
                onClose={() => setIsReferralModalOpen(false)}
                onSelectClient={handleReferralClientSelect}
                businessId={user?.id}
            />

            {/* Language Selection Modal */}
            <LanguageSelectionModal
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
                onSelect={handleLanguageSelect}
                selectedLanguage={formData.preferredLanguage}
            />

            {/* Address Modal */}
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => {
                    setIsAddressModalOpen(false);
                    setEditingAddressIndex(null);
                }}
                onSave={handleAddressSave}
                initialData={editingAddressIndex !== null ? formData.addresses[editingAddressIndex] : null}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setAddressToDeleteIndex(null);
                }}
                onConfirm={handleConfirmDeleteAddress}
                title="Usuń adres"
                message="Czy na pewno chcesz usunąć ten adres? Ta operacja jest nieodwracalna."
                confirmText="Usuń adres"
            />
        </div>
    );
}


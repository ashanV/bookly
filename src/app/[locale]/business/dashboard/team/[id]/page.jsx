"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import { User, ChevronDown, Calendar, PenLine, ArrowLeft } from 'lucide-react';

const SECTIONS = [
    { id: 'profile', label: 'Profil', group: 'Profil osobisty' },
    { id: 'addresses', label: 'Adresy', group: 'Profil osobisty' },
    { id: 'emergency', label: 'Kontakty alarmowe', group: 'Profil osobisty' },
    { id: 'services', label: 'Usługi', count: 4, group: 'Obszar roboczy' },
    { id: 'locations', label: 'Lokalizacje', count: 1, group: 'Obszar roboczy' },
    { id: 'settings', label: 'Ustawienia', group: 'Obszar roboczy' },
    { id: 'payroll', label: 'Płace i karty czasu pracy', group: 'Zapłać' },
    { id: 'commissions', label: 'Prowizje', group: 'Zapłać' },
    { id: 'payslips', label: 'Listy płac', group: 'Zapłać' },
];

const CALENDAR_COLORS = [
    '#A5B4FC', '#93C5FD', '#818CF8', '#C4B5FD', '#DDD6FE', '#F0ABFC', '#F9A8D4', '#FCA5A5',
    '#FDBA74', '#FDE047', '#FEF08A', '#BEF264', '#86EFAC', '#5EEAD4', '#67E8F9'
];

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [existingEmployees, setExistingEmployees] = useState([]);
    const [openingHours, setOpeningHours] = useState([
        { day: 'Poniedziałek', key: 'monday', open: '09:00', close: '17:00', closed: false },
        { day: 'Wtorek', key: 'tuesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Środa', key: 'wednesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Czwartek', key: 'thursday', open: '09:00', close: '17:00', closed: false },
        { day: 'Piątek', key: 'friday', open: '09:00', close: '17:00', closed: false },
        { day: 'Sobota', key: 'saturday', open: '10:00', close: '14:00', closed: false },
        { day: 'Niedziela', key: 'sunday', open: '00:00', close: '00:00', closed: true }
    ]);
    const [services, setServices] = useState([]);

    const [employeeData, setEmployeeData] = useState({
        name: '',
        position: '',
        phone: '',
        email: '',
        bio: '',
        avatarImage: null,
        role: 'employee',
        assignedServices: [],
        calendarColor: '#A5B4FC'
    });

    useEffect(() => {
        if (user && params.id) {
            fetchBusinessData();
        }
    }, [user, params.id]);

    const fetchBusinessData = async () => {
        if (user?.id) {
            try {
                const response = await fetch(`/api/businesses/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const business = data.business;

                    if (business.employees) {
                        setExistingEmployees(business.employees);
                        const employee = business.employees.find(e => e.id.toString() === params.id);
                        if (employee) {
                            setEmployeeData({
                                ...employee,
                                name: employee.name || '',
                                position: employee.position || '',
                                phone: employee.phone || '',
                                email: employee.email || '',
                                bio: employee.bio || '',
                                avatarImage: employee.avatarImage || null,
                                role: employee.role || 'employee',
                                assignedServices: employee.assignedServices || [],
                                calendarColor: employee.calendarColor || '#A5B4FC'
                            });

                            if (employee.availability) {
                                const mappedHours = openingHours.map(day => {
                                    const dayKey = day.key;
                                    return {
                                        ...day,
                                        ...(employee.availability[dayKey] || {})
                                    };
                                });
                                setOpeningHours(mappedHours);
                            }
                        } else {
                            toast.error('Nie znaleziono pracownika');
                            router.push('/business/dashboard/team');
                        }
                    }
                    if (business.services) setServices(business.services);
                }
            } catch (error) {
                console.error('Failed to fetch business data:', error);
                toast.error('Nie udało się pobrać danych firmy');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (field, value) => {
        setEmployeeData(prev => ({ ...prev, [field]: value }));
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(`section-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Image Upload
    const uploadImage = async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('folder', `bookly/${user?.id || 'default'}`);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return data.url;
            } else {
                throw new Error(data.error || 'Błąd uploadowania obrazu');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Błąd uploadowania obrazu: ' + error.message);
            return null;
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEmployeeData(prev => ({ ...prev, avatarImage: reader.result }));
            };
            reader.readAsDataURL(file);

            toast.info('Uploadowanie zdjęcia pracownika...');
            const url = await uploadImage(file, 'employee');
            if (url) {
                setEmployeeData(prev => ({ ...prev, avatarImage: url }));
                toast.success('Zdjęcie pracownika zostało zapisane!');
            }
        }
    };

    const handleSave = async () => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        if (!employeeData.name || !employeeData.email) {
            toast.error('Wypełnij wymagane pola (Imię i nazwisko, Email)');
            return;
        }

        const initials = employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase();

        const updatedEmployee = {
            ...employeeData,
            avatar: initials,
            availability: openingHours.reduce((acc, day) => {
                const dayKey = day.key;
                acc[dayKey] = {
                    open: day.open,
                    close: day.close,
                    closed: day.closed
                };
                return acc;
            }, {}),
            assignedServices: (employeeData.assignedServices || []).map(as => {
                if (typeof as === 'string') {
                    const service = services.find(s => s.id === as);
                    if (service) {
                        return {
                            serviceId: as,
                            duration: service.duration,
                            price: service.price,
                            available: true
                        };
                    }
                    return null;
                }
                return as;
            }).filter(Boolean)
        };

        const updatedEmployees = existingEmployees.map(emp =>
            emp.id.toString() === params.id ? updatedEmployee : emp
        );

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees: updatedEmployees }),
            });

            if (response.ok) {
                toast.success('Dane pracownika zostały zaktualizowane!');
                router.push('/business/dashboard/team');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji pracownika');
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 font-medium">Ładowanie...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-4 border-b border-gray-100 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Edytuj pracownika</h2>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800"
                    >
                        Zapisz
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-100 overflow-y-auto py-6 hidden md:block">
                    {['Profil osobisty', 'Obszar roboczy', 'Zapłać'].map(group => (
                        <div key={group} className="mb-6">
                            <h3 className="px-6 text-sm font-bold text-gray-900 mb-2">{group}</h3>
                            <ul>
                                {SECTIONS.filter(s => s.group === group).map(section => (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full text-left px-6 py-2 text-sm flex justify-between items-center hover:bg-gray-50 transition-colors ${activeSection === section.id ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-600'
                                                }`}
                                        >
                                            {section.label}
                                            {section.count && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                                    {section.count}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-12">

                        {/* Profile Section */}
                        <div id="section-profile">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil</h2>
                            <p className="text-gray-500 mb-8">Zarządzaj profilem osobistym członka zespołu</p>

                            <div className="flex flex-col md:flex-row gap-12 mb-8">
                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-32 h-32 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                                            {employeeData.avatarImage ? (
                                                <img src={employeeData.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-indigo-400" />
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full border border-white shadow-sm group-hover:bg-gray-200 transition-colors">
                                            <PenLine size={16} className="text-gray-600" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                </div>

                                {/* Basic Info Inputs */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Imię*</label>
                                        <input
                                            type="text"
                                            value={employeeData.name?.split(' ')[0] || ''}
                                            onChange={(e) => {
                                                const lastName = employeeData.name?.split(' ').slice(1).join(' ') || '';
                                                handleInputChange('name', `${e.target.value} ${lastName}`.trim());
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Nazwisko</label>
                                        <input
                                            type="text"
                                            value={employeeData.name?.split(' ').slice(1).join(' ') || ''}
                                            onChange={(e) => {
                                                const firstName = employeeData.name?.split(' ')[0] || '';
                                                handleInputChange('name', `${firstName} ${e.target.value}`.trim());
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">E-mail *</label>
                                        <input
                                            type="email"
                                            value={employeeData.email || ''}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Numer telefonu</label>
                                        <div className="flex gap-2">
                                            <div className="w-24 px-3 py-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between text-gray-700">
                                                +48 <ChevronDown size={14} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={employeeData.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Dodatkowy numer telefonu</label>
                                        <div className="flex gap-2">
                                            <div className="w-24 px-3 py-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between text-gray-700">
                                                +48 <ChevronDown size={14} />
                                            </div>
                                            <input
                                                type="tel"
                                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Kraj</label>
                                        <div className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-gray-400 cursor-pointer hover:bg-gray-50">
                                            Wybierz kraj <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-900 mb-4">Kolor kalendarza</label>
                                <div className="flex flex-wrap gap-3">
                                    {CALENDAR_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${employeeData.calendarColor === color ? 'ring-2 ring-offset-2 ring-black' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleInputChange('calendarColor', color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Job Title */}
                            <div className="mb-12">
                                <label className="block text-sm font-bold text-gray-900 mb-2">Stanowisko</label>
                                <input
                                    type="text"
                                    value={employeeData.position || ''}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    placeholder="Widoczne dla klientów online"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Work Details Section */}
                        <div id="section-work-details">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Szczegóły pracy</h2>
                            <p className="text-gray-500 mb-8">Zarządzaj datą rozpoczęcia pracy i szczegółami zatrudnienia swojego pracownika</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Data rozpoczęcia</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="1 grudnia"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Rok</label>
                                    <input
                                        type="text"
                                        placeholder="2025"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Data zakończenia</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Dzień i miesiąc"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Rok</label>
                                    <input
                                        type="text"
                                        placeholder="Rok"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Rodzaj zatrudnienia</label>
                                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between text-gray-400 cursor-pointer hover:bg-gray-50">
                                        Wybierz opcję <ChevronDown size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Identyfikator pracownika</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Identyfikator używany w systemach zewnętrznych, takich jak lista płac</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-900">Notatki</label>
                                    <span className="text-xs text-gray-500">0/1000</span>
                                </div>
                                <textarea
                                    placeholder="Dodaj prywatną notatkę widoczną tylko na liście pracowników"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Spacer for bottom scrolling */}
                        <div className="h-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

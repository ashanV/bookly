"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import { Camera, Save, Plus, Trash2, Edit2, X, Star, Upload, Building2, Settings, ArrowLeft, Phone, Mail, Lock, Facebook, Instagram, Globe, User, Users, Image as ImageIcon, MessageSquare, Clock, Briefcase, Calendar, CalendarDays, Coffee, Plane, Shield, UserCheck, UserCog, CheckSquare, Square, AlertTriangle } from 'lucide-react';

export default function BusinessSettings() {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [businessName, setBusinessName] = useState('Moja Firma');
    const [description, setDescription] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
    const [showHoursConfirmModal, setShowHoursConfirmModal] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user) {
            setPhone(user.phone || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateContactData = () => {
        setShowConfirmModal(true);
    };

    const confirmUpdate = async () => {
        const result = await updateProfile({ phone, email });
        if (result.success) {
            toast.success('Dane kontaktowe zostały zaktualizowane!');
        } else {
            toast.error('Błąd aktualizacji: ' + result.error);
        }
        setShowConfirmModal(false);
    };

    const handlePasswordChangeClick = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Nowe hasła nie są identyczne');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Hasło musi mieć co najmniej 6 znaków');
            return;
        }
        setShowPasswordConfirmModal(true);
    };

    const handleChangePassword = async () => {
        setShowPasswordConfirmModal(false);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.error || 'Wystąpił błąd podczas zmiany hasła');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };
    const [employees, setEmployees] = useState([
        {
            id: 1, name: 'Jan Kowalski', position: 'Fryzjer', phone: '123456789', avatar: 'JK',
            availability: {
                monday: { open: '09:00', close: '17:00', closed: false },
                tuesday: { open: '09:00', close: '17:00', closed: false },
                wednesday: { open: '09:00', close: '17:00', closed: false },
                thursday: { open: '09:00', close: '17:00', closed: false },
                friday: { open: '09:00', close: '17:00', closed: false },
                saturday: { open: '10:00', close: '14:00', closed: false },
                sunday: { open: '00:00', close: '00:00', closed: true }
            },
            vacations: [],
            breaks: [],
            assignedServices: [1, 2]
        }
    ]);
    const [portfolio, setPortfolio] = useState([]);
    const [reviews] = useState([
        { id: 1, author: 'Anna Nowak', rating: 5, comment: 'Świetna obsługa! Bardzo profesjonalne podejście do klienta.', date: '2025-10-15', avatar: 'AN' },
        { id: 2, author: 'Piotr Wiśniewski', rating: 4, comment: 'Profesjonalnie wykonana usługa, polecam!', date: '2025-10-10', avatar: 'PW' },
        { id: 3, author: 'Maria Kowalczyk', rating: 5, comment: 'Jestem bardzo zadowolona z rezultatu. Na pewno wrócę!', date: '2025-10-05', avatar: 'MK' }
    ]);

    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        phone: '',
        email: '',
        bio: '',
        avatarImage: null,
        role: 'employee', // 'admin', 'manager', 'employee', 'calendar-only', 'no-access'
        assignedServices: [] // Array of service IDs with custom settings
    });

    // Employee availability management state
    const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState(null);
    const [showVacationForm, setShowVacationForm] = useState(false);
    const [newVacation, setNewVacation] = useState({ employeeId: null, startDate: '', endDate: '', reason: '' });
    const [showBreakForm, setShowBreakForm] = useState(false);
    const [newBreak, setNewBreak] = useState({ employeeId: null, day: '', startTime: '', endTime: '', reason: '' });
    const [selectedServiceAssignment, setSelectedServiceAssignment] = useState({ employeeId: null, serviceId: null });

    // Opening hours state
    const [openingHours, setOpeningHours] = useState([
        { day: 'Poniedziałek', key: 'monday', open: '09:00', close: '17:00', closed: false },
        { day: 'Wtorek', key: 'tuesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Środa', key: 'wednesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Czwartek', key: 'thursday', open: '09:00', close: '17:00', closed: false },
        { day: 'Piątek', key: 'friday', open: '09:00', close: '17:00', closed: false },
        { day: 'Sobota', key: 'saturday', open: '10:00', close: '14:00', closed: false },
        { day: 'Niedziela', key: 'sunday', open: '00:00', close: '00:00', closed: true }
    ]);

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(`/api/businesses/${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        const business = data.business;
                        if (business.workingHours) {
                            const mappedHours = openingHours.map(day => ({
                                ...day,
                                ...business.workingHours[day.key]
                            }));
                            setOpeningHours(mappedHours);
                        }
                        if (business.services) {
                            setServices(business.services);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch business data:', error);
                }
            }
        };

        if (user) {
            fetchBusinessData();
        }
    }, [user]);

    // Services state
    const [services, setServices] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: '', price: '', description: '' });
    const [editingServiceId, setEditingServiceId] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePortfolioUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPortfolio(prev => [...prev, { id: Date.now() + Math.random(), url: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleEmployeeAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEmployee({ ...newEmployee, avatarImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const addEmployee = () => {
        if (newEmployee.name && newEmployee.email) {
            const initials = newEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase();
            setEmployees([...employees, {
                name: newEmployee.name,
                position: newEmployee.position,
                phone: newEmployee.phone,
                email: newEmployee.email,
                bio: newEmployee.bio,
                avatarImage: newEmployee.avatarImage,
                avatar: initials, // Fallback to initials if no image
                role: newEmployee.role,
                id: Date.now(),
                availability: {
                    monday: { open: '09:00', close: '17:00', closed: false },
                    tuesday: { open: '09:00', close: '17:00', closed: false },
                    wednesday: { open: '09:00', close: '17:00', closed: false },
                    thursday: { open: '09:00', close: '17:00', closed: false },
                    friday: { open: '09:00', close: '17:00', closed: false },
                    saturday: { open: '10:00', close: '14:00', closed: false },
                    sunday: { open: '00:00', close: '00:00', closed: true }
                },
                vacations: [],
                breaks: [],
                assignedServices: newEmployee.assignedServices || []
            }]);
            setNewEmployee({
                name: '',
                position: '',
                phone: '',
                email: '',
                bio: '',
                avatarImage: null,
                role: 'employee',
                assignedServices: []
            });
            setShowEmployeeForm(false);
        }
    };

    const toggleServiceAssignment = (serviceId) => {
        const isAssigned = newEmployee.assignedServices.some(s => s.serviceId === serviceId);
        if (isAssigned) {
            setNewEmployee({
                ...newEmployee,
                assignedServices: newEmployee.assignedServices.filter(s => s.serviceId !== serviceId)
            });
        } else {
            const service = services.find(s => s.id === serviceId);
            setNewEmployee({
                ...newEmployee,
                assignedServices: [...newEmployee.assignedServices, {
                    serviceId: serviceId,
                    duration: service.duration,
                    price: service.price,
                    available: true
                }]
            });
        }
    };

    const updateAssignedService = (serviceId, field, value) => {
        setNewEmployee({
            ...newEmployee,
            assignedServices: newEmployee.assignedServices.map(s =>
                s.serviceId === serviceId ? { ...s, [field]: value } : s
            )
        });
    };

    const deleteEmployee = (id) => {
        setEmployees(employees.filter(emp => emp.id !== id));
    };

    const deletePortfolioImage = (id) => {
        setPortfolio(portfolio.filter(img => img.id !== id));
    };

    const updateOpeningHours = (index, field, value) => {
        const updated = [...openingHours];
        updated[index][field] = value;
        setOpeningHours(updated);
    };

    const saveOpeningHours = async () => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        const workingHours = {};
        openingHours.forEach(day => {
            workingHours[day.key] = {
                open: day.open,
                close: day.close,
                closed: day.closed
            };
        });

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workingHours }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Godziny otwarcia zostały zaktualizowane!');
                setShowHoursConfirmModal(false);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji godzin otwarcia');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
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
        setServices(services.filter(service => service.id !== id));
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

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    const tabs = [
        { id: 'profile', label: 'Profil Firmy', icon: Building2 },
        { id: 'data', label: 'Dane Kontaktowe', icon: User },
        { id: 'hours', label: 'Godziny Otwarcia', icon: Clock },
        { id: 'services', label: 'Usługi', icon: Briefcase },
        { id: 'employees', label: 'Pracownicy', icon: Users },
        { id: 'availability', label: 'Dostępność i Grafik', icon: CalendarDays },
        { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
        { id: 'reviews', label: 'Opinie', icon: MessageSquare }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            {/* Password Confirmation Modal */}
            {showPasswordConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Zmiana hasła</h3>
                            <p className="text-gray-500 mb-6">
                                Czy na pewno chcesz zmienić swoje hasło?
                                Będziesz musiał użyć nowego hasła przy następnym logowaniu.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowPasswordConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                                >
                                    Zmień hasło
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hours Confirmation Modal */}
            {showHoursConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aktualizacja godzin</h3>
                            <p className="text-gray-500 mb-6">
                                Czy na pewno chcesz zaktualizować godziny otwarcia?
                                Zmiany będą widoczne natychmiast dla wszystkich klientów.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowHoursConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={saveOpeningHours}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                                >
                                    Potwierdź
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Potwierdzenie zmiany</h3>
                            <p className="text-gray-500 mb-6">
                                Czy na pewno chcesz zaktualizować dane kontaktowe?
                                Zmiany będą widoczne natychmiast dla wszystkich użytkowników.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={confirmUpdate}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                                >
                                    Potwierdź
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Settings className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Ustawienia Biznesu
                                </h1>
                                <p className="text-sm text-gray-500">Zarządzaj swoim profilem i danymi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar with Tabs */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sticky top-24">
                            <nav className="space-y-2">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="text-sm">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Profile Section */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Edycja Profilu</h2>
                                        <p className="text-sm text-gray-500 mt-1">Dostosuj informacje o swojej firmie</p>
                                    </div>
                                </div>

                                {/* Banner Image */}
                                <div className="mb-8">
                                    <label className="block text-gray-900 mb-4 font-semibold text-lg">Baner</label>
                                    <div className="relative group">
                                        <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg">
                                            {bannerImage ? (
                                                <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon className="w-16 h-16 text-purple-400" />
                                                    <p className="text-gray-500">Dodaj baner</p>
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl cursor-pointer hover:shadow-lg transition-all group-hover:scale-110">
                                            <Camera className="w-5 h-5 text-white" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
                                        </label>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Zalecany rozmiar: 1920x400px</p>
                                        <p className="text-xs text-gray-500">Formaty: JPG, PNG (max 5MB)</p>
                                    </div>
                                </div>

                                {/* Profile Image */}
                                <div className="mb-8">
                                    <label className="block text-gray-900 mb-4 font-semibold text-lg">Zdjęcie Profilowe</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                                {profileImage ? (
                                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-12 h-12 text-purple-400" />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl cursor-pointer hover:shadow-lg transition-all group-hover:scale-110">
                                                <Camera className="w-5 h-5 text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Zalecany rozmiar: 400x400px</p>
                                            <p className="text-xs text-gray-500">Formaty: JPG, PNG (max 2MB)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Name */}
                                <div className="mb-6">
                                    <label className="block text-gray-900 mb-3 font-semibold">Nazwa Firmy</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Wpisz nazwę firmy..."
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <label className="block text-gray-900 mb-3 font-semibold">Opis Firmy</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="5"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Opisz swoją firmę, usługi i to co wyróżnia Cię na rynku..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Pozostało znaków: {500 - description.length}/500</p>
                                </div>

                                {/* Social Media */}
                                <div className="space-y-6 mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Globe className="text-purple-600" size={24} />
                                        Media Społecznościowe
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                                                <Facebook size={18} className="text-blue-600" />
                                                Facebook
                                            </label>
                                            <input
                                                type="text"
                                                value={facebook}
                                                onChange={(e) => setFacebook(e.target.value)}
                                                placeholder="facebook.com/twojafirma"
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                                                <Instagram size={18} className="text-pink-600" />
                                                Instagram
                                            </label>
                                            <input
                                                type="text"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                placeholder="instagram.com/twojafirma"
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                                                <Globe size={18} className="text-green-600" />
                                                Strona WWW
                                            </label>
                                            <input
                                                type="text"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                placeholder="www.twojafirma.pl"
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
                                    <Save className="w-5 h-5" />
                                    Zapisz Zmiany
                                </button>
                            </div>
                        )}

                        {/* Contact Data Section */}
                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900">Dane Kontaktowe</h2>
                                        <p className="text-sm text-gray-500 mt-1">Zaktualizuj informacje kontaktowe</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="block text-gray-900 mb-3 font-semibold flex items-center gap-2">
                                                <Phone size={18} className="text-purple-600" />
                                                Numer Telefonu
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+48 123 456 789"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 mb-3 font-semibold flex items-center gap-2">
                                                <Mail size={18} className="text-purple-600" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="kontakt@firma.pl"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateContactData}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
                                        <Save className="w-5 h-5" />
                                        Zapisz Dane Kontaktowe
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Lock className="text-purple-600" size={24} />
                                            Zmiana Hasła
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Zaktualizuj swoje hasło dostępu</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-900 mb-3 font-semibold">Aktualne Hasło</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 mb-3 font-semibold">Nowe Hasło</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 mb-3 font-semibold">Potwierdź Nowe Hasło</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePasswordChangeClick}
                                        className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                    >
                                        <Lock className="w-5 h-5" />
                                        Zmień Hasło
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Opening Hours Section */}
                        {activeTab === 'hours' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Godziny Otwarcia</h2>
                                    <p className="text-sm text-gray-500 mt-1">Ustaw godziny pracy swojej firmy</p>
                                </div>

                                <div className="space-y-4">
                                    {openingHours.map((day, index) => (
                                        <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-gray-900 font-semibold mb-2">{day.day}</label>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={day.open}
                                                            onChange={(e) => updateOpeningHours(index, 'open', e.target.value)}
                                                            disabled={day.closed}
                                                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                                        />
                                                        <span className="text-gray-500">-</span>
                                                        <input
                                                            type="time"
                                                            value={day.close}
                                                            onChange={(e) => updateOpeningHours(index, 'close', e.target.value)}
                                                            disabled={day.closed}
                                                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={day.closed}
                                                            onChange={(e) => updateOpeningHours(index, 'closed', e.target.checked)}
                                                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                        />
                                                        <span className="text-sm text-gray-700 font-medium">Nieczynne</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowHoursConfirmModal(true)}
                                        className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                    >
                                        <Save className="w-5 h-5" />
                                        Zapisz Godziny
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Services Section */}
                        {activeTab === 'services' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Usługi</h2>
                                        <p className="text-sm text-gray-500 mt-1">Zarządzaj ofertą swojej firmy</p>
                                    </div>
                                    <button
                                        onClick={() => setShowServiceForm(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Dodaj Usługę
                                    </button>
                                </div>

                                {showServiceForm && (
                                    <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-200">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">{editingServiceId ? 'Edytuj Usługę' : 'Nowa Usługa'}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">Nazwa usługi</label>
                                                <input
                                                    type="text"
                                                    value={newService.name}
                                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="np. Strzyżenie męskie"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">Czas trwania (min)</label>
                                                <input
                                                    type="number"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="np. 45"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">Cena (PLN)</label>
                                                <input
                                                    type="number"
                                                    value={newService.price}
                                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="np. 100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">Opis (opcjonalnie)</label>
                                                <input
                                                    type="text"
                                                    value={newService.description}
                                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Krótki opis usługi"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={addService}
                                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
                                            >
                                                {editingServiceId ? 'Zapisz Zmiany' : 'Dodaj'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowServiceForm(false);
                                                    setNewService({ name: '', duration: '', price: '', description: '' });
                                                    setEditingServiceId(null);
                                                }}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                                            >
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {services.map((service) => (
                                        <div key={service.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-lg">
                                                    {service.name?.charAt(0) ?? String(service.id ?? '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{service.name}</h4>
                                                    <p className="text-sm text-gray-500">{service.duration} min • {service.price} PLN</p>
                                                    {service.description && (
                                                        <p className="text-xs text-gray-400 mt-1">{service.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editService(service)}
                                                    className="p-2 hover:bg-purple-50 rounded-lg transition-all group"
                                                >
                                                    <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                                                </button>
                                                <button
                                                    onClick={() => deleteService(service.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                                                >
                                                    <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {services.length === 0 && !showServiceForm && (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900">Brak usług</h3>
                                            <p className="text-gray-500">Dodaj pierwszą usługę, aby klienci mogli się umawiać.</p>
                                        </div>
                                    )}
                                </div>

                                {services.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={saveServices}
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                        >
                                            <Save className="w-5 h-5" />
                                            Zapisz Usługi
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Employee Availability/Schedule Management Section */}
                        {
                            activeTab === 'availability' && (
                                <div className="space-y-6">
                                    {/* Employee Selection */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                <CalendarDays className="text-purple-600" size={28} />
                                                Zarządzanie dostępnością/grafikami pracowników
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-2">Wybierz pracownika, aby zarządzać jego dostępnością i grafikiem</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                            {employees.map(emp => (
                                                <button
                                                    key={emp.id}
                                                    onClick={() => setSelectedEmployeeForSchedule(emp.id)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedEmployeeForSchedule === emp.id
                                                        ? 'border-purple-600 bg-purple-50 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {emp.avatarImage ? (
                                                            <img
                                                                src={emp.avatarImage}
                                                                alt={emp.name}
                                                                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                                {emp.avatar}
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-900">{emp.name}</h3>
                                                            <p className="text-sm text-purple-600">{emp.position || 'Brak stanowiska'}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {selectedEmployeeForSchedule && (() => {
                                            const employee = employees.find(e => e.id === selectedEmployeeForSchedule);
                                            if (!employee) return null;

                                            return (
                                                <div className="space-y-6">
                                                    {/* Individual Calendar - Availability Hours */}
                                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                            <Calendar className="text-purple-600" size={24} />
                                                            Indywidualny Kalendarz - Godziny Dostępności
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {Object.entries(employee.availability || {}).map(([day, schedule]) => (
                                                                <div key={day} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <label className="block text-gray-900 font-semibold capitalize w-32">
                                                                            {day === 'monday' ? 'Poniedziałek' :
                                                                                day === 'tuesday' ? 'Wtorek' :
                                                                                    day === 'wednesday' ? 'Środa' :
                                                                                        day === 'thursday' ? 'Czwartek' :
                                                                                            day === 'friday' ? 'Piątek' :
                                                                                                day === 'saturday' ? 'Sobota' : 'Niedziela'}
                                                                        </label>
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <input
                                                                                type="time"
                                                                                value={schedule.open}
                                                                                disabled={schedule.closed}
                                                                                onChange={(e) => {
                                                                                    const updated = [...employees];
                                                                                    const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                    updated[empIndex].availability[day].open = e.target.value;
                                                                                    setEmployees(updated);
                                                                                }}
                                                                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                                                            />
                                                                            <span className="text-gray-500">-</span>
                                                                            <input
                                                                                type="time"
                                                                                value={schedule.close}
                                                                                disabled={schedule.closed}
                                                                                onChange={(e) => {
                                                                                    const updated = [...employees];
                                                                                    const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                    updated[empIndex].availability[day].close = e.target.value;
                                                                                    setEmployees(updated);
                                                                                }}
                                                                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                                                            />
                                                                            <label className="flex items-center gap-2 cursor-pointer ml-4">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={schedule.closed}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...employees];
                                                                                        const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                        updated[empIndex].availability[day].closed = e.target.checked;
                                                                                        setEmployees(updated);
                                                                                    }}
                                                                                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                                />
                                                                                <span className="text-sm text-gray-700 font-medium">Nieczynne</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Vacations and Days Off */}
                                                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                                <Plane className="text-purple-600" size={24} />
                                                                Urlopy i Dni Wolne
                                                            </h3>
                                                            <button
                                                                onClick={() => {
                                                                    setNewVacation({ employeeId: employee.id, startDate: '', endDate: '', reason: '' });
                                                                    setShowVacationForm(true);
                                                                }}
                                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Dodaj urlop
                                                            </button>
                                                        </div>

                                                        {showVacationForm && newVacation.employeeId === employee.id && (
                                                            <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                                                                <h4 className="font-semibold text-gray-900 mb-3">Nowy Urlop</h4>
                                                                <div className="space-y-3">
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="block text-sm text-gray-700 mb-1">Data rozpoczęcia</label>
                                                                            <input
                                                                                type="date"
                                                                                value={newVacation.startDate}
                                                                                onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm text-gray-700 mb-1">Data zakończenia</label>
                                                                            <input
                                                                                type="date"
                                                                                value={newVacation.endDate}
                                                                                onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Powód (opcjonalnie)"
                                                                        value={newVacation.reason}
                                                                        onChange={(e) => setNewVacation({ ...newVacation, reason: e.target.value })}
                                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...employees];
                                                                                const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                updated[empIndex].vacations = [...(updated[empIndex].vacations || []), { ...newVacation, id: Date.now() }];
                                                                                setEmployees(updated);
                                                                                setShowVacationForm(false);
                                                                                setNewVacation({ employeeId: null, startDate: '', endDate: '', reason: '' });
                                                                            }}
                                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                                                                        >
                                                                            Dodaj
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowVacationForm(false);
                                                                                setNewVacation({ employeeId: null, startDate: '', endDate: '', reason: '' });
                                                                            }}
                                                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all"
                                                                        >
                                                                            Anuluj
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            {(employee.vacations || []).length > 0 ? (
                                                                (employee.vacations || []).map(vacation => (
                                                                    <div key={vacation.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                                                                        <div>
                                                                            <span className="font-semibold text-gray-900">{vacation.startDate} - {vacation.endDate}</span>
                                                                            {vacation.reason && <span className="text-gray-600 ml-2">({vacation.reason})</span>}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...employees];
                                                                                const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                updated[empIndex].vacations = updated[empIndex].vacations.filter(v => v.id !== vacation.id);
                                                                                setEmployees(updated);
                                                                            }}
                                                                            className="p-1 hover:bg-red-50 rounded transition-all"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-sm text-center py-4">Brak urlopów</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Breaks */}
                                                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                                <Coffee className="text-purple-600" size={24} />
                                                                Przerwy
                                                            </h3>
                                                            <button
                                                                onClick={() => {
                                                                    setNewBreak({ employeeId: employee.id, day: '', startTime: '', endTime: '', reason: '' });
                                                                    setShowBreakForm(true);
                                                                }}
                                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Dodaj przerwę
                                                            </button>
                                                        </div>

                                                        {showBreakForm && newBreak.employeeId === employee.id && (
                                                            <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                                                                <h4 className="font-semibold text-gray-900 mb-3">Nowa Przerwa</h4>
                                                                <div className="space-y-3">
                                                                    <select
                                                                        value={newBreak.day}
                                                                        onChange={(e) => setNewBreak({ ...newBreak, day: e.target.value })}
                                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                    >
                                                                        <option value="">Wybierz dzień</option>
                                                                        <option value="monday">Poniedziałek</option>
                                                                        <option value="tuesday">Wtorek</option>
                                                                        <option value="wednesday">Środa</option>
                                                                        <option value="thursday">Czwartek</option>
                                                                        <option value="friday">Piątek</option>
                                                                        <option value="saturday">Sobota</option>
                                                                        <option value="sunday">Niedziela</option>
                                                                    </select>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="block text-sm text-gray-700 mb-1">Od</label>
                                                                            <input
                                                                                type="time"
                                                                                value={newBreak.startTime}
                                                                                onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })}
                                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm text-gray-700 mb-1">Do</label>
                                                                            <input
                                                                                type="time"
                                                                                value={newBreak.endTime}
                                                                                onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })}
                                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Powód (np. Przerwa obiadowa)"
                                                                        value={newBreak.reason}
                                                                        onChange={(e) => setNewBreak({ ...newBreak, reason: e.target.value })}
                                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...employees];
                                                                                const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                updated[empIndex].breaks = [...(updated[empIndex].breaks || []), { ...newBreak, id: Date.now() }];
                                                                                setEmployees(updated);
                                                                                setShowBreakForm(false);
                                                                                setNewBreak({ employeeId: null, day: '', startTime: '', endTime: '', reason: '' });
                                                                            }}
                                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                                                                        >
                                                                            Dodaj
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowBreakForm(false);
                                                                                setNewBreak({ employeeId: null, day: '', startTime: '', endTime: '', reason: '' });
                                                                            }}
                                                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all"
                                                                        >
                                                                            Anuluj
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            {(employee.breaks || []).length > 0 ? (
                                                                (employee.breaks || []).map(breakItem => (
                                                                    <div key={breakItem.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                                                                        <div>
                                                                            <span className="font-semibold text-gray-900 capitalize">
                                                                                {breakItem.day === 'monday' ? 'Poniedziałek' :
                                                                                    breakItem.day === 'tuesday' ? 'Wtorek' :
                                                                                        breakItem.day === 'wednesday' ? 'Środa' :
                                                                                            breakItem.day === 'thursday' ? 'Czwartek' :
                                                                                                breakItem.day === 'friday' ? 'Piątek' :
                                                                                                    breakItem.day === 'saturday' ? 'Sobota' : 'Niedziela'}
                                                                            </span>
                                                                            <span className="text-gray-600 ml-2">{breakItem.startTime} - {breakItem.endTime}</span>
                                                                            {breakItem.reason && <span className="text-gray-500 ml-2">({breakItem.reason})</span>}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...employees];
                                                                                const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                updated[empIndex].breaks = updated[empIndex].breaks.filter(b => b.id !== breakItem.id);
                                                                                setEmployees(updated);
                                                                            }}
                                                                            className="p-1 hover:bg-red-50 rounded transition-all"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-sm text-center py-4">Brak przerw</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Shift Schedule */}
                                                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                            <Clock className="text-purple-600" size={24} />
                                                            Grafik Zmianowy
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-4">Godziny dostępności dla tego pracownika są widoczne w sekcji "Indywidualny Kalendarz" powyżej.</p>
                                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                                            <p className="text-sm text-gray-700">
                                                                Grafik zmianowy jest oparty na indywidualnych godzinach dostępności pracownika.
                                                                Zmiany są automatycznie uwzględniane na podstawie ustawionych godzin pracy i przerw.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Service Assignment */}
                                                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                                <Briefcase className="text-purple-600" size={24} />
                                                                Przypisane Usługi
                                                            </h3>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedServiceAssignment({ employeeId: employee.id, serviceId: null });
                                                                }}
                                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Przypisz usługę
                                                            </button>
                                                        </div>

                                                        {selectedServiceAssignment?.employeeId === employee.id && (
                                                            <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                                                                <h4 className="font-semibold text-gray-900 mb-3">Wybierz usługę</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {services.filter(s => !(employee.assignedServices || []).includes(s.id)).map(service => (
                                                                        <button
                                                                            key={service.id}
                                                                            onClick={() => {
                                                                                const updated = [...employees];
                                                                                const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                updated[empIndex].assignedServices = [...(updated[empIndex].assignedServices || []), service.id];
                                                                                setEmployees(updated);
                                                                                setSelectedServiceAssignment({ employeeId: null, serviceId: null });
                                                                            }}
                                                                            className="bg-white border-2 border-purple-200 hover:border-purple-600 rounded-lg p-3 text-left transition-all"
                                                                        >
                                                                            <div className="font-semibold text-gray-900">{service.name}</div>
                                                                            <div className="text-sm text-gray-600">{service.duration} min - {service.price} PLN</div>
                                                                        </button>
                                                                    ))}
                                                                    {services.filter(s => !(employee.assignedServices || []).includes(s.id)).length === 0 && (
                                                                        <p className="text-gray-500 text-sm col-span-2 text-center py-2">Wszystkie usługi są już przypisane</p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => setSelectedServiceAssignment({ employeeId: null, serviceId: null })}
                                                                    className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all"
                                                                >
                                                                    Anuluj
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            {(employee.assignedServices || []).length > 0 ? (
                                                                (employee.assignedServices || []).map(serviceId => {
                                                                    const service = services.find(s => s.id === serviceId);
                                                                    if (!service) return null;
                                                                    return (
                                                                        <div key={serviceId} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                                                                            <div>
                                                                                <span className="font-semibold text-gray-900">{service.name}</span>
                                                                                <span className="text-gray-600 ml-2">({service.duration} min - {service.price} PLN)</span>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updated = [...employees];
                                                                                    const empIndex = updated.findIndex(e => e.id === employee.id);
                                                                                    updated[empIndex].assignedServices = updated[empIndex].assignedServices.filter(s => s !== serviceId);
                                                                                    setEmployees(updated);
                                                                                }}
                                                                                className="p-1 hover:bg-red-50 rounded transition-all"
                                                                            >
                                                                                <X className="w-4 h-4 text-red-500" />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <p className="text-gray-500 text-sm text-center py-4">Brak przypisanych usług</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )
                        }

                        {/* Employees Section */}
                        {activeTab === 'employees' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Pracownikami</h2>
                                        <p className="text-sm text-gray-500 mt-1">Dodaj i edytuj informacje o pracownikach</p>
                                    </div>
                                    <button
                                        onClick={() => setShowEmployeeForm(!showEmployeeForm)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Dodaj Pracownika
                                    </button>
                                </div>

                                {showEmployeeForm && (
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 mb-8 border border-purple-200">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Dodaj Nowego Pracownika</h3>

                                        {/* A) Dane Podstawowe */}
                                        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <User className="text-purple-600" size={24} />
                                                A) Dane Podstawowe
                                            </h4>

                                            <div className="space-y-4">
                                                {/* Imię i nazwisko */}
                                                <div>
                                                    <label className="block text-gray-900 mb-2 font-semibold">Imię i nazwisko *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Jan Kowalski"
                                                        value={newEmployee.name}
                                                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Zdjęcie profilowe */}
                                                <div>
                                                    <label className="block text-gray-900 mb-2 font-semibold">Zdjęcie profilowe</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative group">
                                                            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg">
                                                                {newEmployee.avatarImage ? (
                                                                    <img src={newEmployee.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User className="w-10 h-10 text-purple-400" />
                                                                )}
                                                            </div>
                                                            <label className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg cursor-pointer hover:shadow-lg transition-all">
                                                                <Camera className="w-4 h-4 text-white" />
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleEmployeeAvatarUpload} />
                                                            </label>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600">Zalecany rozmiar: 200x200px</p>
                                                            <p className="text-xs text-gray-500">Formaty: JPG, PNG (max 2MB)</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Telefon */}
                                                <div>
                                                    <label className="block text-gray-900 mb-2 font-semibold">Telefon</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="+48 123 456 789"
                                                        value={newEmployee.phone}
                                                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label className="block text-gray-900 mb-2 font-semibold">Email *</label>
                                                    <input
                                                        type="email"
                                                        placeholder="pracownik@firma.pl"
                                                        value={newEmployee.email}
                                                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Opis / Bio */}
                                                <div>
                                                    <label className="block text-gray-900 mb-2 font-semibold">Opis / Bio (opcjonalnie)</label>
                                                    <textarea
                                                        placeholder="Krótki opis doświadczenia i umiejętności pracownika..."
                                                        value={newEmployee.bio}
                                                        onChange={(e) => setNewEmployee({ ...newEmployee, bio: e.target.value })}
                                                        rows="3"
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Stanowisko */}
                                                <div>
                                                    <label className="block text-gray-900 mb-2 font-semibold">Stanowisko</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Fryzjer, Stylista, etc."
                                                        value={newEmployee.position}
                                                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* B) Uprawnienia i rola */}
                                        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Shield className="text-purple-600" size={24} />
                                                B) Uprawnienia i Rola
                                            </h4>

                                            <div className="space-y-3">
                                                {[
                                                    { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Pełny dostęp do wszystkich funkcji i ustawień' },
                                                    { id: 'manager', label: 'Menedżer', icon: UserCog, desc: 'Zarządzanie rezerwacjami i pracownikami, dostęp do raportów' },
                                                    { id: 'employee', label: 'Pracownik', icon: UserCheck, desc: 'Tylko obsługa rezerwacji i dostęp do swojego kalendarza' },
                                                    { id: 'calendar-only', label: 'Tylko dostęp do kalendarza', icon: Calendar, desc: 'Tylko przeglądanie kalendarza, brak możliwości edycji' },
                                                    { id: 'no-access', label: 'Brak dostępu do ustawień', icon: Lock, desc: 'Tylko przeglądanie, brak możliwości edycji czegokolwiek' }
                                                ].map(role => {
                                                    const RoleIcon = role.icon;
                                                    return (
                                                        <label
                                                            key={role.id}
                                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${newEmployee.role === role.id
                                                                ? 'border-purple-600 bg-purple-50'
                                                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="role"
                                                                value={role.id}
                                                                checked={newEmployee.role === role.id}
                                                                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                                                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <RoleIcon className="text-purple-600" size={20} />
                                                                    <span className="font-semibold text-gray-900">{role.label}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">{role.desc}</p>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* C) Przypisane Usługi */}
                                        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Briefcase className="text-purple-600" size={24} />
                                                C) Jakie usługi wykonuje dany pracownik
                                            </h4>

                                            {services.length > 0 ? (
                                                <div className="space-y-4">
                                                    {services.map(service => {
                                                        const assignedService = newEmployee.assignedServices.find(s => s.serviceId === service.id);
                                                        const isAssigned = !!assignedService;

                                                        return (
                                                            <div key={service.id} className="border border-gray-200 rounded-xl p-4">
                                                                <label className="flex items-center gap-3 cursor-pointer mb-3">
                                                                    {isAssigned ? (
                                                                        <CheckSquare className="w-5 h-5 text-purple-600" />
                                                                    ) : (
                                                                        <Square className="w-5 h-5 text-gray-400" />
                                                                    )}
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isAssigned}
                                                                        onChange={() => toggleServiceAssignment(service.id)}
                                                                        className="hidden"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="font-semibold text-gray-900">{service.name}</span>
                                                                        <p className="text-sm text-gray-600">{typeof service.description === 'string' ? service.description : ''}</p>
                                                                    </div>
                                                                </label>

                                                                {isAssigned && (
                                                                    <div className="ml-8 mt-3 space-y-3 bg-purple-50 rounded-lg p-4 border border-purple-200">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-sm text-gray-700 mb-1">Czas trwania (min)</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={assignedService.duration}
                                                                                    onChange={(e) => updateAssignedService(service.id, 'duration', parseInt(e.target.value) || 0)}
                                                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                                    min="1"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm text-gray-700 mb-1">Cena (PLN)</label>
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    value={assignedService.price}
                                                                                    onChange={(e) => updateAssignedService(service.id, 'price', parseFloat(e.target.value) || 0)}
                                                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                                    min="0"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={assignedService.available !== false}
                                                                                onChange={(e) => updateAssignedService(service.id, 'available', e.target.checked)}
                                                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                            />
                                                                            <span className="text-sm text-gray-700">Usługa dostępna</span>
                                                                        </label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">Brak usług. Dodaj usługi w zakładce "Usługi".</p>
                                            )}
                                        </div>

                                        {/* Przyciski akcji */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={addEmployee}
                                                disabled={!newEmployee.name || !newEmployee.email}
                                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Dodaj Pracownika
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowEmployeeForm(false);
                                                    setNewEmployee({
                                                        name: '',
                                                        position: '',
                                                        phone: '',
                                                        email: '',
                                                        bio: '',
                                                        avatarImage: null,
                                                        role: 'employee',
                                                        assignedServices: []
                                                    });
                                                }}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                                            >
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {employees.map(emp => {
                                        const roleLabels = {
                                            admin: 'Administrator',
                                            manager: 'Menedżer',
                                            employee: 'Pracownik',
                                            'calendar-only': 'Tylko kalendarz',
                                            'no-access': 'Brak dostępu'
                                        };
                                        const roleIcons = {
                                            admin: Shield,
                                            manager: UserCog,
                                            employee: UserCheck,
                                            'calendar-only': Calendar,
                                            'no-access': Lock
                                        };
                                        const RoleIcon = roleIcons[emp.role] || UserCheck;

                                        return (
                                            <div key={emp.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="relative">
                                                        {emp.avatarImage ? (
                                                            <img
                                                                src={emp.avatarImage}
                                                                alt={emp.name}
                                                                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                                {emp.avatar}
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border-2 border-purple-200">
                                                            <RoleIcon className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                                                        <p className="text-purple-600 font-medium text-sm">{emp.position || 'Brak stanowiska'}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <RoleIcon className="w-3 h-3 text-gray-500" />
                                                            <span className="text-xs text-gray-600">{roleLabels[emp.role] || 'Pracownik'}</span>
                                                        </div>
                                                        {emp.phone && (
                                                            <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                                                                <Phone size={14} />
                                                                {emp.phone}
                                                            </p>
                                                        )}
                                                        {emp.email && (
                                                            <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                                                                <Mail size={14} />
                                                                {emp.email}
                                                            </p>
                                                        )}
                                                        {emp.assignedServices && emp.assignedServices.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {emp.assignedServices.length} {emp.assignedServices.length === 1 ? 'usługa' : 'usług'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteEmployee(emp.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Portfolio Section */}
                        {activeTab === 'portfolio' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
                                        <p className="text-sm text-gray-500 mt-1">Zaprezentuj swoje najlepsze prace</p>
                                    </div>
                                    <label className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer">
                                        <Upload className="w-5 h-5" />
                                        Dodaj Zdjęcia
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handlePortfolioUpload} />
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {portfolio.map(img => (
                                        <div key={img.id} className="relative group">
                                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-purple-400 transition-all">
                                                <img src={img.url} alt="Portfolio" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                onClick={() => deletePortfolioImage(img.id)}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {portfolio.length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Brak zdjęć w portfolio</p>
                                            <p className="text-sm text-gray-400 mt-2">Dodaj swoje prace, aby pokazać je klientom</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        {activeTab === 'reviews' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Opinie Klientów</h2>
                                    <p className="text-sm text-gray-500 mt-1">Przegląd opinii i ocen</p>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 mb-8 border border-purple-200">
                                    <div className="flex items-center justify-center gap-8">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</div>
                                            <div className="flex items-center gap-1 justify-center mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                        size={24}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600">{reviews.length} opinii</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                    {review.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-bold text-gray-900">{review.author}</h3>
                                                        <span className="text-sm text-gray-500">{review.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                                size={16}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-700">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>

    );
}
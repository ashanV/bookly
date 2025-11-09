"use client";

import React, { useState } from 'react';
import { Camera, Save, Plus, Trash2, Edit2, X, Star, Upload, Building2, Settings, ArrowLeft, Phone, Mail, Lock, Facebook, Instagram, Globe, User, Users, Image as ImageIcon, MessageSquare, Clock, Briefcase } from 'lucide-react';

export default function BusinessSettings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState(null);
    const [businessName, setBusinessName] = useState('Moja Firma');
    const [description, setDescription] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Jan Kowalski', position: 'Fryzjer', phone: '123456789', avatar: 'JK' }
    ]);
    const [portfolio, setPortfolio] = useState([]);
    const [reviews] = useState([
        { id: 1, author: 'Anna Nowak', rating: 5, comment: 'Świetna obsługa! Bardzo profesjonalne podejście do klienta.', date: '2025-10-15', avatar: 'AN' },
        { id: 2, author: 'Piotr Wiśniewski', rating: 4, comment: 'Profesjonalnie wykonana usługa, polecam!', date: '2025-10-10', avatar: 'PW' },
        { id: 3, author: 'Maria Kowalczyk', rating: 5, comment: 'Jestem bardzo zadowolona z rezultatu. Na pewno wrócę!', date: '2025-10-05', avatar: 'MK' }
    ]);

    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', position: '', phone: '' });

    // Opening hours state
    const [openingHours, setOpeningHours] = useState([
        { day: 'Poniedziałek', open: '09:00', close: '17:00', closed: false },
        { day: 'Wtorek', open: '09:00', close: '17:00', closed: false },
        { day: 'Środa', open: '09:00', close: '17:00', closed: false },
        { day: 'Czwartek', open: '09:00', close: '17:00', closed: false },
        { day: 'Piątek', open: '09:00', close: '17:00', closed: false },
        { day: 'Sobota', open: '10:00', close: '14:00', closed: false },
        { day: 'Niedziela', open: '00:00', close: '00:00', closed: true }
    ]);

    // Services state
    const [services, setServices] = useState([
        { id: 1, name: 'Strzyżenie męskie', duration: 30, price: 50, description: 'Klasyczne strzyżenie dla mężczyzn' },
        { id: 2, name: 'Strzyżenie damskie', duration: 45, price: 80, description: 'Strzyżenie i modelowanie' }
    ]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: '', price: '', description: '' });

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

    const addEmployee = () => {
        if (newEmployee.name && newEmployee.position) {
            const initials = newEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase();
            setEmployees([...employees, { ...newEmployee, id: Date.now(), avatar: initials }]);
            setNewEmployee({ name: '', position: '', phone: '' });
            setShowEmployeeForm(false);
        }
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

    const addService = () => {
        if (newService.name && newService.duration && newService.price) {
            setServices([...services, { ...newService, id: Date.now(), duration: parseInt(newService.duration), price: parseFloat(newService.price) }]);
            setNewService({ name: '', duration: '', price: '', description: '' });
            setShowServiceForm(false);
        }
    };

    const deleteService = (id) => {
        setServices(services.filter(service => service.id !== id));
    };

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    const tabs = [
        { id: 'profile', label: 'Profil Firmy', icon: Building2 },
        { id: 'data', label: 'Dane Kontaktowe', icon: User },
        { id: 'hours', label: 'Godziny Otwarcia', icon: Clock },
        { id: 'services', label: 'Usługi', icon: Briefcase },
        { id: 'employees', label: 'Pracownicy', icon: Users },
        { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
        { id: 'reviews', label: 'Opinie', icon: MessageSquare }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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
                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
                                    }`}
                            >
                                <Icon size={20} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Profile Section */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edycja Profilu</h2>
                                <p className="text-sm text-gray-500 mt-1">Dostosuj informacje o swojej firmie</p>
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

                            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
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
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-900 mb-3 font-semibold">Nowe Hasło</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-900 mb-3 font-semibold">Potwierdź Nowe Hasło</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
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
                        </div>

                        <button className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
                            <Save className="w-5 h-5" />
                            Zapisz Godziny Otwarcia
                        </button>
                    </div>
                )}

                {/* Services Section */}
                {activeTab === 'services' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Usługami</h2>
                                <p className="text-sm text-gray-500 mt-1">Dodaj i edytuj oferowane usługi</p>
                            </div>
                            <button
                                onClick={() => setShowServiceForm(!showServiceForm)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Dodaj Usługę
                            </button>
                        </div>

                        {showServiceForm && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 border border-purple-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Nowa Usługa</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Nazwa usługi"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            placeholder="Czas trwania (min)"
                                            value={newService.duration}
                                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cena (PLN)"
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Opis usługi"
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        rows="3"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={addService}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
                                        >
                                            Dodaj
                                        </button>
                                        <button
                                            onClick={() => setShowServiceForm(false)}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.map(service => (
                                <div key={service.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-purple-600">
                                                    <Clock size={16} />
                                                    <span className="font-medium">{service.duration} min</span>
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {service.price} PLN</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteService(service.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                                        >
                                            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 border border-purple-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Nowy Pracownik</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Imię i nazwisko"
                                        value={newEmployee.name}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Stanowisko"
                                        value={newEmployee.position}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Telefon"
                                        value={newEmployee.phone}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={addEmployee}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
                                        >
                                            Dodaj
                                        </button>
                                        <button
                                            onClick={() => setShowEmployeeForm(false)}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {employees.map(emp => (
                                <div key={emp.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            {emp.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                                            <p className="text-purple-600 font-medium text-sm">{emp.position}</p>
                                            {emp.phone && (
                                                <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                                                    <Phone size={14} />
                                                    {emp.phone}
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
                            ))}
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
            </div>
        </div>
    );
}
import React from 'react';
import { Plus, User, Camera, Shield, UserCog, UserCheck, Calendar, Lock, Briefcase, Phone, Mail, Trash2, CheckSquare, Square, X } from 'lucide-react';

export default function EmployeesSection({
    employees,
    showEmployeeForm,
    setShowEmployeeForm,
    newEmployee,
    setNewEmployee,
    handleEmployeeAvatarUpload,
    addEmployee,
    deleteEmployee,
    services,
    toggleServiceAssignment,
    updateAssignedService
}) {
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

    return (
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
    );
}

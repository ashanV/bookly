import React from 'react';
import { CalendarDays, Calendar, Plane, Plus, Trash2, Coffee, Clock, Briefcase, X } from 'lucide-react';

export default function AvailabilitySection({
    employees,
    selectedEmployeeForSchedule,
    setSelectedEmployeeForSchedule,
    saveEmployees,
    setEmployees,
    showVacationForm,
    setShowVacationForm,
    newVacation,
    setNewVacation,
    showBreakForm,
    setShowBreakForm,
    newBreak,
    setNewBreak,
    selectedServiceAssignment,
    setSelectedServiceAssignment,
    services
}) {
    return (
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
                                                            saveEmployees(updated);
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
                                                            saveEmployees(updated);
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
                                                                saveEmployees(updated);
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
                                                        saveEmployees(updated);
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
                                                        saveEmployees(updated);
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
                                                        saveEmployees(updated);
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
                                                        saveEmployees(updated);
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
                                            {services.filter(s => !(employee.assignedServices || []).some(as => as.serviceId === s.id)).map(service => (
                                                <button
                                                    key={service.id}
                                                    onClick={() => {
                                                        const updated = [...employees];
                                                        const empIndex = updated.findIndex(e => e.id === employee.id);
                                                        updated[empIndex].assignedServices = [...(updated[empIndex].assignedServices || []), { serviceId: service.id, duration: service.duration, price: service.price, available: true }];
                                                        saveEmployees(updated);
                                                        setEmployees(updated);
                                                        setSelectedServiceAssignment({ employeeId: null, serviceId: null });
                                                    }}
                                                    className="bg-white border-2 border-purple-200 hover:border-purple-600 rounded-lg p-3 text-left transition-all"
                                                >
                                                    <div className="font-semibold text-gray-900">{service.name}</div>
                                                    <div className="text-sm text-gray-600">{service.duration} min - {service.price} PLN</div>
                                                </button>
                                            ))}
                                            {services.filter(s => !(employee.assignedServices || []).some(as => as.serviceId === s.id)).length === 0 && (
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
                                        (employee.assignedServices || []).map(assignment => {
                                            const serviceId = typeof assignment === 'object' ? assignment.serviceId : assignment;
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
                                                            updated[empIndex].assignedServices = updated[empIndex].assignedServices.filter(s => {
                                                                const sId = typeof s === 'object' ? s.serviceId : s;
                                                                return sId !== serviceId;
                                                            });
                                                            saveEmployees(updated);
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
    );
}

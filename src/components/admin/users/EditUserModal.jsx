import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Check, User, Mail, Phone, Calendar, Shield, Lock, Activity } from 'lucide-react';

export default function EditUserModal({ isOpen, onClose, user, onSuccess }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        isActive: true,
        adminRole: 'none',
        forcePasswordReset: false,
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                birthDate: user.birthDate || '',
                isActive: user.isActive,
                adminRole: user.adminRole || 'none',
                forcePasswordReset: user.forcePasswordReset || false,
                newPassword: ''
            });
            setError(null);
            setSuccess(false);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email) {
            setError('Imię, nazwisko i email są wymagane.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Wystąpił błąd podczas zapisywania zmian.');
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#131B2C] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0 sticky top-0 bg-[#131B2C] z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-400" />
                            Edycja Użytkownika
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Modyfikuj dane, rolę i uprawnienia</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                            <Check className="w-5 h-5 text-emerald-500" />
                            <p className="text-sm text-emerald-400">Zmiany zostały zapisane pomyślnie!</p>
                        </div>
                    )}

                    {/* Personal Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">
                            Dane Osobowe
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400">Imię <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Jan"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400">Nazwisko <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Kowalski"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" /> Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="jan@example.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" /> Telefon
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="+48 123 456 789"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> Data Urodzenia
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate || ''}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions & Security Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">
                            Bezpieczeństwo i Role
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3" /> Status Konta
                                </label>
                                <select
                                    name="isActive"
                                    value={formData.isActive.toString()}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                    className={`w-full bg-[#0B0F19] border border-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 ${!formData.isActive ? 'text-red-400 border-red-500/30' : 'text-emerald-400 border-emerald-500/30'}`}
                                >
                                    <option value="true">Aktywne</option>
                                    <option value="false">Zablokowane</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-[#0B0F19]/50 border border-gray-800/50 rounded-lg p-4 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" /> Zmiana Hasła (Opcjonalne)
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B0F19] border border-gray-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Wpisz nowe hasło aby zmienić..."
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-600">Minimum 6 znaków. Pozostaw puste aby nie zmieniać.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="forcePasswordReset"
                                    name="forcePasswordReset"
                                    checked={formData.forcePasswordReset}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-700 bg-[#0B0F19] text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0"
                                />
                                <label htmlFor="forcePasswordReset" className="text-sm text-gray-300">
                                    Wymuś zmianę hasła przy następnym logowaniu
                                </label>
                            </div>
                        </div>

                        {/* Additional Warning for blocking */}
                        {!formData.isActive && user.isActive && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-xs text-red-400">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Uwaga: Zablokowanie użytkownika wyloguje go ze wszystkich sesji i uniemożliwi dostęp do platformy.</p>
                            </div>
                        )}
                    </div>


                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-[#131B2C] z-10 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Zapisz Zmiany
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

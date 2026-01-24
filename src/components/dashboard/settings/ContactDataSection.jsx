"use client";

import React from 'react';
import { Save, Phone, Mail, Lock } from 'lucide-react';

export default function ContactDataSection({
    phone,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
    onPhoneChange,
    onEmailChange,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onUpdateContactData,
    onPasswordChangeClick
}) {
    return (
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
                            onChange={(e) => onPhoneChange(e.target.value)}
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
                            onChange={(e) => onEmailChange(e.target.value)}
                            placeholder="kontakt@firma.pl"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <button
                    onClick={onUpdateContactData}
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
                            onChange={(e) => onCurrentPasswordChange(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-900 mb-3 font-semibold">Nowe Hasło</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => onNewPasswordChange(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-900 mb-3 font-semibold">Potwierdź Nowe Hasło</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => onConfirmPasswordChange(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    onClick={onPasswordChangeClick}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                    <Lock className="w-5 h-5" />
                    Zmień Hasło
                </button>
            </div>
        </div>
    );
}



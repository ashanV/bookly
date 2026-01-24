"use client";

import React from 'react';
import { Camera, Save, Building2, Facebook, Instagram, Globe, MapPin, Image as ImageIcon } from 'lucide-react';

export default function ProfileSection({
    profileImage,
    bannerImage,
    businessName,
    description,
    facebook,
    instagram,
    website,
    city,
    address,
    postalCode,
    onProfileImageChange,
    onBannerImageChange,
    onBusinessNameChange,
    onDescriptionChange,
    onFacebookChange,
    onInstagramChange,
    onWebsiteChange,
    onCityChange,
    onAddressChange,
    onPostalCodeChange,
    onSave
}) {
    const handlePostalCodeChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Usuń wszystko oprócz cyfr
        if (value.length > 2) {
            value = value.slice(0, 2) + '-' + value.slice(2, 5);
        }
        onPostalCodeChange(value);
    };

    return (
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
                        <input type="file" className="hidden" accept="image/*" onChange={onBannerImageChange} />
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
                            <input type="file" className="hidden" accept="image/*" onChange={onProfileImageChange} />
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
                    onChange={(e) => onBusinessNameChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Wpisz nazwę firmy..."
                />
            </div>

            {/* Description */}
            <div className="mb-8">
                <label className="block text-gray-900 mb-3 font-semibold">Opis Firmy</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
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
                            onChange={(e) => onFacebookChange(e.target.value)}
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
                            onChange={(e) => onInstagramChange(e.target.value)}
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
                            onChange={(e) => onWebsiteChange(e.target.value)}
                            placeholder="www.twojafirma.pl"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={24} />
                    Lokalizacja
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Miasto
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                            placeholder="Warszawa"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Ulica i numer
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => onAddressChange(e.target.value)}
                            placeholder="ul. Przykładowa 123"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Kod pocztowy
                        </label>
                        <input
                            type="text"
                            value={postalCode}
                            onChange={handlePostalCodeChange}
                            placeholder="00-000"
                            maxLength={6}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 00-000</p>
                    </div>
                </div>
                {(city || address || postalCode) && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">
                            <MapPin className="inline w-4 h-4 mr-1 text-blue-600" />
                            <strong>Pełny adres:</strong> {address ? `${address}, ` : ''}{postalCode ? `${postalCode} ` : ''}{city || ''}
                        </p>
                    </div>
                )}
            </div>

            <button 
                onClick={onSave}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
                <Save className="w-5 h-5" />
                Zapisz Zmiany
            </button>
        </div>
    );
}



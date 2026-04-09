"use client";

import React from 'react';
import { Camera, Save, Building2, Facebook, Instagram, Globe, MapPin, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('BusinessSettingsProfile');
    const handlePostalCodeChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove everything except digits
        if (value.length > 2) {
            value = value.slice(0, 2) + '-' + value.slice(2, 5);
        }
        onPostalCodeChange(value);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
            </div>

            {/* Banner Image */}
            <div className="mb-8">
                <label className="block text-gray-900 mb-4 font-semibold text-lg">{t('bannerLabel')}</label>
                <div className="relative group">
                    <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg">
                        {bannerImage ? (
                            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-16 h-16 text-purple-400" />
                                <p className="text-gray-500">{t('addBanner')}</p>
                            </div>
                        )}
                    </div>
                    <label className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl cursor-pointer hover:shadow-lg transition-all group-hover:scale-110">
                        <Camera className="w-5 h-5 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={onBannerImageChange} />
                    </label>
                </div>
                <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">{t('bannerRecSize')}</p>
                    <p className="text-xs text-gray-500">{t('bannerFormat')}</p>
                </div>
            </div>

            {/* Profile Image */}
            <div className="mb-8">
                <label className="block text-gray-900 mb-4 font-semibold text-lg">{t('profileLabel')}</label>
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
                        <p className="text-sm text-gray-600 mb-2">{t('profileRecSize')}</p>
                        <p className="text-xs text-gray-500">{t('profileFormat')}</p>
                    </div>
                </div>
            </div>

            {/* Business Name */}
            <div className="mb-6">
                <label className="block text-gray-900 mb-3 font-semibold">{t('businessNameLabel')}</label>
                <input
                    type="text"
                    value={businessName}
                    onChange={(e) => onBusinessNameChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={t('businessNamePlaceholder')}
                />
            </div>

            {/* Description */}
            <div className="mb-8">
                <label className="block text-gray-900 mb-3 font-semibold">{t('descriptionLabel')}</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows="5"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={t('descriptionPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-2">{t('charsRemaining', { count: 500 - description.length })}</p>
            </div>

            {/* Social Media */}
            <div className="space-y-6 mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="text-purple-600" size={24} />
                    {t('socialMediaLabel')}
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
                            placeholder={t('facebookPlaceholder')}
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
                            placeholder={t('instagramPlaceholder')}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                            <Globe size={18} className="text-green-600" />
                            {t('websiteLabel')}
                        </label>
                        <input
                            type="text"
                            value={website}
                            onChange={(e) => onWebsiteChange(e.target.value)}
                            placeholder={t('websitePlaceholder')}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={24} />
                    {t('locationLabel')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            {t('cityLabel')}
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                            placeholder={t('cityPlaceholder')}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            {t('addressLabel')}
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => onAddressChange(e.target.value)}
                            placeholder={t('addressPlaceholder')}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            {t('postalCodeLabel')}
                        </label>
                        <input
                            type="text"
                            value={postalCode}
                            onChange={handlePostalCodeChange}
                            placeholder={t('postalCodePlaceholder')}
                            maxLength={6}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('postalCodeFormat')}</p>
                    </div>
                </div>
                {(city || address || postalCode) && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">
                            <MapPin className="inline w-4 h-4 mr-1 text-blue-600" />
                            <strong>{t('fullAddressLabel')}</strong> {address ? `${address}, ` : ''}{postalCode ? `${postalCode} ` : ''}{city || ''}
                        </p>
                    </div>
                )}
            </div>

            <button 
                onClick={onSave}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
                <Save className="w-5 h-5" />
                {t('saveBtn')}
            </button>
        </div>
    );
}



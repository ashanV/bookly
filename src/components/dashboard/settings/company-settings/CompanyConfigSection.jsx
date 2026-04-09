"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CompanyConfigSection({
    businessName,
    facebook,
    instagram,
    website,
    onBack,
    onEditClick,
    onSidebarClick,
    activeTab = 'details'
}) {
    const t = useTranslations('BusinessCompanyConfig');
    return (
        <div className="animate-fade-in text-left">
            {/* Breadcrumbs Header */}
            <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700"
                >
                    <ArrowLeft size={16} />
                    {t('btnBack')}
                </button>
                <span className="text-gray-300">|</span>
                <span>{t('workspaceSettings')}</span>
                <span className="text-gray-300">•</span>
                <span className="font-semibold text-gray-900">{t('companyConfig')}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">{t('companyConfig')}</h2>
                        <nav className="space-y-1">
                            <button
                                onClick={() => onSidebarClick && onSidebarClick('details')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {t('companyDetails')}
                            </button>
                            <button
                                onClick={() => onSidebarClick && onSidebarClick('locations')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'locations' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {t('locations')}
                            </button>
                        </nav>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-gray-900 mb-3 px-2 uppercase tracking-wider">{t('shortcuts')}</h2>
                        <nav className="space-y-1">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>{t('serviceMenu')}</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>{t('productList')}</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>{t('passes')}</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors group">
                                <span>{t('clientList')}</span>
                                <span className="text-gray-300 group-hover:text-gray-500">↗</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('companyDetails')}</h1>
                        <p className="text-gray-500">
                            {t('companyConfigDesc')}
                        </p>
                    </div>

                    {/* Company Info Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-gray-900">{t('companyInfo')}</h3>
                                <button
                                    onClick={onEditClick}
                                    className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('btnChange')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">{t('companyName')}</div>
                                    <div className="text-gray-500">{businessName}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">{t('country')}</div>
                                    <div className="text-gray-500">{t('countryPoland')}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">{t('currency')}</div>
                                    <div className="text-gray-500">{t('currencyPLN')}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">{t('tax')}</div>
                                    <div className="text-gray-500">{t('pricesIncludeTax')}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">{t('defaultTeamLanguage')}</div>
                                    <div className="text-gray-500">{t('langPolish')}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-1">{t('defaultClientLanguage')}</div>
                                    <div className="text-gray-500">{t('langPolish')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* External Links Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('externalLinks')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <div className="font-medium text-gray-900 mb-1">{t('fb')}</div>
                                {facebook ? (
                                    <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline block truncate">{facebook}</a>
                                ) : (
                                    <button className="text-purple-600 hover:underline font-medium text-sm">{t('btnAdd')}</button>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">{t('twitter')}</div>
                                <button className="text-purple-600 hover:underline font-medium text-sm">{t('btnAdd')}</button>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">{t('ig')}</div>
                                {instagram ? (
                                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline block truncate">{instagram}</a>
                                ) : (
                                    <button className="text-purple-600 hover:underline font-medium text-sm">{t('btnAdd')}</button>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 mb-1">{t('website')}</div>
                                {website ? (
                                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline block truncate">{website}</a>
                                ) : (
                                    <button className="text-purple-600 hover:underline font-medium text-sm">{t('btnAdd')}</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import {
    MessageSquare,
    Mail,
    Send,
    Clock,
    Calendar,
    Users,
    Plus,
    BarChart3,
    Settings,
    CheckCircle,
    AlertCircle,
    Gift,
    Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Marketing() {
    const t = useTranslations('BusinessMarketing');
    const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns', 'automations', 'templates'

    // Mock data
    const campaigns = [
        {
            id: 1,
            name: t('mockCamp1'),
            type: 'sms',
            status: 'sent',
            sent: 156,
            delivered: 154,
            clicks: 45,
            date: '2023-11-10'
        },
        {
            id: 2,
            name: t('mockCamp2'),
            type: 'email',
            status: 'scheduled',
            audience: 340,
            date: '2023-12-01'
        },
        {
            id: 3,
            name: t('mockCamp3'),
            type: 'sms',
            status: 'draft',
            date: '-'
        },
    ];

    const automations = [
        {
            id: 1,
            name: t('mockAuto1'),
            trigger: t('mockTrig1'),
            action: t('mockAct1'),
            status: 'active',
            stats: `${t('sent')} 45 ${t('thisMonth')}`
        },
        {
            id: 2,
            name: t('mockAuto2'),
            trigger: t('mockTrig2'),
            action: t('mockAct2'),
            status: 'active',
            stats: `${t('sent')} 128 ${t('thisMonth')}`
        },
        {
            id: 3,
            name: t('mockAuto3'),
            trigger: t('mockTrig3'),
            action: t('mockAct3'),
            status: 'paused',
            stats: `${t('sent')} 0`
        }
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('title')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('description')}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200 font-medium">
                    <Plus size={18} />
                    {t('createCampaign')}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white">
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'campaigns'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Send size={16} />
                    {t('tabCampaigns')}
                </button>
                <button
                    onClick={() => setActiveTab('automations')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'automations'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Zap size={16} />
                    {t('tabAutomations')}
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'templates'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MessageSquare size={16} />
                    {t('tabTemplates')}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {activeTab === 'campaigns' && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                        <CheckCircle size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{t('delivered')}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">98.5%</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <Users size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{t('reach')}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">1,240</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                                        <BarChart3 size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{t('conversion')}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">12.4%</p>
                            </div>
                        </div>

                        {/* Campaigns List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">{t('colCampaignName')}</th>
                                        <th className="px-6 py-4 font-medium">{t('colType')}</th>
                                        <th className="px-6 py-4 font-medium">{t('colStatus')}</th>
                                        <th className="px-6 py-4 font-medium">{t('colDate')}</th>
                                        <th className="px-6 py-4 font-medium text-right">{t('colResults')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{campaign.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${campaign.type === 'sms' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {campaign.type === 'sms' ? <MessageSquare size={12} /> : <Mail size={12} />}
                                                    {campaign.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                        campaign.status === 'scheduled' ? 'bg-violet-100 text-violet-700' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {campaign.status === 'sent' ? t('statusSent') :
                                                        campaign.status === 'scheduled' ? t('statusScheduled') : t('statusDraft')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{campaign.date}</td>
                                            <td className="px-6 py-4 text-right text-slate-600">
                                                {campaign.status === 'sent' ? (
                                                    <span>{campaign.delivered} {t('deliveredCount')} • {campaign.clicks} {t('clicks')}</span>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'automations' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {automations.map((auto) => (
                            <div key={auto.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${auto.status === 'active' ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{auto.name}</h3>
                                            <p className="text-xs text-slate-500">{auto.stats}</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${auto.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                                        }`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${auto.status === 'active' ? 'translate-x-4' : ''
                                            }`} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                                        <Clock size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{t('when')} <span className="font-medium text-slate-900">{auto.trigger}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                                        <Send size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{t('execute')} <span className="font-medium text-slate-900">{auto.action}</span></span>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                                    {t('editSettings')}
                                </button>
                            </div>
                        ))}

                        <button className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all min-h-[200px]">
                            <Plus size={32} className="mb-2" />
                            <span className="font-medium">{t('addNewAutomation')}</span>
                        </button>
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-violet-200 transition-colors cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS</span>
                                    <button className="text-slate-300 group-hover:text-violet-600">
                                        <Settings size={16} />
                                    </button>
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-2">{t('templateStandard')}</h4>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic border border-slate-100">
                                    {t('templateStandardText')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

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

export default function Marketing() {
    const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns', 'automations', 'templates'

    // Mock data
    const campaigns = [
        {
            id: 1,
            name: 'Promocja Listopadowa',
            type: 'sms',
            status: 'sent',
            sent: 156,
            delivered: 154,
            clicks: 45,
            date: '2023-11-10'
        },
        {
            id: 2,
            name: 'Przypomnienie o świętach',
            type: 'email',
            status: 'scheduled',
            audience: 340,
            date: '2023-12-01'
        },
        {
            id: 3,
            name: 'Nowa usługa - Masaż',
            type: 'sms',
            status: 'draft',
            date: '-'
        },
    ];

    const automations = [
        {
            id: 1,
            name: 'Życzenia urodzinowe',
            trigger: 'Urodziny klienta',
            action: 'Wyślij SMS z kodem -20%',
            status: 'active',
            stats: 'Wysłano: 45 w tym miesiącu'
        },
        {
            id: 2,
            name: 'Przypomnienie o wizycie',
            trigger: '24h przed wizytą',
            action: 'Wyślij SMS przypominający',
            status: 'active',
            stats: 'Wysłano: 128 w tym miesiącu'
        },
        {
            id: 3,
            name: 'Odzyskiwanie klienta',
            trigger: 'Brak wizyty przez 90 dni',
            action: 'Wyślij Email "Tęsknimy"',
            status: 'paused',
            stats: 'Wysłano: 0'
        }
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Marketing i Automatyzacja</h2>
                    <p className="text-slate-500 text-sm mt-1">Zarządzaj kampaniami SMS/Email i buduj relacje z klientami</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200 font-medium">
                    <Plus size={18} />
                    Utwórz kampanię
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
                    Kampanie
                </button>
                <button
                    onClick={() => setActiveTab('automations')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'automations'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Zap size={16} />
                    Automatyzacje
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'templates'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MessageSquare size={16} />
                    Szablony
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
                                    <span className="text-sm font-medium text-slate-600">Dostarczone</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">98.5%</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <Users size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">Zasięg</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">1,240</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                                        <BarChart3 size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">Konwersja</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">12.4%</p>
                            </div>
                        </div>

                        {/* Campaigns List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Nazwa kampanii</th>
                                        <th className="px-6 py-4 font-medium">Typ</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Data</th>
                                        <th className="px-6 py-4 font-medium text-right">Wyniki</th>
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
                                                    {campaign.status === 'sent' ? 'Wysłana' :
                                                        campaign.status === 'scheduled' ? 'Zaplanowana' : 'Szkic'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{campaign.date}</td>
                                            <td className="px-6 py-4 text-right text-slate-600">
                                                {campaign.status === 'sent' ? (
                                                    <span>{campaign.delivered} dostarczono • {campaign.clicks} kliknięć</span>
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
                                        <span className="text-slate-600">Kiedy: <span className="font-medium text-slate-900">{auto.trigger}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                                        <Send size={16} className="text-slate-400" />
                                        <span className="text-slate-600">Wykonaj: <span className="font-medium text-slate-900">{auto.action}</span></span>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                                    Edytuj ustawienia
                                </button>
                            </div>
                        ))}

                        <button className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all min-h-[200px]">
                            <Plus size={32} className="mb-2" />
                            <span className="font-medium">Dodaj nową automatyzację</span>
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
                                <h4 className="font-semibold text-slate-900 mb-2">Przypomnienie standard</h4>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic border border-slate-100">
                                    "Cześć [Imie], przypominamy o wizycie w Bookly jutro o [Godzina]. Do zobaczenia!"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

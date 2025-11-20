import React, { useState } from 'react';
import {
    Phone,
    Mail,
    Calendar,
    Clock,
    MapPin,
    Star,
    MoreVertical,
    Edit,
    Trash2,
    MessageSquare,
    FileText,
    Ban,
    Tag,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    Gift,
    Award,
    Image
} from 'lucide-react';
import ClientGallery from './ClientGallery';

export default function ClientDetails({ client, onBack }) {
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'notes', 'info', 'loyalty', 'gallery'

    if (!client) return null;

    // Mock history data
    const history = [
        { id: 1, service: 'Strzyżenie damskie', date: '2023-11-15', time: '14:00', price: 120, status: 'completed', employee: 'Anna K.' },
        { id: 2, service: 'Koloryzacja', date: '2023-10-01', time: '10:00', price: 350, status: 'completed', employee: 'Marta W.' },
        { id: 3, service: 'Modelowanie', date: '2023-09-15', time: '16:30', price: 80, status: 'cancelled', employee: 'Anna K.' },
    ];

    const loyaltyHistory = [
        { id: 1, action: 'Wizyta: Strzyżenie', points: 12, date: '2023-11-15', type: 'earned' },
        { id: 2, action: 'Odbiór nagrody: Zniżka -20%', points: -200, date: '2023-11-01', type: 'spent' },
        { id: 3, action: 'Wizyta: Koloryzacja', points: 35, date: '2023-10-01', type: 'earned' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} /> Zrealizowana</span>;
            case 'cancelled':
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Anulowana</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"><Clock size={12} /> Oczekująca</span>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-200">
                            {client.avatar}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{client.firstName} {client.lastName}</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> {client.rating}.0</span>
                                <span>•</span>
                                <span>{client.visits} wizyt</span>
                                <span>•</span>
                                <span className="text-violet-600 font-medium">VIP</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Edit size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Ban size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href={`tel:${client.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-violet-600 shadow-sm transition-colors">
                            <Phone size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Telefon</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{client.phone}</p>
                        </div>
                    </a>
                    <a href={`mailto:${client.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-violet-600 shadow-sm transition-colors">
                            <Mail size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Email</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{client.email}</p>
                        </div>
                    </a>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-violet-600 shadow-sm transition-colors">
                            <Tag size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Ostatnia wizyta</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{client.lastVisit}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Historia wizyt
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'notes'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Notatki
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Dane klienta
                </button>
                <button
                    onClick={() => setActiveTab('loyalty')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'loyalty'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Program lojalnościowy
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'gallery'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Galeria i Dokumenty
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {history.map((visit) => (
                            <div key={visit.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-slate-100">
                                        <span className="text-xs font-bold">{visit.date.split('-')[2]}</span>
                                        <span className="text-[10px] uppercase">{new Date(visit.date).toLocaleString('pl-PL', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{visit.service}</h4>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock size={14} /> {visit.time}</span>
                                            <span>•</span>
                                            <span>{visit.employee}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px]">
                                    <span className="font-bold text-slate-900">{visit.price} zł</span>
                                    {getStatusBadge(visit.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-amber-900 mb-1">Ważne informacje</h4>
                                    <p className="text-amber-800 text-sm leading-relaxed">
                                        {client.notes || "Brak ważnych uwag."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Notatki personelu</h3>
                                <button className="text-sm text-violet-600 font-medium hover:text-violet-700 flex items-center gap-1">
                                    <Edit size={14} /> Dodaj notatkę
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-slate-600 text-sm mb-3">Klientka prosiła o delikatniejszy masaż głowy przy myciu.</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Dodano: 15.11.2023</span>
                                        <span>Anna K.</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-slate-600 text-sm mb-3">Preferuje produkty marki Kerastase.</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Dodano: 10.10.2023</span>
                                        <span>Marta W.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Imię i nazwisko</label>
                                    <div className="text-slate-900 font-medium">{client.firstName} {client.lastName}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Data urodzenia</label>
                                    <div className="text-slate-900 font-medium">12.05.1990</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Telefon</label>
                                    <div className="text-slate-900 font-medium">{client.phone}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                    <div className="text-slate-900 font-medium">{client.email}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Adres</label>
                                    <div className="text-slate-900 font-medium">ul. Kwiatowa 15/4, 00-001 Warszawa</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Zgody marketingowe</label>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">SMS: Tak</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Email: Tak</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="font-semibold text-slate-900 mb-4">Statystyki finansowe</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-slate-900">{client.totalSpent} zł</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Całkowity wydatki</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-slate-900">{Math.round(client.totalSpent / client.visits)} zł</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Średnia wartość wizyty</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-slate-900">0</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">No-show</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'loyalty' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-violet-100 text-sm font-medium mb-1">Dostępne punkty</p>
                                    <h3 className="text-4xl font-bold">450 pkt</h3>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Gift size={24} className="text-white" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-violet-100 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                <Award size={16} />
                                <span>Brakuje 50 pkt do darmowego strzyżenia</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Historia punktów</h4>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {loyaltyHistory.map((item) => (
                                        <div key={item.id} className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{item.action}</p>
                                                <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                                            </div>
                                            <span className={`font-bold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.type === 'earned' ? '+' : ''}{item.points}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <ClientGallery />
                )}
            </div>
        </div>
    );
}

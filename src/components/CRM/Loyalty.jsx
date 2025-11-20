import React, { useState } from 'react';
import { Gift, Award, Settings, Plus, Edit, Trash2, Star, TrendingUp } from 'lucide-react';

export default function Loyalty() {
    const [activeTab, setActiveTab] = useState('rewards'); // 'rewards', 'rules'

    const rewards = [
        { id: 1, name: 'Darmowe strzyżenie', points: 500, description: 'Darmowe strzyżenie męskie lub damskie' },
        { id: 2, name: '-20% na kosmetyki', points: 200, description: 'Zniżka na dowolny produkt' },
        { id: 3, name: 'Masaż głowy gratis', points: 150, description: 'Dodatek do dowolnej usługi' },
    ];

    const rules = [
        { id: 1, name: 'Punkty za wizytę', points: 10, type: 'per_visit', description: 'Stała liczba punktów za każdą wizytę' },
        { id: 2, name: 'Punkty za wydane zł', points: 1, type: 'per_spent', description: '1 punkt za każde wydane 10 zł' },
        { id: 3, name: 'Bonus urodzinowy', points: 50, type: 'bonus', description: 'Dodatkowe punkty w dniu urodzin' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Program Lojalnościowy</h2>
                    <p className="text-slate-500 text-sm mt-1">Konfiguruj zasady przyznawania punktów i nagrody</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Program aktywny
                </div>
            </div>

            <div className="flex border-b border-slate-200 px-6 bg-white">
                <button
                    onClick={() => setActiveTab('rewards')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rewards'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Gift size={16} />
                    Nagrody
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rules'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Settings size={16} />
                    Zasady punktowania
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {activeTab === 'rewards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards.map((reward) => (
                            <div key={reward.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                        <Gift size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                                        <Star size={14} fill="currentColor" />
                                        {reward.points} pkt
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{reward.name}</h3>
                                <p className="text-slate-500 text-sm mb-4">{reward.description}</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                                        Edytuj
                                    </button>
                                    <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all min-h-[200px]">
                            <Plus size={32} className="mb-2" />
                            <span className="font-medium">Dodaj nową nagrodę</span>
                        </button>
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="space-y-4">
                        {rules.map((rule) => (
                            <div key={rule.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{rule.name}</h4>
                                        <p className="text-sm text-slate-500">{rule.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block font-bold text-slate-900 text-lg">+{rule.points} pkt</span>
                                        <span className="text-xs text-slate-400 uppercase">{rule.type === 'per_spent' ? 'za 10 zł' : 'jednorazowo'}</span>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-violet-600 transition-colors">
                                        <Edit size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
                            <Plus size={18} />
                            Dodaj nową regułę
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

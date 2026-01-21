import React from 'react';
import { Trash2, Mail, Lock, Unlock, Download, X } from 'lucide-react';

export default function BulkActionsBar({
    selectedCount,
    onClearSelection,
    onDelete,
    onBlock,
    onUnblock,
    onEmail,
    onExport
}) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#131B2C] border border-gray-700/50 rounded-2xl shadow-2xl p-2 pl-6 flex items-center gap-6 backdrop-blur-xl ring-1 ring-white/10">

                <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
                    <div className="bg-purple-500/20 text-purple-400 font-bold px-3 py-1 rounded-lg text-sm">
                        {selectedCount}
                    </div>
                    <span className="text-gray-300 text-sm font-medium">Zaznaczono</span>
                    <button
                        onClick={onClearSelection}
                        className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors"
                        title="Anuluj wybór"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onBlock}
                        className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] group"
                        title="Zablokuj"
                    >
                        <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium opacity-70">Zablokuj</span>
                    </button>

                    <button
                        onClick={onUnblock}
                        className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] group"
                        title="Odblokuj"
                    >
                        <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium opacity-70">Odblokuj</span>
                    </button>

                    <div className="w-px h-8 bg-gray-700 mx-1"></div>

                    <button
                        onClick={onEmail}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] group"
                        title="Wyślij Email"
                    >
                        <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium opacity-70">Email</span>
                    </button>

                    <button
                        onClick={onExport}
                        className="p-2 text-gray-300 hover:bg-gray-700 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] group"
                        title="Eksportuj CSV"
                    >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium opacity-70">Eksport</span>
                    </button>

                    <div className="w-px h-8 bg-gray-700 mx-1"></div>

                    <button
                        onClick={onDelete}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] group"
                        title="Usuń"
                    >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium opacity-70">Usuń</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { X, AlertTriangle, Lock } from 'lucide-react';

export default function BlockUserModal({ isOpen, onClose, user, onConfirm, count }) {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(reason);
            // Modal close handled by parent or onSuccess
            setReason('');
        } catch (error) {
            console.error('Block failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0B0F19] border border-red-500/20 rounded-2xl shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-red-500" />
                        Zablokuj Użytkownika
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-200">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">
                                {user ? 'Czy na pewno chcesz zablokować to konto?' : `Czy na pewno chcesz zablokować ${count} użytkowników?`}
                            </p>
                            <p className="opacity-80">
                                {user ? (
                                    <>Użytkownik <strong>{user.firstName} {user.lastName}</strong> ({user.email}) straci dostęp do sytemu.</>
                                ) : (
                                    <>Wybrani użytkownicy stracą dostęp do systemu.</>
                                )}
                                {' '}Wszystkie aktywne sesje zostaną natychmiast zakończone.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Powód blokady (opcjonalne)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Wpisz powód zablokowania konta..."
                            className="w-full h-24 bg-[#131B2C] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-[#0f111a]/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Blokowanie...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Potwierdź blokadę
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

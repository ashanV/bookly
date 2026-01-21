import React, { useState } from 'react';
import { X, CheckCircle, Unlock } from 'lucide-react';

export default function UnblockUserModal({ isOpen, onClose, user, onConfirm, count }) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            // Modal close handled by parent or onSuccess
        } catch (error) {
            console.error('Unblock failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0B0F19] border border-emerald-500/20 rounded-2xl shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Unlock className="w-5 h-5 text-emerald-500" />
                        Odblokuj Użytkownika
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 text-emerald-200">
                        <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">
                                {user ? 'Czy na pewno chcesz odblokować to konto?' : `Czy na pewno chcesz odblokować ${count} użytkowników?`}
                            </p>
                            <p className="opacity-80">
                                {user ? (
                                    <>Użytkownik <strong>{user.firstName} {user.lastName}</strong> ({user.email}) odzyska dostęp do systemu.</>
                                ) : (
                                    <>Wybrani użytkownicy odzyskają dostęp do systemu.</>
                                )}
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400">
                        Użytkownik otrzyma automatyczną wiadomość email z informacją o odblokowaniu konta.
                    </p>
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
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Odblokowywanie...
                            </>
                        ) : (
                            <>
                                <Unlock className="w-4 h-4" />
                                Potwierdź
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert, Archive } from 'lucide-react';

export default function DeleteUserModal({ isOpen, onClose, user, onConfirm, count }) {
    const [deletionType, setDeletionType] = useState('soft'); // soft, anonymize, hard
    const [confirmed, setConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!confirmed && deletionType !== 'soft') return;

        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(user?._id, deletionType);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Wystąpił błąd podczas usuwania');
        } finally {
            setIsLoading(false);
        }
    };

    const hasBusiness = user?.stats?.isBusinessOwner;
    const hasReservations = user?.stats?.reservations > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0B0F19] border border-red-500/20 rounded-2xl shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        {user ? 'Usuń Użytkownika' : `Usuń ${count} Użytkowników`}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Info */}
                    {user ? (
                        <div className="flex items-center gap-4 p-4 bg-[#131B2C] rounded-xl border border-gray-800">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                                <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-[#131B2C] rounded-xl border border-gray-800 text-center">
                            <div className="text-white font-medium">Wybrano {count} użytkowników</div>
                            <div className="text-sm text-gray-400">Wybrana akcja zostanie zastosowana do wszystkich zaznaczonych kont.</div>
                        </div>
                    )}

                    {/* Warning for Dependencies */}
                    {(hasBusiness || hasReservations) && (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3 text-orange-200">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
                            <div className="text-sm">
                                <p className="font-semibold mb-1">Uwaga! Powiązane dane:</p>
                                <ul className="list-disc list-inside opacity-80 space-y-1">
                                    {hasBusiness && <li>Użytkownik jest właścicielem firmy.</li>}
                                    {hasReservations && <li>Liczba rezerwacji: {user.stats.reservations}</li>}
                                </ul>
                                <p className="mt-2 text-xs opacity-70">
                                    Usunięcie może wpłynąć na integralność danych historycznych.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Deletion Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-400">Wybierz tryb usuwania:</label>

                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deletionType === 'soft' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[#131B2C] border-gray-800 hover:border-gray-700'}`}>
                            <input
                                type="radio"
                                name="deletionType"
                                value="soft"
                                checked={deletionType === 'soft'}
                                onChange={(e) => setDeletionType(e.target.value)}
                                className="mt-1"
                            />
                            <div>
                                <div className={`font-medium ${deletionType === 'soft' ? 'text-blue-400' : 'text-gray-300'}`}>Soft Delete (Zalecane)</div>
                                <div className="text-xs text-gray-500 mt-1">Oznacza konto jako usunięte, zachowując dane w bazie. Konto staje się nieaktywne.</div>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deletionType === 'anonymize' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-[#131B2C] border-gray-800 hover:border-gray-700'}`}>
                            <input
                                type="radio"
                                name="deletionType"
                                value="anonymize"
                                checked={deletionType === 'anonymize'}
                                onChange={(e) => setDeletionType(e.target.value)}
                                className="mt-1"
                            />
                            <div>
                                <div className={`font-medium ${deletionType === 'anonymize' ? 'text-purple-400' : 'text-gray-300'}`}>Anonimizacja (RODO)</div>
                                <div className="text-xs text-gray-500 mt-1">Zastępuje dane osobowe losowymi ciągami znaków. Zachowuje statystyki, ale usuwa tożsamość. Nieodwracalne.</div>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deletionType === 'hard' ? 'bg-red-500/10 border-red-500/50' : 'bg-[#131B2C] border-gray-800 hover:border-gray-700'}`}>
                            <input
                                type="radio"
                                name="deletionType"
                                value="hard"
                                checked={deletionType === 'hard'}
                                onChange={(e) => setDeletionType(e.target.value)}
                                className="mt-1"
                            />
                            <div>
                                <div className={`font-medium ${deletionType === 'hard' ? 'text-red-400' : 'text-gray-300'}`}>Hard Delete (Trwałe)</div>
                                <div className="text-xs text-gray-500 mt-1">Całkowicie usuwa rekord z bazy danych. Może spowodować błędy w powiązanych rekordach. Nieodwracalne.</div>
                            </div>
                        </label>
                    </div>

                    {/* Confirmation Checkbox for Destructive Actions */}
                    {deletionType !== 'soft' && (
                        <div className="flex items-start gap-3 p-4 bg-red-900/10 rounded-xl border border-red-900/20">
                            <input
                                type="checkbox"
                                id="confirmDelete"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
                            />
                            <label htmlFor="confirmDelete" className="text-sm text-gray-300 cursor-pointer select-none">
                                Rozumiem, że ta operacja jest <strong>nieodwracalna</strong> i trwale usunie lub zanonimizuje dane użytkownika.
                            </label>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
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
                        onClick={handleSubmit}
                        disabled={isLoading || (deletionType !== 'soft' && !confirmed)}
                        className={`px-4 py-2 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg 
                            ${deletionType === 'hard' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' :
                                deletionType === 'anonymize' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20' :
                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        {deletionType === 'soft' ? 'Archiwizuj' : 'Usuń / Anonimizuj'}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { X, KeyRound, Link as LinkIcon, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';

export default function ResetPasswordModal({ isOpen, onClose, targetName, targetEmail, onConfirm }) {
    const [action, setAction] = useState('link'); // link, force, temp
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null); // { tempPassword: '...' } or success message

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const response = await onConfirm(action);
            if (response && response.tempPassword) {
                setResult(response);
            } else if (response && response.success) {
                onClose(); // Close if no result result (e.g. force reset)
            } else {
                // If the callback returns data but not tempPassword, maybe we just show success state?
                // For 'link' and 'force', we usually just want to close or show toast.
                // Let's assume onConfirm handles toasts for success, but returns data for temp password.
                if (action === 'temp') {
                    // Wait for result
                } else {
                    onClose();
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const CopyButton = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Kopiuj">
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0B0F19] border border-gray-800 rounded-2xl shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-purple-500" />
                        Resetowanie Hasła
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!result ? (
                        <>
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <p className="text-sm text-purple-200">
                                    Wybierz metodę resetowania hasła dla <strong>{targetName}</strong> ({targetEmail}).
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${action === 'link' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-[#131B2C] border-gray-800 hover:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="resetAction"
                                        value="link"
                                        checked={action === 'link'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className={`font-medium flex items-center gap-2 ${action === 'link' ? 'text-purple-400' : 'text-gray-300'}`}>
                                            <LinkIcon className="w-4 h-4" />
                                            Wyślij link resetujący
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Użytkownik otrzyma wiadomość email z linkiem pozwalającym na ustawienie nowego hasła.
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${action === 'force' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[#131B2C] border-gray-800 hover:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="resetAction"
                                        value="force"
                                        checked={action === 'force'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className={`font-medium flex items-center gap-2 ${action === 'force' ? 'text-blue-400' : 'text-gray-300'}`}>
                                            <ShieldAlert className="w-4 h-4" />
                                            Wymuś zmianę przy logowaniu
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Użytkownik zostanie poproszony o zmianę hasła podczas następnej próby logowania.
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${action === 'temp' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-[#131B2C] border-gray-800 hover:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="resetAction"
                                        value="temp"
                                        checked={action === 'temp'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className={`font-medium flex items-center gap-2 ${action === 'temp' ? 'text-amber-400' : 'text-gray-300'}`}>
                                            <Sparkles className="w-4 h-4" />
                                            Wygeneruj hasło tymczasowe
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            System wygeneruje nowe, losowe hasło i wyświetli je tutaj. Zostanie również wysłane mailem.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sukces!</h3>
                                <p className="text-gray-400">Hasło zostało zresetowane.</p>
                            </div>

                            {result.tempPassword && (
                                <div className="p-6 bg-[#131B2C] border border-amber-500/30 rounded-2xl">
                                    <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2 block">
                                        Nowe Hasło Tymczasowe
                                    </label>
                                    <div className="flex items-center justify-between gap-4 p-3 bg-black/30 rounded-xl border border-gray-800">
                                        <code className="text-xl font-mono text-white tracking-widest">
                                            {result.tempPassword}
                                        </code>
                                        <CopyButton text={result.tempPassword} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Skopiuj i przekaż to hasło użytkownikowi.
                                        <br />Zostało ono również wysłane na adres email.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-[#0f111a]/50 rounded-b-2xl">
                    {!result ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                disabled={isLoading}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Przetwarzanie...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" />
                                        Wykonaj
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Zamknij
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

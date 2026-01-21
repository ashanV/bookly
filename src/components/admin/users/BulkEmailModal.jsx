import React, { useState } from 'react';
import { Mail, Send, X, Loader2 } from 'lucide-react';

export default function BulkEmailModal({ isOpen, onClose, selectedCount, onSend }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await onSend(subject, message);
            onClose();
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error('Send failed', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#131B2C] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Wyślij wiadomość</h2>
                            <p className="text-gray-400 text-sm">Do {selectedCount} użytkowników</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Temat wiadomości
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 bg-black/20 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Wpisz temat..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Treść wiadomości
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 bg-black/20 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors min-h-[150px] resize-none"
                                placeholder="Wpisz treść wiadomości..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Wiadomość zostanie wysłana jako osobny e-mail do każdego z zaznaczonych użytkowników.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-medium"
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                disabled={isSending || !subject.trim() || !message.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Wysyłanie...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Wyślij
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

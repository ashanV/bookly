'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminChatWindow from '@/components/chat/AdminChatWindow';
import { MessageSquare, Clock, CheckCircle, XCircle, User, AlertTriangle, MoreHorizontal, Trash2, Lock, RotateCcw } from 'lucide-react';
import { useCsrf } from '@/hooks/useCsrf';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSupportPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const menuRef = useRef(null);
    const { secureFetch } = useCsrf();
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [filter]);

    // Subskrypcja Pusher dla aktualizacji na żywo
    useEffect(() => {
        if (!isConnected || !socket) return;

        const channel = socket.subscribe('admin-support');

        if (channel) {
            // Nowa konwersacja
            channel.bind('new-conversation', (data) => {
                setConversations(prev => {
                    // Sprawdź czy już nie mamy tej konwersacji
                    const newId = String(data.conversation._id || data.conversation.id);
                    if (prev.some(c => String(c._id || c.id) === newId)) return prev;
                    return [data.conversation, ...prev];
                });
            });

            // Aktualizacja statusu
            channel.bind('conversation-updated', (data) => {
                setConversations(prev => prev.map(c => {
                    if (String(c._id || c.id) === String(data.id)) {
                        return { ...c, status: data.status };
                    }
                    return c;
                }));
            });

            // Usunięcie konwersacji (trwałe)
            channel.bind('conversation-deleted', (data) => {
                setConversations(prev => prev.filter(c => String(c._id || c.id) !== String(data.id)));
            });

            // Nowa wiadomość (aktualizacja licznika i czasu)
            channel.bind('message-received', (data) => {
                setConversations(prev => {
                    const updated = prev.map(c => {
                        if (String(c._id || c.id) === String(data.conversationId)) {
                            return {
                                ...c,
                                lastMessageAt: data.lastMessageAt,
                                lastMessageBy: data.lastMessageBy,
                                status: data.status,
                                unreadCount: data.unreadCount
                            };
                        }
                        return c;
                    });
                    // Przesuń na górę listę jeśli wiadomość jest nowa
                    const targetIdx = updated.findIndex(c => String(c._id || c.id) === String(data.conversationId));
                    if (targetIdx > 0) {
                        const target = updated.splice(targetIdx, 1)[0];
                        return [target, ...updated];
                    }
                    return updated;
                });
            });
        }

        return () => {
            if (channel) {
                channel.unbind_all();
                socket.unsubscribe('admin-support');
            }
        };
    }, [isConnected, socket]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const url = `/api/chat/conversations?role=admin`; // Pobieraj wszystkie dla poprawnego openCount
            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();
            if (response.ok) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Błąd pobierania konwersacji:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityInfo = (priority) => {
        switch (priority) {
            case 'high': return { text: 'Wysoki', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle };
            case 'medium': return { text: 'Średni', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock };
            case 'low': return { text: 'Niski', color: 'bg-green-500/20 text-green-400', icon: CheckCircle };
            default: return { text: priority, color: 'bg-gray-500/20 text-gray-400', icon: MessageSquare };
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'open': return { text: 'Otwarte', color: 'text-blue-400' };
            case 'in_progress': return { text: 'W trakcie', color: 'text-yellow-400' };
            case 'waiting': return { text: 'Oczekuje', color: 'text-orange-400' };
            case 'closed': return { text: 'Zamknięte', color: 'text-red-500 font-bold' };
            case 'resolved': return { text: 'Rozwiązane', color: 'text-green-400' };
            case 'deleted': return { text: 'W koszu', color: 'text-gray-500 italic' };
            default: return { text: status, color: 'text-gray-400' };
        }
    };

    const handleOpenChat = (conversation) => {
        setSelectedConversation(conversation);
    };

    const handleCloseChat = () => {
        setSelectedConversation(null);
        fetchConversations(); // Odśwież listę
    };

    const handleUpdate = () => {
        fetchConversations();
    };

    const handleAction = async (e, convId, action) => {
        e.stopPropagation();
        const conv = conversations.find(c => (c._id || c.id) === convId);
        const currentStatus = conv?.status;

        if (action === 'delete') {
            const confirmMessage = currentStatus === 'deleted'
                ? 'Czy na pewno chcesz TRWALE usunąć tę konwersację? Wszystkie wiadomości zostaną bezpowrotnie skasowane.'
                : 'Czy na pewno chcesz przenieść tę konwersację do kosza?';

            if (!confirm(confirmMessage)) return;

            try {
                const response = await secureFetch(`/api/chat/conversations/${convId}`, { method: 'DELETE' });
                if (response.ok) fetchConversations();
            } catch (err) { console.error(err); }
        } else if (action === 'close' || action === 'restore') {
            const newStatus = action === 'restore' ? 'open' : 'closed';
            try {
                const response = await secureFetch(`/api/chat/conversations/${convId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (response.ok) fetchConversations();
            } catch (err) { console.error(err); }
        }
        setActiveMenuId(null);
    };

    const displayConversations = filter === 'all'
        ? conversations.filter(c => c.status !== 'closed' && c.status !== 'deleted')
        : conversations.filter(c => c.status === filter);

    const openCount = conversations.filter(c => c.status === 'open').length;

    return (
        <>
            <AdminHeader title="Zgłoszenia" subtitle={`${openCount} otwartych zgłoszeń`} />

            <div className="p-6 space-y-6">
                <div className="flex gap-2">
                    {['all', 'open', 'in_progress', 'closed', 'deleted'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${filter === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' && 'Aktywne'}
                            {f === 'open' && 'Otwarte'}
                            {f === 'in_progress' && 'W toku'}
                            {f === 'closed' && 'Zamknięte'}
                            {f === 'deleted' && (
                                <>
                                    <Trash2 size={14} />
                                    <span>Kosz</span>
                                </>
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Ładowanie...</div>
                    ) : displayConversations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">Brak zgłoszeń</div>
                    ) : (
                        displayConversations.map(conversation => {
                            const priority = getPriorityInfo(conversation.priority);
                            const status = getStatusInfo(conversation.status);
                            const PriorityIcon = priority.icon;
                            const convId = conversation._id || conversation.id;
                            const activeStatus = conversation.status;

                            return (
                                <div key={convId} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-medium text-white">{conversation.subject}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${priority.color}`}>
                                                    <PriorityIcon className="w-3 h-3 inline mr-1" />
                                                    {priority.text}
                                                </span>
                                                {conversation.unreadCount > 0 && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                                                        {conversation.unreadCount} nowych
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1"><User className="w-4 h-4" />{conversation.userName}</span>
                                                {conversation.userEmail && (
                                                    <span>{conversation.userEmail}</span>
                                                )}
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(conversation.lastMessageAt || conversation.createdAt).toLocaleString('pl-PL')}</span>
                                                <span className={status.color}>{status.text}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenChat(conversation)}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
                                            >
                                                <MessageSquare size={16} />
                                                Otwórz chat
                                            </button>

                                            <div ref={activeMenuId === convId ? menuRef : null} className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === convId ? null : convId);
                                                    }}
                                                    className={`p-2 rounded-xl transition-all ${activeMenuId === convId ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>

                                                <AnimatePresence>
                                                    {activeMenuId === convId && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                                                        >
                                                            {conversation.status !== 'closed' && (
                                                                <button
                                                                    onClick={(e) => handleAction(e, convId, 'close')}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                                                >
                                                                    <Lock size={16} className="text-amber-400" />
                                                                    <span>Zamknij konwersację</span>
                                                                </button>
                                                            )}
                                                            {activeStatus === 'deleted' && (
                                                                <button
                                                                    onClick={(e) => handleAction(e, convId, 'restore')}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-3 transition-colors"
                                                                >
                                                                    <RotateCcw size={16} />
                                                                    <span>Przywróć</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => handleAction(e, convId, 'delete')}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                                <span>{activeStatus === 'deleted' ? 'Usuń trwale' : 'Przenieś do kosza'}</span>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {selectedConversation && (
                <AdminChatWindow
                    conversation={selectedConversation}
                    onClose={handleCloseChat}
                    onUpdate={handleUpdate}
                />
            )}
        </>
    );
}

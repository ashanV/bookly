'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminChatWindow from '@/components/chat/AdminChatWindow';
import { MessageSquare, Clock, CheckCircle, XCircle, User, AlertTriangle, MoreHorizontal, Trash2, Lock, RotateCcw, Timer, X, Check } from 'lucide-react';
import { useCsrf } from '@/hooks/useCsrf';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import SupportStats from '@/components/admin/support/SupportStats';

export default function AdminSupportPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'appeals'
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const menuRef = useRef(null);
    const { secureFetch } = useCsrf();
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);

    // Ref for selected conversation to usage in socket listeners without stale closure
    const selectedConversationRef = useRef(null);
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

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
        fetchAdmins();

        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }, [filter]);

    // Simple beep sound setup
    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Subtle ping
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.error('Audio setup failed', e);
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await fetch('/api/admin/roles', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.admins || []);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        }
    };

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

            // Aktualizacja statusu lub przypisania
            channel.bind('conversation-updated', (data) => {
                setConversations(prev => prev.map(c => {
                    if (String(c._id || c.id) === String(data.id)) {
                        return {
                            ...c,
                            status: data.status || c.status,
                            supportId: data.supportId !== undefined ? data.supportId : c.supportId,
                            supportName: data.supportName !== undefined ? data.supportName : c.supportName
                        };
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
                // Powiadomienia
                // Powiadomienia
                const isHidden = document.hidden;
                // Use Ref to get current selected conversation without closure staleness
                const currentConv = selectedConversationRef.current;
                const isOtherChat = currentConv?._id !== data.conversationId && currentConv?.id !== data.conversationId;

                if (isHidden || isOtherChat) {
                    playNotificationSound();

                    if (isHidden && Notification.permission === "granted") {
                        new Notification("Nowa wiadomość w Bookly Support", {
                            body: `Nowa wiadomość od użytkownika`, // Można rozszerzyć o treść jeśli dostępna
                            icon: "/icons/icon-192x192.png" // Opcjonalnie
                        });
                    }
                }

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
                const convs = data.conversations || [];
                setConversations(convs);
            }
        } catch (error) {
            console.error('Błąd pobierania konwersacji:', error);
        } finally {
            setLoading(false);
        }
    };

    // Synchronizuj wybrany chat z listą (np. dla auto-przypisania)
    useEffect(() => {
        if (!selectedConversation) return;
        const updated = conversations.find(c =>
            String(c._id || c.id) === String(selectedConversation._id || selectedConversation.id)
        );

        if (updated) {
            // Aktualizuj tylko jeśli są istotne różnice, aby uniknąć pętli
            if (updated.status !== selectedConversation.status ||
                updated.supportId !== selectedConversation.supportId ||
                updated.unreadCount !== selectedConversation.unreadCount) {
                setSelectedConversation(updated);
            }
        }
    }, [conversations]);

    const getSLATimer = (conversation) => {
        // Jeśli ostatnia wiadomość była od supportu lub bota, klient nie czeka
        if (conversation.lastMessageBy === 'support' || conversation.status === 'closed') return null;

        const lastMsgTime = new Date(conversation.lastMessageAt || conversation.createdAt).getTime();
        const now = new Date().getTime();
        const diffMs = now - lastMsgTime;

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const isOverdue = diffHours >= 2;

        return {
            text: `${diffHours}h ${diffMinutes}m`,
            isOverdue
        };
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

    const handleAssign = async (e, convId, adminId, adminName) => {
        e.stopPropagation();
        try {
            const response = await secureFetch(`/api/chat/conversations/${convId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supportId: adminId,
                    supportName: adminName
                })
            });
            if (response.ok) fetchConversations();
        } catch (err) { console.error(err); }
        setActiveMenuId(null);
    };

    const handleSelect = (e, id) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === displayConversations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(displayConversations.map(c => c._id || c.id));
        }
    };

    const handleBulkAction = async (action) => {
        if (!confirm(`Czy na pewno chcesz wykonać tę akcję dla ${selectedIds.length} zgłoszeń?`)) return;

        try {
            const response = await secureFetch('/api/chat/conversations/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    ids: selectedIds,
                    updateData: action === 'update_status' ? { status: 'closed' } : undefined
                })
            });

            if (response.ok) {
                setSelectedIds([]);
                fetchConversations();
            }
        } catch (error) {
            console.error('Błąd akcji masowej:', error);
        }
    };

    const displayConversations = (filter === 'all'
        ? conversations.filter(c => c.status !== 'closed' && c.status !== 'deleted')
        : filter === 'mine'
            ? conversations.filter(c => c.supportId === user?._id && c.status !== 'closed' && c.status !== 'deleted')
            : conversations.filter(c => c.status === filter)
    ).filter(c => {
        const isAppeal = c.category === 'blocked';
        return activeTab === 'appeals' ? isAppeal : !isAppeal;
    });

    const openCount = conversations.filter(c => c.status === 'open').length;

    return (
        <>
            <AdminHeader title="Zgłoszenia" subtitle={`${openCount} otwartych zgłoszeń`} />

            <div className="p-6 space-y-6">
                <SupportStats />



                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-900 rounded-xl mb-4 self-start max-w-md border border-gray-800">
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'messages'
                            ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Wiadomości
                    </button>
                    <button
                        onClick={() => setActiveTab('appeals')}
                        className={`flex-1 px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'appeals'
                            ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Odwołania
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={handleSelectAll}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${selectedIds.length > 0 && selectedIds.length === displayConversations.length ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'}`}
                            title="Zaznacz wszystko"
                        >
                            <Check size={20} className={selectedIds.length > 0 && selectedIds.length === displayConversations.length ? 'opacity-100' : 'opacity-0'} />
                        </button>
                        {['all', 'mine', 'open', 'in_progress', 'closed', 'deleted'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${filter === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {f === 'all' && 'Aktywne'}
                                {f === 'mine' && 'Moje zgłoszenia'}
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
                            const sla = getSLATimer(conversation);

                            return (
                                <div key={convId}
                                    className={`relative group bg-gray-900/50 border rounded-2xl p-5 transition-colors cursor-pointer ${selectedConversation?._id === convId ? 'border-purple-500 bg-purple-500/5' : 'border-gray-800 hover:border-gray-700'}`}
                                >
                                    {/* Checkbox */}
                                    <div
                                        onClick={(e) => handleSelect(e, convId)}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 cursor-pointer transition-opacity ${selectedIds.includes(convId) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.includes(convId) ? 'bg-purple-600 border-purple-600' : 'border-gray-600 bg-gray-900 hover:border-gray-400'}`}>
                                            {selectedIds.includes(convId) && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between pl-10">
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
                                                {sla && (
                                                    <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${sla.isOverdue ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                                                        <Timer size={12} />
                                                        Czeka: {sla.text}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1 font-medium text-gray-300">
                                                    {conversation.userAvatar ? (
                                                        <img src={conversation.userAvatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )}
                                                    <span
                                                        onClick={(e) => {
                                                            if (conversation.userType === 'business') {
                                                                e.stopPropagation();
                                                                window.open(`/admin/businesses/${conversation.userId}`, '_blank');
                                                            }
                                                        }}
                                                        className={conversation.userType === 'business' ? 'cursor-pointer hover:underline hover:text-white transition-colors' : ''}
                                                    >
                                                        {conversation.userName}
                                                    </span>
                                                </span>
                                                {conversation.userEmail && (
                                                    <span>{conversation.userEmail}</span>
                                                )}
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(conversation.lastMessageAt || conversation.createdAt).toLocaleString('pl-PL')}</span>
                                                <span className={status.color}>{status.text}</span>
                                                {conversation.supportName && (
                                                    <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                                                        <User size={12} />
                                                        {conversation.supportName}
                                                    </span>
                                                )}
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
                                                            className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                                                        >
                                                            {/* Przypisywanie */}
                                                            <div className="px-3 py-2 border-b border-gray-800 mb-2">
                                                                <p className="text-xs font-medium text-gray-500 mb-2 uppercase">Przypisz do</p>
                                                                <div className="space-y-1">
                                                                    {admins.map(admin => (
                                                                        <button
                                                                            key={admin._id}
                                                                            onClick={(e) => handleAssign(e, convId, admin._id, `${admin.firstName} ${admin.lastName}`)}
                                                                            className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${conversation.supportId === admin._id ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                                                        >
                                                                            <span>{admin.firstName} {admin.lastName}</span>
                                                                            {conversation.supportId === admin._id && <CheckCircle size={12} />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

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

                {/* Bulk Actions Bar */}
                <div className={`fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-white/10 p-4 transform transition-transform duration-300 z-50 ${selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-5 h-5 rounded border border-purple-600 bg-purple-600 flex items-center justify-center">
                                <Check size={14} className="text-white" />
                            </div>
                            <span className="font-semibold text-white">Wybrano: {selectedIds.length}</span>
                            <button onClick={() => setSelectedIds([])} className="text-sm text-gray-400 hover:text-white">Anuluj</button>
                        </div>

                        <div className="flex items-center gap-3">
                            {filter === 'deleted' ? (
                                <>
                                    <button
                                        onClick={() => handleBulkAction('update_status')}
                                        className="px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw size={16} /> Przywróć
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete_permanently')}
                                        className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Usuń trwale
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleBulkAction('update_status')}
                                        className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Lock size={16} /> Zamknij
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('move_to_trash')}
                                        className="px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Do kosza
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {selectedConversation && (
                    <AdminChatWindow
                        conversation={selectedConversation}
                        admins={admins}
                        onClose={handleCloseChat}
                        onUpdate={handleUpdate}
                    />
                )}
            </div>
        </>
    );
}

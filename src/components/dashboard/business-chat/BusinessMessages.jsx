'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useCsrf } from '@/hooks/useCsrf';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    MessageSquare, Plus, Search, Filter, Mail, Phone,
    ChevronRight, Clock, CheckCircle2, AlertCircle, X, Paperclip, ImageIcon
} from 'lucide-react';
import BusinessChatWindow from './BusinessChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessMessages() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'appeals'

    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const { secureFetch } = useCsrf();
    const searchParams = useSearchParams();
    const router = useRouter();

    // New Message Form State
    const [newMsgSubject, setNewMsgSubject] = useState('');
    const [newMsgCategory, setNewMsgCategory] = useState('question');
    const [newMsgContent, setNewMsgContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchConversations();

        // Check for ?create=true to auto-open modal
        if (searchParams.get('create') === 'true') {
            setShowNewMessageModal(true);
            const subjectParam = searchParams.get('subject');
            const categoryParam = searchParams.get('category');

            if (subjectParam) setNewMsgSubject(subjectParam);
            if (categoryParam) {
                setNewMsgCategory(categoryParam);
                if (categoryParam === 'blocked') setActiveTab('appeals');
            }
        }
    }, [user, searchParams]);

    // Real-time updates via Pusher
    useEffect(() => {
        if (!isConnected || !socket || !user) return;

        // Listen to user-specific channel if applicable, but implementation plan suggested simple list refresh logic or specific channel
        // Ideally, the backend should trigger events on a channel the user subscribes to.
        // Based on AdminSupportPage, likely we just update local state if we are listening to specific convs, 
        // BUT for the list itself, we might not have a global "user-conversations" channel yet.
        // We will rely on manual refresh or individual conversation updates if they are in the list.

        // However, let's try to update the selected conversation in real-time.
        // The list update is less critical unless a NEW conversation is created by support (unlikely).
    }, [isConnected, socket, user]);


    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await secureFetch('/api/chat/conversations?role=business');
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Błąd pobierania wiadomości:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConversation = async (e) => {
        e.preventDefault();
        if (!newMsgSubject || (!newMsgContent && !selectedFile)) return;

        setIsCreating(true);
        try {
            let messageType = 'message';
            let fileUrl = null;
            let fileName = null;
            let fileSize = null;

            // Upload file if selected
            if (selectedFile) {
                const sigResponse = await secureFetch('/api/upload/signature');
                const sigData = await sigResponse.json();
                if (!sigResponse.ok) throw new Error('Nie udało się pobrać sygnatury');

                const formDataUpload = new FormData();
                formDataUpload.append('file', selectedFile);
                formDataUpload.append('signature', sigData.signature);
                formDataUpload.append('timestamp', sigData.timestamp);
                formDataUpload.append('api_key', sigData.apiKey);
                formDataUpload.append('folder', 'bookly_chat');

                const clResponse = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
                    method: 'POST',
                    body: formDataUpload
                });
                const clData = await clResponse.json();
                if (!clResponse.ok) throw new Error('Błąd uploadu do Cloudinary');

                fileUrl = clData.secure_url;
                fileName = selectedFile.name;
                fileSize = selectedFile.size;
                messageType = 'image';
            }

            const response = await secureFetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: newMsgSubject,
                    category: newMsgCategory,
                    message: newMsgContent,
                    role: 'business',
                    messageType,
                    fileUrl,
                    fileName,
                    fileSize
                })
            });

            if (response.ok) {
                const data = await response.json();
                setConversations([data.conversation, ...conversations]);
                setShowNewMessageModal(false);
                setNewMsgSubject('');
                setNewMsgContent('');
                setSelectedFile(null);
                setSelectedConversation(data.conversation);
            }
        } catch (error) {
            console.error('Błąd tworzenia:', error);
            alert('Wystąpił błąd podczas tworzenia zgłoszenia.');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.id.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' ? true : conv.status === statusFilter;

        // Filter by tab
        const isAppeal = conv.category === 'blocked';
        const matchesTab = activeTab === 'appeals' ? isAppeal : !isAppeal;

        return matchesSearch && matchesStatus && matchesTab;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'closed': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open': return 'Otwarte';
            case 'in_progress': return 'W toku';
            case 'closed': return 'Zamknięte';
            default: return status;
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">
            {/* Sidebar List */}
            <div className={`w-full lg:w-[380px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Centrum kontaktu</h2>
                        <button
                            onClick={() => {
                                setShowNewMessageModal(true);
                                setNewMsgCategory(activeTab === 'appeals' ? 'blocked' : 'question');
                            }}
                            className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-200"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'messages'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Wiadomości
                        </button>
                        <button
                            onClick={() => setActiveTab('appeals')} // Fixed: Set to appeals
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'appeals'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Moje odwołania
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Szukaj..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {['all', 'open', 'closed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === status
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {status === 'all' ? 'Wszystkie' : status === 'open' ? 'Otwarte' : 'Archiwum'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <span className="text-xs text-gray-400">Ładowanie...</span>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="text-gray-300" size={24} />
                            </div>
                            <p className="text-gray-900 font-medium text-sm">
                                {activeTab === 'appeals' ? 'Brak odwołań' : 'Brak wiadomości'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                {activeTab === 'appeals'
                                    ? 'Nie masz żadnych aktywnych odwołań od blokad.'
                                    : 'Rozpocznij nową konwersację, aby skontaktować się z obsługą.'}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id || conv._id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedConversation?._id === conv._id
                                    ? 'bg-purple-50 border-purple-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getStatusColor(conv.status)}`}>
                                        {getStatusText(conv.status)}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{conv.subject}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                        ID: #{conv.id?.slice(-4) || conv._id?.slice(-4)}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden relative ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <BusinessChatWindow
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                        onUpdate={fetchConversations}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                            <Mail className="text-purple-200" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Centrum Wiadomości</h2>
                        <p className="text-gray-500 max-w-md">
                            Wybierz konwersację z listy po lewej stronie, aby zobaczyć szczegóły lub rozpocznij nowe zgłoszenie.
                        </p>
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            <AnimatePresence>
                {showNewMessageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Nowe zgłoszenie</h3>
                                <button
                                    onClick={() => setShowNewMessageModal(false)}
                                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateConversation} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temat</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Np. Problem z logowaniem"
                                        value={newMsgSubject}
                                        onChange={e => setNewMsgSubject(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        value={newMsgCategory}
                                        onChange={e => setNewMsgCategory(e.target.value)}
                                    >
                                        <option value="question">Pytanie</option>
                                        <option value="bug">Błąd</option>
                                        <option value="blocked">Blokada konta</option>
                                        <option value="suggestion">Sugestia</option>
                                        <option value="billing">Płatności</option>
                                        <option value="other">Inne</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Załącznik</label>
                                    <div className="flex gap-3 items-center">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                        >
                                            <Paperclip size={18} />
                                            {selectedFile ? 'Zmień plik' : 'Dodaj plik'}
                                        </button>
                                        {selectedFile && (
                                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                                <ImageIcon size={16} />
                                                {selectedFile.name}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedFile(null)}
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wiadomość</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                                        placeholder="Opisz dokładnie swój problem..."
                                        value={newMsgContent}
                                        onChange={e => setNewMsgContent(e.target.value)}
                                        required={!selectedFile}
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewMessageModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        {isCreating ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

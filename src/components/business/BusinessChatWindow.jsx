'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useCsrf } from '@/hooks/useCsrf';
import {
    Send, X, User, Clock, CheckCircle2, Smile, Image as ImageIcon, Film,
    Paperclip, ShieldCheck, Lock, MoreHorizontal, Trash2, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

export default function BusinessChatWindow({ conversation, onClose, onUpdate }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [giphySearch, setGiphySearch] = useState('');
    const [giphyResults, setGiphyResults] = useState([]);
    const [isSearchingGiphy, setIsSearchingGiphy] = useState(false);
    const [supportTyping, setSupportTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const fileInputRef = useRef(null);

    const { socket, isConnected } = useSocket();
    const { secureFetch } = useCsrf();

    // Close menus on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        if (!conversation) return;
        fetchMessages();
    }, [conversation]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await secureFetch(`/api/chat/messages?conversationId=${conversation.id || conversation._id}&role=user`);
            const data = await response.json();
            if (response.ok) {
                setMessages(data.messages || []);
                markAsRead();
            }
        } catch (error) {
            console.error('Błąd pobierania wiadomości:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        const hasUnread = messages.some(m => m.senderType === 'support' && !m.read);
        if (!hasUnread) return;

        try {
            await secureFetch(`/api/chat/messages/${conversation.id || conversation._id}/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user' })
            });
        } catch (error) {
            console.error('Błąd oznaczania jako przeczytane:', error);
        }
    };

    // Pusher Subscription
    useEffect(() => {
        if (!conversation || !isConnected) return;
        const conversationId = conversation.id || conversation._id;

        const channel = socket.subscribe(`chat-${conversationId}`);

        const handleNewMessage = (msg) => {
            setMessages(prev => {
                const msgId = String(msg._id || msg.id);
                if (prev.some(m => String(m._id || m.id) === msgId)) return prev;
                return [...prev, msg];
            });

            if (msg.senderType === 'support') {
                markAsRead();
            }
        };

        if (channel) {
            channel.bind('new-message', handleNewMessage);
            channel.bind('typing', (data) => {
                if (data.role === 'admin') {
                    setSupportTyping(true);
                    if (window.supportTypingTimeout) clearTimeout(window.supportTypingTimeout);
                    window.supportTypingTimeout = setTimeout(() => setSupportTyping(false), 3000);
                }
            });
            channel.bind('message-read', (data) => {
                if (data.role === 'admin') {
                    setMessages(prev => prev.map(m => {
                        if (m.senderType !== 'support') {
                            return { ...m, read: true, readAt: data.readAt };
                        }
                        return m;
                    }));
                }
            });
            channel.bind('conversation-updated', (data) => {
                if (data.id === conversationId) {
                    if (onUpdate) onUpdate();
                }
            });
        }

        return () => {
            if (channel) {
                channel.unbind_all();
                socket.unsubscribe(`chat-${conversationId}`);
            }
        };
    }, [conversation, isConnected, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Actions
    const handleTyping = () => {
        if (!isConnected || !conversation) return;
        socket.emit('typing', {
            conversationId: conversation.id || conversation._id,
            role: 'user'
        });
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('pl-PL', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await secureFetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: conversation.id || conversation._id,
                    message: newMessage.trim(),
                    role: 'user'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => {
                    const msgId = String(data.message._id || data.message.id);
                    if (prev.some(m => String(m._id || m.id) === msgId)) return prev;
                    return [...prev, data.message];
                });
                setNewMessage('');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Błąd wysyłania wiadomości:', error);
        } finally {
            setSending(false);
        }
    };

    // Image & GIF handling
    const searchGiphy = async (q) => {
        if (!q) {
            setGiphyResults([]);
            return;
        }
        setIsSearchingGiphy(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC';
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=12&rating=g`);
            const data = await response.json();
            if (data.data) setGiphyResults(data.data);
        } catch (error) {
            console.error('Giphy error:', error);
        } finally {
            setIsSearchingGiphy(false);
        }
    };

    const handleSendGif = async (gif) => {
        if (sending || !conversation) return;
        setSending(true);
        try {
            const response = await secureFetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: conversation.id || conversation._id,
                    type: 'gif',
                    gifUrl: gif.images.fixed_height.url,
                    role: 'user'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => {
                    const msgId = String(data.message._id || data.message.id);
                    if (prev.some(m => String(m._id || m.id) === msgId)) return prev;
                    return [...prev, data.message];
                });
                setShowGifPicker(false);
                setGiphySearch('');
                setGiphyResults([]);
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Błąd wysyłania GIFa:', error);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (giphySearch) searchGiphy(giphySearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [giphySearch]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSending(true);
        try {
            const sigResponse = await secureFetch('/api/upload/signature');
            const sigData = await sigResponse.json();
            if (!sigResponse.ok) throw new Error('Nie udało się pobrać sygnatury');

            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('signature', sigData.signature);
            formDataUpload.append('timestamp', sigData.timestamp);
            formDataUpload.append('api_key', sigData.apiKey);
            formDataUpload.append('folder', 'bookly_chat');

            const clResponse = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
                method: 'POST',
                body: formDataUpload
            });
            console.log(clResponse);
            const clData = await clResponse.json();
            if (!clResponse.ok) throw new Error('Błąd uploadu do Cloudinary');

            const response = await secureFetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: conversation.id || conversation._id,
                    type: 'image',
                    fileUrl: clData.secure_url,
                    fileName: file.name,
                    fileSize: file.size,
                    role: 'user'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => {
                    const msgId = String(data.message._id || data.message.id);
                    if (prev.some(m => String(m._id || m.id) === msgId)) return prev;
                    return [...prev, data.message];
                });
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Błąd uploadu obrazka:', error);
            alert('Nie udało się wysłać obrazka.');
        } finally {
            setSending(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!conversation) return null;

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <ShieldCheck className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{conversation.subject}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${conversation.status === 'open' ? 'bg-green-100 text-green-600' :
                                    conversation.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                                        'bg-gray-100 text-gray-500'
                                }`}>
                                {conversation.status === 'open' ? 'Otwarte' :
                                    conversation.status === 'in_progress' ? 'W toku' : 'Zamknięte'}
                            </span>
                            <span className="text-xs text-gray-400">ID: #{conversation.id?.slice(-4) || conversation._id?.slice(-4)}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all md:hidden">
                    <X size={20} />
                </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-500">Ładowanie wiadomości...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 font-medium">Rozpocznij konwersację</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderType !== 'support';
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg._id || msg.id || index}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[75%] group relative ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>

                                    {!isMe && (
                                        <span className="text-[10px] text-gray-400 font-bold mb-1 ml-1 uppercase tracking-wider">Support</span>
                                    )}

                                    <div className={`
                    px-4 py-3 rounded-2xl text-sm font-medium shadow-sm break-words
                    ${isMe
                                            ? 'bg-purple-600 text-white rounded-tr-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}
                  `}>
                                        {msg.type === 'gif' ? (
                                            <img src={msg.gifUrl} alt="gif" className="rounded-xl w-full max-w-[280px]" />
                                        ) : msg.type === 'image' ? (
                                            <div className="space-y-2">
                                                <img src={msg.fileUrl} alt="upload" className="rounded-xl w-full max-w-[280px] cursor-pointer hover:opacity-90 transition-opacity" />
                                                {msg.message && <div>{msg.message}</div>}
                                            </div>
                                        ) : (
                                            <div className="leading-relaxed whitespace-pre-wrap">{msg.message}</div>
                                        )}
                                    </div>

                                    <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${isMe ? 'mr-1' : 'ml-1'}`}>
                                        {formatTime(msg.createdAt)}
                                        {isMe && (
                                            <CheckCircle2 size={12} className={msg.read ? 'text-purple-600' : 'text-gray-300'} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}

                {supportTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex gap-1 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {conversation.status === 'closed' ? (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500 text-sm font-medium">
                        <Lock size={16} />
                        Ta konwersacja została zakończona
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-white border-t border-gray-100 relative z-20">
                    <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div
                                ref={emojiPickerRef}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-full left-4 mb-2 z-30 shadow-xl rounded-2xl overflow-hidden border border-gray-100"
                            >
                                <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showGifPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-full left-4 mb-2 z-30 shadow-xl rounded-2xl overflow-hidden bg-white border border-gray-100 p-3 w-[320px]"
                            >
                                <input
                                    type="text"
                                    value={giphySearch}
                                    onChange={(e) => setGiphySearch(e.target.value)}
                                    placeholder="Szukaj GIFów..."
                                    className="w-full px-3 py-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-purple-500 mb-2 text-sm"
                                    autoFocus
                                />
                                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                    {giphyResults.map(gif => (
                                        <img
                                            key={gif.id}
                                            src={gif.images.fixed_height_small.url}
                                            alt="gif"
                                            className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity w-full h-[80px] object-cover"
                                            onClick={() => handleSendGif(gif)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSend} className="flex gap-2">
                        <div className="flex gap-2 items-center">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                <ImageIcon size={20} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                            <button
                                type="button"
                                onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
                                className={`p-2 rounded-xl transition-colors ${showGifPicker ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <Film size={20} />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Napisz wiadomość..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium text-gray-900 placeholder:text-gray-400"
                            disabled={sending || !isConnected}
                        />

                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending || !isConnected}
                            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

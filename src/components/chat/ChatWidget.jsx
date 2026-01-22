'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useCsrf } from '@/hooks/useCsrf';
import { MessageSquare, X, Send, Minimize2, AlertCircle, Smile, Image as ImageIcon, Film, Plus, Paperclip, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'other',
    userName: '',
    userEmail: '',
    message: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [giphySearch, setGiphySearch] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [isSearchingGiphy, setIsSearchingGiphy] = useState(false);

  const dragControls = useDragControls();

  const isDraggingRef = useRef(false);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const { secureFetch } = useCsrf();

  // Close emoji picker on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && conversation) {
      fetchMessages();
    }
  }, [isOpen, conversation]);

  // Pusher real-time subscription
  useEffect(() => {
    if (!isOpen || !conversation || !isConnected) return;

    const conversationId = conversation.id || conversation._id;

    // Subskrybuj kanał konwersacji
    const channel = socket.subscribe(`chat-${conversationId}`);

    if (channel) {
      channel.bind('new-message', (msg) => {
        setMessages(prev => {
          const msgId = String(msg._id || msg.id);
          if (prev.some(m => String(m._id || m.id) === msgId)) {
            return prev;
          }
          if (msg.senderType === 'support') {
            markAsRead();
          }
          return [...prev, msg];
        });
      });

      channel.bind('typing', (data) => {
        if (data.role === 'admin') {
          setOtherUserTyping(true);
          // Przedłużaj widoczność jeśli nadal pisze
          if (window.typingTimeout) clearTimeout(window.typingTimeout);
          window.typingTimeout = setTimeout(() => setOtherUserTyping(false), 3000);
        }
      });

      channel.bind('message-read', (data) => {
        setMessages(prev => prev.map(m => {
          if (m.senderType !== 'support') {
            return { ...m, read: true, readAt: data.readAt };
          }
          return m;
        }));
      });

      channel.bind('conversation-updated', (data) => {
        setConversation(prev => {
          if (!prev) return prev;
          return { ...prev, status: data.status };
        });
      });
    }

    return () => {
      if (channel) {
        channel.unbind_all();
        socket.unsubscribe(`chat-${conversationId}`);
      }
    };
  }, [isOpen, conversation, isConnected, socket]);

  const handleTyping = () => {
    if (!isConnected || !conversation) return;
    socket.emit('typing', {
      conversationId: conversation.id || conversation._id,
      role: 'user'
    });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!isMinimized) markAsRead();
    }
  }, [messages, isOpen, isMinimized]);

  const fetchMessages = async () => {
    if (!conversation) return;
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
    if (!conversation || isMinimized || !isOpen) return;

    // Sprawdź czy są nieprzeczytane wiadomości od supportu
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


  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    try {
      setLoading(true);
      const response = await secureFetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject || 'Zgłoszenie',
          category: formData.category,
          userName: formData.userName || 'Użytkownik nie zalogowany',
          userEmail: formData.userEmail || null,
          message: formData.message
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
        setShowForm(false);
        setMessages([{
          _id: 'temp',
          senderId: data.conversation.userId || 'anonymous',
          senderType: data.conversation.userType,
          senderName: data.conversation.userName,
          message: formData.message,
          createdAt: new Date()
        }]);
      }
    } catch (error) {
      console.error('Błąd tworzenia konwersacji:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversation || conversation?.status === 'closed') return;

    setSending(true);
    try {
      const response = await secureFetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id || conversation._id,
          message: newMessage.trim(),
          role: 'user',
          senderName: formData.userName || 'Użytkownik nie zalogowany',
          senderEmail: formData.userEmail || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          const msgId = String(data.message._id || data.message.id);
          if (prev.some(m => String(m._id || m.id) === msgId)) {
            return prev;
          }
          return [...prev, data.message];
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
    } finally {
      setSending(false);
    }
  };

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
      if (data.data) {
        setGiphyResults(data.data);
      }
    } catch (error) {
      console.error('Giphy error:', error);
    } finally {
      setIsSearchingGiphy(false);
    }
  };

  const handleSendGif = async (gif) => {
    if (sending || !conversation || conversation?.status === 'closed') return;
    setSending(true);
    try {
      const response = await secureFetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id || conversation._id,
          type: 'gif',
          gifUrl: gif.images.fixed_height.url,
          role: 'user',
          senderName: formData.userName || 'Użytkownik nie zalogowany'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          const msgId = String(data.message._id || data.message.id);
          if (prev.some(m => String(m._id || m.id) === msgId)) {
            return prev;
          }
          return [...prev, data.message];
        });
        setShowGifPicker(false);
        setGiphySearch('');
        setGiphyResults([]);
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
    if (!file || conversation?.status === 'closed') return;

    setSending(true);
    try {
      // 1. Pobierz sygnaturę
      const sigResponse = await secureFetch('/api/upload/signature');
      const sigData = await sigResponse.json();

      if (!sigResponse.ok) throw new Error('Nie udało się pobrać sygnatury');

      // 2. Wyślij do Cloudinary
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

      const clData = await clResponse.json();
      if (!clResponse.ok) throw new Error('Błąd uploadu do Cloudinary');

      // 3. Wyślij wiadomość z obrazkiem
      const response = await secureFetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id || conversation._id,
          type: 'image',
          fileUrl: clData.secure_url,
          fileName: file.name,
          fileSize: file.size,
          role: 'user',
          senderName: formData.userName || 'Użytkownik nie zalogowany'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          const msgId = String(data.message._id || data.message.id);
          if (prev.some(m => String(m._id || m.id) === msgId)) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
    } catch (error) {
      console.error('Błąd uploadu obrazka:', error);
      alert('Nie udało się wysłać obrazka. Upewnij się, że klucze Cloudinary są skonfigurowane.');
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onDragStart={() => { isDraggingRef.current = true; }}
      onDragEnd={() => { setTimeout(() => isDraggingRef.current = false, 100); }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="chat-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onPointerDown={(e) => dragControls.start(e)}
            onClick={() => {
              if (!isDraggingRef.current) setIsOpen(true);
            }}
            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all border border-white/20 cursor-grab active:cursor-grabbing"
          >
            <MessageSquare size={28} />
          </motion.button>
        ) : (
          <motion.div
            key="chat-window"
            initial={{ y: 20, opacity: 0, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              height: isMinimized ? '64px' : '650px'
            }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[400px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-white/30"
          >
            {/* Header */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between shadow-lg relative overflow-hidden cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <span className="font-bold tracking-tight block">Centrum Wsparcia</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {showForm ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 overflow-y-auto p-6 space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Jak możemy pomóc?</h3>
                      <p className="text-sm text-gray-500 font-medium">Nasze biuro obsługi klienta odpowie tak szybko, jak to możliwe.</p>
                    </div>

                    <form onSubmit={handleCreateConversation} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Kategoria</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm"
                          >
                            <option value="bug">Bug Report</option>
                            <option value="question">Question</option>
                            <option value="complaint">Complaint</option>
                            <option value="suggestion">Suggestion</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Twój Email</label>
                          <input
                            type="email"
                            value={formData.userEmail}
                            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                            placeholder="Adres email"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Opis problemu</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Co się dzieje?"
                          rows={4}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm resize-none"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!formData.message.trim() || loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Ładowanie...</span>
                          </div>
                        ) : 'Rozpocznij czat'}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                          <span className="text-sm font-medium tracking-tight">Pobieranie wiadomości...</span>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <div className="w-16 h-16 bg-purple-50 rounded-3xl flex items-center justify-center mb-4">
                            <MessageSquare className="text-purple-500 opacity-50" size={32} />
                          </div>
                          <p className="font-bold text-gray-900">Brak historii wiadomości</p>
                          <p className="text-sm text-gray-500">Napisz coś poniżej, aby zacząć.</p>
                        </div>
                      ) : (
                        messages.map((msg, index) => {
                          const isUser = msg.senderType !== 'support';
                          const isLast = index === messages.length - 1;
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              key={msg._id || msg.id || index}
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] group`}>
                                <div className={`
                              px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all
                              ${isUser
                                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none hover:border-purple-100'}
                            `}>
                                  {!isUser && (
                                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                                      <div className="w-1 h-1 rounded-full bg-purple-500" />
                                      {msg.senderName}
                                    </div>
                                  )}

                                  {/* Content Rendering */}
                                  {msg.type === 'gif' ? (
                                    <img src={msg.gifUrl} alt="gif" className="rounded-xl w-full max-w-[240px] shadow-sm" />
                                  ) : msg.type === 'image' ? (
                                    <div className="space-y-2">
                                      <img src={msg.fileUrl} alt="upload" className="rounded-xl w-full max-w-[240px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity" />
                                      {msg.message && <div className="mt-1">{msg.message}</div>}
                                    </div>
                                  ) : (
                                    <div className="leading-relaxed whitespace-pre-wrap">{msg.message}</div>
                                  )}

                                  <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-tighter opacity-50 flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    {formatTime(msg.createdAt)}
                                    {isUser && (
                                      <div className="flex items-center gap-0.5">
                                        <ShieldCheck size={10} className={msg.read ? 'text-blue-200' : 'text-purple-300'} />
                                        <span>{msg.read ? 'Przeczytano' : 'Wysłano'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}

                      {otherUserTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                          <div className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-1 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                      {conversation?.status === 'closed' && (
                        <div className="py-8 px-4 text-center">
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                              <Lock size={14} />
                              Konwersacja została zakończona
                            </p>
                            <p className="text-gray-400 text-[11px] mt-1 font-medium">To zgłoszenie jest już archiwalne. Jeśli masz nowe pytania, otwórz nową konwersację.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 relative">
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            ref={emojiPickerRef}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-full left-0 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden"
                          >
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              width={320}
                              height={400}
                              skinTonesDisabled
                              searchDisabled={false}
                              previewConfig={{ showPreview: false }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Toolbar */}
                      <div className="flex items-center gap-1 mb-2">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
                          disabled={conversation?.status === 'closed'}
                        >
                          <Smile size={20} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          disabled={conversation?.status === 'closed'}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                          disabled={conversation?.status === 'closed'}
                        >
                          <ImageIcon size={20} />
                        </button>
                        <AnimatePresence>
                          {showGifPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              className="absolute bottom-full left-0 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-100 p-4 w-[340px]"
                            >
                              <div className="flex items-center gap-2 mb-4 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                                <Film size={16} className="text-gray-400" />
                                <input
                                  type="text"
                                  value={giphySearch}
                                  onChange={(e) => setGiphySearch(e.target.value)}
                                  placeholder="Szukaj GIFów..."
                                  className="bg-transparent border-none focus:outline-none text-sm w-full"
                                />
                                {isSearchingGiphy && <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />}
                              </div>

                              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {giphyResults.map(gif => (
                                  <img
                                    key={gif.id}
                                    src={gif.images.fixed_height_small.url}
                                    alt="gif"
                                    className="rounded-lg cursor-pointer hover:scale-[1.02] transition-transform w-full h-[100px] object-cover"
                                    onClick={() => handleSendGif(gif)}
                                  />
                                ))}
                                {!isSearchingGiphy && giphyResults.length === 0 && (
                                  <div className="col-span-2 text-center py-8 text-xs text-gray-400 font-bold uppercase tracking-widest">Wpisz coś, aby szukać</div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }} disabled={conversation?.status === 'closed'}>
                          <Film size={20} className={showGifPicker ? 'text-purple-600' : ''} />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all" disabled={conversation?.status === 'closed'}>
                          <Paperclip size={20} />
                        </button>
                      </div>

                      <form onSubmit={handleSend} className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                              }
                            }}
                            disabled={sending || !isConnected || conversation?.status === 'closed'}
                            placeholder={conversation?.status === 'closed' ? "Ta rozmowa jest zamknięta" : "Zadaj pytanie..."}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!newMessage.trim() || sending || !isConnected}
                          className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {sending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
                        </motion.button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


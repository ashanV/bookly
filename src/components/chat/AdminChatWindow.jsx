'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useCsrf } from '@/hooks/useCsrf';
import { Send, X, User, Clock, CheckCircle2, Smile, Image as ImageIcon, Film, Plus, Paperclip, MoreHorizontal, ShieldCheck, Trash2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

export default function AdminChatWindow({ conversation, onClose, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [giphySearch, setGiphySearch] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [isSearchingGiphy, setIsSearchingGiphy] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!conversation) return;

    // Pobierz wiadomości
    fetchMessages();
  }, [conversation]);

  // Subskrybuj kanał
  useEffect(() => {
    if (!conversation || !isConnected) return;
    const conversationId = conversation.id || conversation._id;

    const channel = socket.subscribe(`chat-${conversationId}`);

    if (channel) {
      channel.bind('new-message', (msg) => {
        setMessages(prev => {
          const msgId = String(msg._id || msg.id);
          if (prev.some(m => String(m._id || m.id) === msgId)) {
            return prev;
          }
          return [...prev, msg];
        });

        if (msg.senderType !== 'support') {
          markAsRead();
        }
      });

      channel.bind('typing', (data) => {
        if (data.role === 'user') {
          setOtherUserTyping(true);
          if (window.adminTypingTimeout) clearTimeout(window.adminTypingTimeout);
          window.adminTypingTimeout = setTimeout(() => setOtherUserTyping(false), 3000);
        }
      });

      channel.bind('message-read', (data) => {
        if (data.role === 'user') {
          setMessages(prev => prev.map(m => {
            if (m.senderType === 'support') {
              return { ...m, read: true, readAt: data.readAt };
            }
            return m;
          }));
        }
      });

      channel.bind('conversation-updated', (data) => {
        // Jeśli to ta sama konwersacja i status się zmienił
        if (data.id === conversationId) {
          // Możemy wywołać onUpdate żeby główna lista też wiedziała, 
          // ale tutaj chcemy zaktualizować lokalny obiekt conversation jeśli to możliwe
          // Zwykle conversation przychodzi jako prop, więc najlepiej odświeżyć listę rodzica
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

  const handleTyping = () => {
    if (!isConnected || !conversation) return;
    socket.emit('typing', {
      conversationId: conversation.id || conversation._id,
      role: 'admin'
    });
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          role: 'admin'
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
          role: 'admin'
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
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Błąd uploadu obrazka:', error);
      alert('Nie udało się wysłać obrazka. Upewnij się, że klucze Cloudinary są skonfigurowane.');
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await secureFetch(`/api/chat/messages?conversationId=${conversation.id || conversation._id}&role=admin`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
        // Oznacz jako przeczytane
        markAsRead();
      }
    } catch (error) {
      console.error('Błąd pobierania wiadomości:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    // Sprawdź czy są nieprzeczytane wiadomości od użytkownika
    const hasUnread = messages.some(m => m.senderType !== 'support' && !m.read);
    if (!hasUnread) return;

    try {
      await secureFetch(`/api/chat/messages/${conversation.id || conversation._id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' })
      });
    } catch (error) {
      console.error('Błąd oznaczania jako przeczytane:', error);
    }
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
          role: 'admin'
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

        // Zaktualizuj konwersację
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await secureFetch(`/api/chat/conversations/${conversation.id || conversation._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setShowActions(false);
        if (onUpdate) onUpdate();
        // Zamknij okno jeśli to było zamknięcie
        if (newStatus === 'closed') {
          onClose();
        }
      }
    } catch (error) {
      console.error('Błąd zmiany statusu:', error);
    }
  };

  const handleDelete = async () => {
    const isAlreadyDeleted = conversation.status === 'deleted';
    const confirmMessage = isAlreadyDeleted
      ? 'Czy na pewno chcesz TRWALE usunąć tę konwersację? Wszystkie wiadomości zostaną bezpowrotnie skasowane.'
      : 'Czy na pewno chcesz przenieść tę konwersację do kosza?';

    if (!confirm(confirmMessage)) return;

    try {
      const response = await secureFetch(`/api/chat/conversations/${conversation.id || conversation._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onClose();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Błąd usuwania konwersacji:', error);
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

  if (!conversation) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1E293B] border border-white/10 rounded-[32px] w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <User className="text-white" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white tracking-tight">{conversation.userName}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${conversation.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                  conversation.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                  }`}>
                  {conversation.status === 'open' ? 'Aktywne' :
                    conversation.status === 'in_progress' ? 'W toku' : 'Zamknięte'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1 font-medium">
                <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  {conversation.userEmail || 'Brak emaila'}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">{conversation.category}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className={`p-3 rounded-2xl transition-all ${showActions ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <MoreHorizontal size={20} />
              </button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl py-2 z-[70] overflow-hidden"
                  >
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <Lock size={16} className="text-amber-400" />
                      <span>Zamknij zgłoszenie</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-3 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Usuń zgłoszenie</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F172A]/30 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Synchronizacja...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <MessageSquare size={64} className="text-gray-500 mb-4" />
              <p className="text-xl font-bold text-gray-400">Historia jest pusta</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isSupport = msg.senderType === 'support';
              return (
                <motion.div
                  initial={{ opacity: 0, x: isSupport ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg._id || msg.id || index}
                  className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] group relative`}>
                    <div className={`
                      px-5 py-3.5 rounded-3xl text-sm font-medium shadow-2xl transition-all
                      ${isSupport
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-[#1E293B] border border-white/5 text-gray-100 rounded-tl-none active:scale-[0.98]'}
                    `}>
                      {!isSupport && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1.5 flex items-center gap-1.5">
                          <User size={10} />
                          {msg.senderName}
                        </div>
                      )}

                      {/* Multimedia Support */}
                      {msg.type === 'gif' ? (
                        <img src={msg.gifUrl} alt="gif" className="rounded-2xl w-full max-w-[320px] shadow-2xl border border-white/10" />
                      ) : msg.type === 'image' ? (
                        <div className="space-y-3">
                          <img src={msg.fileUrl} alt="upload" className="rounded-2xl w-full max-w-[320px] shadow-2xl border border-white/10 hover:opacity-90 transition-opacity cursor-zoom-in" />
                          {msg.message && <div className="leading-relaxed opacity-90">{msg.message}</div>}
                        </div>
                      ) : (
                        <div className="leading-relaxed whitespace-pre-wrap">{msg.message}</div>
                      )}

                      <div className={`flex items-center gap-2 mt-2 font-bold text-[9px] uppercase tracking-tighter ${isSupport ? 'justify-end opacity-60' : 'justify-start opacity-40'}`}>
                        {formatTime(msg.createdAt)}
                        {isSupport && (
                          <div className="flex items-center gap-0.5">
                            <ShieldCheck size={10} className={msg.read ? 'text-blue-400' : 'text-gray-400'} />
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
              <div className="bg-[#1E293B] border border-white/5 rounded-2xl px-4 py-2.5 flex gap-1.5 shadow-xl">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-gray-900/50 border-t border-white/5 relative">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                ref={emojiPickerRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-full right-6 mb-4 z-50 shadow-2xl rounded-3xl overflow-hidden border border-white/10"
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme="dark"
                  width={340}
                  height={400}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2.5 rounded-xl transition-all ${showEmojiPicker ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <Smile size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all"
            >
              <ImageIcon size={20} />
            </button>
            <AnimatePresence>
              {showGifPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-full right-6 mb-4 z-50 shadow-2xl rounded-[32px] overflow-hidden bg-[#1E293B] border border-white/10 p-5 w-[360px]"
                >
                  <div className="flex items-center gap-3 mb-4 bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
                    <Film size={18} className="text-gray-400" />
                    <input
                      type="text"
                      value={giphySearch}
                      onChange={(e) => setGiphySearch(e.target.value)}
                      placeholder="Szukaj GIFów..."
                      className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
                    />
                    {isSearchingGiphy && <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />}
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                    {giphyResults.map(gif => (
                      <img
                        key={gif.id}
                        src={gif.images.fixed_height_small.url}
                        alt="gif"
                        className="rounded-2xl cursor-pointer hover:scale-[1.05] transition-all w-full h-[110px] object-cover border border-white/5 shadow-lg"
                        onClick={() => handleSendGif(gif)}
                      />
                    ))}
                    {!isSearchingGiphy && giphyResults.length === 0 && (
                      <div className="col-span-2 text-center py-10">
                        <Film className="mx-auto text-gray-700 mb-2" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Gotowy na emocje?</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
              className={`p-2.5 rounded-xl transition-all ${showGifPicker ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <Film size={20} />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <Paperclip size={20} />
            </button>
            <div className="flex-1" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isConnected ? 'Zaszyfrowano' : 'Błąd połączenia'}
            </span>
          </div>

          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder={conversation.status === 'closed' ? "Ta rozmowa jest zamknięta" : "Odpowiedz użytkownikowi..."}
              className="flex-1 bg-gray-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending || !isConnected || conversation.status === 'closed'}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!newMessage.trim() || sending || !isConnected}
              className="px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Wyślij</span>
                  <Send size={18} />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


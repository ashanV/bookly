"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from '@/components/Toast';
import {
    Plus,
    MoreHorizontal,
    Clock,
    X,
    Check,
    Pencil,
    Trash2,
    Smile
} from 'lucide-react';

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function TimeBlockTypesSettings({ businessData, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    // Initial state derived from businessData
    const blockTypes = businessData?.calendarSettings?.blockTypes || [];

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        duration: 60,
        isPaid: true,
        icon: '📅' // Default emoji
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            duration: 60,
            isPaid: true,
            icon: '📅'
        });
        setEditingBlock(null);
        setShowEmojiPicker(false);
    };

    const handleOpenModal = (block = null) => {
        if (block) {
            setEditingBlock(block);
            setFormData({
                name: block.name,
                duration: block.duration,
                isPaid: block.isPaid,
                icon: block.icon || '📅'
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDelete = async (blockId) => {
        if (!confirm('Czy na pewno chcesz usunąć ten typ blokady?')) return;

        setLoading(true);
        try {
            const updatedBlockTypes = blockTypes.filter(b => b._id !== blockId);

            await onUpdate({
                calendarSettings: {
                    ...(businessData?.calendarSettings || {}),
                    blockTypes: updatedBlockTypes
                }
            });
            toast.success("Typ blokady został usunięty");
        } catch (error) {
            toast.error("Błąd usuwania typu blokady");
            console.error(error);
        } finally {
            setLoading(false);
            setOpenMenuId(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let updatedBlockTypes;

            if (editingBlock) {
                updatedBlockTypes = blockTypes.map(b =>
                    b._id === editingBlock._id ? { ...b, ...formData } : b
                );
            } else {
                updatedBlockTypes = [...blockTypes, { ...formData, _id: new Date().getTime().toString() }];
            }

            await onUpdate({
                calendarSettings: {
                    ...(businessData?.calendarSettings || {}),
                    blockTypes: updatedBlockTypes
                }
            });

            toast.success(editingBlock ? "Zaktualizowano typ blokady" : "Dodano nowy typ blokady");
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error("Błąd zapisu");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setFormData(prev => ({ ...prev, icon: emojiObject.emoji }));
        setShowEmojiPicker(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Typy blokad czasu w kalendarzu</h1>
                    <p className="text-gray-500 max-w-2xl">
                        Twórz i dostosowuj zablokowane godziny, które można zaplanować w kalendarzu. <span className="text-purple-600 hover:underline cursor-pointer">Dowiedz się więcej</span>.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    <Plus size={16} />
                    Dodaj
                </button>
            </div>

            <div className="space-y-4">
                {blockTypes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">Brak zdefiniowanych blokad</h3>
                        <p className="text-gray-500 text-sm mb-4">Dodaj pierwszy typ blokady, np. Przerwę obiadową</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                            Dodaj typ blokady
                        </button>
                    </div>
                ) : (
                    blockTypes.map((block) => (
                        <div key={block._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 text-2xl">
                                    {block.icon || '📅'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{block.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{block.duration} min</span>
                                        <span>•</span>
                                        <span>{block.isPaid ? 'Opłacono' : 'Nieopłacona'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === block._id ? null : block._id)}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Opcje
                                    <MoreHorizontal size={16} />
                                </button>

                                {openMenuId === block._id && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setOpenMenuId(null)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in-up">
                                            <button
                                                onClick={() => handleOpenModal(block)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Pencil size={14} />
                                                Edytuj
                                            </button>
                                            <button
                                                onClick={() => handleDelete(block._id)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Usuń
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-in overflow-visible">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingBlock ? 'Edytuj typ blokady' : 'Dodaj typ blokady'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="flex gap-4">
                                {/* Emoji Picker */}
                                <div className="relative" ref={emojiPickerRef}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ikona</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="w-12 h-11 flex items-center justify-center text-2xl border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-purple-500"
                                    >
                                        {formData.icon}
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute top-12 left-0 z-50 shadow-2xl rounded-xl">
                                            <EmojiPicker
                                                onEmojiClick={onEmojiClick}
                                                width={300}
                                                height={400}
                                                searchPlaceholder="Wyszukaj..."
                                                previewConfig={{ showPreview: false }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nazwa</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                        placeholder="np. Przerwa obiadowa"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Czas trwania (minuty)</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                    min="5"
                                    step="5"
                                    required
                                />
                            </div>

                            {/* Is Paid */}
                            <div>
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isPaid ? 'bg-black border-black' : 'border-gray-300 bg-white'
                                        }`}>
                                        {formData.isPaid && <Check size={14} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPaid}
                                        onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-medium text-gray-900">Czas płatny (wliczany do czasu pracy)</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Zapisywanie...' : (editingBlock ? 'Zapisz zmiany' : 'Dodaj')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

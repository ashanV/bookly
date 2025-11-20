import React, { useState } from 'react';
import { Image, FileText, Upload, Plus, Trash2, Eye, Download, Grid, List } from 'lucide-react';

export default function ClientGallery() {
    const [activeTab, setActiveTab] = useState('photos'); // 'photos', 'documents'
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

    const photos = [
        { id: 1, url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', date: '2023-11-15', title: 'Po koloryzacji', type: 'after' },
        { id: 2, url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', date: '2023-11-15', title: 'Przed koloryzacją', type: 'before' },
        { id: 3, url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', date: '2023-10-01', title: 'Strzyżenie', type: 'after' },
    ];

    const documents = [
        { id: 1, name: 'Karta klienta.pdf', date: '2023-01-15', size: '2.4 MB', type: 'pdf' },
        { id: 2, name: 'Zgoda RODO.pdf', date: '2023-01-15', size: '1.1 MB', type: 'pdf' },
        { id: 3, name: 'Historia zabiegów 2022.xlsx', date: '2023-01-01', size: '45 KB', type: 'xls' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Galeria i Dokumenty</h2>
                    <p className="text-slate-500 text-sm mt-1">Zarządzaj zdjęciami i dokumentami klienta</p>
                </div>
                <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
                    <Upload size={18} />
                    <span className="font-medium">Dodaj plik</span>
                </button>
            </div>

            <div className="flex border-b border-slate-200 px-6 bg-white">
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'photos'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Image size={16} />
                    Zdjęcia
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'documents'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText size={16} />
                    Dokumenty
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {activeTab === 'photos' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-white font-medium truncate">{photo.title}</p>
                                    <p className="text-white/80 text-xs">{photo.date}</p>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/40 transition-colors">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/80 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium uppercase ${photo.type === 'before' ? 'bg-amber-500/80 text-white' : 'bg-green-500/80 text-white'
                                        }`}>
                                        {photo.type === 'before' ? 'Przed' : 'Po'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <button className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all">
                            <Plus size={32} className="mb-2" />
                            <span className="font-medium">Dodaj zdjęcie</span>
                        </button>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{doc.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{doc.date}</span>
                                            <span>•</span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                                        <Download size={18} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
                            <Plus size={18} />
                            Dodaj nowy dokument
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Search,
    FileText,
    Bold,
    Italic,
    List,
    ListOrdered,
    Type,
    Palette,
    Save,
    MoreVertical
} from 'lucide-react';

export default function Notepad() {
    const [notes, setNotes] = useState([
        { id: 1, title: 'Pomysły na promocje świąteczne', content: '<div><b>1. Pakiety prezentowe</b></div><div>- Zestaw kosmetyków do włosów</div><div>- Voucher na zabiegi</div><div><br></div><div><b>2. Zniżki</b></div><div>- -20% na koloryzację w grudniu</div>', date: '2023-11-15' },
        { id: 2, title: 'Lista zakupów - Grudzień', content: '<div><ul><li>Szampony L\'Oreal (10 szt.)</li><li>Farby (odcienie blondu)</li><li>Ręczniki jednorazowe</li></ul></div>', date: '2023-11-14' },
        { id: 3, title: 'Notatka ze spotkania zespołu', content: '<div>Omówić grafik na święta.</div><div><font color="#ff0000">Ważne: urlopy zgłaszać do końca tygodnia.</font></div>', date: '2023-11-10' },
    ]);

    const [selectedNoteId, setSelectedNoteId] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const editorRef = useRef(null);

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    // Update editor content when selected note changes
    useEffect(() => {
        if (editorRef.current && selectedNote) {
            editorRef.current.innerHTML = selectedNote.content;
        }
    }, [selectedNoteId, selectedNote]);

    const handleContentChange = () => {
        if (editorRef.current && selectedNote) {
            const newContent = editorRef.current.innerHTML;
            setNotes(notes.map(n => n.id === selectedNoteId ? { ...n, content: newContent } : n));
        }
    };

    const handleTitleChange = (e) => {
        if (selectedNote) {
            setNotes(notes.map(n => n.id === selectedNoteId ? { ...n, title: e.target.value } : n));
        }
    };

    const createNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'Nowa notatka',
            content: '<div>Zacznij pisać...</div>',
            date: new Date().toISOString().split('T')[0]
        };
        setNotes([newNote, ...notes]);
        setSelectedNoteId(newNote.id);
    };

    const deleteNote = (id, e) => {
        e.stopPropagation();
        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        if (selectedNoteId === id && newNotes.length > 0) {
            setSelectedNoteId(newNotes[0].id);
        } else if (newNotes.length === 0) {
            setSelectedNoteId(null);
        }
    };

    const execCmd = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        handleContentChange();
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Sidebar - Note List */}
            <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <button
                        onClick={createNote}
                        className="w-full bg-violet-600 text-white py-2.5 px-4 rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm shadow-violet-200"
                    >
                        <Plus size={18} />
                        Nowa notatka
                    </button>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Szukaj notatek..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-all group ${selectedNoteId === note.id
                                    ? 'bg-white shadow-md border border-violet-100 ring-1 ring-violet-500/20'
                                    : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <h3 className={`font-medium truncate pr-2 ${selectedNoteId === note.id ? 'text-violet-900' : 'text-slate-900'}`}>
                                    {note.title}
                                </h3>
                                <button
                                    onClick={(e) => deleteNote(note.id, e)}
                                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 h-8 overflow-hidden opacity-70" dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]+>/g, ' ') }} />
                            <div className="mt-2 text-[10px] text-slate-400 font-medium">
                                {note.date}
                            </div>
                        </div>
                    ))}

                    {filteredNotes.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Brak notatek
                        </div>
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {selectedNote ? (
                    <>
                        {/* Toolbar */}
                        <div className="border-b border-slate-200 p-2 flex items-center gap-1 flex-wrap bg-white sticky top-0 z-10">
                            <div className="flex items-center border-r border-slate-200 pr-2 mr-2 gap-1">
                                <select
                                    className="h-8 px-2 text-sm border border-slate-200 rounded hover:border-slate-300 focus:outline-none cursor-pointer bg-transparent"
                                    onChange={(e) => execCmd('fontName', e.target.value)}
                                    defaultValue="Arial"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                </select>
                                <select
                                    className="h-8 px-2 text-sm border border-slate-200 rounded hover:border-slate-300 focus:outline-none cursor-pointer bg-transparent"
                                    onChange={(e) => execCmd('fontSize', e.target.value)}
                                    defaultValue="3"
                                >
                                    <option value="1">Mała</option>
                                    <option value="3">Normalna</option>
                                    <option value="5">Duża</option>
                                    <option value="7">Ogromna</option>
                                </select>
                            </div>

                            <div className="flex items-center border-r border-slate-200 pr-2 mr-2 gap-1">
                                <button onClick={() => execCmd('bold')} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Pogrubienie">
                                    <Bold size={18} />
                                </button>
                                <button onClick={() => execCmd('italic')} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Kursywa">
                                    <Italic size={18} />
                                </button>
                            </div>

                            <div className="flex items-center border-r border-slate-200 pr-2 mr-2 gap-1">
                                <div className="relative group">
                                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-1" title="Kolor tekstu">
                                        <Palette size={18} />
                                    </button>
                                    <input
                                        type="color"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        onChange={(e) => execCmd('foreColor', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Lista punktowana">
                                    <List size={18} />
                                </button>
                                <button onClick={() => execCmd('insertOrderedList')} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Lista numerowana">
                                    <ListOrdered size={18} />
                                </button>
                            </div>

                            <div className="ml-auto">
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Title Input */}
                        <div className="px-8 pt-6 pb-2">
                            <input
                                type="text"
                                value={selectedNote.title}
                                onChange={handleTitleChange}
                                className="w-full text-3xl font-bold text-slate-900 placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent"
                                placeholder="Tytuł notatki"
                            />
                            <div className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                                <FileText size={14} />
                                Ostatnia edycja: {selectedNote.date}
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div
                            className="flex-1 px-8 py-4 overflow-y-auto focus:outline-none prose prose-slate max-w-none"
                            contentEditable
                            ref={editorRef}
                            onInput={handleContentChange}
                            suppressContentEditableWarning={true}
                            style={{ minHeight: '200px' }}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Wybierz notatkę</h3>
                        <p>Wybierz notatkę z listy lub utwórz nową.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import {
    CheckCircle,
    Circle,
    Clock,
    Calendar,
    User,
    Plus,
    Filter,
    MoreVertical,
    AlertCircle,
    CheckSquare,
    Square,
    GripVertical,
    Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tasks() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Potwierdzić wizyty na jutro', dueDate: '2023-11-16', dueTime: '18:00', assignee: 'Recepcja', priority: 'high', status: 'todo', description: 'Zadzwonić do wszystkich klientów z wizytami na jutro.' },
        { id: 2, title: 'Zamówić farby L\'Oreal', dueDate: '2023-11-17', dueTime: '12:00', assignee: 'Marta W.', priority: 'medium', status: 'todo', description: 'Sprawdzić braki w magazynie i złożyć zamówienie.' },
        { id: 3, title: 'Przygotować raport miesięczny', dueDate: '2023-11-30', dueTime: '16:00', assignee: 'Anna K.', priority: 'low', status: 'in-progress', description: 'Zestawienie przychodów i kosztów za listopad.' },
        { id: 4, title: 'Wysłać newsletter urodzinowy', dueDate: '2023-11-15', dueTime: '10:00', assignee: 'System', priority: 'medium', status: 'done', description: 'Automatyczna wysyłka życzeń urodzinowych.' },
        { id: 5, title: 'Sprzątanie stanowisk', dueDate: '2023-11-16', dueTime: '20:00', assignee: 'Wszyscy', priority: 'low', status: 'todo', description: 'Generalne porządki po całym dniu.' },
    ]);

    const [draggedTask, setDraggedTask] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [openPriorityMenu, setOpenPriorityMenu] = useState(false);
    const [editingColumn, setEditingColumn] = useState(null);
    const [editColumnTitle, setEditColumnTitle] = useState('');

    const [columns, setColumns] = useState([
        { id: 'todo', title: 'Do zrobienia', color: 'bg-slate-100', icon: Circle },
        { id: 'in-progress', title: 'W trakcie', color: 'bg-blue-50', icon: Clock },
        { id: 'done', title: 'Zrobione', color: 'bg-green-50', icon: CheckCircle },
    ]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-100';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        // Set a transparent drag image or custom one if needed, but default is usually fine
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== status) {
            setTasks(tasks.map(t =>
                t.id === draggedTask.id ? { ...t, status: status } : t
            ));
        }
        setDraggedTask(null);
    };

    const cyclePriority = (taskId) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const priorities = ['low', 'medium', 'high'];
                const currentIndex = priorities.indexOf(t.priority);
                const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                return { ...t, priority: nextPriority };
            }
            return t;
        }));
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        setOpenMenu(null);
    };

    const handleEditTask = (taskId) => {
        // Placeholder for edit functionality - you can implement an edit modal/form here
        console.log('Edit task:', taskId);
        setOpenMenu(null);
        alert('Edycja zadania - funkcjonalność do implementacji');
    };

    const handleSetPriority = (taskId, priority) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, priority } : t));
        setOpenMenu(null);
        setOpenPriorityMenu(false);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenu(null);
            setOpenPriorityMenu(false);
        };
        if (openMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenu]);

    const handleColumnEdit = (columnId) => {
        const column = columns.find(c => c.id === columnId);
        setEditingColumn(columnId);
        setEditColumnTitle(column.title);
    };

    const handleColumnTitleSave = (columnId) => {
        setColumns(columns.map(c =>
            c.id === columnId ? { ...c, title: editColumnTitle } : c
        ));
        setEditingColumn(null);
        setEditColumnTitle('');
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Tablica zadań</h2>
                    <p className="text-slate-500 text-sm mt-1">Przeciągaj zadania między kolumnami</p>
                </div>
                <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
                    <Plus size={18} />
                    <span className="font-medium">Nowe zadanie</span>
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
                <div className="flex gap-6 h-full min-w-[800px]">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className={`flex-1 flex flex-col rounded-xl ${column.color} border border-slate-200/60`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-slate-200/60 flex items-center justify-between bg-white/50 rounded-t-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2 flex-1">
                                    <column.icon size={18} className="text-slate-500" />
                                    {editingColumn === column.id ? (
                                        <input
                                            type="text"
                                            value={editColumnTitle}
                                            onChange={(e) => setEditColumnTitle(e.target.value)}
                                            onBlur={() => handleColumnTitleSave(column.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleColumnTitleSave(column.id);
                                                if (e.key === 'Escape') {
                                                    setEditingColumn(null);
                                                    setEditColumnTitle('');
                                                }
                                            }}
                                            className="font-semibold text-slate-900 bg-white border border-violet-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            autoFocus
                                        />
                                    ) : (
                                        <h3 className="font-semibold text-slate-900">{column.title}</h3>
                                    )}
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 border border-slate-200">
                                        {tasks.filter(t => t.status === column.id).length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleColumnEdit(column.id)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-3 overflow-y-auto overflow-x-visible space-y-3">
                                <AnimatePresence>
                                    {tasks.filter(t => t.status === column.id).map((task) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                                    {task.priority === 'high' ? 'Pilne' : task.priority === 'medium' ? 'Średnie' : 'Niskie'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => cyclePriority(task.id)}
                                                        className="text-slate-300 hover:text-amber-500 transition-colors p-1 rounded hover:bg-slate-50"
                                                        title="Zmień priorytet"
                                                    >
                                                        <Flag size={14} className={task.priority === 'high' ? 'fill-red-500 text-red-500' : task.priority === 'medium' ? 'fill-amber-500 text-amber-500' : ''} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setMenuPosition({ top: rect.bottom, left: rect.right });
                                                            setOpenMenu(openMenu === task.id ? null : task.id);
                                                            setOpenPriorityMenu(false);
                                                        }}
                                                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h4 className="font-semibold text-slate-900 mb-1">{task.title}</h4>
                                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Calendar size={12} />
                                                    <span>{task.dueDate}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                                    <User size={12} />
                                                    <span>{task.assignee}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {tasks.filter(t => t.status === column.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                                        Pusto
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Position Menu Portal */}
            <AnimatePresence>
                {openMenu && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[90]"
                            onClick={() => {
                                setOpenMenu(null);
                                setOpenPriorityMenu(false);
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="fixed z-[100] bg-white rounded-lg shadow-2xl border border-slate-200 py-1 min-w-[170px]"
                            style={{
                                top: menuPosition.top + 5,
                                left: menuPosition.left - 170, // Align right edge with button
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => handleEditTask(openMenu)}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                                <Square size={16} />
                                Edytuj
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                                onClick={() => handleDeleteTask(openMenu)}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                                <AlertCircle size={16} />
                                Usuń
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <div
                                className="relative"
                                onMouseEnter={() => setOpenPriorityMenu(true)}
                                onMouseLeave={() => setOpenPriorityMenu(false)}
                            >
                                <div className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4 text-slate-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="flex-1">Nadaj priorytet</span>
                                    <Flag size={16} />
                                </div>

                                {/* Priority Submenu */}
                                <AnimatePresence>
                                    {openPriorityMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 5 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-full top-0 mr-2 bg-white rounded-lg shadow-2xl border border-slate-200 py-1 min-w-[140px] z-[110]"
                                        >
                                            <button
                                                onClick={() => handleSetPriority(openMenu, 'high')}
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                                            >
                                                <Flag size={16} className="fill-red-500" />
                                                Pilne
                                            </button>
                                            <button
                                                onClick={() => handleSetPriority(openMenu, 'medium')}
                                                className="w-full px-4 py-2.5 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-3 transition-colors font-medium"
                                            >
                                                <Flag size={16} className="fill-amber-500" />
                                                Średnie
                                            </button>
                                            <button
                                                onClick={() => handleSetPriority(openMenu, 'low')}
                                                className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors font-medium"
                                            >
                                                <Flag size={16} className="fill-blue-500" />
                                                Niskie
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

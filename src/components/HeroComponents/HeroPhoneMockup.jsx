"use client";

import { motion } from "framer-motion";
import { Calendar, Check, MapPin, Star, User, Search, Bell } from "lucide-react";

export default function HeroPhoneMockup() {
    return (
        <div className="relative w-[300px] md:w-[340px] h-[600px] md:h-[680px] mx-auto perspective-1000">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full h-full"
            >
                {/* Floating Animation Container */}
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full"
                >
                    {/* Phone Frame */}
                    <div className="relative w-full h-full bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                        {/* Dynamic Island / Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                            <div className="w-12 h-1.5 rounded-full bg-slate-800"></div>
                        </div>

                        {/* Screen Content */}
                        <div className="w-full h-full bg-slate-50 overflow-hidden relative">
                            {/* Header */}
                            <div className="pt-12 px-6 pb-4 bg-white flex justify-between items-center shadow-sm z-10 relative">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Witaj,</p>
                                        <p className="text-sm font-bold text-slate-900">Anna</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 relative">
                                    <Bell size={16} />
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 space-y-6 h-full overflow-hidden">
                                {/* Search Bar */}
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 text-slate-400">
                                    <Search size={18} />
                                    <span className="text-sm">Znajdź usługę...</span>
                                </div>

                                {/* Categories */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Kategorie</h4>
                                    <div className="flex gap-3 overflow-hidden">
                                        {[
                                            { icon: "✂️", name: "Włosy", color: "bg-blue-50" },
                                            { icon: "💅", name: "Paznokcie", color: "bg-pink-50" },
                                            { icon: "💆‍♀️", name: "Masaż", color: "bg-emerald-50" },
                                        ].map((cat, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                                className={`flex-shrink-0 w-20 h-24 ${cat.color} rounded-2xl flex flex-col items-center justify-center gap-2`}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Upcoming Appointment Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-white/80 mb-1">Najbliższa wizyta</p>
                                            <h3 className="text-lg font-bold">Glow Hair Studio</h3>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                                            <Calendar size={18} className="text-white" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-8 h-8 rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Stylista: Marek</p>
                                            <p className="text-xs text-white/70">Strzyżenie + Modelowanie</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                            <Calendar size={12} /> Jutro, 14:00
                                        </div>
                                        <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                            <MapPin size={12} /> Centrum
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Popular Places */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Popularne</h4>
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1 + i * 0.1 }}
                                                className="bg-white p-3 rounded-xl border border-slate-100 flex gap-3"
                                            >
                                                <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                                                <div>
                                                    <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                                                    <div className="h-3 w-16 bg-slate-100 rounded mb-2"></div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="text-yellow-400 fill-current" />)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Notifications */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="absolute top-[20%] -right-12 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
                >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Check size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Rezerwacja potwierdzona</p>
                        <p className="text-[10px] text-slate-500">Wysłano powiadomienie</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                    className="absolute bottom-[30%] -left-12 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
                >
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-200 border border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-pink-200 border border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-yellow-200 border border-white"></div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800">500+ opinii</p>
                        <p className="text-[10px] text-slate-500">W Twojej okolicy</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

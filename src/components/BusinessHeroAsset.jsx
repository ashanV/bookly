"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
    BarChart3,
    Users,
    Calendar,
    TrendingUp,
    Bell,
    CheckCircle2,
    ArrowUpRight,
    MessageSquare,
    MoreHorizontal
} from "lucide-react";
import { useState } from "react";

export default function BusinessHeroAsset() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            className="relative w-full h-[600px] flex items-center justify-center perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background blurred elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-600/30 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-fuchsia-600/30 rounded-full blur-[100px]"
            />

            {/* Main Dashboard Card */}
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d"
                }}
                initial={{ opacity: 0, y: 100, rotateX: 30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-[340px] sm:w-[400px] bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10"
            >
                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-50" />

                {/* Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            B
                        </div>
                        <div>
                            <div className="h-2 w-20 bg-slate-700 rounded-full mb-1.5"></div>
                            <div className="h-1.5 w-12 bg-slate-800 rounded-full"></div>
                        </div>
                    </div>
                    <div className="relative">
                        <Bell className="w-5 h-5 text-slate-400" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Revenue Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                                <BarChart3 size={20} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                +24.5% <ArrowUpRight size={12} className="ml-1" />
                            </span>
                        </div>
                        <div className="text-slate-400 text-xs font-medium mb-1">Przychód (Ten tydzień)</div>
                        <div className="text-3xl font-bold text-white tracking-tight">12,450 PLN</div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <Users className="w-5 h-5 text-blue-400 mb-3" />
                            <div className="text-xl font-bold text-white mb-1">148</div>
                            <div className="text-xs text-slate-500">Nowi klienci</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <Calendar className="w-5 h-5 text-pink-400 mb-3" />
                            <div className="text-xl font-bold text-white mb-1">32</div>
                            <div className="text-xs text-slate-500">Wizyty dziś</div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ostatnie rezerwacje</div>
                            <MoreHorizontal size={16} className="text-slate-600" />
                        </div>
                        {[1, 2].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${i === 0 ? 'bg-gradient-to-br from-pink-500 to-rose-500' : 'bg-gradient-to-br from-cyan-500 to-blue-500'}`}>
                                    {i === 0 ? 'AK' : 'MK'}
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 w-24 bg-slate-700 rounded-full mb-1.5"></div>
                                    <div className="h-1.5 w-16 bg-slate-800 rounded-full"></div>
                                </div>
                                <div className="text-xs text-slate-500 font-mono">14:00</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Floating Widgets */}

            {/* Notification Widget */}
            <motion.div
                initial={{ opacity: 0, x: 50, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                style={{ translateZ: 50 }}
                className="absolute top-16 -right-4 sm:-right-16 bg-white rounded-2xl p-4 shadow-2xl z-20 flex items-center gap-3 w-52 border border-slate-100"
            >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                    <CheckCircle2 size={20} />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-900">Nowa rezerwacja</div>
                    <div className="text-[10px] text-slate-500 font-medium">Anna K. • Fryzjer</div>
                </div>
            </motion.div>

            {/* Message Widget */}
            <motion.div
                initial={{ opacity: 0, x: -50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                style={{ translateZ: 30 }}
                className="absolute top-48 -left-8 sm:-left-20 bg-slate-800 rounded-2xl p-3 shadow-2xl z-20 flex items-center gap-3 w-48 border border-slate-700"
            >
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                        JD
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <div>
                    <div className="text-xs font-bold text-white">Jan D.</div>
                    <div className="text-[10px] text-slate-400">Czy jest wolny termin?</div>
                </div>
            </motion.div>

            {/* Growth Widget */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
                style={{ translateZ: 40 }}
                className="absolute bottom-24 -right-2 sm:-right-8 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-20 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <TrendingUp size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Wzrost wizyt</span>
                </div>
                <div className="h-16 w-36 flex items-end gap-1.5">
                    {[40, 60, 45, 70, 55, 85, 80].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1.2 + (i * 0.1), duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-sm"
                        />
                    ))}
                </div>
            </motion.div>

        </div>
    );
}

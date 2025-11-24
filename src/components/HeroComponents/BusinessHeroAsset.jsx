"use client";

import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    Users,
    Calendar,
    TrendingUp,
    Bell,
    CheckCircle2,
    ArrowUpRight,
    MessageSquare,
    MoreHorizontal,
    CreditCard,
    PieChart,
    Activity,
    Search,
    Menu
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function BusinessHeroAsset() {
    const containerRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smoother spring physics for premium feel
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    // Increased rotation range for more drama
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);

    // Parallax transforms for floating elements
    const floatingX = useTransform(mouseX, [-0.5, 0.5], ["-20px", "20px"]);
    const floatingY = useTransform(mouseY, [-0.5, 0.5], ["-20px", "20px"]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
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

    // Live Data Simulation
    const [revenue, setRevenue] = useState(12450);
    const [activeUsers, setActiveUsers] = useState(148);

    useEffect(() => {
        const interval = setInterval(() => {
            setRevenue(prev => prev + Math.floor(Math.random() * 100) - 30);
            if (Math.random() > 0.7) setActiveUsers(prev => prev + 1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[650px] flex items-center justify-center perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ambient Background Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 rounded-full blur-[120px] -z-10"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -50, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-600/30 to-cyan-600/30 rounded-full blur-[100px] -z-10"
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
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative w-[380px] sm:w-[460px] bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden z-10 group"
            >
                {/* Dynamic Spotlight Effect */}
                <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: useTransform(
                            [mouseX, mouseY],
                            ([x, y]) => `radial-gradient(600px circle at ${x * 100 + 50}% ${y * 100 + 50}%, rgba(255,255,255,0.08), transparent 40%)`
                        )
                    }}
                />

                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-50" />

                {/* Sidebar & Content Layout */}
                <div className="flex h-full min-h-[500px]">
                    {/* Mini Sidebar */}
                    <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-white/5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-violet-500/20">
                            B
                        </div>
                        <div className="flex flex-col gap-4 mt-4">
                            {[BarChart3, Calendar, Users, MessageSquare].map((Icon, i) => (
                                <div key={i} className={`p-2 rounded-lg transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <Icon size={18} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-white font-bold text-lg">Dashboard</h3>
                                <p className="text-slate-500 text-xs">Witaj ponownie, Anna</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="p-2 rounded-full bg-white/5 border border-white/5 text-slate-400">
                                    <Search size={16} />
                                </div>
                                <div className="p-2 rounded-full bg-white/5 border border-white/5 text-slate-400 relative">
                                    <Bell size={16} />
                                    <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 relative overflow-hidden group mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                                    <CreditCard size={20} />
                                </div>
                                <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    +24.5% <ArrowUpRight size={12} className="ml-1" />
                                </span>
                            </div>
                            <div className="text-slate-400 text-xs font-medium mb-1">Całkowity przychód</div>
                            <div className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                                {revenue.toLocaleString()} PLN
                                <motion.span
                                    key={revenue}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-slate-500 font-normal"
                                >
                                    (Live)
                                </motion.span>
                            </div>

                            {/* Animated Chart Line */}
                            <div className="mt-4 h-12 flex items-end gap-1">
                                {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: "20%" }}
                                        animate={{ height: `${h}%` }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            delay: i * 0.1,
                                            ease: "easeInOut"
                                        }}
                                        className="flex-1 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-t-sm opacity-80"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/stat">
                                <div className="flex justify-between items-start mb-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <PieChart size={14} className="text-slate-600" />
                                    </motion.div>
                                </div>
                                <div className="text-xl font-bold text-white mb-1">{activeUsers}</div>
                                <div className="text-xs text-slate-500">Klienci online</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <Calendar className="w-5 h-5 text-pink-400" />
                                    <Activity size={14} className="text-emerald-500" />
                                </div>
                                <div className="text-xl font-bold text-white mb-1">32</div>
                                <div className="text-xs text-slate-500">Wizyty dziś</div>
                            </div>
                        </div>

                        {/* Recent Activity List */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ostatnie rezerwacje</div>
                            </div>
                            {[
                                { name: "Anna K.", time: "14:00", type: "Strzyżenie", color: "from-pink-500 to-rose-500" },
                                { name: "Marek Z.", time: "15:30", type: "Konsultacja", color: "from-cyan-500 to-blue-500" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg bg-gradient-to-br ${item.color}`}>
                                        {item.name?.charAt(0) ?? item.name?.[0] ?? '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white group-hover/item:text-violet-300 transition-colors">{item.name}</div>
                                        <div className="text-[10px] text-slate-500">{item.type}</div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded-md">{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Widgets Layer (Parallax) */}

            {/* Success Notification */}
            <motion.div
                style={{
                    x: floatingX,
                    y: floatingY,
                    translateZ: 60
                }}
                initial={{ opacity: 0, x: 50, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                className="absolute top-20 -right-4 sm:-right-12 bg-white rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-30 flex items-center gap-3 w-auto border border-slate-100"
            >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                    <CheckCircle2 size={20} />
                </div>
                <div className="pr-4">
                    <div className="text-xs font-bold text-slate-900">Rezerwacja potwierdzona</div>
                    <div className="text-[10px] text-slate-500 font-medium">Płatność zaksięgowana</div>
                </div>
            </motion.div>

            {/* Message Widget */}
            <motion.div
                style={{
                    x: useTransform(mouseX, [-0.5, 0.5], ["20px", "-20px"]),
                    y: useTransform(mouseY, [-0.5, 0.5], ["20px", "-20px"]),
                    translateZ: 40
                }}
                initial={{ opacity: 0, x: -50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                className="absolute top-1/2 -left-8 sm:-left-16 bg-slate-800/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl z-30 flex items-center gap-3 w-56 border border-slate-700"
            >
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        JD
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
                </div>
                <div>
                    <div className="text-xs font-bold text-white">Jan D.</div>
                    <div className="text-[10px] text-slate-400">Czy jest wolny termin na jutro?</div>
                </div>
            </motion.div>

            {/* Growth Widget */}
            <motion.div
                style={{
                    x: floatingX,
                    y: useTransform(mouseY, [-0.5, 0.5], ["10px", "-10px"]),
                    translateZ: 80
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
                className="absolute bottom-32 -right-2 sm:-right-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-40 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <TrendingUp size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Wzrost +124%</span>
                </div>
                <div className="h-16 w-32 flex items-end gap-1">
                    {[30, 45, 35, 60, 50, 75, 65, 90].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1.2 + (i * 0.1), duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-[2px]"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
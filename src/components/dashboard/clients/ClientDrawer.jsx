import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronDown,
    Info,
    Calendar,
    ShoppingBag,
    Flag,
    StickyNote,
    ShieldAlert,
    Square,
    Sparkles,
    User
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';

// Format date helper
const formatDateStr = (dateStr, dateLocale) => {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return format(date, 'd MMM yyyy', { locale: dateLocale });
    } catch (e) {
        return dateStr;
    }
};

export default function ClientDrawer({ isOpen, onClose, client }) {
    const t = useTranslations('BusinessClientDrawer');
    const locale = useLocale();
    const dateLocale = locale === 'pl' ? pl : enUS;
    const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);

    if (!client) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[1200px] bg-white shadow-2xl z-[70] flex flex-col overflow-hidden"
                    >
                        <div className="flex h-full">
                            {/* Left Sidebar (Navigation + Header info) */}
                            <div className="w-[350px] bg-white border-r border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto">
                                {/* Close & Header */}
                                <div className="p-6">
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors mb-6"
                                    >
                                        <X size={24} className="text-slate-500" />
                                    </button>

                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-medium mb-4 ${client.color || 'bg-violet-100 text-violet-600'}`}>
                                            {client.avatar}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{client.firstName} {client.lastName}</h2>
                                        <p className="text-base text-slate-500 mb-8">{client.email}</p>

                                        <div className="flex gap-3 w-full px-2">
                                            <div className="flex-1 relative">
                                                <button
                                                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-full text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors shadow-sm"
                                                >
                                                    {t('options')}
                                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOptionsOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isOptionsOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setIsOptionsOpen(false)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 overflow-hidden"
                                                            >
                                                                <div className="px-5 py-2 text-sm font-bold text-slate-900 mb-1">
                                                                    {t('quickActions')}
                                                                </div>

                                                                <DropdownItem icon={ShoppingBag} label={t('sales')} />
                                                                <DropdownItem icon={Flag} label={t('addStaffNotice')} />
                                                                <DropdownItem icon={StickyNote} label={t('addNote')} />
                                                                <DropdownItem icon={ShieldAlert} label={t('addAllergies')} />
                                                                <DropdownItem icon={Square} label={t('addPatchTest')} />
                                                                <DropdownItem icon={Sparkles} label={t('addReward')} />

                                                                <div className="h-px bg-slate-100 my-2" />

                                                                <button className="w-full px-5 py-2.5 text-left text-[15px] font-medium text-slate-900 hover:bg-slate-50 transition-colors">
                                                                    {t('editClientData')}
                                                                </button>
                                                                <button className="w-full px-5 py-2.5 text-left text-[15px] font-medium text-slate-900 hover:bg-slate-50 transition-colors">
                                                                    {t('mergeProfiles')}
                                                                </button>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <button className="flex-1 px-4 py-2.5 bg-black text-white rounded-full hover:bg-slate-800 text-sm font-bold transition-colors shadow-lg shadow-gray-200">
                                                {t('bookNow')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info Snippets */}
                                <div className="px-8 py-4 space-y-4">
                                    {client.pronouns ? (
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                            <span className="w-5 flex justify-center text-lg leading-none text-slate-400">+</span>
                                            {client.pronouns}
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group text-left">
                                            <span className="w-5 flex justify-center text-lg leading-none text-slate-400 group-hover:text-slate-600 transition-colors">+</span>
                                            {t('addPronouns')}
                                        </button>
                                    )}

                                    {(client.birthDate || client.birthYear) ? (
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                            <span className="w-5 flex justify-center text-lg leading-none text-slate-400">🎂</span>
                                            {client.birthDate} {client.birthYear}
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group text-left">
                                            <span className="w-5 flex justify-center text-lg leading-none text-slate-400 group-hover:text-slate-600 transition-colors">🎂</span>
                                            {t('addBirthDate')}
                                        </button>
                                    )}

                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <span className="w-5 flex justify-center text-lg leading-none text-slate-400 text-[18px]">👤</span>
                                        {t('created')} {formatDateStr(client.createdAt || client.created, dateLocale)}
                                    </div>
                                </div>
                            </div>

                            {/* Middle Navigation Column */}
                            <div className="w-[250px] border-r border-slate-100 py-8 overflow-y-auto hidden md:block bg-slate-50/30">
                                <nav className="space-y-1.5 px-4">
                                    <NavButton active>{t('navSummary')}</NavButton>
                                    <NavButton badge="1">{t('navVisits')}</NavButton>
                                    <NavButton>{t('navSales')}</NavButton>
                                    <NavButton>{t('navClientData')}</NavButton>
                                    <NavButton>{t('navProductsServices')}</NavButton>
                                    <NavButton hasArrow>{t('navDocuments')}</NavButton>
                                    <NavButton>{t('navWallet')}</NavButton>
                                    <NavButton>{t('navLoyalty')}</NavButton>
                                    <NavButton>{t('navReviews')}</NavButton>
                                </nav>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 bg-white overflow-y-auto">
                                <div className="p-8 max-w-2xl">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-8">{t('navSummary')}</h2>

                                    {/* Portfel Card */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-900">{t('navWallet')}</h3>
                                            <button className="text-sm text-violet-600 hover:underline">{t('viewWallet')}</button>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-6 relative group hover:shadow-md transition-shadow cursor-default">
                                            <Info size={16} className="absolute top-4 right-4 text-slate-300" />
                                            <div className="text-sm font-medium text-slate-500 mb-1">{t('balance')}</div>
                                            <div className="text-2xl font-bold text-slate-900">0 zł</div>
                                        </div>
                                    </div>

                                    {/* Card Summary */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">{t('navSummary')}</h3>
                                        <div className="bg-white border border-slate-200 rounded-xl p-6 relative mb-4 hover:shadow-md transition-shadow cursor-default">
                                            <Info size={16} className="absolute top-4 right-4 text-slate-300" />
                                            <div className="text-sm font-medium text-slate-500 mb-1">{t('totalSales')}</div>
                                            <div className="text-2xl font-bold text-slate-900">0 zł</div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatCard label={t('statVisits')} value="1" />
                                        <StatCard label={t('statRating')} value="-" />
                                        <StatCard label={t('statCancelled')} value="0" />
                                        <StatCard label={t('statNoShow')} value="0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function NavButton({ children, active, badge, hasArrow }) {
    return (
        <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${active ? 'bg-violet-50 text-violet-900' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2">
                {children}
                {hasArrow && <ChevronDown size={14} />}
            </span>
            {badge && (
                <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full border border-slate-200">
                    {badge}
                </span>
            )}
        </button>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative hover:shadow-md transition-shadow cursor-default">
            <Info size={16} className="absolute top-4 right-4 text-slate-300" />
            <div className="text-sm font-medium text-slate-900 mb-1">{label}</div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
        </div>
    );
}

function DropdownItem({ icon: Icon, label }) {
    return (
        <button className="w-full px-5 py-2 flex items-center gap-3 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors group">
            <Icon size={18} className="text-slate-900" />
            <span>{label}</span>
        </button>
    );
}

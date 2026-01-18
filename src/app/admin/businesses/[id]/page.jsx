'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Star,
    Shield,
    ShieldAlert,
    CheckCircle,
    Globe,
    Phone,
    Mail,
    Calendar,
    Users,
    Briefcase,
    User,
    Loader2,
    Trash2,
    Trash,
    Image as ImageIcon,
    MessageSquare,
    LayoutDashboard,
    Eye,
    EyeOff,
    KeyRound,
    LogIn,
    Save,
    Edit,
    Scissors,
    Ban,
    Power,
    Wifi,
    WifiOff,
    History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BusinessDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeline, setTimeline] = useState([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        companyName: '',
        category: '',
        firstName: '',
        lastName: '',
        email: ''
    });

    // Service Edit State
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [serviceForm, setServiceForm] = useState({ name: '', description: '' });

    // Block Modal State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
    const [blockReasonInput, setBlockReasonInput] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const response = await fetch(`/api/admin/businesses/${id}`);
                if (!response.ok) throw new Error('Failed to fetch business');
                const data = await response.json();
                setBusiness(data);
                // Initialize form
                setEditForm({
                    companyName: data.companyName || '',
                    category: data.category || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || ''
                });
            } catch (error) {
                console.error(error);
                toast.error('Nie udało się pobrać danych firmy');
                router.push('/admin/businesses');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBusiness();
        }
    }, [id, router]);

    // Fetch timeline when tab is active
    useEffect(() => {
        if (activeTab === 'timeline' && id) {
            fetchTimeline();
        }
    }, [activeTab, id]);

    const fetchTimeline = async () => {
        try {
            setLoadingTimeline(true);
            const response = await fetch(`/api/admin/businesses/${id}/timeline`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setTimeline(data.timeline || []);
            }
        } catch (error) {
            console.error('Error fetching timeline:', error);
        } finally {
            setLoadingTimeline(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!confirm('Czy na pewno chcesz usunąć tę usługę?')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/services`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId })
            });
            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({ ...prev, services: data.services }));
                toast.success('Usługa usunięta');
            } else {
                toast.error('Błąd usuwania usługi');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleStartEditService = (service) => {
        setEditingServiceId(service.id);
        setServiceForm({ name: service.name, description: service.description || '' });
    };

    const handleCancelEditService = () => {
        setEditingServiceId(null);
        setServiceForm({ name: '', description: '' });
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!confirm('Czy na pewno chcesz usunąć tego pracownika? Ta operacja jest nieodwracalna.')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/employees`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId })
            });

            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({ ...prev, employees: data.employees }));
                toast.success('Pracownik usunięty');
            } else {
                const err = await response.text();
                toast.error('Błąd usuwania pracownika');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };



    const handleToggleActive = async () => {
        const isActive = business.isActive;
        const confirmMsg = isActive
            ? 'Czy chcesz dezaktywować ten biznes?'
            : 'Czy chcesz aktywować ten biznes?';

        if (!confirm(confirmMsg)) return;

        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive })
            });

            if (response.ok) {
                setBusiness(prev => ({ ...prev, isActive: !isActive }));
                toast.success(isActive ? 'Biznes dezaktywowany' : 'Biznes aktywowany');
            } else {
                toast.error('Zmiana statusu nie powiodła się');
            }
        } catch (error) {
            toast.error('Błąd połączenia');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteBusiness = async () => {
        setIsDeleteModalOpen(true);
        setDeleteConfirmationInput('');
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmationInput !== business.companyName) {
            toast.error('Nazwa nie pasuje');
            return;
        }

        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Biznes został usunięty');
                router.push('/admin/businesses');
            } else {
                toast.error('Usuwanie nie powiodło się');
                setUpdating(false);
            }
        } catch (error) {
            toast.error('Błąd połączenia');
            setUpdating(false);
        }
    };

    const handleSaveService = async () => {
        if (!serviceForm.name) return toast.error('Nazwa jest wymagana');
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/services`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: editingServiceId,
                    name: serviceForm.name,
                    description: serviceForm.description
                })
            });
            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({ ...prev, services: data.services }));
                toast.success('Usługa zaktualizowana');
                handleCancelEditService();
            } else {
                toast.error('Błąd aktualizacji usługi');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateBusiness = async (e) => {
        e.preventDefault();
        if (!confirm('Czy na pewno chcesz zaktualizować dane firmy?')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                const updatedBusiness = await response.json();
                setBusiness(prev => ({ ...prev, ...updatedBusiness }));
                toast.success('Dane zaktualizowane');
            } else {
                toast.error('Błąd aktualizacji danych');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleResetPassword = async () => {
        if (!confirm('Czy na pewno zresetować hasło? Zostanie wygenerowane nowe hasło tymczasowe.')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/reset-password`, {
                method: 'POST'
            });
            if (response.ok) {
                const data = await response.json();
                alert(`Hasło zresetowane. Nowe hasło tymczasowe: ${data.tempPassword}`);
            } else {
                toast.error('Błąd resetowania hasła');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleImpersonate = async () => {
        if (!confirm('Zostaniesz zalogowany jako ten biznes. Kontynuować?')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/auth/impersonate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: id })
            });

            if (response.ok) {
                const data = await response.json();
                // Store token in cookie (simulate login)
                document.cookie = `token=${data.token}; path=/; max-age=3600`;
                // Also can store in localStorage if used
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ role: 'business', id: business._id, email: business.email })); // Mock user data

                window.open('/business/dashboard', '_blank'); // Open in new tab to keep admin open
                toast.success('Zalogowano pomyślnie (nowa karta)');
            } else {
                toast.error('Błąd logowania');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleImageVisibility = async (imageUrl) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/gallery`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            });
            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({
                    ...prev,
                    portfolioImages: data.portfolioImages,
                    hiddenPortfolioImages: data.hiddenPortfolioImages
                }));
                toast.success(data.message.includes('unhidden') ? 'Zdjęcie widoczne' : 'Zdjęcie ukryte');
            } else {
                toast.error('Błąd zmiany widoczności');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleReviewVisibility = async (reviewId) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/reviews`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId })
            });
            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({ ...prev, reviews: data.reviews }));
                toast.success(data.message.includes('unhidden') ? 'Opinia widoczna' : 'Opinia ukryta');
            } else {
                toast.error('Błąd zmiany widoczności');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteImage = async (imageUrl) => {
        if (!confirm('Czy na pewno chcesz usunąć to zdjęcie?')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/gallery`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            });
            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({ ...prev, portfolioImages: data.portfolioImages }));
                toast.success('Zdjęcie usunięte');
            } else {
                toast.error('Błąd usuwania zdjęcia');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Czy na pewno chcesz usunąć tę opinię?')) return;
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/businesses/${id}/reviews`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId })
            });
            if (response.ok) {
                const data = await response.json();
                setBusiness(prev => ({ ...prev, reviews: data.reviews }));
                toast.success('Opinia usunięta');
            } else {
                toast.error('Błąd usuwania opinii');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleBlock = async (targetBlockedStatus, reason) => {
        setUpdating(true);
        try {
            const body = { isBlocked: targetBlockedStatus };
            if (reason !== undefined) body.blockReason = reason;

            console.log('DEBUG: Toggling Block', { targetBlockedStatus, reason, body });

            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const updatedBusiness = await response.json();
                setBusiness(prev => ({
                    ...prev,
                    isBlocked: updatedBusiness.isBlocked,
                    blockReason: updatedBusiness.blockReason
                }));
                toast.success(targetBlockedStatus ? 'Biznes zablokowany' : 'Biznes odblokowany');
            } else {
                toast.error('Błąd aktualizacji blokady');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusToggle = async () => {
        setUpdating(true);
        try {
            const newStatus = !business.isActive;
            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus })
            });

            if (response.ok) {
                const updatedBusiness = await response.json();
                // Ensure calculated fields are preserved if API returns raw object, 
                // but usually we might want to refresh. 
                // For simplicity, we merge the response with existing calculated fields 
                // or assume response is just the DB object and we re-apply basic local updates if needed.
                // Our PATCH returns the raw DB object usually. 
                // Let's just update the specific field locally to avoid losing calculated stats if API doesn't return them.
                setBusiness(prev => ({ ...prev, isActive: updatedBusiness.isActive }));
                toast.success(newStatus ? 'Konto aktywowane' : 'Konto zablokowane');
            } else {
                toast.error('Błąd aktualizacji statusu');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    const handleVerificationToggle = async () => {
        setUpdating(true);
        try {
            const newStatus = !business.isVerified;
            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: newStatus })
            });

            if (response.ok) {
                const updatedBusiness = await response.json();
                setBusiness(prev => ({ ...prev, isVerified: updatedBusiness.isVerified }));
                toast.success(newStatus ? 'Firma zweryfikowana' : 'Cofnięto weryfikację');
            } else {
                toast.error('Błąd aktualizacji weryfikacji');
            }
        } catch (error) {
            toast.error('Wystąpił błąd');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!business) return null;

    return (
        <div className="min-h-screen bg-[#0f111a] text-white">
            {/* Header / Banner Area */}
            <div className="relative h-64 w-full">
                {business.bannerImage ? (
                    <div className="absolute inset-0">
                        <img src={business.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/50 to-transparent"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-[#0f111a]"></div>
                )}

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 rounded-xl text-white backdrop-blur-md transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Wróć do listy</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 pb-12">

                {/* Main Identity Card */}
                <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
                    <div className="relative group">
                        {business.profileImage ? (
                            <img src={business.profileImage} alt="Logo" className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-[#0f111a] shadow-2xl object-cover bg-gray-800" />
                        ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-[#0f111a] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
                                {business.companyName?.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-3 -right-3 md:right-0 md:bottom-0">
                            {business.isActive ? (
                                <div className="p-2 bg-[#0f111a] rounded-full">
                                    <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-[#0f111a]" title="Aktywny"></div>
                                </div>
                            ) : (
                                <div className="p-2 bg-[#0f111a] rounded-full">
                                    <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-[#0f111a]" title="Zablokowany"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 pt-4 md:pt-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{business.companyName}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-800 text-purple-400 font-medium">
                                        <Briefcase className="w-4 h-4" />
                                        {business.category || 'Brak kategorii'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {business.city}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-white font-semibold">{business.averageRating || '0.0'}</span>
                                        <span className="text-sm">({business.reviewsCount || 0} opinii)</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {business.isVerified && (
                                    <span className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-medium flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Zweryfikowany Partner
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Przegląd
                    </button>
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'gallery'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        Galeria ({business.portfolioImages?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reviews'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Opinie ({business.reviews?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'services'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Scissors className="w-4 h-4" />
                        Usługi ({business.services?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'employees'
                            ? 'border-green-500 text-green-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Pracownicy ({business.employees?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('actions')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'actions'
                            ? 'border-red-500 text-red-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Akcje Administracyjne
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        Historia
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'timeline' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-yellow-500" />
                            Oś czasu aktywności
                        </h3>

                        {loadingTimeline ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : timeline.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Brak zarejestrowanej aktywności.
                            </div>
                        ) : (
                            <div className="relative border-l border-gray-800 ml-4 space-y-8">
                                {timeline.map((log, index) => (
                                    <div key={log._id || index} className="relative pl-8">
                                        <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                {(() => {
                                                    switch (log.action) {
                                                        case 'employee_created': return 'Dodano pracownika';
                                                        case 'employee_deleted': return 'Usunięto pracownika';
                                                        case 'service_created': return 'Dodano usługę';
                                                        case 'service_updated': return 'Zaktualizowano usługę';
                                                        case 'service_deleted': return 'Usunięto usługę';
                                                        case 'business_edited': return 'Edytowano dane firmy';
                                                        case 'business_verified': return 'Zweryfikowano firmę';
                                                        case 'business_rejected': return 'Odrzucono weryfikację';
                                                        default: return log.action.replace(/_/g, ' ');
                                                    }
                                                })()}
                                                <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                                    {log.userRole === 'admin' ? 'Administrator' : log.userRole || 'System'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(log.timestamp).toLocaleString('pl-PL')}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-800/50 block">
                                            {log.userEmail && <span className="block text-xs text-gray-500 mb-1">Przez: {log.userEmail}</span>}
                                            {log.details ? (
                                                <span className="font-mono text-xs text-gray-300">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </span>
                                            ) : '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Details & Contact */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-gray-800 rounded-lg text-purple-400">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Usługi</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white pl-1">{business.services?.length || 0}</div>
                                </div>
                                <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-gray-800 rounded-lg text-blue-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Pracownicy</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white pl-1">{business.employees?.length || 0}</div>
                                </div>
                                <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-gray-800 rounded-lg text-green-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Data dołączenia</span>
                                    </div>
                                    <div className="text-lg font-bold text-white pl-1 mt-1">
                                        {new Date(business.createdAt).toLocaleDateString('pl-PL')}
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Location Card */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-400" />
                                    Dane Kontaktowe i Lokalizacja
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <div className="space-y-4">
                                        <div className="group">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Właściciel</label>
                                            <div className="text-white text-lg">{business.firstName} {business.lastName}</div>
                                        </div>
                                        <div className="group">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Adres Email</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <span className="text-white hover:text-purple-400 transition-colors cursor-pointer">{business.email}</span>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Telefon</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="text-white">{business.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="group">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Lokalizacja</label>
                                            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800 flex items-start gap-3">
                                                <MapPin className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="text-white font-medium">{business.address}</div>
                                                    <div className="text-gray-400">{business.postalCode} {business.city}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {business.website && (
                                            <div className="group">
                                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Strona WWW</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                                                        {business.website}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Moderation */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sticky top-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Strefa Moderacji
                                </h3>

                                <div className="space-y-4">
                                    {/* Account Status Toggle */}
                                    <div className="bg-[#0f111a] rounded-xl p-4 border border-gray-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-white">Status Konta</h4>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={business.isActive}
                                                    onChange={handleStatusToggle}
                                                    disabled={updating}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Wyłączenie konta sprawi, że wizytówka firmy przestanie być widoczna dla użytkowników.
                                        </p>
                                        <div className={`text-xs font-semibold py-1 px-2 rounded inline-block ${business.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {business.isActive ? 'KONTO AKTYWNE' : 'KONTO NIEAKTYWNE'}
                                        </div>
                                    </div>

                                    {/* Block Status Toggle */}
                                    <div className="bg-[#0f111a] rounded-xl p-4 border border-gray-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-white">Blokada</h4>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={business.isBlocked}
                                                    onChange={() => {
                                                        if (business.isBlocked) {
                                                            setIsUnblockModalOpen(true);
                                                        } else {
                                                            setBlockReasonInput('');
                                                            setIsBlockModalOpen(true);
                                                        }
                                                    }}
                                                    disabled={updating}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Ukryj biznes przed klientami (wymaga powodu).
                                        </p>
                                        <div className={`text-xs font-semibold py-1 px-2 rounded inline-block ${business.isBlocked ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-800 text-gray-500'}`}>
                                            {business.isBlocked ? 'ZABLOKOWANY' : 'BRAK BLOKADY'}
                                        </div>

                                        {business.isBlocked && business.blockReason && (
                                            <div className="mt-3 p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
                                                <p className="text-xs text-red-400 font-semibold mb-1">Powód blokady:</p>
                                                <p className="text-sm text-gray-300 italic">"{business.blockReason}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Verification Toggle */}
                                    <div className="bg-[#0f111a] rounded-xl p-4 border border-gray-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-white">Weryfikacja</h4>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={business.isVerified}
                                                    onChange={handleVerificationToggle}
                                                    disabled={updating}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Zweryfikowani partnerzy otrzymują odznakę zaufania i wyższą pozycję w wyszukiwaniu.
                                        </p>
                                        <div className={`text-xs font-semibold py-1 px-2 rounded inline-block ${business.isVerified ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-800 text-gray-500'}`}>
                                            {business.isVerified ? 'ZWERYFIKOWANY' : 'BRAK WERYFIKACJI'}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={handleDeleteBusiness}
                                        disabled={updating}
                                        className="w-full flex items-center justify-between p-4 bg-red-600/10 border border-red-600/30 rounded-xl hover:bg-red-600/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-600/20 rounded-lg text-red-500 group-hover:text-red-400">
                                                <Trash className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-red-400">Usuń Trwale</div>
                                                <div className="text-xs text-red-400/60">Tej operacji nie można cofnąć</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Portfolio Biznesu</h3>
                            <span className="text-gray-400 text-sm">Zarządzaj widocznością zdjęć lub usuwaj je trwale</span>
                        </div>

                        {!business.portfolioImages || business.portfolioImages.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Brak zdjęć w portfolio</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {business.portfolioImages.map((img, idx) => {
                                    const isHidden = business.hiddenPortfolioImages?.includes(img);
                                    return (
                                        <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700 ${isHidden ? 'opacity-50 grayscale' : ''}`}>
                                            <img src={img} alt={`Portfolio ${idx}`} className="w-full h-full object-cover" />
                                            {isHidden && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                                    <EyeOff className="w-8 h-8 text-white/50" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleToggleImageVisibility(img)}
                                                    className="p-3 bg-gray-600/80 hover:bg-gray-600 text-white rounded-full transition-all shadow-lg transform scale-90 group-hover:scale-100"
                                                    title={isHidden ? "Pokaż zdjęcie" : "Ukryj zdjęcie"}
                                                    disabled={updating}
                                                >
                                                    {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteImage(img)}
                                                    className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all shadow-lg transform scale-90 group-hover:scale-100"
                                                    title="Usuń zdjęcie"
                                                    disabled={updating}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Opinie Klientów</h3>
                            <span className="text-gray-400 text-sm">Ukryj opinie wulgarne lub usuń te naruszające regulamin</span>
                        </div>

                        {!business.reviews || business.reviews.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Brak opinii</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {business.reviews.map((review) => (
                                    <div key={review._id} className={`bg-gray-800/40 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors ${review.hidden ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold relative">
                                                    {review.author?.charAt(0).toUpperCase() || 'A'}
                                                    {review.hidden && (
                                                        <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
                                                            <EyeOff className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white font-medium">{review.author}</span>
                                                        <span className="text-xs text-gray-500">• {new Date(review.date).toLocaleDateString()}</span>
                                                        {review.hidden && <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">Ukryta</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-300 text-sm leading-relaxed">{review.text}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleReviewVisibility(review._id)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title={review.hidden ? "Pokaż opinię" : "Ukryj opinię"}
                                                    disabled={updating}
                                                >
                                                    {review.hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Usuń opinię"
                                                    disabled={updating}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Usługi Biznesu</h3>
                            <span className="text-gray-400 text-sm">Edytuj nazwy wulgarne lub usuń nieodpowiednie usługi</span>
                        </div>

                        {!business.services || business.services.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Scissors className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Brak usług</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {business.services.map((service) => (
                                    <div key={service.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {editingServiceId === service.id ? (
                                            <div className="flex-1 grid gap-2">
                                                <input
                                                    type="text"
                                                    value={serviceForm.name}
                                                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                                    placeholder="Nazwa usługi"
                                                />
                                                <textarea
                                                    value={serviceForm.description}
                                                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                                    placeholder="Opis usługi"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={handleSaveService} disabled={updating} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Zapisz</button>
                                                    <button onClick={handleCancelEditService} disabled={updating} className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">Anuluj</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-white font-medium">{service.name}</h4>
                                                        <span className="text-blue-400 font-bold text-sm">{service.price} PLN</span>
                                                    </div>
                                                    <p className="text-gray-400 text-xs mb-1">{service.duration} min</p>
                                                    {service.description && <p className="text-gray-500 text-sm line-clamp-2">{service.description}</p>}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStartEditService(service)}
                                                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Edytuj usługę"
                                                        disabled={updating}
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteService(service.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Usuń usługę"
                                                        disabled={updating}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Pracownicy</h3>
                            <span className="text-gray-400 text-sm">Szczegółowy podgląd zespołu</span>
                        </div>

                        {!business.employees || business.employees.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Brak pracowników</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {business.employees.map((emp, idx) => {
                                    // Helper for Mapping
                                    const getServiceName = (sId) => {
                                        const s = business.services?.find(serv => serv.id === sId);
                                        return s ? s.name : 'Nieznana usługa';
                                    };

                                    // Format Date
                                    const joinDate = emp.id ? new Date(emp.id).toLocaleDateString() : 'Brak daty';

                                    // Role translation
                                    const roleMap = {
                                        'admin': 'Administrator',
                                        'manager': 'Manager',
                                        'employee': 'Pracownik',
                                        'calendar-only': 'Tylko Kalendarz',
                                        'no-access': 'Brak Dostępu'
                                    };

                                    return (
                                        <div key={idx} className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-700 transition-colors">
                                            {/* Header */}
                                            <div className="flex items-start gap-4 relative">
                                                <div className="w-14 h-14 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-bold text-xl overflow-hidden border-2 border-gray-600">
                                                    {emp.avatarImage ? (
                                                        <img src={emp.avatarImage} alt={emp.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        emp.avatar || emp.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-white font-bold text-lg truncate pr-8">{emp.name}</h4>
                                                        <div className="flex gap-2 items-center">
                                                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider ${emp.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                                emp.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {roleMap[emp.role] || emp.role}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteEmployee(emp.id)}
                                                                className="text-gray-500 hover:text-red-400 p-1 hover:bg-gray-700 rounded transition-colors"
                                                                title="Usuń pracownika"
                                                                disabled={updating}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-blue-400 text-sm font-medium">{emp.position || 'Stanowisko nieokreślone'}</p>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2 text-sm text-gray-400 bg-gray-900/40 p-3 rounded-xl">
                                                {emp.email && (
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                                        <span className="truncate" title={emp.email}>{emp.email}</span>
                                                    </div>
                                                )}
                                                {emp.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                                        <span>{emp.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-gray-500 pt-1 border-t border-gray-700 mt-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                                    <span>Zatrudniony: <span className="text-gray-300">{joinDate}</span></span>
                                                </div>
                                            </div>

                                            {/* Assigned Services */}
                                            <div className="flex-1">
                                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wider">Przypisane Usługi</h5>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {emp.assignedServices && emp.assignedServices.length > 0 ? (
                                                        emp.assignedServices.map((as, i) => (
                                                            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded truncate max-w-full">
                                                                {getServiceName(as.serviceId)}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-600 italic">Brak przypisanych usług</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions Tab */}
                {activeTab === 'actions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Edit Form */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Edytuj dane biznesu</h3>
                                <Edit className="text-gray-500 w-5 h-5" />
                            </div>
                            <form onSubmit={handleUpdateBusiness} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nazwa firmy</label>
                                    <input
                                        type="text"
                                        value={editForm.companyName}
                                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Kategoria</label>
                                    <input
                                        type="text"
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Imię właściciela</label>
                                        <input
                                            type="text"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Nazwisko właściciela</label>
                                        <input
                                            type="text"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <Save className="w-4 h-4" />
                                    {updating ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                </button>
                            </form>
                        </div>

                        {/* Critical Actions */}
                        <div className="space-y-6">
                            {/* Account Access */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                                <h3 className="text-xl font-bold text-white mb-6">Dostęp do konta</h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={updating}
                                        className="w-full flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500/20">
                                                <KeyRound className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-white">Resetuj hasło</div>
                                                <div className="text-xs text-gray-400">Wygeneruj tymczasowe hasło</div>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleImpersonate}
                                        disabled={updating}
                                        className="w-full flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20">
                                                <LogIn className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-white">Zaloguj jako ten biznes</div>
                                                <div className="text-xs text-gray-400">Przełącz się na panel biznesu</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Block Reason Modal */}
                {isBlockModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-orange-500">
                                <ShieldAlert className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Blokada Biznesu</h3>
                            </div>

                            <p className="text-gray-400 mb-6">
                                Czy na pewno chcesz zablokować ten biznes? Biznes stanie się niewidoczny dla klientów.
                                <br /><span className="text-orange-400">Podanie powodu jest wymagane.</span>
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-500 mb-2">Powód blokady</label>
                                <textarea
                                    value={blockReasonInput}
                                    onChange={(e) => setBlockReasonInput(e.target.value)}
                                    placeholder="Np. Niezapłacona faktura, naruszenie regulaminu..."
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 min-h-[100px]"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsBlockModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={() => {
                                        if (!blockReasonInput.trim()) {
                                            toast.error('Powód blokady jest wymagany');
                                            return;
                                        }
                                        handleToggleBlock(true, blockReasonInput);
                                        setIsBlockModalOpen(false);
                                    }}
                                    disabled={!blockReasonInput.trim()}
                                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-bold"
                                >
                                    Zablokuj
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unblock Modal */}
                {isUnblockModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-green-500">
                                <Shield className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Odblokuj Biznes</h3>
                            </div>

                            <p className="text-gray-400 mb-4">
                                Czy na pewno chcesz odblokować ten biznes? Biznes ponownie stanie się widoczny dla klientów i będzie mógł przyjmować rezerwacje.
                            </p>

                            {business.blockReason && (
                                <div className="mb-6 p-4 bg-gray-950 border border-gray-800 rounded-xl">
                                    <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Ostatni powód blokady</p>
                                    <p className="text-gray-300 italic">"{business.blockReason}"</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsUnblockModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={() => {
                                        handleToggleBlock(false, '');
                                        setIsUnblockModalOpen(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-bold"
                                >
                                    Odblokuj
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-red-500">
                                <Trash2 className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Usuń Biznes</h3>
                            </div>

                            <p className="text-gray-300 mb-2">
                                Czy na pewno chcesz trwale usunąć biznes <span className="font-bold text-white">{business.companyName}</span>?
                            </p>
                            <p className="text-red-400 text-sm mb-6 font-medium bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                Uwaga: Ta operacja jest nieodwracalna. Wszystkie dane, pracownicy i rezerwacje zostaną usunięte.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Aby potwierdzić, wpisz nazwę firmy: <span className="select-all text-white font-mono bg-gray-800 px-1 rounded">{business.companyName}</span>
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmationInput}
                                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                    placeholder={business.companyName}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={deleteConfirmationInput !== business.companyName}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-bold"
                                >
                                    Usuń trwale
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

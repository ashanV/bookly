"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import {
    Building2, ArrowLeft, Lock, Image as ImageIcon,
    MessageSquare, Store, Calendar, Tag, Landmark, Users, FileText
} from 'lucide-react';
import ProfileSection from '@/components/dashboard/settings/ProfileSection';
import ContactDataSection from '@/components/dashboard/settings/ContactDataSection';
import OpeningHoursSection from '@/components/dashboard/settings/OpeningHoursSection';
import PortfolioSection from '@/components/dashboard/settings/PortfolioSection';
import ReviewsSection from '@/components/dashboard/settings/ReviewsSection';
import CompanyConfigSection from '@/components/dashboard/settings/company-settings/CompanyConfigSection';
import CompanyEditForm from '@/components/dashboard/settings/company-settings/CompanyEditForm';
import SettingsCardGrid from '@/components/dashboard/settings/SettingsCardGrid';
import LocationsSection from '@/components/dashboard/settings/company-settings/LocationsSection';
import AddLocationWizard from '@/components/dashboard/settings/company-settings/AddLocationWizard';

export default function BusinessSettings() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [activeCategory, setActiveCategory] = useState('settings');
    const [activeSection, setActiveSection] = useState(null);
    const [showAddLocationWizard, setShowAddLocationWizard] = useState(false);

    // Profile State
    const [profileImage, setProfileImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [businessName, setBusinessName] = useState('Moja Firma');
    const [description, setDescription] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [website, setWebsite] = useState('');
    const [taxSettings, setTaxSettings] = useState('retail_excl');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');

    // Contact Data State
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Modals State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
    const [showHoursConfirmModal, setShowHoursConfirmModal] = useState(false);

    // Opening Hours State
    const [openingHours, setOpeningHours] = useState([
        { day: 'Poniedziałek', key: 'monday', open: '09:00', close: '17:00', closed: false },
        { day: 'Wtorek', key: 'tuesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Środa', key: 'wednesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Czwartek', key: 'thursday', open: '09:00', close: '17:00', closed: false },
        { day: 'Piątek', key: 'friday', open: '09:00', close: '17:00', closed: false },
        { day: 'Sobota', key: 'saturday', open: '10:00', close: '14:00', closed: false },
        { day: 'Niedziela', key: 'sunday', open: '00:00', close: '00:00', closed: true }
    ]);

    // Portfolio & Reviews State
    const [portfolio, setPortfolio] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (user) {
            setPhone(user.phone || '');
            setEmail(user.email || '');
            fetchBusinessData();
        }
    }, [user]);

    const fetchBusinessData = async () => {
        if (user?.id) {
            try {
                const response = await fetch(`/api/businesses/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const business = data.business;

                    if (business.workingHours) {
                        const mappedHours = openingHours.map(day => ({
                            ...day,
                            ...business.workingHours[day.key]
                        }));
                        setOpeningHours(mappedHours);
                    }

                    const reviewsData = business.reviewsList || business.reviews;
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);

                    if (business.profileImage) setProfileImage(business.profileImage);
                    if (business.bannerImage) setBannerImage(business.bannerImage);
                    if (business.portfolioImages && Array.isArray(business.portfolioImages)) {
                        setPortfolio(business.portfolioImages.map((url, index) => ({
                            id: `portfolio-${index}`,
                            url: url
                        })));
                    }
                    if (business.companyName) setBusinessName(business.companyName);
                    if (business.description) setDescription(business.description);
                    if (business.facebook) setFacebook(business.facebook);
                    if (business.instagram) setInstagram(business.instagram);
                    if (business.website) setWebsite(business.website);
                    if (business.city) setCity(business.city);
                    if (business.address) setAddress(business.address);
                    if (business.postalCode) setPostalCode(business.postalCode);
                }
            } catch (error) {
                console.error('Failed to fetch business data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Image Upload Helper
    const uploadImage = async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('folder', `bookly/${user?.id || 'default'}`);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return data.url;
            } else {
                throw new Error(data.error || 'Błąd uploadowania obrazu');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Błąd uploadowania obrazu: ' + error.message);
            return null;
        }
    };

    // Handlers
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);

            toast.info('Uploadowanie zdjęcia...');
            const url = await uploadImage(file, 'profile');
            if (url) {
                setProfileImage(url);
                await saveBusinessProfile({ profileImage: url });
                toast.success('Zdjęcie profilowe zostało zapisane!');
            }
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBannerImage(reader.result);
            reader.readAsDataURL(file);

            toast.info('Uploadowanie banera...');
            const url = await uploadImage(file, 'banner');
            if (url) {
                setBannerImage(url);
                await saveBusinessProfile({ bannerImage: url });
                toast.success('Baner został zapisany!');
            }
        }
    };

    const handlePortfolioUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        toast.info(`Uploadowanie ${files.length} zdjęć...`);
        const uploadPromises = files.map(async (file) => {
            const url = await uploadImage(file, 'portfolio');
            if (url) return { id: Date.now() + Math.random(), url };
            return null;
        });

        const uploadedImages = (await Promise.all(uploadPromises)).filter(img => img !== null);
        if (uploadedImages.length > 0) {
            const newPortfolio = [...portfolio, ...uploadedImages];
            setPortfolio(newPortfolio);
            await saveBusinessProfile({ portfolioImages: newPortfolio.map(img => img.url) });
            toast.success(`Dodano ${uploadedImages.length} zdjęć do portfolio!`);
        }
    };

    const deletePortfolioImage = async (id) => {
        const imageToDelete = portfolio.find(img => img.id === id);
        if (!imageToDelete) return;

        const updatedPortfolio = portfolio.filter(img => img.id !== id);
        setPortfolio(updatedPortfolio);

        await saveBusinessProfile({ portfolioImages: updatedPortfolio.map(img => img.url) });
        toast.success('Zdjęcie zostało usunięte!');
    };

    const saveBusinessProfile = async (updates = {}) => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika.");
            return { success: false };
        }

        try {
            const updateData = {
                companyName: businessName,
                description, facebook, instagram, twitter, website,
                taxSettings,
                city, address, postalCode,
                ...updates
            };

            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (response.ok) return { success: true };
            const data = await response.json();
            throw new Error(data.error || 'Błąd zapisywania danych');
        } catch (error) {
            toast.error(error.message || 'Wystąpił błąd podczas zapisywania');
            return { success: false, error: error.message };
        }
    };

    const handleSaveProfile = async () => {
        toast.info('Zapisywanie zmian...');
        const result = await saveBusinessProfile();
        if (result.success) toast.success('Dane firmy zostały zaktualizowane!');
    };

    const handleUpdateContactData = () => setShowConfirmModal(true);

    const confirmUpdate = async () => {
        const result = await updateProfile({ phone, email });
        if (result.success) toast.success('Dane kontaktowe zostały zaktualizowane!');
        else toast.error('Błąd aktualizacji: ' + result.error);
        setShowConfirmModal(false);
    };

    const handlePasswordChangeClick = () => {
        if (!currentPassword || !newPassword || !confirmPassword) return toast.error('Wypełnij wszystkie pola');
        if (newPassword !== confirmPassword) return toast.error('Nowe hasła nie są identyczne');
        if (newPassword.length < 6) return toast.error('Hasło musi mieć co najmniej 6 znaków');
        setShowPasswordConfirmModal(true);
    };

    const handleChangePassword = async () => {
        setShowPasswordConfirmModal(false);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.error || 'Błąd zmiany hasła');
            }
        } catch (error) {
            toast.error('Błąd połączenia z serwerem');
        }
    };

    const updateOpeningHours = (index, field, value) => {
        const updated = [...openingHours];
        updated[index][field] = value;
        setOpeningHours(updated);
    };

    const saveOpeningHours = async () => {
        if (!user?.id) return;
        const workingHours = {};
        openingHours.forEach(day => {
            workingHours[day.key] = { open: day.open, close: day.close, closed: day.closed };
        });

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workingHours }),
            });
            if (response.ok) {
                toast.success('Godziny otwarcia zostały zaktualizowane!');
                setShowHoursConfirmModal(false);
            } else {
                toast.error('Błąd aktualizacji godzin');
            }
        } catch (error) {
            toast.error('Błąd połączenia');
        }
    };

    // --- Navigation Config ---
    const categories = [
        { id: 'settings', label: 'Ustawienia' },
        { id: 'online', label: 'Obecność online' },
        { id: 'marketing', label: 'Marketing' }
    ];

    const cards = {
        settings: [
            { id: 'company', title: 'Konfiguracja firmy', description: 'Edytuj dane firmy oraz zarządzaj lokalizacjami.', icon: Store, component: 'profile', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { id: 'planning', title: 'Planowanie', description: 'Ustaw dostępność i preferencje rezerwacji.', icon: Calendar, component: 'hours', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { id: 'contact', title: 'Dane kontaktowe', description: 'Zarządzaj adresem email, telefonem oraz hasłem.', icon: Lock, component: 'data', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { id: 'sales', title: 'Sprzedaż', description: 'Skonfiguruj formy płatności i podatki.', icon: Tag, component: null, comingSoon: true, color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { id: 'billing', title: 'Rozliczenia', description: 'Zarządzaj fakturami i rozliczeniami.', icon: Landmark, component: null, comingSoon: true, color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { id: 'team', title: 'Zespół', description: 'Zarządzaj uprawnieniami i urlopami.', icon: Users, component: null, comingSoon: true, color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { id: 'forms', title: 'Formularze', description: 'Skonfiguruj szablony formularzy.', icon: FileText, component: null, comingSoon: true, color: 'text-purple-600', bgColor: 'bg-purple-50' }
        ],
        online: [
            { id: 'portfolio', title: 'Portfolio', description: 'Zarządzaj zdjęciami swoich prac.', icon: ImageIcon, component: 'portfolio', color: 'text-blue-600', bgColor: 'bg-blue-50' }
        ],
        marketing: [
            { id: 'reviews', title: 'Opinie', description: 'Przeglądaj i zarządzaj opiniami.', icon: MessageSquare, component: 'reviews', color: 'text-pink-600', bgColor: 'bg-pink-50' }
        ]
    };

    const getActiveSectionComponent = () => {
        switch (activeSection) {
            case 'legacy-profile':
                return (
                    <ProfileSection
                        profileImage={profileImage} bannerImage={bannerImage} businessName={businessName} description={description}
                        facebook={facebook} instagram={instagram} website={website} city={city} address={address} postalCode={postalCode}
                        onProfileImageChange={handleImageUpload} onBannerImageChange={handleBannerUpload}
                        onBusinessNameChange={setBusinessName} onDescriptionChange={setDescription}
                        onFacebookChange={setFacebook} onInstagramChange={setInstagram} onWebsiteChange={setWebsite}
                        onCityChange={setCity} onAddressChange={setAddress} onPostalCodeChange={setPostalCode} onSave={handleSaveProfile}
                    />
                );
            case 'data':
                return (
                    <ContactDataSection
                        phone={phone} email={email} currentPassword={currentPassword} newPassword={newPassword} confirmPassword={confirmPassword}
                        onPhoneChange={setPhone} onEmailChange={setEmail} onCurrentPasswordChange={setCurrentPassword}
                        onNewPasswordChange={setNewPassword} onConfirmPasswordChange={setConfirmPassword}
                        onUpdateContactData={handleUpdateContactData} onPasswordChangeClick={handlePasswordChangeClick}
                    />
                );
            case 'hours':
                return (
                    <OpeningHoursSection
                        openingHours={openingHours} onUpdateOpeningHours={updateOpeningHours}
                        onSaveHours={() => setShowHoursConfirmModal(true)} onApplyToAllEmployees={() => toast.info("Przeniesione do zakładki Zespół.")}
                    />
                );
            case 'portfolio':
                return <PortfolioSection portfolio={portfolio} onPortfolioUpload={handlePortfolioUpload} onDeleteImage={deletePortfolioImage} />;
            case 'reviews':
                const reviewsArray = Array.isArray(reviews) ? reviews : [];
                const avgRating = reviewsArray.length > 0 ? reviewsArray.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsArray.length : 0;
                return <ReviewsSection reviews={reviewsArray} avgRating={avgRating} onRefresh={fetchBusinessData} />;
            default:
                return null;
        }
    };

    const activeSectionTitle = Object.values(cards).flat().find(c => c.component === activeSection)?.title || 'Szczegóły';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 font-medium">Ładowanie ustawień...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Modals */}
            {showPasswordConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Zmiana hasła</h3>
                        <p className="text-gray-500 mb-6">Czy na pewno chcesz zmienić hasło?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPasswordConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl">Anuluj</button>
                            <button onClick={handleChangePassword} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl">Zmień hasło</button>
                        </div>
                    </div>
                </div>
            )}
            {showHoursConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Aktualizacja godzin</h3>
                        <p className="text-gray-500 mb-6">Czy na pewno chcesz zaktualizować godziny otwarcia?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowHoursConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl">Anuluj</button>
                            <button onClick={saveOpeningHours} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl">Potwierdź</button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Potwierdzenie zmiany</h3>
                        <p className="text-gray-500 mb-6">Czy na pewno chcesz zaktualizować dane kontaktowe?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl">Anuluj</button>
                            <button onClick={confirmUpdate} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl">Potwierdź</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                {!activeSection && (
                    <div className="mb-8 text-left">
                        <h1 className="text-2xl font-bold text-gray-900">Ustawienia obszaru roboczego</h1>
                        <p className="text-gray-500">Zarządzaj ustawieniami dla {businessName}.</p>
                    </div>
                )}
                {activeSection && !['profile', 'profile-edit', 'locations'].includes(activeSection) && (
                    <div className="mb-8 text-left flex items-center gap-4">
                        <button onClick={() => setActiveSection(null)} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{activeSectionTitle}</h1>
                            <p className="text-gray-500">Zarządzaj ustawieniami tej sekcji</p>
                        </div>
                    </div>
                )}

                {/* Tabs (Only visible in main view) */}
                {!activeSection && (
                    <div className="flex overflow-x-auto pb-4 mb-6 gap-6 scrollbar-hide text-left">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all ${activeCategory === cat.id ? 'bg-black text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {activeSection === 'profile-edit' ? (
                    <CompanyEditForm
                        businessName={businessName} setBusinessName={setBusinessName}
                        taxSettings={taxSettings} setTaxSettings={setTaxSettings}
                        facebook={facebook} setFacebook={setFacebook}
                        instagram={instagram} setInstagram={setInstagram}
                        twitter={twitter} setTwitter={setTwitter}
                        website={website} setWebsite={setWebsite}
                        onSave={() => { handleSaveProfile(); setActiveSection('profile'); }}
                        onClose={() => setActiveSection('profile')}
                    />
                ) : activeSection === 'profile' ? (
                    <CompanyConfigSection
                        businessName={businessName} facebook={facebook} instagram={instagram} website={website}
                        onBack={() => setActiveSection(null)}
                        onEditClick={() => setActiveSection('profile-edit')}
                        onSidebarClick={(tab) => {
                            if (tab === 'locations') setActiveSection('locations');
                            else if (tab === 'details') setActiveSection('profile');
                        }}
                        activeTab="details"
                    />
                ) : activeSection === 'locations' ? (
                    <LocationsSection
                        businessId={user?.id}
                        businessName={businessName}
                        address={address}
                        city={city}
                        phone={phone}
                        avgRating={reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length : 0}
                        reviewCount={reviews.length}
                        onBack={() => setActiveSection(null)}
                        onSidebarClick={(tab) => {
                            if (tab === 'details') setActiveSection('profile');
                            else if (tab === 'locations') setActiveSection('locations');
                        }}
                        onAddClick={() => setShowAddLocationWizard(true)}
                        activeTab="locations"
                    />
                ) : activeSection ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
                        {getActiveSectionComponent()}
                    </div>
                ) : (
                    <SettingsCardGrid cards={cards} activeCategory={activeCategory} onCardClick={setActiveSection} />
                )}
            </div>

            {/* Add Location Wizard Overlay */}
            {showAddLocationWizard && (
                <AddLocationWizard
                    onClose={() => setShowAddLocationWizard(false)}
                    businessId={user?.id}
                    onNext={(newLocation) => {
                        toast.success("Lokalizacja dodana");
                        setShowAddLocationWizard(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
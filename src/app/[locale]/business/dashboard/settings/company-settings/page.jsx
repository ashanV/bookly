"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import CompanyConfigSection from '@/components/dashboard/settings/company-settings/CompanyConfigSection';
import CompanyEditForm from '@/components/dashboard/settings/company-settings/CompanyEditForm';
import LocationsSection from '@/components/dashboard/settings/company-settings/LocationsSection';
import AddLocationWizard from '@/components/dashboard/settings/company-settings/AddLocationWizard';

export default function CompanySettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [businessData, setBusinessData] = useState(null);

    // Navigation State
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'details-edit', 'locations'
    const [showAddLocationWizard, setShowAddLocationWizard] = useState(false);

    // Profile State
    const [businessName, setBusinessName] = useState('Moja Firma');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [website, setWebsite] = useState('');
    const [taxSettings, setTaxSettings] = useState('retail_excl');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (user) {
            setPhone(user.phone || '');
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
                    setBusinessData(business);

                    const reviewsData = business.reviewsList || business.reviews;
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);

                    if (business.companyName) setBusinessName(business.companyName);
                    if (business.facebook) setFacebook(business.facebook);
                    if (business.instagram) setInstagram(business.instagram);
                    if (business.website) setWebsite(business.website);
                    if (business.city) setCity(business.city);
                    if (business.address) setAddress(business.address);
                }
            } catch (error) {
                console.error('Failed to fetch business data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const saveBusinessProfile = async (updates = {}) => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika.");
            return { success: false };
        }

        try {
            const updateData = {
                companyName: businessName,
                facebook, instagram, twitter, website,
                taxSettings,
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'details-edit' ? (
                    <CompanyEditForm
                        businessName={businessName} setBusinessName={setBusinessName}
                        taxSettings={taxSettings} setTaxSettings={setTaxSettings}
                        facebook={facebook} setFacebook={setFacebook}
                        instagram={instagram} setInstagram={setInstagram}
                        twitter={twitter} setTwitter={setTwitter}
                        website={website} setWebsite={setWebsite}
                        onSave={() => { handleSaveProfile(); setActiveTab('details'); }}
                        onClose={() => setActiveTab('details')}
                    />
                ) : activeTab === 'locations' ? (
                    <LocationsSection
                        businessId={user?.id}
                        businessName={businessName}
                        address={address}
                        city={city}
                        phone={phone}
                        avgRating={reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length : 0}
                        reviewCount={reviews.length}
                        onBack={() => router.push('/business/dashboard/settings')}
                        onSidebarClick={(tab) => {
                            if (tab === 'details') setActiveTab('details');
                            else if (tab === 'locations') setActiveTab('locations');
                        }}
                        onAddClick={() => setShowAddLocationWizard(true)}
                        activeTab="locations"
                    />
                ) : (
                    <CompanyConfigSection
                        businessName={businessName}
                        facebook={facebook}
                        instagram={instagram}
                        website={website}
                        onBack={() => router.push('/business/dashboard/settings')}
                        onEditClick={() => setActiveTab('details-edit')}
                        onSidebarClick={(tab) => {
                            if (tab === 'locations') setActiveTab('locations');
                            else if (tab === 'details') setActiveTab('details');
                        }}
                        activeTab="details"
                    />
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

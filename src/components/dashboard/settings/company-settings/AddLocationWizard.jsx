"use client";

import React, { useState } from 'react';
import {
    X, Check, Scissors, HandMetal, Eye, Sparkles,
    User, Activity, Waves, Flame, Heart, Sun, Dumbbell,
    Stethoscope, Dog, LayoutGrid, Syringe
} from 'lucide-react';
import { toast } from '@/components/Toast';
import AddressDetailsModal from '@/components/dashboard/clients/AddressDetailsModal';
import { DEFAULT_HOURS } from '@/components/dashboard/settings/company-settings/WorkingHoursEditor';
import { INDUSTRIES } from '@/constants/industries';

// Import Wizard Steps
import Step1BasicInfo from './wizard-steps/Step1BasicInfo';
import Step2BusinessType from './wizard-steps/Step2BusinessType';
import Step3AdditionalTypes from './wizard-steps/Step3AdditionalTypes';
import Step4LocationAddress from './wizard-steps/Step4LocationAddress';
import Step5WorkingHours from './wizard-steps/Step5WorkingHours';

export default function AddLocationWizard({ onClose, onNext, businessId }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phonePrefix: '+48',
        phone: '',
        email: '',
        businessType: '',
        additionalTypes: [],
        address: '',
        noAddress: false,
        addressDetails: null,
        billingAddressDetails: null,
        workingHours: DEFAULT_HOURS
    });
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [modalMode, setModalMode] = useState('main'); // 'main' or 'billing'

    // Parse Address Helper
    const parsedAddress = React.useMemo(() => {
        if (formData.addressDetails) {
            return {
                street: formData.addressDetails.street || '-',
                city: formData.addressDetails.city || '-',
                zip: formData.addressDetails.postCode || '-',
                region: formData.addressDetails.region ? `${formData.addressDetails.province}, ${formData.addressDetails.region}` : '-',
                country: formData.addressDetails.country || 'Polska'
            };
        }

        if (!formData.address) return { city: '-', street: '-', zip: '-', region: '-', country: 'Polska' };

        // Simple heuristic: "Street, City" or just "City"
        const parts = formData.address.split(',').map(s => s.trim());

        // If only one part, assume it's the City (like "Warszawa")
        if (parts.length === 1) {
            return { city: parts[0], street: '-', zip: '-', region: '-', country: 'Polska' };
        }

        // If multiple parts, assume last is City, rest is Street
        const city = parts[parts.length - 1];
        const street = parts.slice(0, parts.length - 1).join(', ');

        return { city, street, zip: '-', region: '-', country: 'Polska' };
    }, [formData.addressDetails, formData.address]);

    // Industry Options
    const industries = INDUSTRIES;

    // Validation
    const validate = (data, currentStep) => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!data.name.trim()) newErrors.name = 'To pole jest wymagane';
            if (!data.phone.trim()) newErrors.phone = 'To pole jest wymagane';
            if (!data.email.trim()) newErrors.email = 'To pole jest wymagane';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Nieprawidłowy format email';
        }
        if (currentStep === 2) {
            if (!data.businessType) newErrors.businessType = 'Wybierz typ działalności';
        }
        // Step 3 is optional
        if (currentStep === 4) {
            if (!data.noAddress && !data.address.trim()) newErrors.address = 'Wprowadź adres firmy';
        }
        return newErrors;
    };

    const handleNext = async () => {
        const newErrors = validate(formData, step);
        setErrors(newErrors);

        if (step === 1) {
            setTouched({ name: true, phone: true, email: true });
            if (Object.keys(newErrors).length === 0) {
                setStep(2);
            }
        } else if (step === 2) {
            if (Object.keys(newErrors).length === 0) {
                setStep(3);
            } else {
                toast.error("Wybierz rodzaj działalności aby kontynuować");
            }
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            if (Object.keys(newErrors).length === 0) {
                setStep(5);
            }
        } else if (step === 5) {
            // Save to database
            await saveLocation();
        }
    };

    const saveLocation = async () => {
        if (!businessId) {
            toast.error("Brak identyfikatora biznesu");
            return;
        }

        setIsSubmitting(true);
        try {
            const csrfRes = await fetch('/api/csrf');
            const csrfData = await csrfRes.json();

            const response = await fetch(`/api/businesses/${businessId}/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfData.csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    phone: `${formData.phonePrefix}${formData.phone}`,
                    email: formData.email,
                    businessType: formData.businessType,
                    additionalTypes: formData.additionalTypes,
                    address: formData.address,
                    addressDetails: formData.addressDetails,
                    billingAddressDetails: formData.billingAddressDetails,
                    noAddress: formData.noAddress,
                    workingHours: formData.workingHours
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.limitReached) {
                    toast.error(data.error || "Osiągnięto limit lokalizacji dla Twojego planu");
                } else {
                    toast.error(data.error || "Wystąpił błąd podczas dodawania lokalizacji");
                }
                return;
            }

            toast.success("Lokalizacja dodana pomyślnie");
            if (onNext) onNext(data.location);
            onClose();
        } catch (error) {
            console.error('Error saving location:', error);
            toast.error("Wystąpił błąd podczas zapisywania lokalizacji");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (field, value) => {
        if (field === 'additionalTypes') {
            const current = formData.additionalTypes;
            const updated = current.includes(value)
                ? current.filter(id => id !== value)
                : [...current, value];
            setFormData(prev => ({ ...prev, additionalTypes: updated }));
        } else if (field === 'address') {
            setFormData(prev => ({ ...prev, address: value, addressDetails: null }));
            if (touched.address || step === 4) setErrors(prev => ({ ...prev, address: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (touched[field] || step === 2 || step === 4) {
                setErrors(prev => ({ ...prev, [field]: '' }));
            }
        }
    };

    const handleAddressSave = (details) => {
        const parts = [
            details.street,
            details.apartmentNumber ? `lok. ${details.apartmentNumber}` : '',
            details.city,
            details.province
        ].filter(Boolean);

        const addressString = parts.join(', ');

        if (modalMode === 'main') {
            setFormData(prev => ({
                ...prev,
                address: addressString,
                addressDetails: details
            }));
            setErrors(prev => ({ ...prev, address: '' }));
        } else {
            setFormData(prev => ({
                ...prev,
                billingAddressDetails: details
            }));
        }

        setShowAddressModal(false);
    };

    const openAddressModal = (mode = 'main') => {
        setModalMode(mode);
        setShowAddressModal(true);
    };

    const billingAddressDisplay = React.useMemo(() => {
        if (formData.billingAddressDetails) {
            const d = formData.billingAddressDetails;
            return [d.street, d.apartmentNumber ? `lok. ${d.apartmentNumber}` : '', d.city, d.postCode].filter(Boolean).join(', ');
        }
        if (formData.address && formData.address.length > 0) return formData.address;
        return null;
    }, [formData.billingAddressDetails, formData.address]);

    const modalInitialData = React.useMemo(() => {
        if (modalMode === 'billing') {
            return formData.billingAddressDetails || (formData.addressDetails ? formData.addressDetails : { street: formData.address });
        }
        return formData.addressDetails || { street: formData.address };
    }, [modalMode, formData.billingAddressDetails, formData.addressDetails, formData.address]);

    const progressWidth = step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%';

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 relative">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="text-purple-600 font-medium hover:underline text-sm"
                        >
                            Wstecz
                        </button>
                    )}
                </div>

                <div className="absolute left-0 bottom-0 h-1 bg-purple-100 w-full">
                    <div
                        className="h-full bg-purple-600 transition-all duration-300 ease-in-out"
                        style={{ width: progressWidth }}
                    ></div>
                </div>

                <button
                    onClick={handleNext}
                    className="px-8 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                    Dalej
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center p-6">
                <div className="w-full max-w-5xl mt-12">
                    <div className="text-center mb-10">
                        <h2 className="text-sm font-medium text-gray-500 mb-2">Dodaj nową lokalizację</h2>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {step === 1 ? 'O Twojej firmie' : step === 2 ? 'Wybierz główny rodzaj działalności' : step === 3 ? 'Wybierz dodatkowe rodzaje działalności' : 'Dodaj swoją lokalizację'}
                        </h1>
                    </div>

                    {step === 1 && (
                        <Step1BasicInfo
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                        />
                    )}

                    {step === 2 && (
                        <Step2BusinessType
                            formData={formData}
                            handleChange={handleChange}
                            industries={industries}
                        />
                    )}

                    {step === 3 && (
                        <Step3AdditionalTypes
                            formData={formData}
                            handleChange={handleChange}
                            industries={industries}
                        />
                    )}

                    {step === 4 && (
                        <Step4LocationAddress
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                            parsedAddress={parsedAddress}
                            billingAddressDisplay={billingAddressDisplay}
                            openAddressModal={openAddressModal}
                        />
                    )}

                    {step === 5 && (
                        <Step5WorkingHours
                            formData={formData}
                            handleChange={handleChange}
                        />
                    )}

                    <AddressDetailsModal
                        isOpen={showAddressModal}
                        onClose={() => setShowAddressModal(false)}
                        onSave={handleAddressSave}
                        initialData={modalInitialData}
                    />
                </div>
            </div>
        </div>
    );
}
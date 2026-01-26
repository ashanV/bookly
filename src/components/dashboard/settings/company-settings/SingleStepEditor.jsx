"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from '@/components/Toast';

import { INDUSTRIES } from '@/constants/industries';

// Import Wizard Steps
import Step1BasicInfo from './wizard-steps/Step1BasicInfo';
import Step2BusinessType from './wizard-steps/Step2BusinessType';
import Step3AdditionalTypes from './wizard-steps/Step3AdditionalTypes';
import Step4LocationAddress from './wizard-steps/Step4LocationAddress';
import Step5WorkingHours from './wizard-steps/Step5WorkingHours';
import { DEFAULT_HOURS } from './WorkingHoursEditor';

// Import Modals
import AddressDetailsModal from '@/components/dashboard/clients/AddressDetailsModal';

export default function SingleStepEditor({
    isOpen,
    onClose,
    location,
    onUpdate,
    mode = 'contact' // 'contact', 'types', 'address', 'hours', etc.
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Address Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [modalMode, setModalMode] = useState('main'); // 'main' or 'billing'

    // Initialize form data based on location prop
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
        workingHours: location.workingHours || DEFAULT_HOURS
    });

    useEffect(() => {
        if (location) {
            // Helper to split phone if needed
            let phonePrefix = '+48';
            let phone = '';

            if (location.phone) {
                if (location.phone.startsWith('+48')) {
                    phonePrefix = '+48';
                    phone = location.phone.replace('+48', '');
                } else if (location.phone.startsWith('+1')) {
                    phonePrefix = '+1';
                    phone = location.phone.replace('+1', '');
                } else if (location.phone.startsWith('+44')) {
                    phonePrefix = '+44';
                    phone = location.phone.replace('+44', '');
                } else {
                    phone = location.phone;
                }
            }

            // Handle addressDetails reconstruction if data comes from API as flattened object or separate fields
            // Assuming location object matches Business model structure
            const addressDetails = location.address && typeof location.address === 'object' ? location.address : null;
            const addressString = addressDetails
                ? [addressDetails.street, addressDetails.city].filter(Boolean).join(', ')
                : (typeof location.address === 'string' ? location.address : '');

            setFormData({
                name: location.name || '',
                phonePrefix,
                phone,
                email: location.email || '',
                businessType: location.businessType || '',
                additionalTypes: location.additionalTypes || [],
                address: addressString,
                noAddress: location.noAddress || false,
                addressDetails: addressDetails,
                billingAddressDetails: location.billingAddress || null,
                workingHours: location.workingHours || DEFAULT_HOURS
            });
        }
    }, [location]);

    // Parse Address Helper (Copied from Wizard)
    const parsedAddress = useMemo(() => {
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

        const parts = formData.address.split(',').map(s => s.trim());
        if (parts.length === 1) {
            return { city: parts[0], street: '-', zip: '-', region: '-', country: 'Polska' };
        }

        const city = parts[parts.length - 1];
        const street = parts.slice(0, parts.length - 1).join(', ');

        return { city, street, zip: '-', region: '-', country: 'Polska' };
    }, [formData.addressDetails, formData.address]);

    // Billing Address Display Helper
    const billingAddressDisplay = useMemo(() => {
        if (formData.billingAddressDetails) {
            const d = formData.billingAddressDetails;
            return [d.street, d.apartmentNumber ? `lok. ${d.apartmentNumber}` : '', d.city, d.postCode].filter(Boolean).join(', ');
        }
        if (formData.address && formData.address.length > 0) return formData.address;
        return null;
    }, [formData.billingAddressDetails, formData.address]);

    // Modal Initial Data Helper
    const modalInitialData = useMemo(() => {
        if (modalMode === 'billing') {
            return formData.billingAddressDetails || (formData.addressDetails ? formData.addressDetails : { street: formData.address });
        }
        return formData.addressDetails || { street: formData.address };
    }, [modalMode, formData.billingAddressDetails, formData.addressDetails, formData.address]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        if (field === 'address') {
            setFormData(prev => ({ ...prev, address: value, addressDetails: null }));
            if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (errors[field]) {
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

    const validate = () => {
        const newErrors = {};
        if (mode === 'contact') {
            if (!formData.name.trim()) newErrors.name = 'To pole jest wymagane';
            if (!formData.phone.trim()) newErrors.phone = 'To pole jest wymagane';
            if (!formData.email.trim()) newErrors.email = 'To pole jest wymagane';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Nieprawidłowy format email';
        } else if (mode === 'address') {
            if (!formData.noAddress && !formData.address.trim()) newErrors.address = 'Wprowadź adres firmy';
        }
        return newErrors;
    };

    const handleSave = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Construct payload based on mode
            const payload = {};

            if (mode === 'contact') {
                payload.name = formData.name;
                payload.phone = `${formData.phonePrefix}${formData.phone}`;
                payload.email = formData.email;
            } else if (mode === 'types') {
                payload.businessType = formData.businessType;
                payload.additionalTypes = formData.additionalTypes;
            } else if (mode === 'address') {
                payload.address = formData.address;
                payload.noAddress = formData.noAddress;
                payload.addressDetails = formData.addressDetails;
                payload.billingAddressDetails = formData.billingAddressDetails;
            } else if (mode === 'hours') {
                payload.workingHours = formData.workingHours;
            }

            // Get CSRF token
            const csrfRes = await fetch('/api/csrf');
            const csrfData = await csrfRes.json();

            const response = await fetch(`/api/businesses/${location.businessId || 'current'}/locations/${location.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfData.csrfToken
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Błąd aktualizacji danych');
            }

            const updatedLocation = await response.json();

            toast.success('Dane zostały zaktualizowane');
            if (onUpdate) onUpdate(updatedLocation.location || updatedLocation); // Handle wrapper if any
            onClose();
        } catch (error) {
            console.error('Error updating location:', error);
            toast.error(error.message || 'Wystąpił błąd');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine content based on mode
    let title = '';
    let StepComponent = null;

    switch (mode) {
        case 'contact':
            title = 'Edytuj informacje podstawowe';
            StepComponent = Step1BasicInfo;
            break;
        case 'types':
            title = 'Edytuj rodzaje działalności';
            StepComponent = ({ formData, handleChange }) => (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Główny rodzaj działalności</h3>
                        <Step2BusinessType
                            formData={formData}
                            handleChange={handleChange}
                            industries={INDUSTRIES}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Dodatkowe rodzaje działalności</h3>
                        <Step3AdditionalTypes
                            formData={formData}
                            handleChange={handleChange}
                            industries={INDUSTRIES}
                        />
                    </div>
                </div>
            );
            break;
        case 'address':
            title = 'Edytuj adres i dane rozliczeniowe';
            StepComponent = Step4LocationAddress;
            break;
        case 'hours':
            title = 'Edytuj godziny otwarcia';
            StepComponent = Step5WorkingHours;
            break;
        default:
            return null;
    }

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
                    <span className="font-semibold text-gray-900">{title}</span>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    Zapisz zmiany
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center p-6">
                <div className="w-full max-w-5xl mt-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {title}
                        </h1>
                    </div>

                    {StepComponent && (
                        <StepComponent
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                            parsedAddress={parsedAddress}
                            billingAddressDisplay={billingAddressDisplay}
                            openAddressModal={openAddressModal}
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

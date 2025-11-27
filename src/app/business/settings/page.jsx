"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
import { Building2, Settings, ArrowLeft, Lock, User, Users, Image as ImageIcon, MessageSquare, Clock, Briefcase, CalendarDays, AlertTriangle } from 'lucide-react';
import ProfileSection from '@/components/settings/ProfileSection';
import ContactDataSection from '@/components/settings/ContactDataSection';
import OpeningHoursSection from '@/components/settings/OpeningHoursSection';
import ServicesSection from '@/components/settings/ServicesSection';
import PortfolioSection from '@/components/settings/PortfolioSection';
import ReviewsSection from '@/components/settings/ReviewsSection';
import EmployeesSection from '@/components/settings/EmployeesSection';
import AvailabilitySection from '@/components/settings/AvailabilitySection';

export default function BusinessSettings() {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [businessName, setBusinessName] = useState('Moja Firma');
    const [description, setDescription] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    // Location state
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
    const [showHoursConfirmModal, setShowHoursConfirmModal] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user) {
            setPhone(user.phone || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateContactData = () => {
        setShowConfirmModal(true);
    };

    const confirmUpdate = async () => {
        const result = await updateProfile({ phone, email });
        if (result.success) {
            toast.success('Dane kontaktowe zostały zaktualizowane!');
        } else {
            toast.error('Błąd aktualizacji: ' + result.error);
        }
        setShowConfirmModal(false);
    };

    const handlePasswordChangeClick = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Nowe hasła nie są identyczne');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Hasło musi mieć co najmniej 6 znaków');
            return;
        }
        setShowPasswordConfirmModal(true);
    };

    const handleChangePassword = async () => {
        setShowPasswordConfirmModal(false);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.error || 'Wystąpił błąd podczas zmiany hasła');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };
    const [employees, setEmployees] = useState([
        {
            id: 1, name: 'Jan Kowalski', position: 'Fryzjer', phone: '123456789', avatar: 'JK',
            availability: {
                monday: { open: '09:00', close: '17:00', closed: false },
                tuesday: { open: '09:00', close: '17:00', closed: false },
                wednesday: { open: '09:00', close: '17:00', closed: false },
                thursday: { open: '09:00', close: '17:00', closed: false },
                friday: { open: '09:00', close: '17:00', closed: false },
                saturday: { open: '10:00', close: '14:00', closed: false },
                sunday: { open: '00:00', close: '00:00', closed: true }
            },
            vacations: [],
            breaks: [],
            assignedServices: [1, 2]
        }
    ]);
    const [portfolio, setPortfolio] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        phone: '',
        email: '',
        bio: '',
        avatarImage: null,
        role: 'employee', // 'admin', 'manager', 'employee', 'calendar-only', 'no-access'
        assignedServices: [] // Array of service IDs with custom settings
    });

    // Employee availability management state
    const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState(null);
    const [showVacationForm, setShowVacationForm] = useState(false);
    const [newVacation, setNewVacation] = useState({ employeeId: null, startDate: '', endDate: '', reason: '' });
    const [showBreakForm, setShowBreakForm] = useState(false);
    const [newBreak, setNewBreak] = useState({ employeeId: null, day: '', startTime: '', endTime: '', reason: '' });
    const [selectedServiceAssignment, setSelectedServiceAssignment] = useState({ employeeId: null, serviceId: null });

    // Opening hours state
    const [openingHours, setOpeningHours] = useState([
        { day: 'Poniedziałek', key: 'monday', open: '09:00', close: '17:00', closed: false },
        { day: 'Wtorek', key: 'tuesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Środa', key: 'wednesday', open: '09:00', close: '17:00', closed: false },
        { day: 'Czwartek', key: 'thursday', open: '09:00', close: '17:00', closed: false },
        { day: 'Piątek', key: 'friday', open: '09:00', close: '17:00', closed: false },
        { day: 'Sobota', key: 'saturday', open: '10:00', close: '14:00', closed: false },
        { day: 'Niedziela', key: 'sunday', open: '00:00', close: '00:00', closed: true }
    ]);

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
                    if (business.services) {
                        setServices(business.services);
                    }
                    if (business.employees) {
                        setEmployees(business.employees);
                    }
                    // Get reviews from reviewsList (preferred) or reviews field
                    const reviewsData = business.reviewsList || business.reviews;
                    if (reviewsData) {
                        // Ensure reviews is always an array
                        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                    } else {
                        setReviews([]);
                    }
                    // Load images from database
                    if (business.profileImage) {
                        setProfileImage(business.profileImage);
                    }
                    if (business.bannerImage) {
                        setBannerImage(business.bannerImage);
                    }
                    if (business.portfolioImages && Array.isArray(business.portfolioImages)) {
                        setPortfolio(business.portfolioImages.map((url, index) => ({
                            id: `portfolio-${index}`,
                            url: url
                        })));
                    }
                    // Load business info
                    if (business.companyName) {
                        setBusinessName(business.companyName);
                    }
                    if (business.description) {
                        setDescription(business.description);
                    }
                    if (business.facebook) {
                        setFacebook(business.facebook);
                    }
                    if (business.instagram) {
                        setInstagram(business.instagram);
                    }
                    if (business.website) {
                        setWebsite(business.website);
                    }
                    // Load location data
                    if (business.city) {
                        setCity(business.city);
                    }
                    if (business.address) {
                        setAddress(business.address);
                    }
                    if (business.postalCode) {
                        setPostalCode(business.postalCode);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch business data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (user) {
            fetchBusinessData();
        }
    }, [user]);

    // Services state
    const [services, setServices] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: '', price: '', description: '' });
    const [editingServiceId, setEditingServiceId] = useState(null);

    // Upload image to Cloudinary
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show loading/preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            toast.info('Uploadowanie zdjęcia...');
            const url = await uploadImage(file, 'profile');
            if (url) {
                setProfileImage(url);
                // Save to database
                await saveBusinessProfile({ profileImage: url });
                toast.success('Zdjęcie profilowe zostało zapisane!');
            }
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show loading/preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            toast.info('Uploadowanie banera...');
            const url = await uploadImage(file, 'banner');
            if (url) {
                setBannerImage(url);
                // Save to database
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
            if (url) {
                return { id: Date.now() + Math.random(), url };
            }
            return null;
        });

        const uploadedImages = (await Promise.all(uploadPromises)).filter(img => img !== null);

        if (uploadedImages.length > 0) {
            const newPortfolio = [...portfolio, ...uploadedImages];
            setPortfolio(newPortfolio);
            // Save to database
            await saveBusinessProfile({
                portfolioImages: newPortfolio.map(img => img.url)
            });
            toast.success(`Dodano ${uploadedImages.length} zdjęć do portfolio!`);
        }
    };

    const handleEmployeeAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show loading/preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEmployee({ ...newEmployee, avatarImage: reader.result });
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            toast.info('Uploadowanie zdjęcia pracownika...');
            const url = await uploadImage(file, 'employee');
            if (url) {
                setNewEmployee({ ...newEmployee, avatarImage: url });
                toast.success('Zdjęcie pracownika zostało zapisane!');
            }
        }
    };

    // Save business profile data
    const saveBusinessProfile = async (updates = {}) => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        try {
            const updateData = {
                companyName: businessName,
                description: description,
                facebook: facebook,
                instagram: instagram,
                website: website,
                city: city,
                address: address,
                postalCode: postalCode,
                ...updates
            };

            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Błąd zapisywania danych');
            }
        } catch (error) {
            console.error('Error saving business profile:', error);
            toast.error(error.message || 'Wystąpił błąd podczas zapisywania');
            return { success: false, error: error.message };
        }
    };

    // Handle save profile button
    const handleSaveProfile = async () => {
        toast.info('Zapisywanie zmian...');
        const result = await saveBusinessProfile();
        if (result.success) {
            toast.success('Dane firmy zostały zaktualizowane!');
        }
    };

    const saveEmployees = async (updatedEmployees) => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        // Normalize assignedServices to ensure they are objects
        const normalizedEmployees = updatedEmployees.map(emp => ({
            ...emp,
            assignedServices: (emp.assignedServices || []).map(as => {
                if (typeof as === 'string') {
                    const service = services.find(s => s.id === as);
                    if (service) {
                        return {
                            serviceId: as,
                            duration: service.duration,
                            price: service.price,
                            available: true
                        };
                    }
                    return null;
                }
                return as;
            }).filter(Boolean)
        }));

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employees: normalizedEmployees }),
            });

            if (response.ok) {
                setEmployees(updatedEmployees);
                toast.success('Lista pracowników została zaktualizowana!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji pracowników');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };

    const addEmployee = async () => {
        if (newEmployee.name && newEmployee.email) {
            const initials = newEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const updatedEmployees = [...employees, {
                name: newEmployee.name,
                position: newEmployee.position,
                phone: newEmployee.phone,
                email: newEmployee.email,
                bio: newEmployee.bio,
                avatarImage: newEmployee.avatarImage,
                avatar: initials, // Fallback to initials if no image
                role: newEmployee.role,
                id: Date.now(),
                availability: openingHours.reduce((acc, day) => {
                    const dayKey = day.day === 'Poniedziałek' ? 'monday' :
                        day.day === 'Wtorek' ? 'tuesday' :
                            day.day === 'Środa' ? 'wednesday' :
                                day.day === 'Czwartek' ? 'thursday' :
                                    day.day === 'Piątek' ? 'friday' :
                                        day.day === 'Sobota' ? 'saturday' : 'sunday';
                    acc[dayKey] = {
                        open: day.open,
                        close: day.close,
                        closed: day.closed
                    };
                    return acc;
                }, {}),
                vacations: [],
                breaks: [],
                assignedServices: newEmployee.assignedServices || []
            }];

            await saveEmployees(updatedEmployees);

            setNewEmployee({
                name: '',
                position: '',
                phone: '',
                email: '',
                bio: '',
                avatarImage: null,
                role: 'employee',
                assignedServices: []
            });
            setShowEmployeeForm(false);
        }
    };

    const toggleServiceAssignment = (serviceId) => {
        const isAssigned = newEmployee.assignedServices.some(s => s.serviceId === serviceId);
        if (isAssigned) {
            setNewEmployee({
                ...newEmployee,
                assignedServices: newEmployee.assignedServices.filter(s => s.serviceId !== serviceId)
            });
        } else {
            const service = services.find(s => s.id === serviceId);
            setNewEmployee({
                ...newEmployee,
                assignedServices: [...newEmployee.assignedServices, {
                    serviceId: serviceId,
                    duration: service.duration,
                    price: service.price,
                    available: true
                }]
            });
        }
    };

    const updateAssignedService = (serviceId, field, value) => {
        setNewEmployee({
            ...newEmployee,
            assignedServices: newEmployee.assignedServices.map(s =>
                s.serviceId === serviceId ? { ...s, [field]: value } : s
            )
        });
    };

    const deleteEmployee = async (id) => {
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        await saveEmployees(updatedEmployees);
    };

    const deletePortfolioImage = async (id) => {
        const imageToDelete = portfolio.find(img => img.id === id);
        if (!imageToDelete) return;

        // Extract public_id from Cloudinary URL if possible
        const url = imageToDelete.url;
        let public_id = null;

        if (url && url.includes('cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
                const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\..+)?$/);
                if (match && match[1]) {
                    public_id = match[1];
                }
            } catch (error) {
                console.error('Error extracting public_id:', error);
            }
        }

        // Update UI immediately
        const updatedPortfolio = portfolio.filter(img => img.id !== id);
        setPortfolio(updatedPortfolio);

        // Delete from Cloudinary if public_id is available
        if (public_id) {
            try {
                const response = await fetch(`/api/upload?public_id=${encodeURIComponent(public_id)}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    console.error('Failed to delete from Cloudinary');
                }
            } catch (error) {
                console.error('Error deleting from Cloudinary:', error);
            }
        }

        // Save updated portfolio to database
        await saveBusinessProfile({
            portfolioImages: updatedPortfolio.map(img => img.url)
        });
        toast.success('Zdjęcie zostało usunięte!');
    };

    const updateOpeningHours = (index, field, value) => {
        const updated = [...openingHours];
        updated[index][field] = value;
        setOpeningHours(updated);
    };

    const saveOpeningHours = async () => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        const workingHours = {};
        openingHours.forEach(day => {
            workingHours[day.key] = {
                open: day.open,
                close: day.close,
                closed: day.closed
            };
        });

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workingHours }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Godziny otwarcia zostały zaktualizowane!');
                setShowHoursConfirmModal(false);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji godzin otwarcia');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };

    const addService = () => {
        if (newService.name && newService.duration && newService.price) {
            if (editingServiceId) {
                setServices(services.map(service =>
                    service.id === editingServiceId
                        ? { ...newService, id: editingServiceId, duration: parseInt(newService.duration), price: parseFloat(newService.price) }
                        : service
                ));
                setEditingServiceId(null);
                toast.success('Usługa została zaktualizowana');
            } else {
                setServices([...services, { ...newService, id: Date.now().toString(), duration: parseInt(newService.duration), price: parseFloat(newService.price) }]);
                toast.success('Usługa została dodana');
            }
            setNewService({ name: '', duration: '', price: '', description: '' });
            setShowServiceForm(false);
        } else {
            toast.error('Wypełnij wymagane pola (Nazwa, Czas, Cena)');
        }
    };

    const editService = (service) => {
        setNewService({
            name: service.name,
            duration: service.duration,
            price: service.price,
            description: service.description || ''
        });
        setEditingServiceId(service.id);
        setShowServiceForm(true);
    };

    const deleteService = (id) => {
        setServices(services.filter(service => service.id !== id));
    };

    const saveServices = async () => {
        if (!user?.id) {
            toast.error("Błąd: Brak ID użytkownika. Spróbuj odświeżyć stronę.");
            return;
        }

        try {
            const response = await fetch(`/api/businesses/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ services }),
            });

            if (response.ok) {
                toast.success('Usługi zostały zaktualizowana!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Błąd aktualizacji usług');
            }
        } catch (error) {
            toast.error('Wystąpił błąd połączenia z serwerem');
        }
    };

    const applyHoursToAllEmployees = async () => {
        if (confirm('Czy na pewno chcesz zastosować te godziny pracy dla WSZYSTKICH pracowników? To nadpisze ich indywidualne ustawienia.')) {
            const newAvailability = openingHours.reduce((acc, day) => {
                const dayKey = day.day === 'Poniedziałek' ? 'monday' :
                    day.day === 'Wtorek' ? 'tuesday' :
                        day.day === 'Środa' ? 'wednesday' :
                            day.day === 'Czwartek' ? 'thursday' :
                                day.day === 'Piątek' ? 'friday' :
                                    day.day === 'Sobota' ? 'saturday' : 'sunday';
                acc[dayKey] = {
                    open: day.open,
                    close: day.close,
                    closed: day.closed
                };
                return acc;
            }, {});

            const updatedEmployees = employees.map(emp => ({
                ...emp,
                availability: JSON.parse(JSON.stringify(newAvailability)) // Deep copy
            }));

            await saveEmployees(updatedEmployees);
        }
    };

    // Ensure reviews is always an array for safe operations
    const reviewsArray = Array.isArray(reviews) ? reviews : [];
    const avgRating = reviewsArray.length > 0 ? reviewsArray.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsArray.length : 0;

    const tabs = [
        { id: 'profile', label: 'Profil Firmy', icon: Building2 },
        { id: 'data', label: 'Dane Kontaktowe', icon: User },
        { id: 'hours', label: 'Godziny Otwarcia', icon: Clock },
        { id: 'services', label: 'Usługi', icon: Briefcase },
        { id: 'employees', label: 'Pracownicy', icon: Users },
        { id: 'availability', label: 'Dostępność i Grafik', icon: CalendarDays },
        { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
        { id: 'reviews', label: 'Opinie', icon: MessageSquare }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 font-medium">Ładowanie ustawień...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            {/* Password Confirmation Modal */}
            {showPasswordConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Zmiana hasła</h3>
                            <p className="text-gray-500 mb-6">
                                Czy na pewno chcesz zmienić swoje hasło?
                                Będziesz musiał użyć nowego hasła przy następnym logowaniu.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowPasswordConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                                >
                                    Zmień hasło
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hours Confirmation Modal */}
            {showHoursConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aktualizacja godzin</h3>
                            <p className="text-gray-500 mb-6">
                                Czy na pewno chcesz zaktualizować godziny otwarcia?
                                Zmiany będą widoczne natychmiast dla wszystkich klientów.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowHoursConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={saveOpeningHours}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                                >
                                    Potwierdź
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Potwierdzenie zmiany</h3>
                            <p className="text-gray-500 mb-6">
                                Czy na pewno chcesz zaktualizować dane kontaktowe?
                                Zmiany będą widoczne natychmiast dla wszystkich użytkowników.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={confirmUpdate}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                                >
                                    Potwierdź
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Settings className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Ustawienia Biznesu
                                </h1>
                                <p className="text-sm text-gray-500">Zarządzaj swoim profilem i danymi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar with Tabs */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sticky top-24">
                            <nav className="space-y-2">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="text-sm">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Profile Section */}
                        {activeTab === 'profile' && (
                            <ProfileSection
                                profileImage={profileImage}
                                bannerImage={bannerImage}
                                businessName={businessName}
                                description={description}
                                facebook={facebook}
                                instagram={instagram}
                                website={website}
                                city={city}
                                address={address}
                                postalCode={postalCode}
                                onProfileImageChange={handleImageUpload}
                                onBannerImageChange={handleBannerUpload}
                                onBusinessNameChange={setBusinessName}
                                onDescriptionChange={setDescription}
                                onFacebookChange={setFacebook}
                                onInstagramChange={setInstagram}
                                onWebsiteChange={setWebsite}
                                onCityChange={setCity}
                                onAddressChange={setAddress}
                                onPostalCodeChange={setPostalCode}
                                onSave={handleSaveProfile}
                            />
                        )}

                        {/* Contact Data Section */}
                        {activeTab === 'data' && (
                            <ContactDataSection
                                phone={phone}
                                email={email}
                                currentPassword={currentPassword}
                                newPassword={newPassword}
                                confirmPassword={confirmPassword}
                                onPhoneChange={setPhone}
                                onEmailChange={setEmail}
                                onCurrentPasswordChange={setCurrentPassword}
                                onNewPasswordChange={setNewPassword}
                                onConfirmPasswordChange={setConfirmPassword}
                                onUpdateContactData={handleUpdateContactData}
                                onPasswordChangeClick={handlePasswordChangeClick}
                            />
                        )}
                        {/* Opening Hours Section */}
                        {activeTab === 'hours' && (
                            <OpeningHoursSection
                                openingHours={openingHours}
                                onUpdateOpeningHours={updateOpeningHours}
                                onSaveHours={() => setShowHoursConfirmModal(true)}
                                onApplyToAllEmployees={applyHoursToAllEmployees}
                            />
                        )}

                        {/* Services Section */}
                        {activeTab === 'services' && (
                            <ServicesSection
                                services={services}
                                showServiceForm={showServiceForm}
                                newService={newService}
                                editingServiceId={editingServiceId}
                                onShowServiceFormChange={setShowServiceForm}
                                onNewServiceChange={setNewService}
                                onAddService={addService}
                                onEditService={editService}
                                onDeleteService={deleteService}
                                onCancelEdit={() => {
                                    setShowServiceForm(false);
                                    setNewService({ name: '', duration: '', price: '', description: '' });
                                    setEditingServiceId(null);
                                }}
                                onSaveServices={saveServices}
                            />
                        )}

                        {
                            activeTab === 'availability' && (
                                <AvailabilitySection
                                    employees={employees}
                                    selectedEmployeeForSchedule={selectedEmployeeForSchedule}
                                    setSelectedEmployeeForSchedule={setSelectedEmployeeForSchedule}
                                    saveEmployees={saveEmployees}
                                    setEmployees={setEmployees}
                                    showVacationForm={showVacationForm}
                                    setShowVacationForm={setShowVacationForm}
                                    newVacation={newVacation}
                                    setNewVacation={setNewVacation}
                                    showBreakForm={showBreakForm}
                                    setShowBreakForm={setShowBreakForm}
                                    newBreak={newBreak}
                                    setNewBreak={setNewBreak}
                                    selectedServiceAssignment={selectedServiceAssignment}
                                    setSelectedServiceAssignment={setSelectedServiceAssignment}
                                    services={services}
                                />
                            )
                        }

                        {/* Employees Section */}
                        {activeTab === 'employees' && (
                            <EmployeesSection
                                employees={employees}
                                showEmployeeForm={showEmployeeForm}
                                setShowEmployeeForm={setShowEmployeeForm}
                                newEmployee={newEmployee}
                                setNewEmployee={setNewEmployee}
                                handleEmployeeAvatarUpload={handleEmployeeAvatarUpload}
                                addEmployee={addEmployee}
                                deleteEmployee={deleteEmployee}
                                services={services}
                                toggleServiceAssignment={toggleServiceAssignment}
                                updateAssignedService={updateAssignedService}
                            />
                        )}

                        {/* Portfolio Section */}
                        {activeTab === 'portfolio' && (
                            <PortfolioSection
                                portfolio={portfolio}
                                onPortfolioUpload={handlePortfolioUpload}
                                onDeleteImage={deletePortfolioImage}
                            />
                        )}

                        {/* Reviews Section */}
                        {activeTab === 'reviews' && (
                            <ReviewsSection
                                reviews={reviewsArray}
                                avgRating={avgRating}
                                onRefresh={fetchBusinessData}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>

    );
}
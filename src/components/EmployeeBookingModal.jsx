import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Calendar, Clock, CheckCircle, ArrowLeft,
  ArrowRight, Loader2, PartyPopper, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, addMinutes, getDay, startOfDay, isSameDay, isToday, isBefore, startOfToday, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

const EmployeeBookingModal = ({ isOpen, onClose, employee, businessId, studioName, services }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  const initialBookingData = {
    date: undefined,
    time: '',
    service: null,
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: ''
    },
    paymentMethod: 'online',
  };

  const [bookingData, setBookingData] = useState(initialBookingData);

  // Pobieranie dostępnych terminów dla wybranego dnia
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!bookingData.date || !employee || !businessId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const dateStr = format(bookingData.date, 'yyyy-MM-dd');
        const response = await fetch(
          `/api/employees/${employee.id}/availability?businessId=${businessId}&date=${dateStr}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.availableSlots || []);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    // Dodaj małe opóźnienie, aby uniknąć zbyt częstych wywołań
    const timeoutId = setTimeout(() => {
      fetchAvailableSlots();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [bookingData.date, employee?.id, businessId]);

  // Filtrowanie usług przypisanych do pracownika
  const employeeServices = useMemo(() => {
    if (!employee || !services) return [];
    
    const assignedServiceIds = (employee.assignedServices || []).map(as => 
      typeof as === 'object' ? as.serviceId : as
    );
    
    return services.filter(service => 
      assignedServiceIds.includes(service.id?.toString())
    );
  }, [employee, services]);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setBookingData(initialBookingData);
      setIsSubmitting(false);
      setAvailableSlots([]);
    }, 300);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedService = employeeServices.find(s => s.id === bookingData.service?.id);
      if (!selectedService) {
        alert('Błąd: Nie wybrano usługi');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          employeeId: employee.id.toString(),
          service: selectedService.name,
          serviceId: selectedService.id?.toString(),
          date: format(bookingData.date, 'yyyy-MM-dd'),
          time: bookingData.time,
          duration: selectedService.duration || 60,
          price: selectedService.price || 0,
          clientName: `${bookingData.customer.firstName} ${bookingData.customer.lastName}`,
          clientEmail: bookingData.customer.email,
          clientPhone: bookingData.customer.phone,
          notes: bookingData.customer.notes
        }),
      });

      if (response.ok) {
        handleNext();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Błąd podczas tworzenia rezerwacji');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Wystąpił błąd podczas tworzenia rezerwacji');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalendarz
  const CustomCalendar = () => {
    const today = startOfToday();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const days = [];
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay() + 1);

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }

    const getDayClassName = (date) => {
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isSelected = bookingData.date && isSameDay(date, bookingData.date);
      const isPast = isBefore(date, today);
      const isTodayDate = isToday(date);

      let baseClass = "relative w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer hover:scale-105";

      if (!isCurrentMonth) {
        return `${baseClass} text-gray-300 cursor-not-allowed`;
      }

      if (isPast) {
        return `${baseClass} text-gray-400 cursor-not-allowed`;
      }

      if (isSelected) {
        return `${baseClass} bg-violet-600 text-white shadow-lg ring-2 ring-violet-200`;
      }

      if (isTodayDate) {
        baseClass += " ring-2 ring-violet-400 font-bold";
      }

      return `${baseClass} text-gray-700 hover:bg-gray-100`;
    };

    const canSelectDay = (date) => {
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isPast = isBefore(date, today);
      return isCurrentMonth && !isPast;
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'LLLL yyyy', { locale: pl })}
          </h3>

          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => canSelectDay(date) && setBookingData(prev => ({ ...prev, date, time: '' }))}
              className={getDayClassName(date)}
              disabled={!canSelectDay(date)}
            >
              {format(date, 'd')}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1_ServiceDateTime />;
      case 2: return <Step2_CustomerDetails />;
      case 3: return <Step3_Confirmation />;
      case 4: return <Step4_Success />;
      default: return null;
    }
  };

  const Step1_ServiceDateTime = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Wybierz usługę i termin</h3>
        <p className="text-gray-500">Zarezerwuj wizytę u {employee?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wybór usługi */}
        <div className="space-y-6">
          <div className="bg-gray-50/50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-violet-500" />
              Wybierz usługę
            </h4>
            {employeeServices.length > 0 ? (
              <div className="space-y-3">
                {employeeServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setBookingData(prev => ({ ...prev, service, time: '' }))}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      bookingData.service?.id === service.id
                        ? 'bg-violet-600 text-white shadow-lg ring-2 ring-violet-200'
                        : 'bg-white hover:bg-violet-50 border border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{service.name}</p>
                        <p className={`text-sm ${bookingData.service?.id === service.id ? 'text-violet-200' : 'text-gray-500'}`}>
                          {service.duration} min • {service.price} zł
                        </p>
                      </div>
                      {bookingData.service?.id === service.id && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Brak dostępnych usług dla tego pracownika</p>
              </div>
            )}
          </div>
        </div>

        {/* Kalendarz i godziny */}
        <div className="space-y-6">
          <CustomCalendar />

          {/* Wybór godziny */}
          {bookingData.date && bookingData.service && (
            <div className="bg-gray-50/50 rounded-2xl p-6 animate-fade-in">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-violet-500" />
                Dostępne godziny
                <span className="ml-2 text-sm text-gray-500">
                  ({format(bookingData.date, 'd MMMM', { locale: pl })})
                </span>
              </h4>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setBookingData(prev => ({ ...prev, time }))}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        bookingData.time === time
                          ? 'bg-violet-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-violet-100 border border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">😔</div>
                  <p className="text-gray-500">
                    Brak dostępnych terminów dla wybranego dnia
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Step2_CustomerDetails = () => (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Twoje dane</h3>
        <p className="text-gray-500">Podaj informacje kontaktowe</p>
      </div>

      <div className="bg-gray-50/50 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Imię" 
            name="firstName" 
            placeholder="Jan"
            value={bookingData.customer.firstName}
            onChange={(e) => setBookingData(prev => ({ ...prev, customer: { ...prev.customer, firstName: e.target.value } }))}
          />
          <InputField 
            label="Nazwisko" 
            name="lastName" 
            placeholder="Kowalski"
            value={bookingData.customer.lastName}
            onChange={(e) => setBookingData(prev => ({ ...prev, customer: { ...prev.customer, lastName: e.target.value } }))}
          />
        </div>
        <InputField 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="jan.kowalski@example.com"
          value={bookingData.customer.email}
          onChange={(e) => setBookingData(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value } }))}
        />
        <InputField 
          label="Telefon" 
          name="phone" 
          type="tel" 
          placeholder="+48 123 456 789"
          value={bookingData.customer.phone}
          onChange={(e) => setBookingData(prev => ({ ...prev, customer: { ...prev.customer, phone: e.target.value } }))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uwagi (opcjonalne)</label>
          <textarea
            value={bookingData.customer.notes}
            onChange={(e) => setBookingData(prev => ({ ...prev, customer: { ...prev.customer, notes: e.target.value } }))}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus-visible:outline-none focus:ring-violet-500 focus:border-transparent transition-all resize-none"
            rows="4"
            placeholder="Dodatkowe informacje dla salonu..."
          />
        </div>
      </div>
    </div>
  );

  const InputField = React.memo(({ label, name, type = 'text', placeholder, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus-visible:outline-none focus:ring-violet-500 focus:border-transparent transition-all"
        placeholder={placeholder}
      />
    </div>
  ));

  const Step3_Confirmation = () => {
    const selectedService = employeeServices.find(s => s.id === bookingData.service?.id);
    
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Potwierdź rezerwację</h3>
          <p className="text-gray-500">Sprawdź szczegóły przed potwierdzeniem</p>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
          <h4 className="font-semibold text-xl text-gray-900 mb-4">Podsumowanie rezerwacji</h4>
          <div className="space-y-4">
            <SummaryRow label="Usługa" value={selectedService?.name || ''} />
            <SummaryRow
              label="Data i godzina"
              value={`${format(bookingData.date, 'd MMMM yyyy', { locale: pl })} o ${bookingData.time}`}
            />
            <SummaryRow label="Pracownik" value={employee?.name || ''} />
            <SummaryRow
              label="Klient"
              value={`${bookingData.customer.firstName} ${bookingData.customer.lastName}`}
            />
            <div className="flex justify-between items-center border-t border-violet-200 pt-4 mt-4">
              <span className="text-xl font-bold text-gray-900">Do zapłaty:</span>
              <span className="text-3xl font-bold text-violet-600">{selectedService?.price || 0} zł</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-start text-sm">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="font-semibold text-gray-900 text-right flex-1 ml-4">{value}</span>
    </div>
  );

  const Step4_Success = () => {
    const selectedService = employeeServices.find(s => s.id === bookingData.service?.id);
    
    return (
      <div className="text-center flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <PartyPopper className="w-16 h-16 text-white" />
        </div>
        <h3 className="text-4xl font-bold text-gray-900 mb-4">Gotowe! 🎉</h3>
        <p className="text-xl text-gray-600 mb-2">Twoja rezerwacja została potwierdzona</p>
        <p className="text-gray-500 mb-8 max-w-md">
          Wysłaliśmy szczegóły na adres {bookingData.customer.email}.
          Do zobaczenia w salonie!
        </p>

        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 w-full max-w-md border border-violet-100">
          <h4 className="font-semibold text-gray-900 mb-4">Szczegóły rezerwacji</h4>
          <div className="space-y-3 text-left">
            <SummaryRow label="Usługa" value={selectedService?.name || ''} />
            <SummaryRow
              label="Termin"
              value={`${format(bookingData.date, 'd MMMM yyyy', { locale: pl })} o ${bookingData.time}`}
            />
            <SummaryRow label="Pracownik" value={employee?.name || ''} />
          </div>
        </div>

        <button
          onClick={resetAndClose}
          className="w-full max-w-md mt-8 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
        >
          Zamknij
        </button>
      </div>
    );
  };

  const isStep1Valid = bookingData.date && bookingData.time && bookingData.service;
  const isStep2Valid = bookingData.customer.firstName && bookingData.customer.lastName &&
    bookingData.customer.email.includes('@') && bookingData.customer.phone;
  const isStep3Valid = bookingData.paymentMethod;

  const getNextButtonDisabledState = () => {
    switch (currentStep) {
      case 1: return !isStep1Valid;
      case 2: return !isStep2Valid;
      case 3: return !isStep3Valid;
      default: return false;
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && currentStep < 4 && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold">Rezerwacja u {employee.name}</h2>
                <p className="text-violet-200 text-sm">{studioName}</p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress indicator */}
          {currentStep < 4 && (
            <div className="mt-6">
              <ProgressIndicator currentStep={currentStep} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Navigation */}
        {currentStep < 4 && (
          <div className="bg-gray-50 border-t border-gray-200 p-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {bookingData.service && (
                  <>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {bookingData.service.duration} min
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">💰</span>
                      {bookingData.service.price} zł
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={getNextButtonDisabledState()}
                    className="flex items-center px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
                  >
                    Dalej <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !isStep3Valid}
                    className="flex items-center justify-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Potwierdź rezerwację
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Indicator
const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Usługa i termin' },
    { number: 2, title: 'Dane' },
    { number: 3, title: 'Potwierdzenie' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              currentStep > step.number
                ? 'bg-white text-violet-600'
                : currentStep === step.number
                  ? 'bg-white text-violet-600 ring-4 ring-white/30'
                  : 'bg-white/30 text-white'
            }`}>
              {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${
              currentStep >= step.number ? 'text-white' : 'text-white/70'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 transition-all duration-300 ${
              currentStep > step.number ? 'bg-white' : 'bg-white/30'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EmployeeBookingModal;


import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Calendar, Clock, MapPin, Star, CreditCard, CheckCircle, ArrowLeft,
  ArrowRight, User, Users, Loader2, PartyPopper, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, addMinutes, getDay, startOfDay, addDays, isSameDay, isToday, isBefore, startOfToday, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

// Mapowanie dni tygodnia (0 = niedziela, 1 = poniedziałek, ...)
const dayMapping = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};


// --- GŁÓWNY KOMPONENT MODALU ---

const BookingModal = ({ isOpen, onClose, service, businessId, employees = [], workingHours = {}, studioName = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  const initialBookingData = {
    date: undefined,
    time: '',
    staff: null,
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

  // Filtrowanie pracowników, którzy mają przypisaną wybraną usługę
  const availableStaff = useMemo(() => {
    if (!service || !employees || employees.length === 0) return [];

    return employees.filter(emp => {
      // If service doesn't specify employees, show all (backward compatibility)
      if (!service.employees || service.employees.length === 0) {
        return true;
      }

      // Check if employee ID is in service.employees array
      return service.employees.includes(emp.id);
    }).map(emp => ({
      id: emp.id,
      name: emp.name,
      position: emp.position || 'Pracownik',
      avatar: emp.avatarImage || emp.avatar || emp.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }));
  }, [service, employees]);

  // Pobieranie dostępnych terminów dla wybranego pracownika i dnia
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!bookingData.date || !bookingData.staff || !businessId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const dateStr = format(bookingData.date, 'yyyy-MM-dd');
        const response = await fetch(
          `/api/employees/${bookingData.staff.id}/availability?businessId=${businessId}&date=${dateStr}`
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
  }, [bookingData.date, bookingData.staff?.id, businessId]);

  // --- NAWIGACJA I OBSŁUGA ---

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
      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          employeeId: bookingData.staff?.id?.toString() || null,
          service: service.name,
          serviceId: service.id?.toString() || null,
          date: format(bookingData.date, 'yyyy-MM-dd'),
          time: bookingData.time,
          duration: service.duration || 60,
          price: service.price || 0,
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
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Wystąpił błąd podczas tworzenia rezerwacji');
      setIsSubmitting(false);
    }
  };

  // --- KALENDARZ KOMPONENTY ---

  // Funkcja pomocnicza do sprawdzania czy dzień jest otwarty
  const isDayOpen = (date) => {
    if (!workingHours || Object.keys(workingHours).length === 0) return true; // Domyślnie otwarte jeśli brak danych

    const dayOfWeek = getDay(date);
    const dayKey = dayMapping[dayOfWeek];
    const dayHours = workingHours[dayKey];

    if (!dayHours) return true; // Domyślnie otwarte
    return !dayHours.closed && dayHours.open && dayHours.close;
  };

  const CustomCalendar = () => {
    const today = startOfToday();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Generujemy dni miesiąca z paddingiem
    const days = [];
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay() + 1); // Rozpoczynamy od poniedziałku

    for (let i = 0; i < 42; i++) { // 6 tygodni x 7 dni
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }

    const getDayClassName = (date) => {
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isSelected = bookingData.date && isSameDay(date, bookingData.date);
      const isPast = isBefore(date, today);
      const isTodayDate = isToday(date);
      const dayOfWeek = getDay(date);
      const isClosed = !isDayOpen(date);

      let baseClass = "relative w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer hover:scale-105";

      if (!isCurrentMonth) {
        return `${baseClass} text-gray-300 cursor-not-allowed`;
      }

      if (isPast) {
        return `${baseClass} text-gray-400 cursor-not-allowed`;
      }

      if (isClosed) {
        return `${baseClass} text-gray-400 bg-gray-100 cursor-not-allowed`;
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
      const isClosed = !isDayOpen(date);

      return isCurrentMonth && !isPast && !isClosed;
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header kalendarza */}
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

        {/* Dni tygodnia */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Dni miesiąca */}
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

        {/* Legenda */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-3">Dostępność terminów:</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Dużo wolnych</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Średnio wolnych</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Mało wolnych</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- PODKOMPONENTY DLA CZYTELNOŚCI ---

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1_DateTime />;
      case 2: return <Step2_CustomerDetails />;
      case 3: return <Step3_Confirmation />;
      case 4: return <Step4_Success />;
      default: return null;
    }
  };

  const Step1_DateTime = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Wybierz termin</h3>
        <p className="text-gray-500">Zarezerwuj dogodny dla siebie termin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kalendarz */}
        <div className="order-2 lg:order-1">
          <CustomCalendar />
        </div>

        {/* Specjaliści i godziny */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Wybór specjalisty */}
          {availableStaff.length > 0 ? (
            <div className="bg-gray-50/50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-violet-500" />
                Wybierz specjalistę
              </h4>
              <div className="space-y-3">
                {availableStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => setBookingData(prev => ({ ...prev, staff, time: '' }))}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${bookingData.staff?.id === staff.id
                      ? 'bg-violet-600 text-white shadow-lg ring-2 ring-violet-200'
                      : 'bg-white hover:bg-violet-50 border border-gray-200 hover:border-violet-300'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      {typeof staff.avatar === 'string' && staff.avatar.startsWith('http') ? (
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {staff.avatar || staff.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{staff.name}</p>
                        <p className={`text-sm ${bookingData.staff?.id === staff.id ? 'text-violet-200' : 'text-gray-500'}`}>
                          {staff.position}
                        </p>
                      </div>
                      {bookingData.staff?.id === staff.id && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50/50 rounded-2xl p-6">
              <p className="text-gray-500 text-center">Brak dostępnych pracowników dla tej usługi</p>
            </div>
          )}

          {/* Wybór godziny */}
          {bookingData.date && bookingData.staff && (
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
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${bookingData.time === time
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
                    Brak dostępnych terminów dla wybranego dnia i specjalisty
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

  const Step3_Confirmation = () => (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Potwierdź rezerwację</h3>
        <p className="text-gray-500">Sprawdź szczegóły przed płatnością</p>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
        <h4 className="font-semibold text-xl text-gray-900 mb-4">Podsumowanie rezerwacji</h4>
        <div className="space-y-4">
          <SummaryRow label="Usługa" value={service.name} />
          <SummaryRow
            label="Data i godzina"
            value={`${format(bookingData.date, 'd MMMM yyyy', { locale: pl })} o ${bookingData.time}`}
          />
          {bookingData.staff && (
            <SummaryRow label="Specjalista" value={bookingData.staff.name} />
          )}
          <SummaryRow
            label="Klient"
            value={`${bookingData.customer.firstName} ${bookingData.customer.lastName}`}
          />
          <div className="flex justify-between items-center border-t border-violet-200 pt-4 mt-4">
            <span className="text-xl font-bold text-gray-900">Do zapłaty:</span>
            <span className="text-3xl font-bold text-violet-600">{service.price} zł</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h4 className="font-semibold text-lg text-gray-900 mb-4">Metoda płatności</h4>
        <div className="space-y-3">
          <PaymentOption
            value="online"
            title="Płatność online"
            subtitle="Zapłać teraz kartą, BLIKiem lub Apple Pay"
            icon="💳"
          />
          <PaymentOption
            value="cash"
            title="Płatność na miejscu"
            subtitle="Gotówka lub karta w salonie"
            icon="💰"
          />
        </div>
      </div>
    </div>
  );

  const PaymentOption = ({ value, title, subtitle, icon }) => (
    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${bookingData.paymentMethod === value
      ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
      : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
      }`}>
      <div className="text-2xl mr-4">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <input
        type="radio"
        name="payment"
        value={value}
        checked={bookingData.paymentMethod === value}
        onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
        className="w-5 h-5 text-violet-600 focus:ring-violet-500"
      />
    </label>
  );

  const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-start text-sm">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="font-semibold text-gray-900 text-right flex-1 ml-4">{value}</span>
    </div>
  );

  const Step4_Success = () => (
    <div className="text-center flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <PartyPopper className="w-16 h-16 text-white" />
      </div>
      <h3 className="text-4xl font-bold text-gray-900 mb-4">Gotowe! 🎉</h3>
      <p className="text-xl text-gray-600 mb-2">Twoja rezerwacja została potwierdzona</p>
      <p className="text-gray-500 mb-8 max-w-md">
        Wysłaliśmy szczegóły na adres {bookingData.customer.email}.
        Do zobaczenia w naszym salonie!
      </p>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 w-full max-w-md border border-violet-100">
        <h4 className="font-semibold text-gray-900 mb-4">Szczegóły rezerwacji</h4>
        <div className="space-y-3 text-left">
          <SummaryRow label="Usługa" value={service.name} />
          <SummaryRow
            label="Termin"
            value={`${format(bookingData.date, 'd MMMM yyyy', { locale: pl })} o ${bookingData.time}`}
          />
          {bookingData.staff && (
            <SummaryRow label="Specjalista" value={bookingData.staff.name} />
          )}
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

  // --- SPRAWDZANIE POPRAWNOŚCI DANYCH DLA KAŻDEGO KROKU ---

  // Jeśli są dostępni pracownicy, wymagaj wyboru; jeśli nie ma, można zarezerwować bez pracownika
  const isStep1Valid = bookingData.date && bookingData.time && (availableStaff.length === 0 || bookingData.staff);
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

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">

        {/* === HEADER === */}
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
                <h2 className="text-2xl font-bold">{service.name}</h2>
                <p className="text-violet-200 text-sm">{studioName || service.salon || 'Salon'}</p>
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

        {/* === CONTENT === */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderStepContent()}
          </div>
        </div>

        {/* === FOOTER NAVIGATION === */}
        {currentStep < 4 && (
          <div className="bg-gray-50 border-t border-gray-200 p-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.duration} min
                </div>
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  {service.price} zł
                </div>
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

// === KOMPONENT PROGRESS INDICATOR ===
const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Termin' },
    { number: 2, title: 'Dane' },
    { number: 3, title: 'Potwierdzenie' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep > step.number
              ? 'bg-white text-violet-600'
              : currentStep === step.number
                ? 'bg-white text-violet-600 ring-4 ring-white/30'
                : 'bg-white/30 text-white'
              }`}>
              {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${currentStep >= step.number ? 'text-white' : 'text-white/70'
              }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 transition-all duration-300 ${currentStep > step.number ? 'bg-white' : 'bg-white/30'
              }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BookingModal;

import React, { useState, useMemo } from 'react';
import { 
  X, Calendar, Clock, MapPin, Star, CreditCard, CheckCircle, ArrowLeft, 
  ArrowRight, User, Users, Loader2, PartyPopper 
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, addMinutes, getDay, startOfDay } from 'date-fns';
import { pl } from 'date-fns/locale';

// --- BARDZIEJ ROZBUDOWANE DANE SYMULACYJNE ---

const mockStaff = [
  { id: 1, name: 'Anna Kowalska' },
  { id: 2, name: 'Zofia Nowak' },
  { id: 3, name: 'Jan Wiśniewski' },
];

const openingHours = {
  // 0: Niedziela, 1: Poniedziałek, ...
  0: null, // nieczynne
  1: { open: '09:00', close: '18:00' },
  2: { open: '09:00', close: '18:00' },
  3: { open: '09:00', close: '18:00' },
  4: { open: '10:00', close: '20:00' },
  5: { open: '10:00', close: '20:00' },
  6: { open: '09:00', close: '16:00' },
};

const existingAppointments = {
  '2025-09-06': [
    { staffId: 1, time: '10:00' },
    { staffId: 2, time: '11:30' },
  ],
  '2025-09-07': [
    { staffId: 1, time: '14:00' },
    { staffId: 3, time: '12:00' },
  ],
};


// --- GŁÓWNY KOMPONENT MODALU ---

const BookingModal = ({ isOpen, onClose, service }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // --- LOGIKA BIZNESOWA (GENEROWANIE GODZIN) ---

  const availableTimeSlots = useMemo(() => {
  // Dodajemy sprawdzenie, czy `service` nie jest nullem
  if (!bookingData.date || !bookingData.staff || !service) return [];

  const dayOfWeek = getDay(bookingData.date);
  const hours = openingHours[dayOfWeek];
  if (!hours) return [];

  const serviceDuration = service.duration;
  const slots = [];
  
  let currentTime = new Date(`${format(bookingData.date, 'yyyy-MM-dd')}T${hours.open}`);
  const closingTime = new Date(`${format(bookingData.date, 'yyyy-MM-dd')}T${hours.close}`);
  
  const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
  const appointmentsForDay = existingAppointments[formattedDate] || [];

  while (currentTime < closingTime) {
    const timeString = format(currentTime, 'HH:mm');
    const isBooked = appointmentsForDay.some(
      appt => appt.staffId === bookingData.staff.id && appt.time === timeString
    );

    if (!isBooked) {
      slots.push(timeString);
    }
    currentTime = addMinutes(currentTime, serviceDuration);
  }
  return slots;
}, [bookingData.date, bookingData.staff, service]);

  // --- NAWIGACJA I OBSŁUGA ---

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);

  const resetAndClose = () => {
    onClose();
    // Dajemy czas animacji na zamknięcie się przed resetem stanu
    setTimeout(() => {
      setCurrentStep(1);
      setBookingData(initialBookingData);
      setIsSubmitting(false);
    }, 300);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    // Symulacja zapytania do API
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Przejście do kroku sukcesu
    handleNext(); 
    setIsSubmitting(false);
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
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-900">Wybierz termin i specjalistę</h3>

    {/* Grid dostosowany: 1 kolumna na małych ekranach, 2 na dużych */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* Kalendarz */}
      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={bookingData.date}
          onSelect={(date) =>
            setBookingData((prev) => ({ ...prev, date, time: '' }))
          }
          fromDate={new Date()}
          locale={pl}
          className="rounded-lg min-w-[280px]" // zapobiega ściskaniu
          disabled={{ dayOfWeek: [0] }} // wyłączamy niedziele
        />
      </div>

      {/* Prawa część – specjaliści i godziny */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-violet-500" />
            Wybierz specjalistę
          </h4>
          <div className="flex flex-wrap gap-2">
            {mockStaff.map((staff) => (
              <button
                key={staff.id}
                onClick={() =>
                  setBookingData((prev) => ({ ...prev, staff, time: '' }))
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  bookingData.staff?.id === staff.id
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-violet-100'
                }`}
              >
                {staff.name}
              </button>
            ))}
          </div>
        </div>

        {bookingData.date && bookingData.staff && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 mt-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-violet-500" />
              Dostępne godziny
            </h4>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() =>
                      setBookingData((prev) => ({ ...prev, time }))
                    }
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      bookingData.time === time
                        ? 'bg-violet-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-violet-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Brak dostępnych terminów dla wybranego dnia i specjalisty.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

  const Step2_CustomerDetails = () => (
    <div className="space-y-5 animate-fade-in">
      <h3 className="text-2xl font-bold text-gray-900">Twoje dane</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Imię" name="firstName" placeholder="Jan" />
        <InputField label="Nazwisko" name="lastName" placeholder="Kowalski" />
      </div>
      <InputField label="Email" name="email" type="email" placeholder="jan.kowalski@example.com" />
      <InputField label="Telefon" name="phone" type="tel" placeholder="+48 123 456 789" />
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Uwagi (opcjonalne)</label>
        <textarea
          value={bookingData.customer.notes}
          onChange={(e) => setBookingData(prev => ({...prev, customer: {...prev.customer, notes: e.target.value}}))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus-visible:outline-none focus:ring-violet-500 transition"
          rows="3"
          placeholder="Dodatkowe informacje dla salonu..."
        />
      </div>
    </div>
  );
  
  const InputField = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={bookingData.customer[name]}
        onChange={(e) => setBookingData(prev => ({...prev, customer: {...prev.customer, [name]: e.target.value}}))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus-visible:outline-none focus:ring-violet-500 transition"
        placeholder={placeholder}
      />
    </div>
  );

  const Step3_Confirmation = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-gray-900">Potwierdź rezerwację</h3>
      <div className="bg-gray-50/70 rounded-xl p-6 space-y-4">
        <h4 className="font-semibold text-lg text-gray-800 border-b pb-3 mb-3">Podsumowanie</h4>
        <SummaryRow label="Usługa" value={service.name} />
        <SummaryRow label="Data" value={`${format(bookingData.date, 'd MMMM yyyy', { locale: pl })} o ${bookingData.time}`} />
        <SummaryRow label="Specjalista" value={bookingData.staff.name} />
        <SummaryRow label="Klient" value={`${bookingData.customer.firstName} ${bookingData.customer.lastName}`} />
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <span className="text-lg font-bold text-gray-900">Do zapłaty:</span>
          <span className="text-2xl font-bold text-violet-600">{service.price} zł</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">Metoda płatności</h4>
        <div className="space-y-3">
          <PaymentOption value="online" title="Płatność online" subtitle="Zapłać teraz kartą, BLIKiem" />
          <PaymentOption value="cash" title="Płatność na miejscu" subtitle="Gotówka lub karta w salonie" />
        </div>
      </div>
    </div>
  );

  const PaymentOption = ({ value, title, subtitle }) => (
    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
      bookingData.paymentMethod === value ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'
    }`}>
      <input
        type="radio"
        name="payment"
        value={value}
        checked={bookingData.paymentMethod === value}
        onChange={(e) => setBookingData(prev => ({...prev, paymentMethod: e.target.value}))}
        className="w-5 h-5 mr-4 text-violet-600 focus:ring-violet-500"
      />
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </label>
  );

  const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );

  const Step4_Success = () => (
    <div className="text-center flex flex-col items-center justify-center h-full animate-fade-in space-y-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <PartyPopper className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900">Rezerwacja potwierdzona!</h3>
        <p className="text-gray-600 max-w-sm">
            Wysłaliśmy potwierdzenie na adres {bookingData.customer.email}. Do zobaczenia w naszym salonie!
        </p>
        <div className="bg-gray-50/70 rounded-xl p-5 text-left w-full mt-4">
             <SummaryRow label="Usługa" value={service.name} />
             <SummaryRow label="Termin" value={`${format(bookingData.date, 'd.MM.yyyy')} o ${bookingData.time}`} />
             <SummaryRow label="Specjalista" value={bookingData.staff.name} />
        </div>
        <button
          onClick={resetAndClose}
          className="w-full mt-6 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-full transition-all duration-300"
        >
          Zamknij
        </button>
    </div>
  );
  
  // --- SPRAWDZANIE POPRAWNOŚCI DANYCH DLA KAŻDEGO KROKU ---

  const isStep1Valid = bookingData.date && bookingData.time && bookingData.staff;
  const isStep2Valid = bookingData.customer.firstName && bookingData.customer.lastName && bookingData.customer.email.includes('@') && bookingData.customer.phone;
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* === LEWY PANEL - INFORMACJE O USŁUDZE === */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-violet-600 to-purple-700 text-white p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                    <button onClick={handleBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h2 className="text-2xl font-bold">{service.name}</h2>
            </div>
            <button onClick={resetAndClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-8 space-y-4 text-sm">
            <InfoBox icon={MapPin} label={service.salon} value={service.location} />
            <InfoBox icon={Clock} label="Czas trwania" value={`${service.duration} min`} />
            <InfoBox icon={Star} label="Ocena" value={`${service.rating} (${service.reviews} opinii)`} starColor="text-yellow-300" />
            <InfoBox icon={CreditCard} label="Cena" value={`${service.price} zł`} valueClass="text-lg font-bold" />
          </div>

          <div className="mt-auto">
            <ProgressIndicator currentStep={currentStep} />
          </div>
        </div>

        {/* === PRAWY PANEL - KROKI REZERWACJI === */}
        <div className="flex-1 p-8 overflow-y-auto">
            {renderStepContent()}
        </div>

        {/* === STOPKA Z NAWIGACJĄ (tylko dla kroków 1-3) === */}
        {currentStep < 4 && (
          <div className="w-full md:w-3/5 p-8 border-t border-gray-200 self-end">
             <div className="flex justify-end">
              {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={getNextButtonDisabledState()}
                    className="flex items-center px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Dalej <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
              ) : (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-full transition-all duration-300"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Przetwarzanie...
                        </>
                    ) : 'Potwierdź i zapłać'}
                  </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- KOMPONENTY POMOCNICZE UI ---

const InfoBox = ({ icon: Icon, label, value, starColor, valueClass }) => (
  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
    <div className="flex items-center">
      <Icon className={`w-5 h-5 mr-3 ${starColor || ''}`} />
      <span>{label}</span>
    </div>
    <span className={`font-semibold ${valueClass || ''}`}>{value}</span>
  </div>
);

const ProgressIndicator = ({ currentStep }) => {
  const steps = ['Termin', 'Dane', 'Potwierdzenie', 'Gotowe'];
  return (
    <div>
      <div className="flex justify-between items-center relative mb-2">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-white/20">
            <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`}}
            ></div>
        </div>
        {steps.map((label, index) => (
          <div key={label} className="relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                index + 1 <= currentStep ? 'bg-white text-violet-600' : 'bg-white/30 text-white'
            }`}>
              {index + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-violet-200 text-sm mt-3">{steps[currentStep-1]}</p>
    </div>
  );
};


export default BookingModal;
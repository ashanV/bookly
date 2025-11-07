import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  // Powiązanie z biznesem
  businessId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business', 
    required: true 
  },
  
  // Powiązanie z klientem (opcjonalne, może być gość)
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Dane klienta (dla gości lub backup)
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  
  // Szczegóły rezerwacji
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Format HH:mm
  duration: { type: Number, default: 60 }, // Czas trwania w minutach
  price: { type: Number, required: true },
  
  // Status rezerwacji
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Notatki
  notes: { type: String, default: '' },
  
  // Integracja z Google Calendar
  googleCalendarEventId: { type: String, default: null },
  googleCalendarSynced: { type: Boolean, default: false },
  googleCalendarSyncedAt: { type: Date, default: null },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  strict: true,
  validateBeforeSave: true
});

// Automatyczna aktualizacja updatedAt
ReservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indeksy dla szybkiego wyszukiwania
ReservationSchema.index({ businessId: 1, date: 1 });
ReservationSchema.index({ clientId: 1 });
ReservationSchema.index({ date: 1, time: 1 });

export default mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);



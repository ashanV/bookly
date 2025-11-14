import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  // ID biznesu
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  
  // Dane klienta
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  
  // Szczegóły usługi
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // w minutach
  price: { type: Number, required: true },
  
  // Status
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
  updatedAt: { type: Date, default: Date.now }
}, {
  strict: true,
  validateBeforeSave: true
});

// Automatyczna aktualizacja updatedAt
ReservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);


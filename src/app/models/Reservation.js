import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  // Business ID
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },

  // Client data
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },

  // Employee
  employeeId: { type: String, default: null }, // Employee ID from employees array

  // Service details
  service: { type: String, required: true },
  serviceId: { type: String, default: null }, // Service ID from services array
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  // Payment
  price: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['gotówka', 'karta', 'blik', 'online', 'unknown'],
    default: 'gotówka'
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Notes
  notes: { type: String, default: '' },

  // Reservation reference number
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null for old reservations
    index: true // Index for fast searching
  },

  // Google Calendar integration
  googleCalendarEventId: { type: String, default: null },
  googleCalendarSynced: { type: Boolean, default: false },
  googleCalendarSyncedAt: { type: Date, default: null },

  // Payouts
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
    default: null,
    index: true
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  strict: true,
  validateBeforeSave: true
});

// Automatic update of updatedAt
ReservationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);


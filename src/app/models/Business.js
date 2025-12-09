import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { encrypt, decrypt } from "../../lib/crypto";

const BusinessSchema = new mongoose.Schema({
  // Dane kontaktowe właściciela
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true, // Explicitly indexed as requested
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?[0-9\s\-\(\)]{9,}$/, 'Please use a valid phone number.']
  },
  password: { type: String, required: true },

  // Dane firmy
  companyName: { type: String, required: true },
  companyType: { type: String, required: true },
  category: { type: String, required: true, index: true }, // Added index
  description: { type: String, default: '' },

  // Obrazy firmy (Cloudinary URLs)
  profileImage: { type: String, default: '' }, // Avatar/logo firmy
  bannerImage: { type: String, default: '' }, // Baner główny
  portfolioImages: [{ type: String }], // Tablica URL-i do portfolio

  // Lokalizacja
  city: { type: String, required: true, index: true }, // Added index
  address: { type: String, required: true },
  postalCode: {
    type: String,
    required: true,
    match: [/^\d{2}-\d{3}$/, 'Invalid postal code format (XX-XXX).']
  },

  // Usługi i działalność
  services: [{
    id: { type: String },
    name: { type: String, required: true, index: true }, // Added index for frequent searches
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, default: 'Ogólne', index: true },
    employees: [{ type: Number }] // Array of employee IDs
  }],
  categories: [{
    name: { type: String, required: true },
    color: { type: String },
    description: { type: String }
  }],
  workingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  pricing: { type: String, default: '' },
  teamSize: { type: String, default: '' },

  // Pracownicy
  employees: [{
    id: { type: Number }, // Timestamp based ID
    name: { type: String, required: true },
    position: { type: String },
    phone: { type: String },
    email: { type: String },
    bio: { type: String },
    avatar: { type: String }, // Initials
    avatarImage: { type: String }, // Base64 or URL
    role: { type: String, enum: ['admin', 'manager', 'employee', 'calendar-only', 'no-access'], default: 'employee' },
    assignedServices: [{
      serviceId: { type: String }, // Changed to String to match service ID type
      duration: { type: Number },
      price: { type: Number },
      available: { type: Boolean, default: true }
    }],
    availability: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean }
    },
    vacations: [{
      id: { type: Number },
      startDate: { type: String },
      endDate: { type: String },
      reason: { type: String }
    }],
    breaks: [{
      id: { type: Number },
      day: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      reason: { type: String }
    }]
  }],

  // Opinie
  reviews: [{
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    service: { type: String },
    verified: { type: Boolean, default: false }
  }],

  // Social Media i marketing
  website: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  newsletter: { type: Boolean, default: false },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Status biznesu
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },

  // Integracja z Google Calendar
  googleCalendarTokens: {
    accessToken: { type: String, default: null, set: encrypt, get: decrypt },
    refreshToken: { type: String, default: null, set: encrypt, get: decrypt },
    expiryDate: { type: Date, default: null }
  },
  googleCalendarConnected: { type: Boolean, default: false },
}, {
  strict: true,
  validateBeforeSave: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Helper functions for validation
const validateTimeFormat = (time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

const validateDaySchedule = (daySchedule) => {
  if (!daySchedule || daySchedule.closed) return true;

  // Check if open and close times are present
  if (!daySchedule.open || !daySchedule.close) return false;

  // Check format
  if (!validateTimeFormat(daySchedule.open) || !validateTimeFormat(daySchedule.close)) return false;

  // Check logic (open < close)
  const [openH, openM] = daySchedule.open.split(':').map(Number);
  const [closeH, closeM] = daySchedule.close.split(':').map(Number);

  if (openH > closeH || (openH === closeH && openM >= closeM)) {
    return false;
  }
  return true;
};

// Walidacja godzin otwarcia przed walidacją modelu
BusinessSchema.pre('validate', function (next) {
  if (this.isModified('workingHours')) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of days) {
      if (this.workingHours[day] && !validateDaySchedule(this.workingHours[day])) {
        this.invalidate(`workingHours.${day}`, `Invalid working hours for ${day}. Check format (HH:MM) and ensure open time is before close time.`);
      }
    }
  }
  next();
});

// Automatyczna aktualizacja updatedAt i hashowanie hasła
BusinessSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Delete cached model to force schema refresh (useful during development)
if (mongoose.models.Business) {
  delete mongoose.models.Business;
}

export default mongoose.model("Business", BusinessSchema);


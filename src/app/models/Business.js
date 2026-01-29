import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { encrypt, decrypt } from "../../lib/crypto";

// Import extracted schemas
import ServiceSchema from "./schemas/ServiceSchema";
import ReviewSchema from "./schemas/ReviewSchema";
import EmployeeSchema from "./schemas/EmployeeSchema";
import LocationSchema from "./schemas/LocationSchema";

const BusinessSchema = new mongoose.Schema({
  // Dane kontaktowe właściciela
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
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
  category: { type: String, required: true, index: true },
  description: { type: String, default: '' },

  // Obrazy firmy (Cloudinary URLs)
  profileImage: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  portfolioImages: [{ type: String }],
  hiddenPortfolioImages: [{ type: String }],

  // Lokalizacja
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  postalCode: {
    type: String,
    required: true,
    match: [/^\d{2}-\d{3}$/, 'Invalid postal code format (XX-XXX).']
  },

  // Usługi i działalność - using extracted schema
  services: [ServiceSchema],
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

  // Time and Calendar Settings
  timeZone: { type: String, default: 'Europe/Warsaw' },
  timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
  firstDayOfWeek: { type: String, enum: ['monday', 'sunday'], default: 'monday' },
  calendarSettings: {
    visitColor: { type: String, default: 'employee' }, // 'service' or 'employee'
    showWaitingTime: { type: Boolean, default: true },
    showBlockTime: { type: Boolean, default: true },
    blockTypes: [{
      name: { type: String, required: true },
      duration: { type: Number, default: 60 }, // w minutach
      isPaid: { type: Boolean, default: true },
      icon: { type: String, default: 'calendar' }
    }]
  },
  waitlistSettings: {
    enabled: { type: Boolean, default: true },
    mode: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    priority: { type: String, enum: ['first_come', 'vip'], default: 'first_come' },
    onlineBooking: {
      active: { type: Boolean, default: true },
      timePreference: { type: String, enum: ['any', 'morning', 'afternoon'], default: 'any' }
    }
  },
  pricing: { type: String, default: '' },
  teamSize: { type: String, default: '' },

  // Pracownicy - using extracted schema
  employees: [EmployeeSchema],

  // Opinie - using extracted schema
  reviews: [ReviewSchema],

  // Social Media i marketing
  website: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  newsletter: { type: Boolean, default: false },

  // Status biznesu
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String, default: '' },

  // Password Reset
  forcePasswordReset: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Integracja z Google Calendar
  googleCalendarTokens: {
    accessToken: { type: String, default: null, set: encrypt, get: decrypt },
    refreshToken: { type: String, default: null, set: encrypt, get: decrypt },
    expiryDate: { type: Date, default: null }
  },
  googleCalendarConnected: { type: Boolean, default: false },

  // Stripe Subscription
  subscription: {
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing', 'inactive'],
      default: 'inactive'
    },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },

  // Multiple Locations - using extracted schema
  locations: [LocationSchema]
}, {
  timestamps: true,
  strict: true,
  validateBeforeSave: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for common queries
BusinessSchema.index({ city: 1, category: 1 });

// Helper functions for validation
const validateTimeFormat = (time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

const validateDaySchedule = (daySchedule) => {
  if (!daySchedule || daySchedule.closed) return true;

  if (!daySchedule.open || !daySchedule.close) return false;

  if (!validateTimeFormat(daySchedule.open) || !validateTimeFormat(daySchedule.close)) return false;

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

// Hashowanie hasła przed zapisem (timestamps handled automatically)
BusinessSchema.pre('save', async function (next) {
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

// Delete cached model only in development (prevents issues in production)
if (process.env.NODE_ENV === 'development' && mongoose.models.Business) {
  delete mongoose.models.Business;
}

export default mongoose.model("Business", BusinessSchema);

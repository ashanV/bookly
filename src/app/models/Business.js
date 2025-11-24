import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
  // Dane kontaktowe właściciela
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  // Dane firmy
  companyName: { type: String, required: true },
  companyType: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },

  // Lokalizacja
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },

  // Usługi i działalność
  services: [{
    id: { type: String },
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
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
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    expiryDate: { type: Date, default: null }
  },
  googleCalendarConnected: { type: Boolean, default: false },
}, {
  strict: true,
  validateBeforeSave: true
});

// Automatyczna aktualizacja updatedAt
BusinessSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Business || mongoose.model("Business", BusinessSchema);


import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  // Dane osobowe
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  phone: {
    type: String,
    match: [/^\+?[0-9\s\-\(\)]{9,}$/, 'Please use a valid phone number.']
  },
  birthDate: { type: String },
  password: { type: String, required: true },

  // Admin fields
  adminRole: {
    type: String,
    enum: ['admin', 'moderator', 'developer', null],
    default: null
  },
  adminPin: { type: String }, // zahashowany PIN do panelu admin
  adminPermissions: [{ type: String }], // dodatkowe uprawnienia specyficzne
  lastAdminLogin: { type: Date },
  isAdminActive: { type: Boolean, default: false },

  // Session Management
  tokenVersion: { type: Number, default: 0 },
  lastIp: { type: String },
  lastUserAgent: { type: String },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Status użytkownika
  isActive: { type: Boolean, default: true },
  forcePasswordReset: { type: Boolean, default: false },
}, {
  strict: true,
  validateBeforeSave: true
});

// Automatyczna aktualizacja updatedAt i hashowanie hasła
UserSchema.pre('save', async function (next) {
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

export default mongoose.models.User || mongoose.model("User", UserSchema);
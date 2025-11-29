import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  // Dane osobowe
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  birthDate: { type: String },
  password: { type: String, required: true },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Status użytkownika
  isActive: { type: Boolean, default: true },
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
import mongoose from "mongoose";

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

// Automatyczna aktualizacja updatedAt
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
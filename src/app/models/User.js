import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ["client", "business"], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  birthDate: { type: String },
  password: { type: String, required: true },
  businessName: String, 
  address: String,      
  services: [String],    
  createdAt: { type: Date, default: Date.now },
}, {
  strict: true,
  validateBeforeSave: true
})

export default mongoose.models.User || mongoose.model("User", UserSchema);
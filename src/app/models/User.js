import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  birthDate: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  strict: true,
  validateBeforeSave: true
})

export default mongoose.model("User", UserSchema)
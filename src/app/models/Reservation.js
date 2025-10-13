import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studioId: { type: String, required: true },
    serviceId: { type: String, required: true },
    staffId: { type: String },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "pending", "cancelled", "completed"], default: "confirmed" },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: true }
);

export default mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Brak zmiennej MONGODB_URI w .env.local");
}

let isConnected = null;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ Połączono z MongoDB");
  } catch (err) {
    console.error("❌ Błąd połączenia z MongoDB", err);
  }
}

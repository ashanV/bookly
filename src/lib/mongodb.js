import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Brak zmiennej MONGODB_URI w .env.local");
}

// Global cache to prevent creating many connections in dev/hot-reload
let globalWithMongoose = global;
if (!globalWithMongoose._mongoose) {
  globalWithMongoose._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const cached = globalWithMongoose._mongoose;
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("✅ Połączono z MongoDB");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ Błąd połączenia z MongoDB", err);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

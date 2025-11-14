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

// Connection pool configuration
const mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5, // Minimum number of connections in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server before timing out
  connectTimeoutMS: 10000, // How long to wait for initial connection
  heartbeatFrequencyMS: 10000, // Frequency of server heartbeat checks
  retryWrites: true,
  retryReads: true,
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
};

export async function connectDB() {
  const cached = globalWithMongoose._mongoose;
  if (cached.conn) {
    // Check if connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection lost, reset
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, mongooseOptions)
      .then((mongooseInstance) => {
        console.log("✅ Połączono z MongoDB");
        
        // Handle connection events
        mongooseInstance.connection.on('error', (err) => {
          console.error("❌ Błąd połączenia MongoDB:", err);
        });

        mongooseInstance.connection.on('disconnected', () => {
          console.warn("⚠️ MongoDB rozłączone");
          cached.conn = null;
          cached.promise = null;
        });

        mongooseInstance.connection.on('reconnected', () => {
          console.log("✅ MongoDB ponownie połączone");
        });

        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ Błąd połączenia z MongoDB", err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await Promise.race([
      cached.promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout połączenia z MongoDB")), 10000)
      )
    ]);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

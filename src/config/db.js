import mongoose from "mongoose";
import env from "./env.js";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("🟡 MongoDB already connected");
    return;
  }

  try {
    // Production-grade connection options
    const options = {
      // Connection pooling for better performance
      maxPoolSize: env.environment === "production" ? 10 : 5,
      minPoolSize: env.environment === "production" ? 5 : 2,

      // Timeouts for connection stability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      // Retry strategies for transient failures
      retryWrites: true,
      retryReads: true,

      // Auto-index only in development to avoid production performance impact
      autoIndex: env.environment !== "production",

      // Database selection
      dbName: env.dbName,

      // Query logging in development for debugging
      monitorCommands: env.environment === "development",
    };

    const conn = await mongoose.connect(env.dbUrl, options);

    isConnected = true;

    console.log(`🟢 MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("🔴 MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

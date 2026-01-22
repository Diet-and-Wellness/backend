import "dotenv/config";
import app from "./app.js";
import connectDB from "#config/db.js";
import env from "#config/env.js";
import gracefulShutdown from "#utils/gracefulShutdown.js";

const PORT = env.port;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

// OS signals
["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
  process.on(signal, gracefulShutdown);
});

// Nodemon restart support
process.on("SIGUSR2", gracefulShutdown);

// Uncaught errors
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("exit", () => {
  console.log("Goodbye!");
});

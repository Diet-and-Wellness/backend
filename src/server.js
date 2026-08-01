import "dotenv/config";
import cron from "node-cron";
import app from "./app.js";
import connectDB from "#config/db.js";
import env from "#config/env.js";
import gracefulShutdown from "#utils/gracefulShutdown.js";
import runBackup from "#utils/backup.js";

const PORT = env.port;
const HOST = env.host;
let server;
let backupTask;

(async () => {
  try {
    await connectDB();
    server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    });

    // Daily backup at 02:00 AM server time (not applicable in serverless environments)
    if (!process.env.VERCEL) {
      backupTask = cron.schedule("0 2 * * *", () => {
        console.log("⏰ Running daily backup...");
        runBackup();
      });
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

// OS signals
["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
  process.once(signal, () => gracefulShutdown(signal, server, backupTask));
});

// Uncaught errors
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("exit", () => {
  console.log("Goodbye!");
});

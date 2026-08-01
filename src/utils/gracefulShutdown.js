import mongoose from "mongoose";

const gracefulShutdown = async (signal, server, backupTask) => {
  console.log(`\n🛑 Received ${signal}. Closing MongoDB connection...`);

  try {
    backupTask?.stop();
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await mongoose.connection.close(false);
    console.log("🟢 MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("🔴 Error closing MongoDB connection:", err);
    process.exit(1);
  }
};

export default gracefulShutdown;

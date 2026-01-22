import mongoose from "mongoose";
import repl from "repl";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.MONGO_URI;

await mongoose.connect(DB_URL);
console.log("Connected to MongoDB!");

// Start a REPL shell
const r = repl.start({
  prompt: "node-shell> ",
});

// Expose mongoose models in the shell
r.context.User = mongoose.model(
  "User",
  new mongoose.Schema({ name: String, email: String }),
);
r.context.mongoose = mongoose;

console.log("You can now use `User` and `mongoose` inside the shell.");

r.on("exit", () => {
  mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit();
});

r.on("close", () => {
  mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit();
});

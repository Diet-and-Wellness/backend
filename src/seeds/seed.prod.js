import { runSeed } from "./seedCommon.js";

(async () => {
  try {
    console.log("Starting production seeding...");
    await runSeed({ envName: "production" });
    console.log("Production seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();

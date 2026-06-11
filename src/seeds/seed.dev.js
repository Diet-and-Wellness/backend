import { runSeed } from "./seedCommon.js";

(async () => {
  try {
    console.log("Starting development seeding...");
    await runSeed({ envName: "development" });
    console.log("Development seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();

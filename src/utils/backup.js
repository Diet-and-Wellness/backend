import { spawn } from "child_process";
import { mkdir, readdir, rm, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import env from "#config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_ROOT = path.resolve(__dirname, "../../backups");
const RETENTION_DAYS = 7;

const runBackup = async () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\..+/, "");
  const backupDir = path.join(BACKUP_ROOT, timestamp);

  try {
    await mkdir(backupDir, { recursive: true });

    await new Promise((resolve, reject) => {
      const args = ["--uri", env.dbUrl, "--out", backupDir];
      if (env.dbName) args.push("--db", env.dbName);

      const proc = spawn("mongodump", args, { stdio: "pipe" });

      proc.stderr.on("data", (data) => {
        // mongodump writes progress to stderr — not an error
        process.stdout.write(`[backup] ${data}`);
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`mongodump exited with code ${code}`));
        }
      });

      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          reject(
            new Error(
              "mongodump not found. Install MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools",
            ),
          );
        } else {
          reject(err);
        }
      });
    });

    console.log(`✅ Backup completed: ${backupDir}`);
    await pruneOldBackups();
  } catch (err) {
    console.error("❌ Backup failed:", err.message);
    // Remove the empty/partial backup directory
    await rm(backupDir, { recursive: true, force: true }).catch(() => {});
  }
};

const pruneOldBackups = async () => {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  let entries;
  try {
    entries = await readdir(BACKUP_ROOT);
  } catch {
    return; // backups directory doesn't exist yet
  }

  for (const entry of entries) {
    const fullPath = path.join(BACKUP_ROOT, entry);
    try {
      const info = await stat(fullPath);
      if (info.isDirectory() && info.mtimeMs < cutoff) {
        await rm(fullPath, { recursive: true, force: true });
        console.log(`🗑️  Removed old backup: ${entry}`);
      }
    } catch {
      // skip entries we can't stat
    }
  }
};

/**
 * Restore the database from a backup directory.
 *
 * @param {string} [backupName] - The backup folder name inside `backups/`
 *   (e.g. "2026-05-15T02-00-00"). Omit to restore from the most recent backup.
 *
 * Usage:
 *   node --input-type=module -e '
 *     import { restoreDB } from "#utils/backup.js";
 *     await restoreDB("2026-05-15T02-00-00");
 *   '
 */
const restoreDB = async (backupName) => {
  let sourceDir;

  if (backupName) {
    sourceDir = path.join(BACKUP_ROOT, backupName);
  } else {
    // Find the most recent backup folder
    let entries;
    try {
      entries = await readdir(BACKUP_ROOT);
    } catch {
      throw new Error(`Backup directory not found: ${BACKUP_ROOT}`);
    }

    const dirs = [];
    for (const entry of entries) {
      const fullPath = path.join(BACKUP_ROOT, entry);
      try {
        const info = await stat(fullPath);
        if (info.isDirectory()) dirs.push({ name: entry, mtime: info.mtimeMs });
      } catch {
        // skip
      }
    }

    if (dirs.length === 0) throw new Error("No backups found to restore from.");

    dirs.sort((a, b) => b.mtime - a.mtime);
    sourceDir = path.join(BACKUP_ROOT, dirs[0].name);
    console.log(
      `ℹ️  No backup name given — using most recent: ${dirs[0].name}`,
    );
  }

  // Verify the directory exists
  try {
    await stat(sourceDir);
  } catch {
    throw new Error(`Backup not found: ${sourceDir}`);
  }

  console.log(`♻️  Restoring from: ${sourceDir}`);

  await new Promise((resolve, reject) => {
    // --drop drops each collection before restoring so the restore is clean
    const args = ["--uri", env.dbUrl, "--drop", "--dir", sourceDir];
    if (env.dbName) args.push("--nsInclude", `${env.dbName}.*`);

    const proc = spawn("mongorestore", args, { stdio: "pipe" });

    proc.stderr.on("data", (data) => {
      // mongorestore writes progress to stderr — not an error
      process.stdout.write(`[restore] ${data}`);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`mongorestore exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(
          new Error(
            "mongorestore not found. Install MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools",
          ),
        );
      } else {
        reject(err);
      }
    });
  });

  console.log("✅ Restore completed successfully.");
};

// # Restore from a specific backup
// node --input-type=module -e '
//   import { restoreDB } from "#utils/backup.js";
//   await restoreDB("2026-05-15T02-00-00");
// '

// # Restore from the most recent backup (omit the argument)
// node --input-type=module -e '
//   import { restoreDB } from "#utils/backup.js";
//   await restoreDB();
// '

export { restoreDB };
export default runBackup;

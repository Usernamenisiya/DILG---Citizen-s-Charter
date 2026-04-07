const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const repoRoot = path.resolve(__dirname, "..");
const dbPath = path.join(repoRoot, "my-custom-backend", "app-data.db");
const outputPath = path.join(repoRoot, "my-custom-backend", "seed-data.json");

const tables = [
  "internal_services",
  "external_services",
  "issuances",
  "issuance_meta",
  "kiosk_settings",
  "feedback_content",
  "organizational_profile",
  "office_directory_meta",
  "office_directory_entries",
  "announcements",
  "programs",
  "idle_videos",
  "calendar_events",
];

const db = new Database(dbPath, { readonly: true });

const snapshot = {};
for (const table of tables) {
  snapshot[table] = db.prepare(`SELECT * FROM ${table}`).all();
}

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
console.log(`Wrote ${outputPath}`);
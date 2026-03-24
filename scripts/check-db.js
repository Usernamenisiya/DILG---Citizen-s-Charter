const Database = require("better-sqlite3");

const db = new Database("./my-custom-backend/app-data.db");

const count = (table) => db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;

const result = {
  internal_services: count("internal_services"),
  external_services: count("external_services"),
  issuances: count("issuances"),
  office_directory_entries: count("office_directory_entries"),
  feedback_content: count("feedback_content"),
  organizational_profile: count("organizational_profile"),
  kiosk_settings: count("kiosk_settings"),
  issuance_meta: count("issuance_meta"),
};

console.log(JSON.stringify(result, null, 2));

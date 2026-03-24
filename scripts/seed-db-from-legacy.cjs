const { execSync } = require("node:child_process");
const Database = require("better-sqlite3");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const dbPath = path.join(repoRoot, "my-custom-backend", "app-data.db");

const sourceText = execSync(
  "git show 2e4d15a:src/data/kioskDefaultData.js",
  { cwd: repoRoot, encoding: "utf8" }
);

const match = sourceText.match(/export const KIOSK_DEFAULT_DATA\s*=\s*([\s\S]*);\s*$/);
if (!match) {
  throw new Error("Could not parse KIOSK_DEFAULT_DATA from legacy source.");
}

const objectCode = match[1];
const buildData = new Function(
  "leaveIcon",
  "travelIcon",
  "certIcon",
  "equipmentIcon",
  "vehicleIcon",
  "procurementIcon",
  "claimsRoIcon",
  "claimsPoIcon",
  "ictIcon",
  "legalIcon",
  `return (${objectCode});`
);

const data = buildData(
  "/src/assets/icons/leave.png",
  "/src/assets/icons/travel.png",
  "/src/assets/icons/certification.png",
  "/src/assets/icons/equipment.png",
  "/src/assets/icons/vehicle.png",
  "/src/assets/icons/procurement.png",
  "/src/assets/icons/claims-regional.png",
  "/src/assets/icons/claims-provincial.png",
  "/src/assets/icons/ict.png",
  "/src/assets/icons/legal.png"
);

const db = new Database(dbPath);

const insertService = (table, svc) => {
  db.prepare(
    `INSERT INTO ${table} (id, icon, classification, label, description, processingTime, fees, whoMayAvail, office, requirements, steps)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    svc.id,
    svc.icon || "",
    svc.classification || "Simple",
    svc.label || "",
    svc.desc || svc.description || "",
    svc.processingTime || "",
    svc.fees || "None",
    svc.who || svc.whoMayAvail || "",
    svc.office || "",
    JSON.stringify(svc.requirements || []),
    JSON.stringify(svc.steps || [])
  );
};

const tx = db.transaction(() => {
  if (data.settings) {
    db.prepare(
      `UPDATE kiosk_settings
       SET kioskTitle = ?, office = ?, address = ?, tagline = ?, hours = ?,
           perPage = ?, resetTimer = ?, adminPin = ?, updateUrl = ?, autoCheckUpdates = ?
       WHERE id = 1`
    ).run(
      data.settings.kioskTitle || "Citizen's Charter Information Kiosk",
      data.settings.office || "",
      data.settings.address || "",
      data.settings.tagline || "",
      data.settings.hours || "",
      Number(data.settings.perPage || 9),
      Number(data.settings.resetTimer || 60),
      data.settings.adminPin || "0000",
      data.settings.updateUrl || "",
      data.settings.autoCheckUpdates ? 1 : 0
    );
  }

  if (data.feedbackAndComplaints) {
    db.prepare(
      `UPDATE feedback_content
       SET title = ?, email = ?, telephone = ?, sections = ?
       WHERE id = 1`
    ).run(
      data.feedbackAndComplaints.title || "Feedback and Complaints Mechanism",
      data.feedbackAndComplaints.contact?.email || "",
      data.feedbackAndComplaints.contact?.telephone || "",
      JSON.stringify(data.feedbackAndComplaints.sections || [])
    );
  }

  if (data.organizationalProfile) {
    const p = data.organizationalProfile;
    db.prepare(
      `UPDATE organizational_profile
       SET title = ?, mandate = ?, mission = ?, vision = ?, pledgeIntro = ?,
           pledgeServiceCommitment = ?, pbest = ?, pledgeOfficeHours = ?, pledgeClosing = ?
       WHERE id = 1`
    ).run(
      p.title || "Mandate, Mission, Vision and Service Pledge",
      p.mandate || "",
      p.mission || "",
      p.vision || "",
      p.servicePledge?.intro || "",
      p.servicePledge?.serviceCommitment || "",
      JSON.stringify(p.servicePledge?.pbest || []),
      p.servicePledge?.officeHoursCommitment || "",
      p.servicePledge?.closing || ""
    );
  }

  if (data.officeDirectory) {
    db.prepare("UPDATE office_directory_meta SET title = ?, region = ? WHERE id = 1").run(
      data.officeDirectory.title || "List of Offices",
      data.officeDirectory.region || ""
    );

    db.prepare("DELETE FROM office_directory_entries").run();
    const insertOffice = db.prepare(
      "INSERT INTO office_directory_entries (office, address, contact, sortOrder) VALUES (?, ?, ?, ?)"
    );
    (data.officeDirectory.entries || []).forEach((entry, index) => {
      insertOffice.run(entry.office || "", entry.address || "", entry.contact || "", index + 1);
    });
  }

  const issuanceMeta = data.policiesAndIssuances || {};
  db.prepare("UPDATE issuance_meta SET title = ?, subtitle = ? WHERE id = 1").run(
    issuanceMeta.title || "Policies and Issuances",
    issuanceMeta.subtitle || "Compliance references and deadlines"
  );

  db.prepare("DELETE FROM issuances").run();
  const insertIssuance = db.prepare(
    `INSERT INTO issuances (id, title, circularNo, subject, date, coverage, effectivity, supersedes, approvingAuthority, highlights, deadlines)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  (issuanceMeta.items || []).forEach((iss) => {
    insertIssuance.run(
      iss.id || `iss_${Date.now()}`,
      iss.title || "",
      iss.circularNo || "",
      iss.subject || "",
      iss.date || "",
      iss.coverage || "",
      iss.effectivity || "",
      iss.supersedes || "",
      iss.approvingAuthority || "",
      JSON.stringify(iss.highlights || []),
      JSON.stringify(iss.deadlines || [])
    );
  });

  db.prepare("DELETE FROM internal_services").run();
  (data.services || []).forEach((svc) => insertService("internal_services", svc));

  db.prepare("DELETE FROM external_services").run();
  (data.externalServices || []).forEach((svc) => insertService("external_services", svc));
});

tx();

const count = (table) => db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
console.log(JSON.stringify({
  seeded: true,
  counts: {
    internal_services: count("internal_services"),
    external_services: count("external_services"),
    issuances: count("issuances"),
    office_directory_entries: count("office_directory_entries"),
  },
}, null, 2));

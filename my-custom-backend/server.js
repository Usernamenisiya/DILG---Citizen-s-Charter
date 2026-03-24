const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "app-data.db");
const db = new Database(dbPath);

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text || "");
  } catch {
    return fallback;
  }
}

function serviceRowToDto(row) {
  return {
    ...row,
    desc: row.description || "",
    who: row.whoMayAvail || "",
    requirements: safeJsonParse(row.requirements, []),
    steps: safeJsonParse(row.steps, []),
  };
}

function ensureSingleRow(tableName, insertSql, seedArgs) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get();
  if (row.count === 0) {
    db.prepare(insertSql).run(...seedArgs);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS internal_services (
    id TEXT PRIMARY KEY,
    icon TEXT,
    classification TEXT,
    label TEXT NOT NULL,
    description TEXT,
    processingTime TEXT,
    fees TEXT,
    whoMayAvail TEXT,
    office TEXT,
    requirements TEXT,
    steps TEXT
  );

  CREATE TABLE IF NOT EXISTS external_services (
    id TEXT PRIMARY KEY,
    icon TEXT,
    classification TEXT,
    label TEXT NOT NULL,
    description TEXT,
    processingTime TEXT,
    fees TEXT,
    whoMayAvail TEXT,
    office TEXT,
    requirements TEXT,
    steps TEXT
  );

  CREATE TABLE IF NOT EXISTS issuances (
    id TEXT PRIMARY KEY,
    title TEXT,
    circularNo TEXT,
    subject TEXT,
    date TEXT,
    coverage TEXT,
    effectivity TEXT,
    supersedes TEXT,
    approvingAuthority TEXT,
    highlights TEXT,
    deadlines TEXT
  );

  CREATE TABLE IF NOT EXISTS issuance_meta (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS kiosk_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    kioskTitle TEXT NOT NULL,
    office TEXT NOT NULL,
    address TEXT NOT NULL,
    tagline TEXT NOT NULL,
    hours TEXT NOT NULL,
    perPage INTEGER NOT NULL,
    resetTimer INTEGER NOT NULL,
    adminPin TEXT NOT NULL,
    updateUrl TEXT NOT NULL,
    autoCheckUpdates INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS feedback_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    sections TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS organizational_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    mandate TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    pledgeIntro TEXT NOT NULL,
    pledgeServiceCommitment TEXT NOT NULL,
    pbest TEXT NOT NULL,
    pledgeOfficeHours TEXT NOT NULL,
    pledgeClosing TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS office_directory_meta (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    region TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS office_directory_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );
`);

ensureSingleRow(
  "issuance_meta",
  "INSERT INTO issuance_meta (id, title, subtitle) VALUES (1, ?, ?)",
  ["Policies and Issuances", "Compliance references and deadlines"]
);

ensureSingleRow(
  "kiosk_settings",
  "INSERT INTO kiosk_settings (id, kioskTitle, office, address, tagline, hours, perPage, resetTimer, adminPin, updateUrl, autoCheckUpdates) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  [
    "Citizen's Charter Information Kiosk",
    "DILG Region XIII (Caraga)",
    "Purok 1-A, Doongan, Butuan City",
    "Serbisyong Maaasahan, Madali at Mabilis",
    "Monday to Friday, 8:00 AM - 5:00 PM",
    9,
    60,
    "0000",
    "",
    0,
  ]
);

ensureSingleRow(
  "feedback_content",
  "INSERT INTO feedback_content (id, title, email, telephone, sections) VALUES (1, ?, ?, ?, ?)",
  [
    "Feedback and Complaints Mechanism",
    "paccrecords@gmail.com",
    "(02) 8925-0343",
    JSON.stringify([
      {
        heading: "How to send feedback?",
        paragraphs: [
          "Accomplish the Client Satisfaction Survey form after receiving your requested service from our action officers.",
          "For other concerns, you may send an e-mail at paccrecords@gmail.com or call the telephone number (02) 8925-0343.",
        ],
      },
      {
        heading: "How feedback is processed?",
        paragraphs: [
          "Feedback on our services are immediately attended to by the concerned action officer.",
          "Other feedback and concerns are endorsed by the Public Assistance and Complaints Center (PACC) to the appropriate office. Upon receiving the reply from the concerned office/personnel, the client will be informed via e-mail/phone call/letter.",
        ],
      },
      {
        heading: "How to file complaint?",
        paragraphs: [
          "For walk-ins at the Central Office: Accomplish the Client's Complaint Form available at the DILG Helpdesk at the Ground Floor, DILG-NAPOLCOM Center, EDSA cor. Quezon Avenue, West Triangle, Quezon City (Central Office).",
          "For walk-ins at the Regional, Provincial, and Field Offices: Approach the Desk Officer of the Day and accomplish the Client's Complaint Form.",
          "Online: Send an e-mail to paccrecords@gmail.com and provide the required details below.",
        ],
        items: [
          "Name (optional) and contact number of the complainant",
          "Narrative/details of the complaint",
          "Name of the office/LGU and/or official being complained",
        ],
      },
      {
        heading: "How complaints are processed?",
        paragraphs: [
          "All complaints received will be reviewed by the PACC or the Desk Officer of the Day and endorsed to the concerned office for a reply or an appropriate action.",
          "The PACC or the DILG Regional Office will provide feedback to the complainant via e-mail/letter.",
        ],
      },
    ]),
  ]
);

ensureSingleRow(
  "organizational_profile",
  "INSERT INTO organizational_profile (id, title, mandate, mission, vision, pledgeIntro, pledgeServiceCommitment, pbest, pledgeOfficeHours, pledgeClosing) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  [
    "Mandate, Mission, Vision and Service Pledge",
    "To promote peace and order, ensure public safety and further strengthen local government capability aimed towards the effective delivery of basic services to the citizenry.",
    "The Department shall ensure peace and order, public safety and security, uphold excellence in local governance and enable resilient and inclusive communities.",
    "A highly trusted Department and Partner in nurturing local governments and sustaining peaceful, safe, progressive, resilient, and inclusive communities towards a comfortable and secure life for Filipinos by 2040.",
    "We in the DILG, imbued with the core values of Integrity, Commitment, Teamwork and Responsiveness, commit to formulate sound policies on strengthening local government capacities, performing oversight function over LGUs, and providing rewards and incentives.",
    "We pledge to provide effective technical and administrative services through professionalized corps of civil servants to promote excellence in local governance specifically in the areas of PBEST:",
    JSON.stringify([
      "Peace and Order",
      "Business-Friendliness and Competitiveness",
      "Environment-Protection and Climate Change Adaptation",
      "Socially Protective and Safe Communities",
      "Transparency and Accountability",
    ]),
    "We commit to attend to clients who are within the premises of the office prior to the end of official working hours and during lunch break.",
    "We commit to consistently demonstrate a \"Matino, Mahusay at Maaasahang Kagawaran para sa Mapagkalinga at Maunlad na Pamahalaang Lokal\".",
  ]
);

ensureSingleRow(
  "office_directory_meta",
  "INSERT INTO office_directory_meta (id, title, region) VALUES (1, ?, ?)",
  ["List of Offices", "Region XIII (Caraga Region)"]
);

const officeCount = db.prepare("SELECT COUNT(*) AS count FROM office_directory_entries").get();
if (officeCount.count === 0) {
  const insertOffice = db.prepare(
    "INSERT INTO office_directory_entries (office, address, contact, sortOrder) VALUES (?, ?, ?, ?)"
  );

  const seedOffices = [
    ["Office of the Regional Director", "Brgy. Libertad, Butuan City, Agusan del Norte", "8876-3454 loc. 8301"],
    ["Finance and Administrative Division", "", "8876-3454 loc. 8303"],
    ["Local Government Capability Development Division", "", "8876-3454 loc. 8304"],
    ["Local Government Monitoring and Evaluation Division", "", "8876-3454 loc. 8305"],
    ["Agusan del Norte", "Matimco Bldg., J.C. Aquino Ave., Libertad, Butuan City, Agusan del Norte", "8876-3454 loc. 8311"],
    ["Agusan del Sur", "Municipality of Prosperidad Hall, National Highway, Prosperidad City, Agusan del Sur", "8876-3454 loc. 8321"],
    ["Dinagat Islands", "Brgy. Cuarinta, San Jose, Dinagat Islands", "8876-3454 loc. 8331"],
    ["Surigao del Norte", "City Hall Compound, Surigao City, Surigao del Norte", "8876-3454 loc. 8341"],
    ["Surigao del Sur", "Lianga, Surigao del Sur", "8876-3454 loc. 8351"],
  ];

  seedOffices.forEach((entry, index) => {
    insertOffice.run(entry[0], entry[1], entry[2], index + 1);
  });
}

const announcementCount = db.prepare("SELECT COUNT(*) AS count FROM announcements").get();
if (announcementCount.count === 0) {
  db.prepare("INSERT INTO announcements (message, sortOrder) VALUES (?, 1)").run(
    "Welcome to the DILG Citizens Charter Kiosk. We are committed to providing fast, efficient, and courteous public service."
  );
}

app.get("/api/services/:type", (req, res) => {
  const type = req.params.type;
  if (type !== "internal" && type !== "external") {
    return res.status(400).json({ error: "Invalid service type." });
  }

  const tableName = type === "external" ? "external_services" : "internal_services";
  try {
    const services = db.prepare(`SELECT * FROM ${tableName}`).all();
    res.json(services.map(serviceRowToDto));
  } catch (error) {
    console.error(`Error fetching ${type} services:`, error);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

app.post("/api/services/:type", (req, res) => {
  const type = req.params.type;
  if (type !== "internal" && type !== "external") {
    return res.status(400).json({ error: "Invalid service type." });
  }

  const tableName = type === "external" ? "external_services" : "internal_services";
  const svc = req.body || {};
  const id = svc.id || `svc_${Date.now()}`;

  if (!String(svc.label || "").trim()) {
    return res.status(400).json({ error: "Service name is required." });
  }

  try {
    db.prepare(`
      INSERT INTO ${tableName} (
        id, icon, classification, label, description,
        processingTime, fees, whoMayAvail, office, requirements, steps
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      svc.icon || "",
      svc.classification || "Simple",
      svc.label || "Unnamed Service",
      svc.description || svc.desc || "",
      svc.processingTime || "",
      svc.fees || "None",
      svc.whoMayAvail || svc.who || "",
      svc.office || "",
      JSON.stringify(svc.requirements || []),
      JSON.stringify(svc.steps || [])
    );
    res.status(201).json({ message: "Service saved successfully.", id });
  } catch (error) {
    console.error(`Error saving ${type} service:`, error);
    res.status(500).json({ error: "Failed to save service." });
  }
});

app.put("/api/services/:type/:id", (req, res) => {
  const type = req.params.type;
  const id = req.params.id;
  if (type !== "internal" && type !== "external") {
    return res.status(400).json({ error: "Invalid service type." });
  }

  const tableName = type === "external" ? "external_services" : "internal_services";
  const svc = req.body || {};

  try {
    const info = db.prepare(`
      UPDATE ${tableName}
      SET icon = ?, classification = ?, label = ?, description = ?,
          processingTime = ?, fees = ?, whoMayAvail = ?, office = ?,
          requirements = ?, steps = ?
      WHERE id = ?
    `).run(
      svc.icon || "",
      svc.classification || "Simple",
      svc.label || "Unnamed Service",
      svc.description || svc.desc || "",
      svc.processingTime || "",
      svc.fees || "None",
      svc.whoMayAvail || svc.who || "",
      svc.office || "",
      JSON.stringify(svc.requirements || []),
      JSON.stringify(svc.steps || []),
      id
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: "Service not found." });
    }
    res.json({ message: "Service updated successfully." });
  } catch (error) {
    console.error(`Error updating ${type} service:`, error);
    res.status(500).json({ error: "Failed to update service." });
  }
});

app.delete("/api/services/:type/:id", (req, res) => {
  const type = req.params.type;
  const id = req.params.id;
  if (type !== "internal" && type !== "external") {
    return res.status(400).json({ error: "Invalid service type." });
  }

  const tableName = type === "external" ? "external_services" : "internal_services";
  try {
    const info = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Service not found." });
    }
    res.json({ message: "Service deleted successfully." });
  } catch (error) {
    console.error(`Error deleting ${type} service:`, error);
    res.status(500).json({ error: "Failed to delete service." });
  }
});

app.get("/api/issuances", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM issuances").all();
    res.json(
      data.map((iss) => ({
        ...iss,
        highlights: safeJsonParse(iss.highlights, []),
        deadlines: safeJsonParse(iss.deadlines, []),
      }))
    );
  } catch (error) {
    console.error("Error fetching issuances:", error);
    res.status(500).json({ error: "Failed to fetch issuances." });
  }
});

app.post("/api/issuances", (req, res) => {
  const iss = req.body || {};
  const id = iss.id || `iss_${Date.now()}`;
  if (!String(iss.circularNo || iss.title || "").trim()) {
    return res.status(400).json({ error: "Circular number or title is required." });
  }

  try {
    db.prepare(`
      INSERT INTO issuances (
        id, title, circularNo, subject, date, coverage,
        effectivity, supersedes, approvingAuthority, highlights, deadlines
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
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
    res.status(201).json({ message: "Issuance saved.", id });
  } catch (error) {
    console.error("Error saving issuance:", error);
    res.status(500).json({ error: "Failed to save issuance." });
  }
});

app.put("/api/issuances/:id", (req, res) => {
  const id = req.params.id;
  const iss = req.body || {};
  try {
    const info = db.prepare(`
      UPDATE issuances
      SET title = ?, circularNo = ?, subject = ?, date = ?, coverage = ?,
          effectivity = ?, supersedes = ?, approvingAuthority = ?, highlights = ?, deadlines = ?
      WHERE id = ?
    `).run(
      iss.title || "",
      iss.circularNo || "",
      iss.subject || "",
      iss.date || "",
      iss.coverage || "",
      iss.effectivity || "",
      iss.supersedes || "",
      iss.approvingAuthority || "",
      JSON.stringify(iss.highlights || []),
      JSON.stringify(iss.deadlines || []),
      id
    );
    if (info.changes === 0) {
      return res.status(404).json({ error: "Issuance not found." });
    }
    res.json({ message: "Issuance updated successfully." });
  } catch (error) {
    console.error("Error updating issuance:", error);
    res.status(500).json({ error: "Failed to update issuance." });
  }
});

app.delete("/api/issuances/:id", (req, res) => {
  const id = req.params.id;
  try {
    const info = db.prepare("DELETE FROM issuances WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Issuance not found." });
    }
    res.json({ message: "Issuance deleted successfully." });
  } catch (error) {
    console.error("Error deleting issuance:", error);
    res.status(500).json({ error: "Failed to delete issuance." });
  }
});

app.get("/api/issuances/meta", (req, res) => {
  try {
    const meta = db.prepare("SELECT title, subtitle FROM issuance_meta WHERE id = 1").get();
    res.json(meta || { title: "Policies and Issuances", subtitle: "Compliance references and deadlines" });
  } catch (error) {
    console.error("Error fetching issuance meta:", error);
    res.status(500).json({ error: "Failed to fetch issuance metadata." });
  }
});

app.put("/api/issuances/meta", (req, res) => {
  const body = req.body || {};
  try {
    db.prepare("UPDATE issuance_meta SET title = ?, subtitle = ? WHERE id = 1").run(
      body.title || "Policies and Issuances",
      body.subtitle || "Compliance references and deadlines"
    );
    res.json({ message: "Issuance metadata updated successfully." });
  } catch (error) {
    console.error("Error updating issuance meta:", error);
    res.status(500).json({ error: "Failed to update issuance metadata." });
  }
});

app.get("/api/settings", (req, res) => {
  try {
    const s = db.prepare("SELECT * FROM kiosk_settings WHERE id = 1").get();
    if (!s) {
      return res.status(404).json({ error: "Settings not found." });
    }
    res.json({
      kioskTitle: s.kioskTitle,
      office: s.office,
      address: s.address,
      tagline: s.tagline,
      hours: s.hours,
      perPage: s.perPage,
      resetTimer: s.resetTimer,
      adminPin: s.adminPin,
      updateUrl: s.updateUrl,
      autoCheckUpdates: !!s.autoCheckUpdates,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings." });
  }
});

app.put("/api/settings", (req, res) => {
  const s = req.body || {};
  const perPage = Math.max(9, Number(s.perPage) || 9);
  try {
    db.prepare(`
      UPDATE kiosk_settings
      SET kioskTitle = ?, office = ?, address = ?, tagline = ?, hours = ?,
          perPage = ?, resetTimer = ?, adminPin = ?, updateUrl = ?, autoCheckUpdates = ?
      WHERE id = 1
    `).run(
      s.kioskTitle || "Citizen's Charter Information Kiosk",
      s.office || "",
      s.address || "",
      s.tagline || "",
      s.hours || "",
      perPage,
      Number.isFinite(Number(s.resetTimer)) ? Number(s.resetTimer) : 60,
      s.adminPin || "0000",
      s.updateUrl || "",
      s.autoCheckUpdates ? 1 : 0
    );
    res.json({ message: "Settings updated successfully." });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings." });
  }
});

app.get("/api/feedback", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM feedback_content WHERE id = 1").get();
    if (!row) {
      return res.status(404).json({ error: "Feedback content not found." });
    }
    res.json({
      title: row.title,
      contact: {
        email: row.email,
        telephone: row.telephone,
      },
      sections: safeJsonParse(row.sections, []),
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback content." });
  }
});

app.put("/api/feedback", (req, res) => {
  const body = req.body || {};
  try {
    db.prepare(`
      UPDATE feedback_content
      SET title = ?, email = ?, telephone = ?, sections = ?
      WHERE id = 1
    `).run(
      body.title || "Feedback and Complaints Mechanism",
      body.contact?.email || "",
      body.contact?.telephone || "",
      JSON.stringify(body.sections || [])
    );
    res.json({ message: "Feedback content updated successfully." });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback content." });
  }
});

app.get("/api/profile", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM organizational_profile WHERE id = 1").get();
    if (!row) {
      return res.status(404).json({ error: "Organizational profile not found." });
    }
    res.json({
      title: row.title,
      mandate: row.mandate,
      mission: row.mission,
      vision: row.vision,
      servicePledge: {
        intro: row.pledgeIntro,
        serviceCommitment: row.pledgeServiceCommitment,
        pbest: safeJsonParse(row.pbest, []),
        officeHoursCommitment: row.pledgeOfficeHours,
        closing: row.pledgeClosing,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch organizational profile." });
  }
});

app.put("/api/profile", (req, res) => {
  const p = req.body || {};
  try {
    db.prepare(`
      UPDATE organizational_profile
      SET title = ?, mandate = ?, mission = ?, vision = ?,
          pledgeIntro = ?, pledgeServiceCommitment = ?, pbest = ?,
          pledgeOfficeHours = ?, pledgeClosing = ?
      WHERE id = 1
    `).run(
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
    res.json({ message: "Organizational profile updated successfully." });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update organizational profile." });
  }
});

app.get("/api/offices", (req, res) => {
  try {
    const meta = db.prepare("SELECT title, region FROM office_directory_meta WHERE id = 1").get();
    const entries = db
      .prepare("SELECT id, office, address, contact, sortOrder FROM office_directory_entries ORDER BY sortOrder ASC, id ASC")
      .all();

    res.json({
      title: meta?.title || "List of Offices",
      region: meta?.region || "",
      entries,
    });
  } catch (error) {
    console.error("Error fetching offices:", error);
    res.status(500).json({ error: "Failed to fetch office directory." });
  }
});

app.put("/api/offices/meta", (req, res) => {
  const body = req.body || {};
  try {
    db.prepare("UPDATE office_directory_meta SET title = ?, region = ? WHERE id = 1").run(
      body.title || "List of Offices",
      body.region || ""
    );
    res.json({ message: "Office directory metadata updated successfully." });
  } catch (error) {
    console.error("Error updating office metadata:", error);
    res.status(500).json({ error: "Failed to update office directory metadata." });
  }
});

app.post("/api/offices", (req, res) => {
  const body = req.body || {};
  const office = String(body.office || "").trim();
  if (!office) {
    return res.status(400).json({ error: "Office name is required." });
  }

  try {
    const currentMax = db
      .prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM office_directory_entries")
      .get();
    const info = db
      .prepare("INSERT INTO office_directory_entries (office, address, contact, sortOrder) VALUES (?, ?, ?, ?)")
      .run(office, body.address || "", body.contact || "", Number(currentMax.maxSort || 0) + 1);

    const saved = db
      .prepare("SELECT id, office, address, contact, sortOrder FROM office_directory_entries WHERE id = ?")
      .get(info.lastInsertRowid);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating office entry:", error);
    res.status(500).json({ error: "Failed to create office entry." });
  }
});

app.put("/api/offices/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const office = String(body.office || "").trim();
  if (!office) {
    return res.status(400).json({ error: "Office name is required." });
  }

  try {
    const info = db
      .prepare("UPDATE office_directory_entries SET office = ?, address = ?, contact = ? WHERE id = ?")
      .run(office, body.address || "", body.contact || "", id);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Office entry not found." });
    }
    res.json({ message: "Office entry updated successfully." });
  } catch (error) {
    console.error("Error updating office entry:", error);
    res.status(500).json({ error: "Failed to update office entry." });
  }
});

app.delete("/api/offices/:id", (req, res) => {
  const id = Number(req.params.id);
  try {
    const info = db.prepare("DELETE FROM office_directory_entries WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Office entry not found." });
    }
    res.json({ message: "Office entry deleted successfully." });
  } catch (error) {
    console.error("Error deleting office entry:", error);
    res.status(500).json({ error: "Failed to delete office entry." });
  }
});

app.get("/api/announcements", (req, res) => {
  try {
    const announcements = db
      .prepare("SELECT id, message, sortOrder FROM announcements ORDER BY sortOrder ASC, id ASC")
      .all();
    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

app.post("/api/announcements", (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) {
    return res.status(400).json({ error: "Announcement message is required." });
  }

  try {
    const currentMax = db
      .prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM announcements")
      .get();
    const info = db
      .prepare("INSERT INTO announcements (message, sortOrder) VALUES (?, ?)")
      .run(message, Number(currentMax.maxSort || 0) + 1);
    const saved = db
      .prepare("SELECT id, message, sortOrder FROM announcements WHERE id = ?")
      .get(info.lastInsertRowid);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement." });
  }
});

app.put("/api/announcements/:id", (req, res) => {
  const id = Number(req.params.id);
  const message = String(req.body?.message || "").trim();
  if (!message) {
    return res.status(400).json({ error: "Announcement message is required." });
  }

  try {
    const info = db
      .prepare("UPDATE announcements SET message = ? WHERE id = ?")
      .run(message, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Announcement not found." });
    }
    res.json({ message: "Announcement updated successfully." });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Failed to update announcement." });
  }
});

app.delete("/api/announcements/:id", (req, res) => {
  const id = Number(req.params.id);
  try {
    const info = db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Announcement not found." });
    }
    res.json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
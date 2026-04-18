const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const port = 3333;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "DELETE" && req.path.startsWith("/api/")) {
    const adminRole = String(req.get("X-Admin-Role") || "").trim().toLowerCase();
    if (adminRole !== "super-admin") {
      return res.status(403).json({ error: "Only Super Admin can delete items." });
    }
  }

  next();
});

// Trigger a generic realtime refresh after successful write requests.
app.use((req, res, next) => {
  const shouldTrack = req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS";
  if (shouldTrack) {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        scheduleDataChangeBroadcast(`api-write:${req.method} ${req.path}`);
      }
    });
  }
  next();
});

const uploadsRoot = path.join(__dirname, "uploads");
const announcementsUploadDir = path.join(uploadsRoot, "announcements");
const programsUploadDir = path.join(uploadsRoot, "programs");
const idleVideosUploadDir = path.join(uploadsRoot, "idle-videos");
const keyOfficialsUploadDir = path.join(uploadsRoot, "key-officials");
fs.mkdirSync(announcementsUploadDir, { recursive: true });
fs.mkdirSync(programsUploadDir, { recursive: true });
fs.mkdirSync(idleVideosUploadDir, { recursive: true });
fs.mkdirSync(keyOfficialsUploadDir, { recursive: true });
app.use("/uploads", express.static(uploadsRoot));

const announcementUploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, announcementsUploadDir),
  filename: (_req, file, cb) => {
    const safeBase = String(path.parse(file.originalname || "file").name)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 60) || "file";
    const safeExt = String(path.extname(file.originalname || "") || "").replace(/[^.a-zA-Z0-9]/g, "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${safeExt}`);
  },
});
const programUploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, programsUploadDir),
  filename: (_req, file, cb) => {
    const safeBase = String(path.parse(file.originalname || "video").name)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 60) || "video";
    const safeExt = String(path.extname(file.originalname || "") || "").replace(/[^.a-zA-Z0-9]/g, "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${safeExt}`);
  },
});
const idleVideoUploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, idleVideosUploadDir),
  filename: (_req, file, cb) => {
    const safeBase = String(path.parse(file.originalname || "idle-video").name)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 60) || "idle-video";
    const safeExt = String(path.extname(file.originalname || "") || "").replace(/[^.a-zA-Z0-9]/g, "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${safeExt}`);
  },
});
const keyOfficialsUploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, keyOfficialsUploadDir),
  filename: (_req, file, cb) => {
    const safeBase = String(path.parse(file.originalname || "key-officials").name)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 60) || "key-officials";
    const safeExt = String(path.extname(file.originalname || "") || "").replace(/[^.a-zA-Z0-9]/g, "") || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${safeExt}`);
  },
});

const uploadAnnouncementFiles = multer({ storage: announcementUploadStorage });
const uploadProgramVideos = multer({
  storage: programUploadStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mimeType = String(file.mimetype || "").toLowerCase();
    if (mimeType.startsWith("video/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only video files are allowed."));
  },
});
const uploadIdleVideos = multer({
  storage: idleVideoUploadStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mimeType = String(file.mimetype || "").toLowerCase();
    if (mimeType.startsWith("video/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only video files are allowed."));
  },
});
const uploadKeyOfficialsImage = multer({
  storage: keyOfficialsUploadStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mimeType = String(file.mimetype || "").toLowerCase();
    if (mimeType.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed."));
  },
});

const dbPath = path.join(__dirname, "app-data.db");
const db = new Database(dbPath);
const seedSnapshotPath = path.join(__dirname, "seed-data.json");

let seedSnapshot = null;
try {
  seedSnapshot = JSON.parse(fs.readFileSync(seedSnapshotPath, "utf8"));
} catch {
  seedSnapshot = null;
}

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text || "");
  } catch {
    return fallback;
  }
}

function getAnnouncementsPayload() {
  const announcements = db
    .prepare("SELECT id, title, message, details, postedBy, announcementWhere, postedOn, effectiveUntil, involvedParties, tickerDisplay, attachments, sortOrder FROM announcements ORDER BY sortOrder ASC, id ASC")
    .all();

  return announcements.map(item => ({
    ...item,
    title: item.title || "",
    details: item.details || "",
    postedBy: item.postedBy || "",
    where: item.announcementWhere || "",
    postedOn: item.postedOn || "",
    effectiveUntil: item.effectiveUntil || "",
    involvedParties: item.involvedParties || "",
    tickerDisplay: item.tickerDisplay === "title" ? "title" : "message",
    attachments: safeJsonParse(item.attachments, []),
  }));
}

function broadcastAnnouncementsChanged() {
  io.emit("announcements:changed", {
    announcements: getAnnouncementsPayload(),
    timestamp: new Date().toISOString(),
  });
}

let dataChangeBroadcastTimer = null;

function broadcastDataChanged(reason = "data-updated") {
  io.emit("kiosk:data-changed", {
    reason,
    timestamp: new Date().toISOString(),
  });
}

function scheduleDataChangeBroadcast(reason = "db-file-changed") {
  clearTimeout(dataChangeBroadcastTimer);
  dataChangeBroadcastTimer = setTimeout(() => {
    broadcastDataChanged(reason);
  }, 150);
}

let lastDbMtimeMs = 0;
try {
  const initialStat = fs.statSync(dbPath);
  lastDbMtimeMs = Number(initialStat.mtimeMs || 0);
} catch {
  lastDbMtimeMs = 0;
}

fs.watchFile(dbPath, { interval: 500 }, (current, previous) => {
  const currentMtimeMs = Number(current.mtimeMs || 0);
  const previousMtimeMs = Number(previous.mtimeMs || 0);
  if (currentMtimeMs && currentMtimeMs !== previousMtimeMs && currentMtimeMs > lastDbMtimeMs) {
    lastDbMtimeMs = currentMtimeMs;
    scheduleDataChangeBroadcast();
  }
});

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

function normalizeIdleVideoUrlList(value) {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map(item => String(item || "").trim()).filter(Boolean)));
  }

  const text = String(value || "").trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map(item => String(item || "").trim()).filter(Boolean)));
    }
  } catch {
    // Ignore invalid JSON and fall back to a single URL.
  }

  return [text];
}

function resolveDefaultKeyOfficialsImageUrl() {
  const targetFileName = "organizational-chart.jpg";
  const targetPath = path.join(keyOfficialsUploadDir, targetFileName);

  try {
    if (!fs.existsSync(targetPath)) {
      const sourcePath = path.join(__dirname, "..", "src", "assets", "images", "Organizational Chart.jpg");
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  } catch (error) {
    console.error("Key officials image migration error:", error);
  }

  return fs.existsSync(targetPath) ? `/uploads/key-officials/${targetFileName}` : "";
}

function deleteOldKeyOfficialsUpload(uploadUrl) {
  const value = String(uploadUrl || "").trim();
  if (!value.startsWith("/uploads/key-officials/")) return;

  const fileName = path.basename(value);
  if (!fileName || fileName === "organizational-chart.jpg") return;

  const absolutePath = path.join(keyOfficialsUploadDir, fileName);
  if (!absolutePath.startsWith(keyOfficialsUploadDir)) return;

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error("Error cleaning up old key officials image:", error);
  }
}

function deleteUploadedProgramFile(videoUrl) {
  const value = String(videoUrl || "").trim();
  if (!value.startsWith("/uploads/programs/")) return;

  const fileName = path.basename(value);
  if (!fileName) return;

  const absolutePath = path.join(programsUploadDir, fileName);
  if (!absolutePath.startsWith(programsUploadDir)) return;

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error("Error deleting uploaded program file:", error);
  }
}

function deleteUploadedIdleVideoFile(videoUrl) {
  const value = String(videoUrl || "").trim();
  if (!value.startsWith("/uploads/idle-videos/")) return;

  const fileName = path.basename(value);
  if (!fileName) return;

  const absolutePath = path.join(idleVideosUploadDir, fileName);
  if (!absolutePath.startsWith(idleVideosUploadDir)) return;

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error("Error deleting uploaded idle video file:", error);
  }
}

function extractAttachmentUrls(value) {
  const raw = Array.isArray(value) ? value : safeJsonParse(value, []);
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") return String(item).trim();
      return String(item?.url || "").trim();
    })
    .filter(Boolean);
}

function collectAllAnnouncementAttachmentUrls() {
  const rows = db.prepare("SELECT attachments FROM announcements").all();
  const usedUrls = new Set();
  rows.forEach((row) => {
    extractAttachmentUrls(row?.attachments).forEach((url) => usedUrls.add(url));
  });
  return usedUrls;
}

function deleteAnnouncementAttachmentFileIfUnused(fileUrl) {
  const value = String(fileUrl || "").trim();
  if (!value.startsWith("/uploads/announcements/")) return;

  const usedUrls = collectAllAnnouncementAttachmentUrls();
  if (usedUrls.has(value)) return;

  const fileName = path.basename(value);
  if (!fileName) return;

  const absolutePath = path.join(announcementsUploadDir, fileName);
  if (!absolutePath.startsWith(announcementsUploadDir)) return;

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error("Error deleting announcement attachment file:", error);
  }
}

function seedTableFromSnapshot(tableName) {
  const rows = seedSnapshot?.[tableName];
  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }

  const rowCount = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get();
  if (rowCount.count !== 0) {
    return;
  }

  const columns = Object.keys(rows[0]);
  if (columns.length === 0) {
    return;
  }

  const insertSql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
  const insertRow = db.prepare(insertSql);
  const insertMany = db.transaction((items) => {
    items.forEach((item) => {
      insertRow.run(...columns.map((column) => item[column]));
    });
  });

  insertMany(rows);
}

function calendarEventRowToDto(row) {
  return {
    id: row.eventId || `evt_${row.id}`,
    title: row.title || "",
    date: row.date || "",
    startDate: row.date || "",
    endDate: row.endDate || row.date || "",
    time: row.time || "",
    startTime: row.startTime || row.time || "",
    endTime: row.endTime || "",
    location: row.location || "",
    office: row.office || "",
    category: row.category || "internal",
    description: row.description || "",
    attendees: safeJsonParse(row.attendees, []),
    sortOrder: row.sortOrder || 0,
  };
}

function restoreDatabaseFromSnapshot() {
  if (!seedSnapshot) {
    throw new Error("Seed snapshot not available.");
  }

  const tablesInOrder = [
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

  db.transaction(() => {
    tablesInOrder.forEach((tableName) => {
      db.prepare(`DELETE FROM ${tableName}`).run();
    });

    tablesInOrder.forEach((tableName) => seedTableFromSnapshot(tableName));
    db.prepare("UPDATE kiosk_settings SET superAdminPin = COALESCE(NULLIF(superAdminPin, ''), '0000') WHERE id = 1").run();
    db.prepare("UPDATE kiosk_settings SET adminPin = '1111' WHERE id = 1 AND (adminPin IS NULL OR adminPin = '' OR adminPin = '0000')").run();
  })();
}

function upsertDefaultKeyOfficialsRow() {
  const defaultImageUrl = resolveDefaultKeyOfficialsImageUrl();
  ensureSingleRow(
    "key_officials",
    "INSERT INTO key_officials (id, title, imageUrl, updatedAt) VALUES (1, ?, ?, ?)",
    ["Key Officials", defaultImageUrl, new Date().toISOString()]
  );
}

function importKioskDataToDatabase(payload, options = {}) {
  const data = payload && typeof payload === "object" ? payload : {};
  const preservePins = !!options.preservePins;
  const currentPins = options.currentPins || {};

  const tx = db.transaction(() => {
    const settings = data.settings || {};
    const nextSuperAdminPin = preservePins
      ? (currentPins.superAdminPin || "0000")
      : String(settings.superAdminPin || "0000");
    const nextAdminPin = preservePins
      ? (currentPins.adminPin || "1111")
      : String(settings.adminPin || "1111");
    const importedIdleVideoUrls = normalizeIdleVideoUrlList(settings.idleVideoUrls);
    const importedIdleVideoUrl = String(settings.idleVideoUrl || importedIdleVideoUrls[0] || "").trim();

    db.prepare(`
      UPDATE kiosk_settings
      SET kioskTitle = ?, office = ?, address = ?, tagline = ?, hours = ?, idleVideoUrl = ?, idleVideoUrls = ?,
          perPage = ?, resetTimer = ?, superAdminPin = ?, adminPin = ?, updateUrl = ?, autoCheckUpdates = ?
      WHERE id = 1
    `).run(
      String(settings.kioskTitle || "Citizen's Charter Information Kiosk"),
      String(settings.office || ""),
      String(settings.address || ""),
      String(settings.tagline || ""),
      String(settings.hours || ""),
      importedIdleVideoUrl,
      JSON.stringify(importedIdleVideoUrls),
      Math.max(9, Number(settings.perPage) || 9),
      Number.isFinite(Number(settings.resetTimer)) ? Number(settings.resetTimer) : 60,
      nextSuperAdminPin,
      nextAdminPin,
      String(settings.updateUrl || ""),
      settings.autoCheckUpdates ? 1 : 0
    );

    const feedback = data.feedbackAndComplaints || {};
    db.prepare(`
      UPDATE feedback_content
      SET title = ?, email = ?, telephone = ?, sections = ?
      WHERE id = 1
    `).run(
      String(feedback.title || "Feedback and Complaints Mechanism"),
      String(feedback.contact?.email || ""),
      String(feedback.contact?.telephone || ""),
      JSON.stringify(Array.isArray(feedback.sections) ? feedback.sections : [])
    );

    const profile = data.organizationalProfile || {};
    db.prepare(`
      UPDATE organizational_profile
      SET title = ?, mandate = ?, mission = ?, vision = ?,
          pledgeIntro = ?, pledgeServiceCommitment = ?, pbest = ?,
          pledgeOfficeHours = ?, pledgeClosing = ?
      WHERE id = 1
    `).run(
      String(profile.title || "Mandate, Mission, Vision and Service Pledge"),
      String(profile.mandate || ""),
      String(profile.mission || ""),
      String(profile.vision || ""),
      String(profile.servicePledge?.intro || ""),
      String(profile.servicePledge?.serviceCommitment || ""),
      JSON.stringify(Array.isArray(profile.servicePledge?.pbest) ? profile.servicePledge.pbest : []),
      String(profile.servicePledge?.officeHoursCommitment || ""),
      String(profile.servicePledge?.closing || "")
    );

    const officeDirectory = data.officeDirectory || {};
    db.prepare("UPDATE office_directory_meta SET title = ?, region = ? WHERE id = 1").run(
      String(officeDirectory.title || "List of Offices"),
      String(officeDirectory.region || "")
    );

    db.prepare("DELETE FROM office_directory_entries").run();
    const insertOffice = db.prepare(
      "INSERT INTO office_directory_entries (office, address, contact, type, sortOrder) VALUES (?, ?, ?, ?, ?)"
    );
    (Array.isArray(officeDirectory.entries) ? officeDirectory.entries : []).forEach((entry, index) => {
      insertOffice.run(
        String(entry?.office || ""),
        String(entry?.address || ""),
        String(entry?.contact || ""),
        String(entry?.type || "office"),
        index + 1
      );
    });

    const issuanceMeta = data.policiesAndIssuances || {};
    db.prepare("UPDATE issuance_meta SET title = ?, subtitle = ? WHERE id = 1").run(
      String(issuanceMeta.title || "Policies and Issuances"),
      String(issuanceMeta.subtitle || "Compliance references and deadlines")
    );

    db.prepare("DELETE FROM issuances").run();
    const insertIssuance = db.prepare(`
      INSERT INTO issuances (id, title, circularNo, subject, date, coverage, effectivity, supersedes, approvingAuthority, highlights, deadlines)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    (Array.isArray(issuanceMeta.items) ? issuanceMeta.items : []).forEach((item, index) => {
      insertIssuance.run(
        String(item?.id || `iss_${Date.now()}_${index}`),
        String(item?.title || ""),
        String(item?.circularNo || ""),
        String(item?.subject || ""),
        String(item?.date || ""),
        String(item?.coverage || ""),
        String(item?.effectivity || ""),
        String(item?.supersedes || ""),
        String(item?.approvingAuthority || ""),
        JSON.stringify(Array.isArray(item?.highlights) ? item.highlights : []),
        JSON.stringify(Array.isArray(item?.deadlines) ? item.deadlines : [])
      );
    });

    const insertServiceTable = (tableName, services) => {
      db.prepare(`DELETE FROM ${tableName}`).run();
      const insertService = db.prepare(`
        INSERT INTO ${tableName} (id, icon, classification, label, description, processingTime, fees, whoMayAvail, office, requirements, steps)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (Array.isArray(services) ? services : []).forEach((service, index) => {
        insertService.run(
          String(service?.id || `svc_${Date.now()}_${index}`),
          String(service?.icon || ""),
          String(service?.classification || "Simple"),
          String(service?.label || "Unnamed Service"),
          String(service?.description || service?.desc || ""),
          String(service?.processingTime || ""),
          String(service?.fees || "None"),
          String(service?.whoMayAvail || service?.who || ""),
          String(service?.office || ""),
          JSON.stringify(Array.isArray(service?.requirements) ? service.requirements : []),
          JSON.stringify(Array.isArray(service?.steps) ? service.steps : [])
        );
      });
    };

    insertServiceTable("internal_services", data.services);
    insertServiceTable("external_services", data.externalServices);

    db.prepare("DELETE FROM announcements").run();
    const insertAnnouncement = db.prepare(
      "INSERT INTO announcements (title, message, details, postedBy, announcementWhere, postedOn, effectiveUntil, involvedParties, tickerDisplay, attachments, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    (Array.isArray(data.announcements) ? data.announcements : []).forEach((item, index) => {
      insertAnnouncement.run(
        String(item?.title || ""),
        String(item?.message || ""),
        String(item?.details || ""),
        String(item?.postedBy || ""),
        String(item?.where || item?.announcementWhere || ""),
        String(item?.postedOn || ""),
        String(item?.effectiveUntil || ""),
        String(item?.involvedParties || ""),
        item?.tickerDisplay === "title" ? "title" : "message",
        JSON.stringify(Array.isArray(item?.attachments) ? item.attachments : []),
        index + 1
      );
    });

    db.prepare("DELETE FROM programs").run();
    const insertProgram = db.prepare(
      "INSERT INTO programs (title, description, videoUrl, category, uploadedDate, sortOrder) VALUES (?, ?, ?, ?, ?, ?)"
    );
    (Array.isArray(data.programs) ? data.programs : []).forEach((item, index) => {
      insertProgram.run(
        String(item?.title || ""),
        String(item?.description || ""),
        String(item?.videoUrl || ""),
        String(item?.category || ""),
        String(item?.uploadedDate || ""),
        index + 1
      );
    });

    if (Object.prototype.hasOwnProperty.call(data, "idleVideos")) {
      db.prepare("DELETE FROM idle_videos").run();
      const insertIdleVideo = db.prepare(
        "INSERT INTO idle_videos (title, videoUrl, uploadedDate, sortOrder) VALUES (?, ?, ?, ?)"
      );
      (Array.isArray(data.idleVideos) ? data.idleVideos : []).forEach((item, index) => {
        insertIdleVideo.run(
          String(item?.title || ""),
          String(item?.videoUrl || ""),
          String(item?.uploadedDate || ""),
          index + 1
        );
      });
    }

    if (Object.prototype.hasOwnProperty.call(data, "calendarEvents")) {
      db.prepare("DELETE FROM calendar_events").run();
      const insertCalendarEvent = db.prepare(
        "INSERT INTO calendar_events (eventId, title, date, endDate, time, startTime, endTime, location, office, category, description, attendees, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      (Array.isArray(data.calendarEvents) ? data.calendarEvents : []).forEach((item, index) => {
        const itemStartDate = String(item?.startDate || item?.date || "");
        const itemStartTime = String(item?.startTime || item?.time || "");
        insertCalendarEvent.run(
          String(item?.id || `evt_${Date.now()}_${index}`),
          String(item?.title || ""),
          itemStartDate,
          String(item?.endDate || itemStartDate),
          itemStartTime,
          itemStartTime,
          String(item?.endTime || ""),
          String(item?.location || ""),
          String(item?.office || ""),
          String(item?.category || "internal"),
          String(item?.description || ""),
          JSON.stringify(Array.isArray(item?.attendees) ? item.attendees : []),
          index + 1
        );
      });
    }

    if (Object.prototype.hasOwnProperty.call(data, "keyOfficials") && data.keyOfficials && typeof data.keyOfficials === "object") {
      const nextTitle = String(data.keyOfficials.title || "Key Officials").trim() || "Key Officials";
      const nextImageUrl = String(data.keyOfficials.imageUrl || "").trim();
      if (nextImageUrl) {
        db.prepare(`
          INSERT INTO key_officials (id, title, imageUrl, updatedAt)
          VALUES (1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            imageUrl = excluded.imageUrl,
            updatedAt = excluded.updatedAt
        `).run(nextTitle, nextImageUrl, new Date().toISOString());
      }
    }

    ensureSelectedIdleVideo();
  });

  tx();
}

function toDbTitleFromFilename(filename, fallbackTitle) {
  const parsed = String(path.parse(filename || "").name || fallbackTitle || "").trim();
  const withoutPrefix = parsed.replace(/^\d+-\d+-/, "");
  const normalized = withoutPrefix.replace(/[_-]+/g, " ").trim();
  return normalized || fallbackTitle;
}

function toIsoDateFromStatSafe(filePath) {
  try {
    return new Date(fs.statSync(filePath).mtime).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function slugifyForId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "holiday";
}

function normalizeYear(inputYear) {
  const parsed = Number(inputYear);
  const current = new Date().getFullYear();
  if (!Number.isFinite(parsed) || parsed < 2000 || parsed > current + 5) {
    return current;
  }
  return Math.trunc(parsed);
}

function unfoldIcsLines(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .reduce((lines, line) => {
      if (/^[ \t]/.test(line) && lines.length) {
        lines[lines.length - 1] += line.slice(1);
      } else {
        lines.push(line);
      }
      return lines;
    }, []);
}

function parseGoogleHolidayIcs(text) {
  const lines = unfoldIcsLines(text);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.date && current?.title) {
        events.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    if (line.startsWith("SUMMARY:")) {
      current.title = line.slice("SUMMARY:".length).trim();
      continue;
    }
    if (line.startsWith("DTSTART")) {
      const match = line.match(/:(\d{8})/);
      if (match) {
        current.date = `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`;
      }
      continue;
    }
    if (line.startsWith("DESCRIPTION:")) {
      current.description = line.slice("DESCRIPTION:".length).trim();
      continue;
    }
    if (line.startsWith("CATEGORIES:")) {
      current.categories = line.slice("CATEGORIES:".length).trim();
    }
  }

  return events;
}

function syncMediaTableFromUploads({
  dirPath,
  urlPrefix,
  tableName,
  insertSql,
  fallbackTitle,
  buildInsertArgs,
}) {
  const existingRows = db.prepare(`SELECT videoUrl FROM ${tableName}`).all();
  const existingUrls = new Set(existingRows.map(row => String(row.videoUrl || "").trim()).filter(Boolean));
  let sortOrder = Number(
    (db.prepare(`SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM ${tableName}`).get() || {}).maxSort || 0
  );
  const insertStmt = db.prepare(insertSql);
  let inserted = 0;

  if (!fs.existsSync(dirPath)) return inserted;

  const files = fs.readdirSync(dirPath).filter((filename) => {
    const fullPath = path.join(dirPath, filename);
    return fs.statSync(fullPath).isFile();
  });

  files.forEach((filename) => {
    const fullPath = path.join(dirPath, filename);
    const videoUrl = `${urlPrefix}/${filename}`;
    if (existingUrls.has(videoUrl)) return;

    sortOrder += 1;
    const title = toDbTitleFromFilename(filename, fallbackTitle);
    const uploadedDate = toIsoDateFromStatSafe(fullPath);
    const args = buildInsertArgs({ title, videoUrl, uploadedDate, sortOrder });
    insertStmt.run(...args);
    existingUrls.add(videoUrl);
    inserted += 1;
  });

  return inserted;
}

function ensureSelectedIdleVideo() {
  const row = db.prepare("SELECT idleVideoUrl, idleVideoUrls FROM kiosk_settings WHERE id = 1").get();
  const currentList = normalizeIdleVideoUrlList(row?.idleVideoUrls);
  const currentSingle = String(row?.idleVideoUrl || "").trim();
  if (currentList.length) {
    if (!currentSingle || currentSingle !== currentList[0]) {
      db.prepare("UPDATE kiosk_settings SET idleVideoUrl = ?, idleVideoUrls = ? WHERE id = 1").run(currentList[0], JSON.stringify(currentList));
    }
    return false;
  }

  if (currentSingle) {
    db.prepare("UPDATE kiosk_settings SET idleVideoUrls = ? WHERE id = 1").run(JSON.stringify([currentSingle]));
    return false;
  }

  const firstIdleVideo = db
    .prepare("SELECT videoUrl FROM idle_videos ORDER BY sortOrder ASC, id ASC LIMIT 1")
    .get();
  const firstUrl = String(firstIdleVideo?.videoUrl || "").trim();
  if (!firstUrl) return false;

  db.prepare("UPDATE kiosk_settings SET idleVideoUrl = ?, idleVideoUrls = ? WHERE id = 1").run(firstUrl, JSON.stringify([firstUrl]));
  return true;
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
    idleVideoUrl TEXT NOT NULL DEFAULT '',
    idleVideoUrls TEXT NOT NULL DEFAULT '[]',
    perPage INTEGER NOT NULL,
    resetTimer INTEGER NOT NULL,
    superAdminPin TEXT NOT NULL,
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
    type TEXT DEFAULT 'office',
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    message TEXT NOT NULL,
    details TEXT,
    postedBy TEXT,
    announcementWhere TEXT,
    postedOn TEXT,
    effectiveUntil TEXT,
    involvedParties TEXT,
    tickerDisplay TEXT,
    attachments TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    videoUrl TEXT NOT NULL,
    category TEXT,
    uploadedDate TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS idle_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    videoUrl TEXT NOT NULL,
    uploadedDate TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT UNIQUE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    endDate TEXT,
    time TEXT,
    startTime TEXT,
    endTime TEXT,
    location TEXT,
    office TEXT,
    category TEXT,
    description TEXT,
    attendees TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS key_officials (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    updatedAt TEXT
  );
`);

// Migration: Add type column if it doesn't exist
try {
  const columns = db.prepare("PRAGMA table_info(office_directory_entries)").all();
  const hasTypeColumn = columns.some(col => col.name === "type");
  if (!hasTypeColumn) {
    db.prepare("ALTER TABLE office_directory_entries ADD COLUMN type TEXT DEFAULT 'office'").run();
    console.log("✓ Added 'type' column to office_directory_entries table");
  }
} catch (error) {
  console.error("Migration error:", error);
}

// Migration: Add endDate, startTime, endTime to calendar_events
try {
  const calendarColumns = db.prepare("PRAGMA table_info(calendar_events)").all();
  const hasEndDate = calendarColumns.some(col => col.name === "endDate");
  if (!hasEndDate) {
    db.prepare("ALTER TABLE calendar_events ADD COLUMN endDate TEXT").run();
    db.prepare("ALTER TABLE calendar_events ADD COLUMN startTime TEXT").run();
    db.prepare("ALTER TABLE calendar_events ADD COLUMN endTime TEXT").run();
    console.log("✓ Added 'endDate', 'startTime', and 'endTime' to calendar_events");
  }
} catch (error) {
  console.error("Calendar events migration error:", error);
}

try {
  const announcementColumns = db.prepare("PRAGMA table_info(announcements)").all();
  const hasTitleColumn = announcementColumns.some(col => col.name === "title");
  const hasDetailsColumn = announcementColumns.some(col => col.name === "details");
  const hasAttachmentsColumn = announcementColumns.some(col => col.name === "attachments");
  const hasPostedByColumn = announcementColumns.some(col => col.name === "postedBy");
  const hasAnnouncementWhereColumn = announcementColumns.some(col => col.name === "announcementWhere");
  const hasPostedOnColumn = announcementColumns.some(col => col.name === "postedOn");
  const hasEffectiveUntilColumn = announcementColumns.some(col => col.name === "effectiveUntil");
  const hasInvolvedPartiesColumn = announcementColumns.some(col => col.name === "involvedParties");
  const hasTickerDisplayColumn = announcementColumns.some(col => col.name === "tickerDisplay");

  if (!hasTitleColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN title TEXT").run();
  }
  if (!hasDetailsColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN details TEXT").run();
  }
  if (!hasAttachmentsColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN attachments TEXT").run();
  }
  if (!hasPostedByColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN postedBy TEXT").run();
  }
  if (!hasAnnouncementWhereColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN announcementWhere TEXT").run();
  }
  if (!hasPostedOnColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN postedOn TEXT").run();
  }
  if (!hasEffectiveUntilColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN effectiveUntil TEXT").run();
  }
  if (!hasInvolvedPartiesColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN involvedParties TEXT").run();
  }
  if (!hasTickerDisplayColumn) {
    db.prepare("ALTER TABLE announcements ADD COLUMN tickerDisplay TEXT").run();
    db.prepare("UPDATE announcements SET tickerDisplay = 'message' WHERE tickerDisplay IS NULL OR tickerDisplay = ''").run();
  }
} catch (error) {
  console.error("Announcements migration error:", error);
}

ensureSingleRow(
  "issuance_meta",
  "INSERT INTO issuance_meta (id, title, subtitle) VALUES (1, ?, ?)",
  ["Policies and Issuances", "Compliance references and deadlines"]
);

ensureSingleRow(
  "kiosk_settings",
  "INSERT INTO kiosk_settings (id, kioskTitle, office, address, tagline, hours, idleVideoUrl, idleVideoUrls, perPage, resetTimer, superAdminPin, adminPin, updateUrl, autoCheckUpdates) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  [
    "Citizen's Charter Information Kiosk",
    "DILG Region XIII (Caraga)",
    "Purok 1-A, Doongan, Butuan City",
    "Matino, Mahusay at Maaasahan",
    "Monday to Friday, 8:00 AM - 5:00 PM",
    "",
    JSON.stringify([]),
    9,
    60,
    "0000",
    "1111",
    "",
    0,
  ]
);

// One-time migration: align legacy seeded tagline with current default.
db.prepare(
  "UPDATE kiosk_settings SET tagline = ? WHERE id = 1 AND tagline = ?"
).run("Matino, Mahusay at Maaasahan", "Serbisyong Maaasahan, Madali at Mabilis");

// Ensure legacy kiosks use a page size compatible with the 3x3 card layout.
db.prepare(
  "UPDATE kiosk_settings SET perPage = 9 WHERE id = 1 AND (perPage IS NULL OR perPage < 9)"
).run();

try {
  const settingsColumns = db.prepare("PRAGMA table_info(kiosk_settings)").all();
  const hasIdleVideoUrlColumn = settingsColumns.some(col => col.name === "idleVideoUrl");
  const hasIdleVideoUrlsColumn = settingsColumns.some(col => col.name === "idleVideoUrls");
  const hasSuperAdminPinColumn = settingsColumns.some(col => col.name === "superAdminPin");
  if (!hasIdleVideoUrlColumn) {
    db.prepare("ALTER TABLE kiosk_settings ADD COLUMN idleVideoUrl TEXT NOT NULL DEFAULT ''").run();
  }
  if (!hasIdleVideoUrlsColumn) {
    db.prepare("ALTER TABLE kiosk_settings ADD COLUMN idleVideoUrls TEXT NOT NULL DEFAULT '[]'").run();
  }
  if (!hasSuperAdminPinColumn) {
    db.prepare("ALTER TABLE kiosk_settings ADD COLUMN superAdminPin TEXT NOT NULL DEFAULT '0000'").run();
  }
} catch (error) {
  console.error("Settings migration error:", error);
}

try {
  const settingsRow = db.prepare("SELECT idleVideoUrl, idleVideoUrls FROM kiosk_settings WHERE id = 1").get();
  if (settingsRow) {
    const normalizedList = normalizeIdleVideoUrlList(settingsRow.idleVideoUrls);
    const fallbackSingle = String(settingsRow.idleVideoUrl || "").trim();
    const nextList = normalizedList.length ? normalizedList : (fallbackSingle ? [fallbackSingle] : []);
    db.prepare("UPDATE kiosk_settings SET idleVideoUrls = ? WHERE id = 1").run(JSON.stringify(nextList));
  }
} catch (error) {
  console.error("Idle video settings migration error:", error);
}

db.prepare("UPDATE kiosk_settings SET superAdminPin = COALESCE(NULLIF(superAdminPin, ''), '0000') WHERE id = 1").run();
db.prepare("UPDATE kiosk_settings SET adminPin = '1111' WHERE id = 1 AND (adminPin IS NULL OR adminPin = '' OR adminPin = '0000')").run();

seedTableFromSnapshot("internal_services");
seedTableFromSnapshot("external_services");
seedTableFromSnapshot("issuances");
seedTableFromSnapshot("issuance_meta");
seedTableFromSnapshot("kiosk_settings");
seedTableFromSnapshot("feedback_content");
seedTableFromSnapshot("organizational_profile");
seedTableFromSnapshot("office_directory_meta");
seedTableFromSnapshot("office_directory_entries");
seedTableFromSnapshot("programs");
seedTableFromSnapshot("idle_videos");
upsertDefaultKeyOfficialsRow();

try {
  const insertedIdle = syncMediaTableFromUploads({
    dirPath: idleVideosUploadDir,
    urlPrefix: "/uploads/idle-videos",
    tableName: "idle_videos",
    insertSql: "INSERT INTO idle_videos (title, videoUrl, uploadedDate, sortOrder) VALUES (?, ?, ?, ?)",
    fallbackTitle: "Idle Video",
    buildInsertArgs: ({ title, videoUrl, uploadedDate, sortOrder }) => [
      title,
      videoUrl,
      uploadedDate,
      sortOrder,
    ],
  });

  const insertedPrograms = syncMediaTableFromUploads({
    dirPath: programsUploadDir,
    urlPrefix: "/uploads/programs",
    tableName: "programs",
    insertSql: "INSERT INTO programs (title, description, videoUrl, category, uploadedDate, sortOrder) VALUES (?, ?, ?, ?, ?, ?)",
    fallbackTitle: "Program Video",
    buildInsertArgs: ({ title, videoUrl, uploadedDate, sortOrder }) => [
      title,
      "Imported from uploaded file.",
      videoUrl,
      "Programs",
      uploadedDate,
      sortOrder,
    ],
  });

  const selectedIdleAssigned = ensureSelectedIdleVideo();
  if (insertedIdle > 0 || insertedPrograms > 0 || selectedIdleAssigned) {
    console.log(
      `Media sync: +${insertedIdle} idle videos, +${insertedPrograms} programs${selectedIdleAssigned ? ", selected default idle video" : ""}.`
    );
  }
} catch (error) {
  console.error("Media sync error:", error);
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
    const idleVideoUrls = normalizeIdleVideoUrlList(s.idleVideoUrls);
    const normalizedIdleVideoUrl = idleVideoUrls[0] || String(s.idleVideoUrl || "").trim();
    res.json({
      kioskTitle: s.kioskTitle,
      office: s.office,
      address: s.address,
      tagline: s.tagline,
      hours: s.hours,
      idleVideoUrl: normalizedIdleVideoUrl,
      idleVideoUrls,
      perPage: s.perPage,
      resetTimer: s.resetTimer,
      superAdminPin: s.superAdminPin || "0000",
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
  const idleVideoUrls = normalizeIdleVideoUrlList(s.idleVideoUrls);
  const idleVideoUrl = String(s.idleVideoUrl || idleVideoUrls[0] || "").trim();
  try {
    db.prepare(`
      UPDATE kiosk_settings
      SET kioskTitle = ?, office = ?, address = ?, tagline = ?, hours = ?, idleVideoUrl = ?, idleVideoUrls = ?,
          perPage = ?, resetTimer = ?, superAdminPin = ?, adminPin = ?, updateUrl = ?, autoCheckUpdates = ?
      WHERE id = 1
    `).run(
      s.kioskTitle || "Citizen's Charter Information Kiosk",
      s.office || "",
      s.address || "",
      s.tagline || "",
      s.hours || "",
      idleVideoUrl,
      JSON.stringify(idleVideoUrls),
      perPage,
      Number.isFinite(Number(s.resetTimer)) ? Number(s.resetTimer) : 60,
      s.superAdminPin || "0000",
      s.adminPin || "1111",
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
      .prepare("SELECT id, office, address, contact, type, sortOrder FROM office_directory_entries ORDER BY sortOrder ASC, id ASC")
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
      .prepare("INSERT INTO office_directory_entries (office, address, contact, type, sortOrder) VALUES (?, ?, ?, ?, ?)")
      .run(office, body.address || "", body.contact || "", body.type || "office", Number(currentMax.maxSort || 0) + 1);

    const saved = db
      .prepare("SELECT id, office, address, contact, type, sortOrder FROM office_directory_entries WHERE id = ?")
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
      .prepare("UPDATE office_directory_entries SET office = ?, address = ?, contact = ?, type = ? WHERE id = ?")
      .run(office, body.address || "", body.contact || "", body.type || "office", id);

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

// LGUSS Programs (Videos) APIs
app.get("/api/programs", (req, res) => {
  try {
    const programs = db
      .prepare("SELECT id, title, description, videoUrl, category, uploadedDate, sortOrder FROM programs ORDER BY sortOrder ASC, id ASC")
      .all();
    res.json(
      programs.map(program => ({
        ...program,
        title: program.title || "",
        description: program.description || "",
        category: program.category || "",
        uploadedDate: program.uploadedDate || "",
      }))
    );
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs." });
  }
});

app.post("/api/programs", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const videoUrl = String(req.body?.videoUrl || "").trim();
  const category = String(req.body?.category || "").trim();
  const uploadedDate = String(req.body?.uploadedDate || new Date().toISOString().split("T")[0]).trim();

  if (!title || !videoUrl) {
    return res.status(400).json({ error: "Program title and video URL are required." });
  }

  try {
    const currentMax = db
      .prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM programs")
      .get();
    const info = db
      .prepare("INSERT INTO programs (title, description, videoUrl, category, uploadedDate, sortOrder) VALUES (?, ?, ?, ?, ?, ?)")
      .run(title, description, videoUrl, category, uploadedDate, Number(currentMax.maxSort || 0) + 1);
    const saved = db
      .prepare("SELECT id, title, description, videoUrl, category, uploadedDate, sortOrder FROM programs WHERE id = ?")
      .get(info.lastInsertRowid);
    res.status(201).json({
      ...saved,
      title: saved.title || "",
      description: saved.description || "",
      category: saved.category || "",
      uploadedDate: saved.uploadedDate || "",
    });
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ error: "Failed to create program." });
  }
});

app.put("/api/programs/reorder", (req, res) => {
  const orderedIdsRaw = Array.isArray(req.body?.orderedIds) ? req.body.orderedIds : [];
  const orderedIds = orderedIdsRaw.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0);

  if (!orderedIds.length || orderedIds.length !== orderedIdsRaw.length) {
    return res.status(400).json({ error: "A valid orderedIds list is required." });
  }

  if (new Set(orderedIds).size !== orderedIds.length) {
    return res.status(400).json({ error: "orderedIds must not contain duplicates." });
  }

  try {
    const existingIds = db.prepare("SELECT id FROM programs").all().map(row => Number(row.id));
    if (existingIds.length !== orderedIds.length) {
      return res.status(400).json({ error: "orderedIds must include all programs." });
    }

    const orderedIdSet = new Set(orderedIds);
    if (existingIds.some(id => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: "orderedIds contains invalid program ids." });
    }

    const updateSortOrder = db.prepare("UPDATE programs SET sortOrder = ? WHERE id = ?");
    const reorderProgramsTx = db.transaction((ids) => {
      ids.forEach((id, index) => {
        updateSortOrder.run(index + 1, id);
      });
    });

    reorderProgramsTx(orderedIds);

    const programs = db
      .prepare("SELECT id, title, description, videoUrl, category, uploadedDate, sortOrder FROM programs ORDER BY sortOrder ASC, id ASC")
      .all();

    res.json(
      programs.map(program => ({
        ...program,
        title: program.title || "",
        description: program.description || "",
        category: program.category || "",
        uploadedDate: program.uploadedDate || "",
      }))
    );
  } catch (error) {
    console.error("Error reordering programs:", error);
    res.status(500).json({ error: "Failed to reorder programs." });
  }
});

app.put("/api/programs/:id", (req, res) => {
  const id = Number(req.params.id);
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const videoUrl = String(req.body?.videoUrl || "").trim();
  const category = String(req.body?.category || "").trim();
  const uploadedDate = String(req.body?.uploadedDate || "").trim();

  if (!title || !videoUrl) {
    return res.status(400).json({ error: "Program title and video URL are required." });
  }

  try {
    const info = db
      .prepare("UPDATE programs SET title = ?, description = ?, videoUrl = ?, category = ?, uploadedDate = ? WHERE id = ?")
      .run(title, description, videoUrl, category, uploadedDate, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Program not found." });
    }
    res.json({ message: "Program updated successfully." });
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: "Failed to update program." });
  }
});

app.delete("/api/programs/:id", (req, res) => {
  const id = Number(req.params.id);
  try {
    const existing = db.prepare("SELECT videoUrl FROM programs WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Program not found." });
    }

    const info = db.prepare("DELETE FROM programs WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Program not found." });
    }

    deleteUploadedProgramFile(existing.videoUrl);
    res.json({ message: "Program deleted successfully." });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: "Failed to delete program." });
  }
});

app.get("/api/idle-videos", (req, res) => {
  try {
    const idleVideos = db
      .prepare("SELECT id, title, videoUrl, uploadedDate, sortOrder FROM idle_videos ORDER BY sortOrder ASC, id ASC")
      .all();
    res.json(
      idleVideos.map(video => ({
        ...video,
        title: video.title || "",
        videoUrl: video.videoUrl || "",
        uploadedDate: video.uploadedDate || "",
      }))
    );
  } catch (error) {
    console.error("Error fetching idle videos:", error);
    res.status(500).json({ error: "Failed to fetch idle videos." });
  }
});

app.delete("/api/idle-videos/:id", (req, res) => {
  const id = Number(req.params.id);
  try {
    const existing = db.prepare("SELECT videoUrl FROM idle_videos WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Idle video not found." });
    }

    const info = db.prepare("DELETE FROM idle_videos WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Idle video not found." });
    }

    const existingUrl = String(existing.videoUrl || "").trim();
    const settingsRow = db.prepare("SELECT idleVideoUrl, idleVideoUrls FROM kiosk_settings WHERE id = 1").get();
    const currentSelection = normalizeIdleVideoUrlList(settingsRow?.idleVideoUrls || settingsRow?.idleVideoUrl);
    const nextSelection = currentSelection.filter(url => url !== existingUrl);
    db.prepare("UPDATE kiosk_settings SET idleVideoUrl = ?, idleVideoUrls = ? WHERE id = 1").run(
      nextSelection[0] || "",
      JSON.stringify(nextSelection)
    );

    deleteUploadedIdleVideoFile(existing.videoUrl);
    res.json({ message: "Idle video deleted successfully." });
  } catch (error) {
    console.error("Error deleting idle video:", error);
    res.status(500).json({ error: "Failed to delete idle video." });
  }
});

app.get("/api/announcements", (req, res) => {
  try {
    res.json(getAnnouncementsPayload());
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

app.get("/api/key-officials", (_req, res) => {
  try {
    const row = db
      .prepare("SELECT title, imageUrl, updatedAt FROM key_officials WHERE id = 1")
      .get();
    const fallbackUrl = resolveDefaultKeyOfficialsImageUrl();
    res.json({
      title: String(row?.title || "Key Officials"),
      imageUrl: String(row?.imageUrl || fallbackUrl || ""),
      updatedAt: String(row?.updatedAt || ""),
    });
  } catch (error) {
    console.error("Error fetching key officials data:", error);
    res.status(500).json({ error: "Failed to fetch key officials data." });
  }
});

app.put("/api/key-officials", (req, res) => {
  try {
    const title = String(req.body?.title || "Key Officials").trim() || "Key Officials";
    const imageUrl = String(req.body?.imageUrl || "").trim();
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required." });
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO key_officials (id, title, imageUrl, updatedAt)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        imageUrl = excluded.imageUrl,
        updatedAt = excluded.updatedAt
    `).run(title, imageUrl, now);

    const updated = db
      .prepare("SELECT title, imageUrl, updatedAt FROM key_officials WHERE id = 1")
      .get();
    res.json(updated);
  } catch (error) {
    console.error("Error updating key officials data:", error);
    res.status(500).json({ error: "Failed to update key officials data." });
  }
});

app.post("/api/announcements", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const message = String(req.body?.message || "").trim();
  const details = String(req.body?.details || "").trim();
  const postedBy = String(req.body?.postedBy || "").trim();
  const where = String(req.body?.where || "").trim();
  const postedOn = String(req.body?.postedOn || "").trim();
  const effectiveUntil = String(req.body?.effectiveUntil || "").trim();
  const involvedParties = String(req.body?.involvedParties || "").trim();
  const tickerDisplay = req.body?.tickerDisplay === "title" ? "title" : "message";
  const attachments = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
  if (!message) {
    return res.status(400).json({ error: "Announcement message is required." });
  }

  try {
    const currentMax = db
      .prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM announcements")
      .get();
    const info = db
      .prepare("INSERT INTO announcements (title, message, details, postedBy, announcementWhere, postedOn, effectiveUntil, involvedParties, tickerDisplay, attachments, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(title, message, details, postedBy, where, postedOn, effectiveUntil, involvedParties, tickerDisplay, JSON.stringify(attachments), Number(currentMax.maxSort || 0) + 1);
    const saved = db
      .prepare("SELECT id, title, message, details, postedBy, announcementWhere, postedOn, effectiveUntil, involvedParties, tickerDisplay, attachments, sortOrder FROM announcements WHERE id = ?")
      .get(info.lastInsertRowid);
    broadcastAnnouncementsChanged();
    res.status(201).json({
      ...saved,
      title: saved.title || "",
      details: saved.details || "",
      postedBy: saved.postedBy || "",
      where: saved.announcementWhere || "",
      postedOn: saved.postedOn || "",
      effectiveUntil: saved.effectiveUntil || "",
      involvedParties: saved.involvedParties || "",
      tickerDisplay: saved.tickerDisplay === "title" ? "title" : "message",
      attachments: safeJsonParse(saved.attachments, []),
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement." });
  }
});

app.put("/api/announcements/:id", (req, res) => {
  const id = Number(req.params.id);
  const title = String(req.body?.title || "").trim();
  const message = String(req.body?.message || "").trim();
  const details = String(req.body?.details || "").trim();
  const postedBy = String(req.body?.postedBy || "").trim();
  const where = String(req.body?.where || "").trim();
  const postedOn = String(req.body?.postedOn || "").trim();
  const effectiveUntil = String(req.body?.effectiveUntil || "").trim();
  const involvedParties = String(req.body?.involvedParties || "").trim();
  const tickerDisplay = req.body?.tickerDisplay === "title" ? "title" : "message";
  const attachments = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
  if (!message) {
    return res.status(400).json({ error: "Announcement message is required." });
  }

  try {
    const existing = db
      .prepare("SELECT attachments FROM announcements WHERE id = ?")
      .get(id);
    if (!existing) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    const previousAttachmentUrls = new Set(extractAttachmentUrls(existing.attachments));
    const nextAttachmentUrls = new Set(extractAttachmentUrls(attachments));
    const info = db
      .prepare("UPDATE announcements SET title = ?, message = ?, details = ?, postedBy = ?, announcementWhere = ?, postedOn = ?, effectiveUntil = ?, involvedParties = ?, tickerDisplay = ?, attachments = ? WHERE id = ?")
      .run(title, message, details, postedBy, where, postedOn, effectiveUntil, involvedParties, tickerDisplay, JSON.stringify(attachments), id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    previousAttachmentUrls.forEach((url) => {
      if (!nextAttachmentUrls.has(url)) {
        deleteAnnouncementAttachmentFileIfUnused(url);
      }
    });

    broadcastAnnouncementsChanged();
    res.json({ message: "Announcement updated successfully." });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Failed to update announcement." });
  }
});

app.delete("/api/announcements/:id", (req, res) => {
  const id = Number(req.params.id);
  try {
    const existing = db
      .prepare("SELECT attachments FROM announcements WHERE id = ?")
      .get(id);
    if (!existing) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    const attachmentUrls = extractAttachmentUrls(existing.attachments);
    const info = db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    attachmentUrls.forEach((url) => deleteAnnouncementAttachmentFileIfUnused(url));

    broadcastAnnouncementsChanged();
    res.json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement." });
  }
});

app.get("/api/calendar-events", (req, res) => {
  try {
    const events = db
      .prepare("SELECT id, eventId, title, date, endDate, time, startTime, endTime, location, office, category, description, attendees, sortOrder FROM calendar_events ORDER BY sortOrder ASC, id ASC")
      .all();
    res.json(events.map(calendarEventRowToDto));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Failed to fetch calendar events." });
  }
});

app.post("/api/calendar-events", (req, res) => {
  const body = req.body || {};
  const title = String(body.title || "").trim();
  const date = String(body.startDate || body.date || "").trim();
  
  if (!title || !date) {
    return res.status(400).json({ error: "Event title and date are required." });
  }

  try {
    const currentMax = db.prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM calendar_events").get();
    const eventId = String(body.id || `evt_${Date.now()}`).trim();
    const startTime = String(body.startTime || body.time || "").trim();
    const endDate = String(body.endDate || date).trim();
    const endTime = String(body.endTime || "").trim();

    db.prepare(`
      INSERT INTO calendar_events (eventId, title, date, endDate, time, startTime, endTime, location, office, category, description, attendees, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      title,
      date,
      endDate,
      startTime,
      startTime,
      endTime,
      String(body.location || "").trim(),
      String(body.office || "").trim(),
      String(body.category || "internal").trim() || "internal",
      String(body.description || "").trim(),
      JSON.stringify(Array.isArray(body.attendees) ? body.attendees.filter(Boolean).map(String) : []),
      Number(currentMax.maxSort || 0) + 1
    );

    res.status(201).json({
      id: eventId,
      title,
      date,
      startDate: date,
      endDate,
      time: startTime,
      startTime,
      endTime,
      location: String(body.location || "").trim(),
      office: String(body.office || "").trim(),
      category: String(body.category || "internal").trim() || "internal",
      description: String(body.description || "").trim(),
      attendees: Array.isArray(body.attendees) ? body.attendees.filter(Boolean).map(String) : [],
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({ error: "Failed to create calendar event." });
  }
});

app.put("/api/calendar-events/:id", (req, res) => {
  const eventId = String(req.params.id || "").trim();
  const body = req.body || {};
  const title = String(body.title || "").trim();
  const date = String(body.startDate || body.date || "").trim();

  if (!title || !date) {
    return res.status(400).json({ error: "Event title and date are required." });
  }

  try {
    const startTime = String(body.startTime || body.time || "").trim();
    const endDate = String(body.endDate || date).trim();
    const endTime = String(body.endTime || "").trim();

    const info = db.prepare(`
      UPDATE calendar_events
      SET title = ?, date = ?, endDate = ?, time = ?, startTime = ?, endTime = ?, location = ?, office = ?, category = ?, description = ?, attendees = ?
      WHERE eventId = ?
    `).run(
      title,
      date,
      endDate,
      startTime,
      startTime,
      endTime,
      String(body.location || "").trim(),
      String(body.office || "").trim(),
      String(body.category || "internal").trim() || "internal",
      String(body.description || "").trim(),
      JSON.stringify(Array.isArray(body.attendees) ? body.attendees.filter(Boolean).map(String) : []),
      eventId
    );

    if (info.changes === 0) {
      return res.status(404).json({ error: "Calendar event not found." });
    }

    res.json({
      id: eventId,
      title,
      date,
      startDate: date,
      endDate,
      time: startTime,
      startTime,
      endTime,
      location: String(body.location || "").trim(),
      office: String(body.office || "").trim(),
      category: String(body.category || "internal").trim() || "internal",
      description: String(body.description || "").trim(),
      attendees: Array.isArray(body.attendees) ? body.attendees.filter(Boolean).map(String) : [],
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    res.status(500).json({ error: "Failed to update calendar event." });
  }
});

app.delete("/api/calendar-events/:id", (req, res) => {
  const eventId = String(req.params.id || "").trim();
  try {
    const info = db.prepare("DELETE FROM calendar_events WHERE eventId = ?").run(eventId);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Calendar event not found." });
    }
    res.json({ message: "Calendar event deleted successfully." });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({ error: "Failed to delete calendar event." });
  }
});

const syncPhilippineHolidaysHandler = async (req, res) => {
  const year = normalizeYear(req.body?.year);
  const replaceExisting = req.body?.replaceExisting !== false;

  try {
    const response = await fetch("https://calendar.google.com/calendar/ical/en.philippines%23holiday%40group.v.calendar.google.com/public/basic.ics");
    if (!response.ok) {
      return res.status(502).json({ error: `Google holiday calendar request failed (${response.status}).` });
    }

    const holidayText = await response.text();
    const holidays = parseGoogleHolidayIcs(holidayText).filter((holiday) => {
      return String(holiday.date || "").startsWith(`${year}-`);
    });
    const tx = db.transaction(() => {
      if (replaceExisting) {
        db.prepare("DELETE FROM calendar_events WHERE eventId LIKE ?").run(`ph-holiday-${year}-%`);
      }

      const maxSort = db.prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM calendar_events").get();
      let sortOrder = Number(maxSort?.maxSort || 0);
      let inserted = 0;
      let updated = 0;

      const upsertHoliday = db.prepare(`
        INSERT INTO calendar_events (eventId, title, date, time, location, office, category, description, attendees, sortOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(eventId)
        DO UPDATE SET
          title = excluded.title,
          date = excluded.date,
          time = excluded.time,
          location = excluded.location,
          office = excluded.office,
          category = excluded.category,
          description = excluded.description,
          attendees = excluded.attendees,
          sortOrder = excluded.sortOrder
      `);

      holidays.forEach((holiday) => {
        const holidayDate = String(holiday?.date || "").trim();
        const holidayTitle = String(holiday?.title || "Holiday").trim();
        if (!holidayDate || !holidayTitle) return;

        const eventId = `ph-holiday-${holidayDate}-${slugifyForId(holidayTitle)}`;
        const exists = db.prepare("SELECT 1 FROM calendar_events WHERE eventId = ?").get(eventId);
        sortOrder += 1;

        const description = holiday.description
          ? String(holiday.description)
          : "Holiday from Google Calendar.";

        upsertHoliday.run(
          eventId,
          holidayTitle,
          holidayDate,
          "Whole Day",
          "Philippines",
          "National Holiday",
          "holiday",
          description,
          JSON.stringify([]),
          sortOrder
        );

        if (exists) updated += 1;
        else inserted += 1;
      });

      return { inserted, updated, total: holidays.length };
    });

    const result = tx();
    const syncedEvents = db
      .prepare("SELECT id, eventId, title, date, time, location, office, category, description, attendees, sortOrder FROM calendar_events ORDER BY sortOrder ASC, id ASC")
      .all()
      .map(calendarEventRowToDto);

    res.json({
      message: `Holiday sync complete from Google Calendar for ${year}.`,
      year,
      ...result,
      events: syncedEvents,
    });
  } catch (error) {
    console.error("Error syncing holidays:", error);
    res.status(500).json({ error: "Failed to sync holidays." });
  }
};

app.post("/api/calendar-events/sync-holidays", syncPhilippineHolidaysHandler);
app.post("/calendar-events/sync-holidays", syncPhilippineHolidaysHandler);

app.post("/api/reset-data", (req, res) => {
  try {
    restoreDatabaseFromSnapshot();
    db.prepare("DELETE FROM key_officials").run();
    upsertDefaultKeyOfficialsRow();
    broadcastAnnouncementsChanged();
    res.json({ message: "Factory defaults restored successfully." });
  } catch (error) {
    console.error("Error restoring factory defaults:", error);
    res.status(500).json({ error: "Failed to restore factory defaults." });
  }
});

app.post("/api/data/import", (req, res) => {
  const payload = req.body?.data;
  const preservePins = req.body?.preservePins !== false;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid import payload." });
  }

  try {
    const currentPins = db.prepare("SELECT superAdminPin, adminPin FROM kiosk_settings WHERE id = 1").get() || {};
    importKioskDataToDatabase(payload, {
      preservePins,
      currentPins,
    });
    broadcastAnnouncementsChanged();
    res.json({ message: "Data imported successfully." });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ error: "Failed to import data." });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/api/announcements/upload", uploadAnnouncementFiles.array("files", 8), (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const uploaded = files.map(file => ({
      name: file.originalname || file.filename,
      url: `/uploads/announcements/${file.filename}`,
      mimeType: file.mimetype || "application/octet-stream",
      size: Number(file.size || 0),
    }));
    res.status(201).json({ files: uploaded });
  } catch (error) {
    console.error("Error uploading announcement files:", error);
    res.status(500).json({ error: "Failed to upload files." });
  }
});

app.post("/api/key-officials/upload", (req, res) => {
  uploadKeyOfficialsImage.single("image")(req, res, (error) => {
    if (error) {
      const message = String(error?.message || "Upload failed.");
      return res.status(400).json({ error: message });
    }

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No image uploaded." });
      }

      const previous = db
        .prepare("SELECT title, imageUrl FROM key_officials WHERE id = 1")
        .get();
      const currentTitle = String(previous?.title || "Key Officials").trim() || "Key Officials";
      const previousImageUrl = String(previous?.imageUrl || "").trim();
      const imageUrl = `/uploads/key-officials/${file.filename}`;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO key_officials (id, title, imageUrl, updatedAt)
        VALUES (1, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          imageUrl = excluded.imageUrl,
          updatedAt = excluded.updatedAt
          `).run(currentTitle, imageUrl, now);

      if (previousImageUrl && previousImageUrl !== imageUrl) {
        deleteOldKeyOfficialsUpload(previousImageUrl);
      }

      res.status(201).json({
        title: currentTitle,
        imageUrl,
        updatedAt: now,
      });
    } catch (uploadError) {
      console.error("Error uploading key officials image:", uploadError);
      res.status(500).json({ error: "Failed to upload key officials image." });
    }
  });
});

app.post("/api/programs/upload", (req, res) => {
  uploadProgramVideos.array("files", 8)(req, res, (error) => {
    if (error) {
      const message = String(error?.message || "Upload failed.");
      return res.status(400).json({ error: message });
    }

    try {
      const files = Array.isArray(req.files) ? req.files : [];
      const uploaded = files.map(file => ({
        name: file.originalname || file.filename,
        url: `/uploads/programs/${file.filename}`,
        mimeType: file.mimetype || "application/octet-stream",
        size: Number(file.size || 0),
      }));
      res.status(201).json({ files: uploaded });
    } catch (uploadError) {
      console.error("Error uploading program videos:", uploadError);
      res.status(500).json({ error: "Failed to upload program videos." });
    }
  });
});

app.post("/api/idle-videos/upload", (req, res) => {
  uploadIdleVideos.array("files", 8)(req, res, (error) => {
    if (error) {
      const message = String(error?.message || "Upload failed.");
      return res.status(400).json({ error: message });
    }

    try {
      const files = Array.isArray(req.files) ? req.files : [];
      if (!files.length) {
        return res.status(400).json({ error: "No files uploaded." });
      }

      const maxSortRow = db.prepare("SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM idle_videos").get();
      let nextSortOrder = Number(maxSortRow?.maxSort || 0);

      const insertStmt = db.prepare(
        "INSERT INTO idle_videos (title, videoUrl, uploadedDate, sortOrder) VALUES (?, ?, ?, ?)"
      );
      const readStmt = db.prepare("SELECT id, title, videoUrl, uploadedDate, sortOrder FROM idle_videos WHERE id = ?");
      const today = new Date().toISOString().split("T")[0];

      const uploaded = files.map(file => {
        const videoUrl = `/uploads/idle-videos/${file.filename}`;
        const title = String(path.parse(file.originalname || "Idle Video").name || "Idle Video").trim() || "Idle Video";
        nextSortOrder += 1;
        const info = insertStmt.run(title, videoUrl, today, nextSortOrder);
        const saved = readStmt.get(info.lastInsertRowid);
        return {
          id: saved.id,
          title: saved.title || title,
          videoUrl: saved.videoUrl || videoUrl,
          uploadedDate: saved.uploadedDate || today,
          sortOrder: saved.sortOrder,
          name: file.originalname || file.filename,
          mimeType: file.mimetype || "application/octet-stream",
          size: Number(file.size || 0),
        };
      });

      res.status(201).json({ files: uploaded });
    } catch (uploadError) {
      console.error("Error uploading idle videos:", uploadError);
      res.status(500).json({ error: "Failed to upload idle videos." });
    }
  });
});
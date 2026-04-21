const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Create new seed DB with correct schema
const seedDbPath = path.join(__dirname, '..', 'my-custom-backend', 'app-data.db');
const backupPath = path.join(__dirname, '..', 'my-custom-backend', 'app-data.db.backup');

// Backup old file
if (fs.existsSync(seedDbPath)) {
  try {
    fs.copyFileSync(seedDbPath, backupPath);
    console.log(`✓ Backed up old seed DB to ${path.basename(backupPath)}`);
  } catch (e) {
    console.log(`Note: Could not backup old DB: ${e.message}`);
  }
  fs.unlinkSync(seedDbPath);
}

const db = new Database(seedDbPath);

// Create all tables with FULL schema
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

console.log('✓ Fresh seed database schema created');
console.log('✓ Calendar_events table has all columns: id, eventId, title, date, endDate, time, startTime, endTime, location, office, category, description, attendees, sortOrder');

// Load seed-data.json and populate
try {
  const seedDataPath = path.join(__dirname, '..', 'my-custom-backend', 'seed-data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  console.log('✓ Loaded seed-data.json');

  // Simple function to seed tables
  function seedTable(tableName, data) {
    if (!Array.isArray(data) || data.length === 0) return;
    const firstRow = data[0];
    const cols = Object.keys(firstRow);
    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`;
    const stmt = db.prepare(sql);
    data.forEach(row => {
      stmt.run(...cols.map(c => row[c]));
    });
    console.log(`  ✓ Seeded ${tableName}: ${data.length} rows`);
  }

  // Seed all tables
  if (seedData.services) seedTable('internal_services', seedData.services);
  if (seedData.externalServices) seedTable('external_services', seedData.externalServices);
  if (seedData.issuances) seedTable('issuances', seedData.issuances);
  if (seedData.announcements) seedTable('announcements', seedData.announcements);
  if (seedData.programs) seedTable('programs', seedData.programs);
  if (seedData.idleVideos) seedTable('idle_videos', seedData.idleVideos);
  if (seedData.calendarEvents) seedTable('calendar_events', seedData.calendarEvents);
  if (seedData.keyOfficials) {
    db.prepare('INSERT INTO key_officials (id, title, imageUrl, updatedAt) VALUES (?, ?, ?, ?)').run(1, seedData.keyOfficials.title || 'Key Officials', seedData.keyOfficials.imageUrl || '', new Date().toISOString());
    console.log('  ✓ Seeded key_officials');
  }

  // Create default settings
  db.prepare(`INSERT INTO kiosk_settings (id, kioskTitle, office, address, tagline, hours, idleVideoUrl, idleVideoUrls, perPage, resetTimer, superAdminPin, adminPin, updateUrl, autoCheckUpdates)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'Citizen\'s Charter Information Kiosk', '', '', '', '', '', '[]', 9, 60, '0000', '1111', '', 0
  );
  console.log('  ✓ Created default kiosk_settings');

  db.prepare('INSERT INTO feedback_content (id, title, email, telephone, sections) VALUES (1, ?, ?, ?, ?)').run('Feedback and Complaints Mechanism', '', '', '[]');
  console.log('  ✓ Created default feedback_content');

  db.prepare('INSERT INTO organizational_profile (id, title, mandate, mission, vision, pledgeIntro, pledgeServiceCommitment, pbest, pledgeOfficeHours, pledgeClosing) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    'Mandate, Mission, Vision and Service Pledge', '', '', '', '', '', '', '', ''
  );
  console.log('  ✓ Created default organizational_profile');

  db.prepare('INSERT INTO issuance_meta (id, title, subtitle) VALUES (1, ?, ?)').run('Policies and Issuances', '');
  console.log('  ✓ Created default issuance_meta');

  db.prepare('INSERT INTO office_directory_meta (id, title, region) VALUES (1, ?, ?)').run('List of Offices', '');
  console.log('  ✓ Created default office_directory_meta');

  console.log('\n✓ Seed database populated successfully');
} catch (e) {
  console.error('✗ Error seeding tables:', e.message);
  process.exit(1);
}

db.close();
console.log('✓ Database closed and ready for deployment');
process.exit(0);

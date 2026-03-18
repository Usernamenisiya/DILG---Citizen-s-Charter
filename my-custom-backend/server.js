const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

// 1. Initialize the Express App
const app = express();
const port = 3000;

// 2. Set up Middleware
app.use(cors()); // Allows your front-end to request data without security errors
app.use(express.json()); // Allows your server to understand JSON data

// 3. Connect to the SQLite Database
// This creates 'app-data.db' in your folder automatically
const db = new Database('app-data.db', { verbose: console.log });

// 4. Create your Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  )
`);

// 5. Insert Dummy Data (Only if the table is empty!)
const checkUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get();
if (checkUsers.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
  insertUser.run('Lorey Jane', 'Lead Developer');
  insertUser.run('Eleen Fe', 'Researcher');
  console.log('Dummy data successfully inserted!');
}

// --- API ROUTES (The Bridge to your Front-End) ---

// Route: Add a new Service (POST request)
// --- GET ROUTE: Fetch services by type ---
app.get('/api/services/:type', (req, res) => {
  const type = req.params.type; // Will be 'internal' or 'external'
  const tableName = type === 'external' ? 'external_services' : 'internal_services';

  try {
    // Read from the requested table
    const services = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    const formattedServices = services.map(svc => ({
      ...svc,
      requirements: JSON.parse(svc.requirements || '[]'),
      steps: JSON.parse(svc.steps || '[]')
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error(`Error fetching ${type} services:`, error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// --- POST ROUTE: Save a new service ---
app.post('/api/services/:type', (req, res) => {
  const type = req.params.type; 
  const tableName = type === 'external' ? 'external_services' : 'internal_services';
  const svc = req.body;

  if (!svc.label) {
    return res.status(400).json({ error: 'Service name is required.' });
  }

  try {
    const insertService = db.prepare(`
      INSERT INTO ${tableName} (
        id, icon, classification, label, description, 
        processingTime, fees, whoMayAvail, office, requirements, steps
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertService.run(
      svc.id,
      svc.icon || "",
      svc.classification || "Simple",
      svc.label,
      svc.desc || "",
      svc.processingTime || "",
      svc.fees || "None",
      svc.who || "",
      svc.office || "",
      JSON.stringify(svc.requirements || []), 
      JSON.stringify(svc.steps || [])
    );
    
    res.status(201).json({ message: 'Service saved successfully!', id: svc.id });
  } catch (error) {
    console.error(`Error saving ${type} service:`, error);
    res.status(500).json({ error: 'Failed to save service to the database.' });
  }
});


// Route: Save a new Issuance
app.post('/api/issuances', (req, res) => {
  const iss = req.body;
  try {
    const insert = db.prepare(`
      INSERT INTO issuances (
        id, title, circularNo, subject, date, coverage, 
        effectivity, supersedes, approvingAuthority, highlights, deadlines
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      iss.id,
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

    res.status(201).json({ message: "Issuance saved!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save issuance." });
  }
});

// Route: Get all Issuances
app.get('/api/issuances', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM issuances').all();
    const formatted = data.map(iss => ({
      ...iss,
      highlights: JSON.parse(iss.highlights || '[]'),
      deadlines: JSON.parse(iss.deadlines || '[]')
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch issuances." });
  }
});
// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`\n🚀 Server is running and listening on http://localhost:${port}`);
  console.log(`Check your data at: http://localhost:${port}/api/users\n`);
});


// Route: Edit/Update an existing Issuance (PUT request)
app.put('/api/issuances/:id', (req, res) => {
  const id = req.params.id; // Grab the ID from the URL
  const iss = req.body;     // Grab the updated data from React

  try {
    // We use the SQL "UPDATE" command instead of "INSERT INTO"
    const updateIssuance = db.prepare(`
      UPDATE issuances 
      SET title = ?, circularNo = ?, subject = ?, date = ?, coverage = ?, 
          effectivity = ?, supersedes = ?, approvingAuthority = ?, 
          highlights = ?, deadlines = ?
      WHERE id = ?
    `);

    // Run the update, making sure the 'id' is the very last variable!
    const info = updateIssuance.run(
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

    // info.changes tells us how many rows were updated. 
    // If it's 0, the ID didn't exist in the database.
    if (info.changes === 0) {
      return res.status(404).json({ error: "Issuance not found." });
    }

    res.json({ message: "Issuance updated successfully!" });
  } catch (error) {
    console.error("Error updating issuance:", error);
    res.status(500).json({ error: "Failed to update issuance in the database." });
  }
});

// 4b. Create the Services Table
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    icon TEXT,
    classification TEXT,
    label TEXT NOT NULL,
    description TEXT,
    processingTime TEXT,
    fees TEXT,
    whoMayAvail TEXT,
    office TEXT,
    requirements TEXT, -- We will store the array as a JSON string
    steps TEXT         -- We will store the array as a JSON string
  )
`);
console.log("Services table ready!");

// Create the Issuances Table
db.exec(`
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
    highlights TEXT, -- JSON string
    deadlines TEXT   -- JSON string
  )
`);
console.log("Issuances table ready!");


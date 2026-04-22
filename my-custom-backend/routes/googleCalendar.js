const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getAuthClient, getAuthUrl, getTokenFromCode } = require('../config/googleAuth');

// Color ID to kiosk category mapping
const COLOR_CATEGORY_MAP = {
  '1': 'internal',   // Lavender
  '2': 'external',   // Sage
  '3': 'internal',   // Grape
  '4': 'external',   // Flamingo
  '5': 'external',   // Banana
  '6': 'holiday',    // Tangerine
  '7': 'internal',   // Peacock
  '8': 'deadlines',  // Graphite
  '9': 'internal',   // Blueberry
  '10': 'external',  // Basil
  '11': 'deadlines', // Tomato
};

// Step 1: Redirect to Google Auth
router.get('/auth', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Step 2: Handle OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    await getTokenFromCode(code);
    res.send(`
      <h2>Google Calendar connected successfully!</h2>
      <p>You can close this window.</p>
    `);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Step 3: Manually trigger sync (called from frontend)
router.post('/sync', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await syncGoogleCalendarEvents(db);
    res.json({ message: 'Google Calendar synced successfully!', ...result });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync Google Calendar.' });
  }
});

// Step 4: Webhook endpoint (called by Google when calendar changes)
router.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately
  try {
    const db = req.app.locals.db;
    await syncGoogleCalendarEvents(db);
  } catch (error) {
    console.error('Webhook sync error:', error);
  }
});

// Core sync function
async function syncGoogleCalendarEvents(db) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    maxResults: 250,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];
  let inserted = 0;
  let updated = 0;

  const upsertEvent = db.prepare(`
    INSERT INTO calendar_events 
      (eventId, title, date, endDate, time, startTime, endTime, location, office, category, description, attendees, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(eventId) DO UPDATE SET
      title = excluded.title,
      date = excluded.date,
      endDate = excluded.endDate,
      time = excluded.time,
      startTime = excluded.startTime,
      endTime = excluded.endTime,
      location = excluded.location,
      category = excluded.category,
      description = excluded.description
  `);

  const maxSortRow = db.prepare('SELECT COALESCE(MAX(sortOrder), 0) AS maxSort FROM calendar_events').get();
  let sortOrder = Number(maxSortRow?.maxSort || 0);

  events.forEach(event => {
    const exists = db.prepare('SELECT 1 FROM calendar_events WHERE eventId = ?').get(event.id);

    const startDate = event.start?.date || event.start?.dateTime?.split('T')[0] || '';
    const endDate = event.end?.date || event.end?.dateTime?.split('T')[0] || startDate;
    const startTime = event.start?.dateTime
      ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'Whole Day';
    const endTime = event.end?.dateTime
      ? new Date(event.end.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '';

    const colorId = String(event.colorId || '1');
    const category = COLOR_CATEGORY_MAP[colorId] || 'internal';

    sortOrder += 1;

    upsertEvent.run(
      event.id,
      event.summary || 'Untitled Event',
      startDate,
      endDate,
      startTime,
      startTime,
      endTime,
      event.location || '',
      '',               // office — admin fills manually
      category,
      event.description || '',
      JSON.stringify([]), // attendees — admin fills manually
      exists ? sortOrder - 1 : sortOrder
    );

    if (exists) updated++;
    else inserted++;
  });

  return { inserted, updated, total: events.length };
}

module.exports = router;
module.exports.syncGoogleCalendarEvents = syncGoogleCalendarEvents;
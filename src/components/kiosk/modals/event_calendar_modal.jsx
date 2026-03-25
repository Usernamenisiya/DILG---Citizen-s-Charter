import { useMemo, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "internal", label: "Internal" },
  { id: "external", label: "External" },
  { id: "deadline", label: "Deadlines" },
  { id: "holiday", label: "Holiday" },
];

const CATEGORY_COLORS = {
  internal: "#002C76",
  external: "#0A7C4B",
  deadline: "#C9282D",
  holiday: "#B57A00",
};

const CATEGORY_LEGEND = [
  { id: "internal", label: "Internal" },
  { id: "external", label: "External" },
  { id: "deadline", label: "Deadlines" },
  { id: "holiday", label: "Holidays" },
];

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getMonthCells(year, month) {
  const first = new Date(year, month, 1);
  const firstDay = first.getDay();
  const start = new Date(year, month, 1 - firstDay);
  const out = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      key: toKey(d.getFullYear(), d.getMonth(), d.getDate()),
      inCurrentMonth: d.getMonth() === month,
    });
  }
  return out;
}

function buildSampleEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const nextMonthDate = new Date(y, m + 1, 1);
  const y2 = nextMonthDate.getFullYear();
  const m2 = nextMonthDate.getMonth();

  const events = {};
  const push = (year, month, day, item) => {
    const key = toKey(year, month, day);
    if (!events[key]) events[key] = [];
    events[key].push(item);
  };

  push(y, m, 4, {
    id: "ev-1",
    title: "Citizen Service Frontline Briefing",
    time: "9:00 AM - 10:30 AM",
    location: "Regional Conference Hall",
    category: "internal",
    office: "Regional Director Office",
    description: "Frontline teams align on service updates, queue handling, and citizen support protocols.",
  });
  push(y, m, 9, {
    id: "ev-2",
    title: "Barangay Documentation Assistance",
    time: "1:30 PM - 4:00 PM",
    location: "Public Service Desk",
    category: "external",
    office: "Customer Assistance Unit",
    description: "Assistance day for documentary requirements and step-by-step filing guidance.",
  });
  push(y, m, 14, {
    id: "ev-3",
    title: "Submission Deadline: Monthly Compliance Report",
    time: "Until 5:00 PM",
    location: "Online Submission Portal",
    category: "deadline",
    office: "Monitoring and Evaluation Division",
    description: "All covered offices must submit required compliance attachments before cutoff.",
  });
  push(y, m, 14, {
    id: "ev-4",
    title: "Civil Registry Coordination Meeting",
    time: "2:00 PM - 3:30 PM",
    location: "Meeting Room 2",
    category: "internal",
    office: "LG Capability Development Division",
    description: "Coordination with support units for upcoming local registry assistance programs.",
  });
  push(y, m, 21, {
    id: "ev-5",
    title: "Public Consultation on Local Governance Programs",
    time: "10:00 AM - 12:00 PM",
    location: "Main Lobby Forum Area",
    category: "external",
    office: "Public Affairs and Communication",
    description: "Open consultation for citizens regarding service improvements and outreach initiatives.",
  });
  push(y, m, 29, {
    id: "ev-6",
    title: "Special Non-Working Holiday",
    time: "Whole Day",
    location: "All Offices",
    category: "holiday",
    office: "DILG Region XIII",
    description: "Office operations follow holiday schedule. Emergency support lines remain available.",
  });

  push(y2, m2, 3, {
    id: "ev-7",
    title: "Inter-Office Service Standards Workshop",
    time: "9:00 AM - 11:30 AM",
    location: "Training Room A",
    category: "internal",
    office: "Human Resource Development",
    description: "Workshop focused on standardizing service touchpoints and processing updates.",
  });
  push(y2, m2, 8, {
    id: "ev-8",
    title: "External Services Info Day",
    time: "8:30 AM - 3:00 PM",
    location: "Ground Floor Help Desk",
    category: "external",
    office: "Citizen Engagement Unit",
    description: "Walk-in orientation for service requirements and expected processing timelines.",
  });

  return events;
}

const EVENTS = buildSampleEvents();

function formatLongDate(year, month, day) {
  return `${MONTHS[month]} ${day}, ${year}`;
}

function EventCard({ event, onClick, delay = 0 }) {
  return (
    <button
      type="button"
      className="kcal-event-card"
      style={{ "--ec": CATEGORY_COLORS[event.category], animationDelay: `${delay}s` }}
      onClick={() => onClick(event.id)}
    >
      <span className="kcal-event-stripe" />
      <span className="kcal-event-body">
        <span className="kcal-event-topline">
          <span className="kcal-event-pill">{event.category}</span>
          <span className="kcal-event-time">{event.time}</span>
        </span>
        <span className="kcal-event-title">{event.title}</span>
        <span className="kcal-event-meta">{event.office} | {event.location}</span>
      </span>
      <span className="kcal-event-arrow">&gt;</span>
    </button>
  );
}

function EventDetail({ event, onBack }) {
  return (
    <div className="kcal-detail" style={{ "--ec": CATEGORY_COLORS[event.category] }}>
      <button type="button" className="kcal-back-btn" onClick={onBack}>Back to list</button>
      <div className="kcal-detail-card">
        <div className="kcal-detail-card-stripe" />
        <div className="kcal-detail-card-inner">
          <div className="kcal-detail-tag">{event.category}</div>
          <div className="kcal-detail-title">{event.title}</div>
          <div className="kcal-detail-time">{event.time}</div>
          <div className="kcal-detail-loc">{event.location}</div>
        </div>
      </div>
      <div className="kcal-section">
        <div className="kcal-section-label">Assigned Office</div>
        <p className="kcal-section-text">{event.office}</p>
      </div>
      <div className="kcal-section">
        <div className="kcal-section-label">Description</div>
        <p className="kcal-section-text">{event.description}</p>
      </div>
    </div>
  );
}

export default function EventsCalendarModal({ onClose }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const visibleCells = useMemo(() => getMonthCells(year, month), [year, month]);

  const selectedKey = selectedDay ? toKey(year, month, selectedDay) : null;
  const isExpanded = selectedDay !== null;

  const isTodayCell = (cell) => {
    return (
      cell.day === today.getDate() &&
      cell.month === today.getMonth() &&
      cell.year === today.getFullYear()
    );
  };

  const applyFilter = (events) => {
    if (filter === "all") return events;
    return events.filter((event) => event.category === filter);
  };

  const selectedEvents = useMemo(() => {
    if (!selectedKey) return [];
    return applyFilter(EVENTS[selectedKey] || []);
  }, [selectedKey, filter]);

  const selectedEvent = useMemo(() => {
    return selectedEvents.find((event) => event.id === selectedEventId) || null;
  }, [selectedEvents, selectedEventId]);

  const prevMonth = () => {
    setSelectedEventId(null);
    setSelectedDay(null);
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
      return;
    }
    setMonth((prev) => prev - 1);
  };

  const nextMonth = () => {
    setSelectedEventId(null);
    setSelectedDay(null);
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
      return;
    }
    setMonth((prev) => prev + 1);
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(null);
    setSelectedEventId(null);
  };

  return (
    <div className="kmodal-backdrop" onClick={onClose}>
      <div className={`kmodal-box kcal-box${isExpanded ? " kcal-box--expanded" : ""}`} style={{ "--modal-color": "#002C76" }} onClick={(e) => e.stopPropagation()}>
        <div className="kmodal-header">
          <div className="kmodal-header-stripe" />
          <div className="kmodal-title">Calendar and Events</div>
          <button className="kmodal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="kcal-body">
          <div className="kcal-panel-left">
            <div className="kcal-toolbar">
              <span className="kcal-toolbar-spacer" aria-hidden="true" />
              <div className="kcal-month-nav">
                <button type="button" className="kcal-nav-btn kcal-nav-btn--prev" onClick={prevMonth} aria-label="Previous month">
                  <span className="kcal-nav-glyph" aria-hidden="true">&larr;</span>
                </button>
                <span className="kcal-month-label">{MONTHS[month]} {year}</span>
                <button type="button" className="kcal-nav-btn kcal-nav-btn--next" onClick={nextMonth} aria-label="Next month">
                  <span className="kcal-nav-glyph" aria-hidden="true">&rarr;</span>
                </button>
              </div>
              <button type="button" className="kcal-today-btn" onClick={goToToday}>Today</button>
            </div>

            <div className="kcal-legend-row" aria-label="Event category colors">
              {CATEGORY_LEGEND.map((item) => (
                <span key={item.id} className="kcal-legend-item">
                  <span className="kcal-legend-dot" style={{ backgroundColor: CATEGORY_COLORS[item.id] }} />
                  <span className="kcal-legend-label">{item.label}</span>
                </span>
              ))}
            </div>

            <div className="kcal-filter-row">
              {FILTERS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`kcal-filter-chip${filter === item.id ? " active" : ""}`}
                  onClick={() => {
                    setFilter(item.id);
                    setSelectedEventId(null);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="kcal-grid kcal-grid--header">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="kcal-dow">{d}</div>
              ))}
            </div>

            <div className="kcal-grid kcal-grid--days">
              {visibleCells.map((cell) => {
                const allCellEvents = EVENTS[cell.key] || [];
                const filteredCellEvents = applyFilter(allCellEvents);
                const eventCategories = [...new Set(filteredCellEvents.map((event) => event.category))];
                const hasEvent = eventCategories.length > 0;
                const isActive = cell.year === year && cell.month === month && cell.day === selectedDay;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    className={[
                      "kcal-day",
                      cell.inCurrentMonth ? "" : "kcal-day--outside",
                      hasEvent ? "kcal-day--has-event" : "",
                      isActive ? "kcal-day--active" : "",
                      isTodayCell(cell) ? "kcal-day--today" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => {
                      if (isActive) {
                        setSelectedDay(null);
                        setSelectedEventId(null);
                        return;
                      }
                      setYear(cell.year);
                      setMonth(cell.month);
                      setSelectedDay(cell.day);
                      setSelectedEventId(null);
                    }}
                  >
                    <span className="kcal-day-num">{cell.day}</span>
                    {hasEvent && (
                      <span className="kcal-day-dot-row">
                        {eventCategories.slice(0, 4).map((categoryId) => (
                          <span key={categoryId} className="kcal-day-dot" style={{ backgroundColor: CATEGORY_COLORS[categoryId] }} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {isExpanded && (
            <div className="kcal-panel-right">
              {selectedEvent ? (
                <EventDetail event={selectedEvent} onBack={() => setSelectedEventId(null)} />
              ) : (
                <>
                  <div className="kcal-panel-right-header">
                    <div className="kcal-panel-date-label">{formatLongDate(year, month, selectedDay)}</div>
                    <div className="kcal-panel-count">
                      {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""} found
                    </div>
                  </div>

                  <div className="kcal-event-list">
                    {selectedEvents.length === 0 && (
                      <div className="kcal-empty-state">
                        <div className="kcal-empty-title">No events scheduled</div>
                        <div className="kcal-empty-sub">Try another date or switch filters.</div>
                      </div>
                    )}

                    {selectedEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} onClick={setSelectedEventId} delay={index * 0.04} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState } from "react";

/* ─── Sample Event Data ──────────────────────────────────────────────────────── */
const EVENTS = {
  "2025-07-03": [
    {
      id: 1,
      title: "Quarterly Budget Review",
      time: "9:00 AM – 11:00 AM",
      location: "Board Room A",
      description:
        "Review of Q2 financial performance and Q3 budget allocation across all departments.",
      departments: ["Finance", "Executive Office", "Operations"],
      personnel: ["Dir. Maria Santos", "CFO Ramon Cruz", "OIC Liza Reyes"],
      color: "#002C76",
    },
    {
      id: 2,
      title: "IT Infrastructure Upgrade",
      time: "2:00 PM – 5:00 PM",
      location: "Server Room / IT Hub",
      description:
        "Scheduled maintenance and system upgrade for the kiosk network infrastructure.",
      departments: ["Information Technology", "Facilities Management"],
      personnel: ["IT Head Jun Bautista", "Engr. Paolo Vera"],
      color: "#0047b2",
    },
  ],
  "2025-07-10": [
    {
      id: 3,
      title: "Employee Wellness Day",
      time: "8:00 AM – 4:00 PM",
      location: "Gymnasium & Outdoor Area",
      description:
        "Annual wellness activities including health check-ups, team sports, and mental health seminars.",
      departments: ["Human Resources", "Medical Services", "All Departments"],
      personnel: ["HR Dir. Anna Flores", "Dr. Carlo Mendez", "Nurse Jessa Go"],
      color: "#0a7c4b",
    },
  ],
  "2025-07-15": [
    {
      id: 4,
      title: "Regional Planning Summit",
      time: "10:00 AM – 3:00 PM",
      location: "Conference Hall 2",
      description:
        "Inter-agency summit for regional development planning and resource coordination among LGUs.",
      departments: ["Planning & Development", "Executive Office", "Legal"],
      personnel: ["Planner Noel Tan", "Dir. Maria Santos", "Atty. Grace Uy"],
      color: "#C9282D",
    },
    {
      id: 5,
      title: "Public Records Day",
      time: "8:00 AM – 12:00 PM",
      location: "Records Office Lobby",
      description:
        "Open access day for constituents to request and receive official records and documents.",
      departments: ["Records Management", "Customer Service"],
      personnel: ["Records Chief Dan Lim", "CSR Supervisor Tina Abad"],
      color: "#C9282D",
    },
  ],
  "2025-07-22": [
    {
      id: 6,
      title: "Youth Leadership Forum",
      time: "1:00 PM – 5:00 PM",
      location: "Main Auditorium",
      description:
        "Forum for youth representatives to discuss governance, civic engagement, and leadership.",
      departments: ["Youth Affairs", "Community Relations", "Education Office"],
      personnel: ["Youth Coord. Mia Reyes", "PIO Head Bart Cruz", "DepEd Liaison"],
      color: "#002C76",
    },
  ],
  "2025-07-28": [
    {
      id: 7,
      title: "End-of-Month Reporting",
      time: "9:00 AM – 12:00 PM",
      location: "Admin Office",
      description:
        "Submission and consolidation of all department monthly performance reports.",
      departments: ["All Departments", "Executive Office"],
      personnel: ["Admin Chief Rose Chua", "Exec. Asst. Kevin Sia"],
      color: "#0a7c4b",
    },
  ],
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

/* ─── EventCard ──────────────────────────────────────────────────────────────── */
function EventCard({ event, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`kcal-event-card${hover ? " kcal-event-card--hover" : ""}`}
      style={{ "--ec": event.color }}
      onClick={() => onClick(event)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="kcal-event-stripe" />
      <div className="kcal-event-body">
        <div className="kcal-event-title">{event.title}</div>
        <div className="kcal-event-meta">
          <span className="kcal-event-time">{event.time}</span>
          <span className="kcal-event-loc">📍 {event.location}</span>
        </div>
      </div>
      <div className="kcal-event-arrow">›</div>
    </div>
  );
}

/* ─── EventDetail ────────────────────────────────────────────────────────────── */
function EventDetail({ event, onBack }) {
  return (
    <div className="kcal-detail" style={{ "--ec": event.color }}>
      <button className="kcal-back-btn" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to events
      </button>

      <div className="kcal-detail-card">
        <div className="kcal-detail-card-stripe" />
        <div className="kcal-detail-card-inner">
          <div className="kcal-detail-tag">Event Details</div>
          <div className="kcal-detail-title">{event.title}</div>
          <div className="kcal-detail-time">{event.time}</div>
          <div className="kcal-detail-loc">📍 {event.location}</div>
        </div>
      </div>

      <div className="kcal-section">
        <div className="kcal-section-label">Description</div>
        <p className="kcal-section-text">{event.description}</p>
      </div>

      <div className="kcal-section">
        <div className="kcal-section-label">Departments Involved</div>
        <div className="kcal-tag-row">
          {event.departments.map((d) => (
            <span key={d} className="kcal-tag kcal-tag--dept" style={{ "--ec": event.color }}>
              🏢 {d}
            </span>
          ))}
        </div>
      </div>

      <div className="kcal-section">
        <div className="kcal-section-label">Personnel</div>
        <div className="kcal-tag-row">
          {event.personnel.map((p) => (
            <span key={p} className="kcal-tag kcal-tag--person">
              👤 {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────────── */
export default function EventsCalendarModal({ onClose }) {
  const today = new Date();
  const [year, setYear]                   = useState(2025);
  const [month, setMonth]                 = useState(6); // July for demo data
  const [selectedDay, setSelectedDay]     = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);
  const selectedKey = selectedDay ? toKey(year, month, selectedDay) : null;
  const dayEvents   = selectedKey ? (EVENTS[selectedKey] || []) : [];
  const isSplit     = selectedDay !== null;

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null); setSelectedEvent(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null); setSelectedEvent(null);
  }
  function handleDayClick(day) {
    const key = toKey(year, month, day);
    if (EVENTS[key]) { setSelectedDay(day); setSelectedEvent(null); }
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="kmodal-backdrop" onClick={onClose}>
      <div
        className={`kmodal-box kcal-box${isSplit ? " kcal-box--split" : ""}`}
        style={{ "--modal-color": "#002C76" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header — reuses existing kmodal-header styles ── */}
        <div className="kmodal-header">
          <div className="kmodal-header-stripe" />
          <div className="kmodal-title">Events Calendar</div>
          <button className="kmodal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="kcal-body">

          {/* Left: Calendar panel */}
          <div className="kcal-panel-left">
            <div className="kcal-month-nav">
              <button className="kcal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="kcal-month-label">{MONTHS[month]} {year}</span>
              <button className="kcal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            <div className="kcal-grid kcal-grid--header">
              {DAYS_SHORT.map(d => (
                <div key={d} className="kcal-dow">{d}</div>
              ))}
            </div>

            <div className="kcal-grid kcal-grid--days">
              {cells.map((day, i) => {
                if (!day) return <div key={`b${i}`} />;
                const key      = toKey(year, month, day);
                const hasEvent = !!EVENTS[key];
                const isActive = selectedDay === day;
                const dots     = hasEvent ? EVENTS[key] : [];

                return (
                  <div
                    key={day}
                    className={[
                      "kcal-day",
                      hasEvent     ? "kcal-day--has-event" : "",
                      isActive     ? "kcal-day--active"    : "",
                      isToday(day) ? "kcal-day--today"     : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => handleDayClick(day)}
                  >
                    <span className="kcal-day-num">{day}</span>
                    {hasEvent && (
                      <div className="kcal-dots">
                        {dots.slice(0, 3).map(ev => (
                          <span
                            key={ev.id}
                            className="kcal-dot"
                            style={{ background: isActive ? "#FFDE15" : ev.color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="kcal-hint">
              {isSplit ? "← Tap another date to switch" : "Tap a highlighted date to see events"}
            </div>
          </div>

          {/* Right: Event panel (only when a date is selected) */}
          {isSplit && (
            <div className="kcal-panel-right">
              {selectedEvent ? (
                <EventDetail
                  event={selectedEvent}
                  onBack={() => setSelectedEvent(null)}
                />
              ) : (
                <>
                  <div className="kcal-panel-right-header">
                    <div className="kcal-panel-date-label">
                      {MONTHS[month]} {selectedDay}, {year}
                    </div>
                    <div className="kcal-panel-count">
                      {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled
                    </div>
                  </div>
                  <div className="kcal-event-list">
                    {dayEvents.map(ev => (
                      <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />
                    ))}
                  </div>
                  <div className="kcal-hint kcal-hint--right">
                    Tap an event card to view full details
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


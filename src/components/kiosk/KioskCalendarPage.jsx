import { Fragment, useMemo, useState } from "react";
import dilgIcon from "../../Dilg.svg";
import lgrrcLogo from "../../lgrrc_logo.jpg";
import rictuLogo from "../../assets/images/RICTU_LOGO.png";
import istmsLogo from "../../assets/images/ISTMS-LOGO.png";
import csuLogo from "../../assets/images/CSU_LOGO.png";
import { MapPin, ChevronLeft } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DEFAULT_ANNOUNCEMENT = "Welcome to the DILG Citizens Charter Kiosk. We are committed to providing fast, efficient, and courteous public service.";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "internal", label: "Internal" },
  { id: "external", label: "External" },
  { id: "deadline", label: "Deadlines" },
  { id: "holiday", label: "Holiday" },
];

const CATEGORY_COLORS = {
  internal: "#002C76",
  external: "#FFDE15",
  deadline: "#C9282D",
  holiday: "#B57A00",
};

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

function formatLongDate(year, month, day) {
  return `${MONTHS[month]} ${day}, ${year}`;
}

function normalizeAttendees(attendees) {
  if (!attendees) return [];
  if (Array.isArray(attendees)) return attendees.filter(Boolean).map(String);
  return String(attendees)
    .split(/\r?\n|,|•/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderAttendeesDetail(attendees) {
  const parts = normalizeAttendees(attendees);
  return parts.length ? (
    <div className="kcal-attendees-list">
      {parts.map((item, idx) => (
        <div key={idx} className="kcal-attendees-item">{item}</div>
      ))}
    </div>
  ) : null;
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
        <span className="kcal-event-meta">
          {event.office} | <MapPin size={12} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />{event.location}
        </span>
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
          <div className="kcal-detail-loc"><MapPin size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />{event.location}</div>
        </div>
      </div>
      {event.description && (
        <div className="kcal-section">
          <div className="kcal-section-label">Description</div>
          <p className="kcal-section-text">{event.description}</p>
        </div>
      )}
      <div className="kcal-section">
        <div className="kcal-section-label">Assigned Office</div>
        <p className="kcal-section-text">{event.office}</p>
      </div>
      {event.attendees && (
        <div className="kcal-section">
          <div className="kcal-section-label">Attending / Involved</div>
          {renderAttendeesDetail(event.attendees)}
        </div>
      )}
    </div>
  );
}

export default function KioskCalendarPage({ visible, settings, announcements = [], calendarEvents, onBackToMenu, onLgrrcLogoClick }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const visibleCells = useMemo(() => getMonthCells(year, month), [year, month]);
  const visibleCellsUntilMonthEnd = useMemo(() => {
    let lastMonthCellIndex = -1;
    for (let i = visibleCells.length - 1; i >= 0; i -= 1) {
      const cell = visibleCells[i];
      if (cell.year === year && cell.month === month) {
        lastMonthCellIndex = i;
        break;
      }
    }

    if (lastMonthCellIndex === -1) return visibleCells;
    return visibleCells.slice(0, lastMonthCellIndex + 1);
  }, [visibleCells, year, month]);
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

  const eventsMap = useMemo(() => {
    if (calendarEvents == null) return {};
    const map = {};
    calendarEvents.forEach((event) => {
      const date = String(event?.date || "");
      const parts = date.split("-").map((v) => Number(v));
      if (parts.length !== 3) return;
      const [yearVal, monthVal, dayVal] = parts;
      if (!Number.isFinite(yearVal) || !Number.isFinite(monthVal) || !Number.isFinite(dayVal)) return;
      const key = toKey(yearVal, monthVal - 1, dayVal);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [calendarEvents]);

  const selectedEvents = useMemo(() => {
    if (!selectedKey) return [];
    return applyFilter(eventsMap[selectedKey] || []);
  }, [selectedKey, filter, eventsMap]);

  const selectedEvent = useMemo(() => {
    return selectedEvents.find((event) => event.id === selectedEventId) || null;
  }, [selectedEvents, selectedEventId]);

  const clampDayToMonth = (year, month, day) => {
    if (day === null) return null;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Math.min(day, daysInMonth);
  };

  const prevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedEventId(null);
    setSelectedDay((prevDay) => clampDayToMonth(newYear, newMonth, prevDay));
  };

  const nextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedEventId(null);
    setSelectedDay((prevDay) => clampDayToMonth(newYear, newMonth, prevDay));
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(null);
    setSelectedEventId(null);
  };

  // Announcement ticker
  const tickerItems = useMemo(() => {
    const fromList = (announcements || [])
      .map(a => {
        const useTitle = a?.tickerDisplay === "title";
        const candidate = useTitle ? a?.title : a?.message;
        const fallback = useTitle ? a?.message : a?.title;
        const baseText = String(candidate || fallback || "").trim();
        const postedOn = String(a?.postedOn || "").trim();
        const effectiveUntil = String(a?.effectiveUntil || "").trim();
        const dateParts = [
          postedOn ? `Posted: ${postedOn}` : "",
          effectiveUntil ? `Effective until: ${effectiveUntil}` : "",
        ].filter(Boolean);
        if (!baseText) return "";
        return dateParts.length ? `${baseText} (${dateParts.join(" | ")})` : baseText;
      })
      .filter(Boolean);
    if (fromList.length) return fromList;
    const fallback = String(settings.announcement || "").trim();
    return [fallback || DEFAULT_ANNOUNCEMENT];
  }, [announcements, settings.announcement]);

  const announcementScrollMs = useMemo(() => {
    const messageLength = tickerItems.join(" ").length;
    const baseMs = 15000;
    const msPerCharacter = 14;
    return Math.max(12000, Math.min(22000, baseMs + (messageLength * msPerCharacter)));
  }, [tickerItems]);

  const officeHours = String(settings.hours || "Monday to Friday, 8:00 AM - 5:00 PM").trim();

  return (
    <div className={`calendar-page${visible ? " visible" : ""}`}>
      {/* ── HEADER: announcement ticker ── */}
      <div className="idle-header">
        <div className="idle-ticker">
          <div className="idle-ticker-badge">
            <svg viewBox="0 0 24 24" fill="white" width="50" height="50">
              <path d="M18 3a1 1 0 0 0-1 .26L9.54 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.57l1.24 3.38A1 1 0 0 0 7.75 19H9a1 1 0 0 0 .94-.66L11.35 15H11l-.01-.01L17 18.74A1 1 0 0 0 18 19a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-8.5 12H8.3l-1.1-3H10l.1.28zM17 17l-6.5-3.5v-5L17 5v12z"/>
              <path d="M20.5 8.5a1 1 0 0 0 0 7 4 4 0 0 0 0-7z"/>
            </svg>
            <div className="idle-ticker-badge-text">
              <span>ANNOUNCEMENT</span>
              <span className="idle-ticker-hours">{officeHours}</span>
            </div>
          </div>
          <div className="idle-ticker-track">
            <div
              className="idle-ticker-inner"
              style={{ animationDuration: `${announcementScrollMs}ms` }}
            >
              {[0, 1].map(groupIndex => (
                <div
                  key={groupIndex}
                  className="idle-ticker-group"
                  aria-hidden={groupIndex === 1 ? "true" : undefined}
                >
                  {tickerItems.map((item, itemIndex) => (
                    <Fragment key={`${groupIndex}-${itemIndex}-${item}`}>
                      <span>{item}</span>
                      <span className="idle-ticker-sep">◆</span>
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="calendar-page-content">
        {/* Back button */}
        <button type="button" className="calendar-page-back-btn" onClick={onBackToMenu}>
          <ChevronLeft size={20} /> Back to Menu
        </button>

        {/* Calendar Panel */}
        <div className={`kcal-page-container${isExpanded ? " kcal-page-container--expanded" : ""}`}>
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
                  {item.id !== "all" && (
                    <span
                      className="kcal-filter-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[item.id] }}
                    />
                  )}
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
              {visibleCellsUntilMonthEnd.map((cell) => {
                const allCellEvents = eventsMap[cell.key] || [];
                const filteredCellEvents = applyFilter(allCellEvents);
                const hasEvent = filteredCellEvents.length > 0;
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
                      <span className="kcal-day-titles-row">
                        {filteredCellEvents.slice(0, 3).map((event) => (
                          <span key={event.id} className="kcal-day-title" style={{ color: CATEGORY_COLORS[event.category] }}>
                            {event.title}
                          </span>
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
                    <div className="kcal-panel-right-header-top">
                      <div className="kcal-panel-date-label">{formatLongDate(year, month, selectedDay)}</div>
                      <button
                        type="button"
                        className="kcal-panel-collapse-btn"
                        onClick={() => {
                          setSelectedDay(null);
                          setSelectedEventId(null);
                        }}
                      >
                        Show full calendar
                      </button>
                    </div>
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

      {/* ── FOOTER ── */}
      <div className="idle-footer idle-footer--transparent">
        {/* Left: Logos + Dept Name + Tagline */}
        <div className="idle-footer-left">
          <div className="idle-footer-logos">
            <img src={dilgIcon} alt="DILG Seal" className="footer-logo" />
            <img src={lgrrcLogo} alt="LGRRC Logo" className="footer-logo lgrrc-logo" onClick={onLgrrcLogoClick} />
          </div>
          <div className="idle-footer-text">
            <div className="idle-footer-office">Department of the Interior and Local Government - Caraga</div>
            <div className="idle-footer-tagline">{settings.tagline}</div>
            <div className="idle-footer-copyright">Copyright 2026 DILG Caraga. All rights reserved.</div>
          </div>
        </div>
        {/* Right: "Powered by" + Partners */}
        <div className="idle-footer-right">
          <div className="idle-footer-powered-by">
            <div className="idle-footer-powered-text">Powered by</div>
            <div className="idle-footer-logos-group">
              <img src={rictuLogo} alt="RICTU Logo" className="idle-footer-rictu-logo" />
              <img src={istmsLogo} alt="ISTMS Logo" className="idle-footer-istms-logo" />
              <img src={csuLogo} alt="CSU Logo" className="idle-footer-csu-logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

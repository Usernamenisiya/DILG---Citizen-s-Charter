import { useEffect, useRef, useState } from "react";
import dilgIcon from "../../Dilg.svg";
import EventsCalendarModal from "./modals/event_calendar_modal";


const DEFAULT_ANNOUNCEMENT =
  "Welcome to the DILG Citizens Charter Kiosk. We are committed to providing fast, efficient, and courteous public service.";

/* ─── Icons ─── */
const ICONS = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  announcement: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
      <path d="M18 3a1 1 0 0 0-1 .26L9.54 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.57l1.24 3.38A1 1 0 0 0 7.75 19H9a1 1 0 0 0 .94-.66L11.35 15H11l-.01-.01L17 18.74A1 1 0 0 0 18 19a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-8.5 12H8.3l-1.1-3H10l.1.28zM17 17l-6.5-3.5v-5L17 5v12z"/>
      <path d="M20.5 8.5a1 1 0 0 0 0 7 4 4 0 0 0 0-7z"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  offices: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  internal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  feedback: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  issuances: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

const NAV_GROUPS = [
  {
    id: "employees",
    label: "DILG Employees Corner",
    color: "#0038A8",
    items: [
      { id: "calendar",     label: "Calendar",     color: "#0038A8" },
      { id: "announcement", label: "Announcement", color: "#0038A8" },
    ],
  },
];

const NAV_STANDALONE = [
  { id: "profile", label: "Mission, Vision & Mandate", color: "#1f6f8b" },
  { id: "offices", label: "Contact Us",          color: "#0a7c4b" },
  { id: "Programs", label: "DILG Programs",   color: "#002C76" },
];

const GRID_CARDS = [
  { id: "internal",  label: "Internal Services",     color: "#002C76", span: "full" },
  { id: "external",  label: "External Services",     color: "#C9282D", span: "full" },
  { id: "feedback",  label: "Feedback & Complaints", color: "#FFDE15", span: "half" },
  { id: "issuances", label: "Policies & Issuances",  color: "#FFDE15", span: "half" },
];

function NavItem({ id, label, color, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      className={`mnav-item${hover ? " hovered" : ""}`}
      style={{ "--nav-color": color }}
      onClick={() => onClick(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="mnav-item-bar" />
      <span className="mnav-item-icon" style={{ color }}>{ICONS[id]}</span>
      <span className="mnav-item-label">{label}</span>
      <span className="mnav-item-arrow">›</span>
    </button>
  );
}

export default function KioskMenuScreen({ visible, settings, announcements = [], onSelectSection, inactBarRef }) {
  const [clockTime, setClockTime]       = useState("");
  const [clockDate, setClockDate]       = useState("");
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const drawerRef    = useRef(null);
  const hamburgerRef = useRef(null);
  const tickerItems = (announcements || [])
    .map(a => String(a?.message || "").trim())
    .filter(Boolean);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    setAnnouncementIndex(0);
  }, [tickerItems.length]);

  useEffect(() => {
    if (tickerItems.length <= 1) return undefined;
    const id = setInterval(() => {
      setAnnouncementIndex(prev => (prev + 1) % tickerItems.length);
    }, 7000);
    return () => clearInterval(id);
  }, [tickerItems.length]);

  const announcement =
    tickerItems[announcementIndex] ||
    String(settings.announcement || "").trim() ||
    DEFAULT_ANNOUNCEMENT;

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      setClockTime(`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`);
      setClockDate(`${days[n.getDay()]}, ${months[n.getMonth()]} ${n.getDate()} ${n.getFullYear()}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Close drawer on outside click — but NOT when clicking the hamburger itself */
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => {
      const clickedHamburger = hamburgerRef.current && hamburgerRef.current.contains(e.target);
      const clickedDrawer    = drawerRef.current    && drawerRef.current.contains(e.target);
      if (!clickedHamburger && !clickedDrawer) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [drawerOpen]);

  const handleSelect = (id) => {
    setDrawerOpen(false);
    if (id === "calendar") {
      setShowCalendar(true);
      return;
    }
    onSelectSection(id);
  };

  return (
    <div className={`menu-screen${visible ? " visible" : ""}`}>

      {/* ── Events Calendar Modal ── */}
      {showCalendar && (
        <EventsCalendarModal onClose={() => setShowCalendar(false)} />
      )}

      {/* ══ FULL-WIDTH LAYOUT: topbar + content ══ */}
      <div className={`mnav-layout${drawerOpen ? " drawer-open" : ""}`}>

        {/* ── TOPBAR: ☰ | Clock | ANNOUNCEMENT ticker ── */}
        <div className="mnav-topbar">
          <div ref={inactBarRef} className="inact-bar-menu" />

          {/* Hamburger */}
          <button
            ref={hamburgerRef}
            className={`mnav-hamburger${drawerOpen ? " open" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setDrawerOpen(o => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" width="32" height="32">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="mnav-topbar-sep" />

          {/* Clock */}
          <div className="mnav-topbar-clock">
            <div className="mnav-clock-time">{clockTime}</div>
            <div className="mnav-clock-date">{clockDate}</div>
          </div>

          {/* Announcement ticker — fills remaining space */}
          <div className="mnav-topbar-ticker">
            <div className="mnav-ticker-badge">
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                <path d="M18 3a1 1 0 0 0-1 .26L9.54 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.57l1.24 3.38A1 1 0 0 0 7.75 19H9a1 1 0 0 0 .94-.66L11.35 15H11l-.01-.01L17 18.74A1 1 0 0 0 18 19a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-8.5 12H8.3l-1.1-3H10l.1.28zM17 17l-6.5-3.5v-5L17 5v12z"/>
                <path d="M20.5 8.5a1 1 0 0 0 0 7 4 4 0 0 0 0-7z"/>
              </svg>
              <span>ANNOUNCEMENT</span>
            </div>
            <div className="mnav-ticker-track">
              <div className="mnav-ticker-inner">
                <span>{announcement}</span>
                <span className="mnav-ticker-sep">◆</span>
                <span>{announcement}</span>
                <span className="mnav-ticker-sep">◆</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ROW: drawer + cards side by side ── */}
        <div className="mnav-content">

          {/* Drawer — inside content row, pushes cards */}
          <div ref={drawerRef} className={`mnav-drawer${drawerOpen ? " open" : ""}`}>

           

            <div className="mnav-drawer-divider" />

            {/* Drawer nav */}
            <nav className="mnav-drawer-nav">
              {NAV_GROUPS.map(group => (
                <div key={group.id} className="mnav-group">
                  <div className="mnav-group-header" style={{ "--grp-color": group.color }}>
                    <span className="mnav-group-dot" />
                    <span className="mnav-group-title">{group.label}</span>
                  </div>
                  <div className="mnav-group-items">
                    {group.items.map(item => (
                      <NavItem key={item.id} {...item} onClick={handleSelect} />
                    ))}
                  </div>
                </div>
              ))}

              <div className="mnav-divider mnav-divider-sm" />

              {NAV_STANDALONE.map(item => (
                <NavItem key={item.id} {...item} onClick={handleSelect} />
              ))}
            </nav>

           
          </div>

          {/* Cards area */}
          <div className="mnav-cards-area">
          <div className="mnav-grid">
            {GRID_CARDS.map((card, i) => (
              <div
                key={card.id}
                className={`mnav-card${card.span === "full" ? " mnav-card--full" : ""}`}
                style={{ "--card-color": card.color, animationDelay: `${i * 0.08}s` }}
                onClick={() => onSelectSection(card.id)}
              >
                <div className="mnav-card-stripe" />
                <div className="mnav-card-main">
                  <div className="mnav-card-label">{card.label}</div>
                </div>
                <div className="mnav-card-sub">
                  <div className="mnav-card-desc">{card.desc}</div>
                </div>
              </div>
            ))}
          </div>
          </div>

        </div>

      </div>
    </div>
  );
}
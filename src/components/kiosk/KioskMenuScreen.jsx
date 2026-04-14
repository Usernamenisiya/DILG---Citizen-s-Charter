import { Fragment, useEffect, useRef, useState } from "react";
import dilgIcon from "../../Dilg.svg";
import lgrrcLogo from "../../lgrrc_logo.jpg";
import rictuLogo from "../../assets/images/RICTU_LOGO.png";
import istmsLogo from "../../assets/images/ISTMS-LOGO.png";
import csuLogo from "../../assets/images/CSU_LOGO.png";
import EventsCalendarModal from "./modals/event_calendar_modal";
import KeyOfficialsModal from "./modals/key_officials_modal";
import {
  CalendarDays,
  Megaphone,
  Award,
  PhoneCall,
  Briefcase,
  Globe,
  MessageSquareMore,
  ScrollText,
  LayoutGrid,
  Menu,
} from "lucide-react";


const DEFAULT_ANNOUNCEMENT =
  "Welcome to the DILG Citizens Charter Kiosk. We are committed to providing fast, efficient, and courteous public service.";

const MIN_SINGLE_BANNER_REPEAT = 4;

/* ─── Icons ─── */
const ICONS = {
  calendar:      <CalendarDays      size={32} strokeWidth={2} />,
  announcement:  <Megaphone         size={32} strokeWidth={2} />,
  profile:       <Award             size={32} strokeWidth={2} />,
  offices:       <PhoneCall         size={32} strokeWidth={2} />,
  Programs:      <LayoutGrid        size={32} strokeWidth={2} />,
  internal:      <Briefcase         size={32} strokeWidth={2} />,
  external:      <Globe             size={32} strokeWidth={2} />,
  feedback:      <MessageSquareMore size={32} strokeWidth={2} />,
  issuances:     <ScrollText        size={32} strokeWidth={2} />,
  keyOfficials:  <Award             size={32} strokeWidth={2} />,
};

const NAV_GROUPS = [
  {
    id: "employees",
    label: "DILG Employees Corner",
    color: "#002C76",
    items: [
      { id: "calendar",     label: "Calendar",     color: "#FFDE15" },
      { id: "announcement", label: "Announcement", color: "#FFDE15" },
    ],
  },
];

const NAV_STANDALONE = [
  { id: "profile",      label: "Mission, Vision & Mandate", color: "#FFDE15" },
  { id: "offices",      label: "Contact Us",                color: "#FFDE15" },
  { id: "Programs",     label: "LGUSS",                     color: "#FFDE15" },
  { id: "keyOfficials", label: "Key Officials",             color: "#FFDE15" },
];

const GRID_CARDS = [
  {
    id: "internal",
    label: "Internal Services",
    desc: "For DILG personnel",
    color: "#002C76",
    span: "full",
  },
  {
    id: "external",
    label: "External Services",
    desc: "For citizens and partner clients",
    color: "#C9282D",
    span: "full",
  },
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

export default function KioskMenuScreen({ visible, settings, announcements = [], calendarEvents, onSelectSection, inactBarRef, onUserActivity, onLgrrcLogoClick }) {
  const [clockTime, setClockTime]             = useState("");
  const [clockDate, setClockDate]             = useState("");
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [showCalendar, setShowCalendar]       = useState(false);
  const [showKeyOfficials, setShowKeyOfficials] = useState(false); // ← FIXED
  const drawerRef    = useRef(null);
  const hamburgerRef = useRef(null);

  const tickerItems = (announcements || [])
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
  const fallbackAnnouncement = String(settings.announcement || "").trim() || DEFAULT_ANNOUNCEMENT;
  const sourceItems = tickerItems.length ? tickerItems : [fallbackAnnouncement];
  const isSingleAnnouncement = sourceItems.length === 1;
  const bannerItems = isSingleAnnouncement
    ? Array.from({ length: MIN_SINGLE_BANNER_REPEAT }, () => sourceItems[0])
    : [...sourceItems, ...sourceItems];
  const bannerAnimationDuration = isSingleAnnouncement ? "34s" : "25s";

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
    if (id === "keyOfficials") { // ← FIXED
      setShowKeyOfficials(true);
      return;
    }
    onSelectSection(id);
  };

  return (
    <div className={`menu-screen${visible ? " visible" : ""}`}>

      {/* ── Events Calendar Modal ── */}
      {showCalendar && (
        <EventsCalendarModal onClose={() => setShowCalendar(false)} events={calendarEvents} onInteract={onUserActivity} />
      )}

      {/* ── Key Officials Modal ── */}
      {showKeyOfficials && ( // ← FIXED
        <KeyOfficialsModal onClose={() => setShowKeyOfficials(false)} onInteract={onUserActivity} />
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
            <Menu size={32} strokeWidth={2.5} />
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
              <div
                className="mnav-ticker-inner"
                aria-label="Announcements banner"
                style={{ animationDuration: bannerAnimationDuration }}
              >
                {bannerItems.map((item, index) => (
                  <Fragment key={`${item}-${index}`}>
                    <span>{item}</span>
                    <span className="mnav-ticker-sep">◆</span>
                  </Fragment>
                ))}
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
            <div className="main-page-title">
              <h1>Citizen's Charter</h1>
            </div>
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

      <div className="idle-footer idle-footer--menu">
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

        <div className="idle-footer-right">
          <div className="idle-footer-powered-by">
            <div className="idle-footer-powered-text">Powered by</div>
            <div className="idle-footer-logos-group">
              <img src={rictuLogo} alt="RICTU Logo" className="idle-footer-rictu-logo" />
              <img src={istmsLogo} alt="ISTMS Logo" className="idle-footer-istms-logo idle-footer-istms-logo--menu" />
              <img src={csuLogo} alt="CSU Logo" className="idle-footer-csu-logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./style/KioskApp.css";
import AdminAccessOverlay from "./components/admin/AdminAccessOverlay";
import KioskIdleScreen from "./components/kiosk/KioskIdleScreen";
import KioskMenuScreen from "./components/kiosk/KioskMenuScreen";
import KioskMainScreen from "./components/kiosk/KioskMainScreen";
import KioskCalendarPage from "./components/kiosk/KioskCalendarPage";
import { getElectronApiBaseUrl } from "./utils/resolveMediaUrl";

// ── Extracted modal components ──
import ProfileModal from "./components/kiosk/modals/mmv_modal";
import OfficesModal from "./components/kiosk/modals/list_of_offices_modal";

function createEmptyAppData() {
  return {
    version: 1,
    lastUpdated: "",
    settings: {
      kioskTitle: "",
      office: "",
      address: "",
      tagline: "",
      hours: "",
      idleVideoUrl: "",
      perPage: 9,
      resetTimer: 60,
      superAdminPin: "0000",
      adminPin: "1111",
      updateUrl: "",
      autoCheckUpdates: false,
    },
    feedbackAndComplaints: null,
    officeDirectory: null,
    organizationalProfile: null,
    policiesAndIssuances: null,
    keyOfficials: null,
    calendarEvents: [],
    announcements: [],
    programs: [],
    services: [],
    externalServices: [],
  };
}


/* ══════════════════════════════════════════════════════
   ROOT-LEVEL MODAL (feedback · issuances · announcement)
   ══════════════════════════════════════════════════════ */
function KioskModal({
  section,
  feedbackAndComplaints,
  policiesAndIssuances,
  announcements,
  onClose,
}) {
  if (!section) return null;

  const isFeedback     = section === "feedback";
  const isIssuances    = section === "issuances";
  const isAnnouncement = section === "announcement";

  const modalTitle = isFeedback
    ? (feedbackAndComplaints?.title  || "Feedback and Complaints Mechanism")
    : isIssuances
      ? (policiesAndIssuances?.title || "Policies and Issuances")
      : "Announcements";

  return (
    <div className="kmodal-backdrop" onClick={onClose}>
      <div
        className="kmodal-box kmodal-box--large"
        style={{ "--modal-color": "#002C76" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="kmodal-header">
          <div className="kmodal-header-stripe" />
          <div className="kmodal-title">{modalTitle}</div>
          <button className="kmodal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="kmodal-body">

          {/* FEEDBACK */}
          {isFeedback && !!feedbackAndComplaints && (
            <div className="feedback-panel" style={{ marginTop: 0 }}>
              <div className="feedback-panel-head">
                <h3>{feedbackAndComplaints.title || "Feedback and Complaints Mechanism"}</h3>
                <div className="feedback-contact">
                  <span>Email: {feedbackAndComplaints.contact?.email || "N/A"}</span>
                  <span>Tel: {feedbackAndComplaints.contact?.telephone || "N/A"}</span>
                </div>
              </div>
              <div className="feedback-grid">
                {(feedbackAndComplaints.sections || []).map((sectionItem, idx) => (
                  <div key={idx} className="feedback-item">
                    <h4>{sectionItem.heading}</h4>
                    {(sectionItem.paragraphs || []).map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                    {!!sectionItem.items?.length && (
                      <ul>
                        {sectionItem.items.map((item, iIdx) => (
                          <li key={iIdx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ISSUANCES */}
          {isIssuances && !!policiesAndIssuances && (
            <div className="issuance-panel" style={{ marginTop: 0 }}>
              <div className="issuance-panel-head">
                <h3>{policiesAndIssuances.title || "Policies and Issuances"}</h3>
                <span>{policiesAndIssuances.subtitle || "Compliance references and deadlines"}</span>
              </div>
              <div className="issuance-list">
                {(policiesAndIssuances.items || []).map(item => (
                  <div key={item.id} className="issuance-item">
                    <div className="issuance-item-head">
                      <h4>{item.circularNo || item.title || "Issuance"}</h4>
                      {!!item.date && <span>{item.date}</span>}
                    </div>
                    {!!item.subject && <p className="issuance-subject">{item.subject}</p>}
                    <div className="issuance-meta">
                      {!!item.coverage          && <div><strong>Coverage:</strong> {item.coverage}</div>}
                      {!!item.effectivity       && <div><strong>Effectivity:</strong> {item.effectivity}</div>}
                      {!!item.supersedes        && <div><strong>Supersedes:</strong> {item.supersedes}</div>}
                      {!!item.approvingAuthority && <div><strong>Approving Authority:</strong> {item.approvingAuthority}</div>}
                    </div>
                    {!!item.highlights?.length && (
                      <ul className="issuance-highlights">
                        {item.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                    {!!item.deadlines?.length && (
                      <div className="issuance-deadlines">
                        {item.deadlines.map((deadline, index) => (
                          <div key={index} className="issuance-deadline-chip">
                            <span>{deadline.dueDate}</span>
                            <strong>{deadline.label}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {isAnnouncement && (
            <div className="announcement-panel" style={{ marginTop: 0 }}>
              <div className="issuance-panel-head">
                <h3>Announcements</h3>
                <span>Latest announcements from the administrator</span>
              </div>
              <div className="announcement-list">
                {(announcements || []).length ? (
                  (announcements || []).map((item, idx) => (
                    <div key={item.id || idx} className="announcement-item">
                      <div className="announcement-item-number">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="announcement-item-text">{item.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="announcement-empty">No announcements available.</div>
                )}
              </div>
            </div>
          )}

        </div>
        {/* ── Footer ── */}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════ */
export default function KioskApp() {
  const [appData, setAppData]               = useState(() => createEmptyAppData());
  const [screen, setScreen]                 = useState("idle");
  const [activeSection, setActiveSection]   = useState(null);
  const [idleHiding, setIdleHiding]         = useState(false);
  const [currentPage, setCurrentPage]       = useState(0);
  const [currentService, setCurrentService] = useState(null);
  const [serviceSearch, setServiceSearch]   = useState("");
  const [showAdmin, setShowAdmin]           = useState(false);
  const [clockTime, setClockTime]           = useState("");
  const [clockDate, setClockDate]           = useState("");
  const [logoTaps, setLogoTaps]             = useState(0);
  const [lgrrcLogoTaps, setLgrrcLogoTaps]   = useState(0);
  const [showCalendarPage, setShowCalendarPage] = useState(false);

  // "profile" | "offices" | "feedback" | "issuances" | null
  const [modalSection, setModalSection] = useState(null);
  const [mainScreenModalOpen, setMainScreenModalOpen] = useState(false);

  const logoTimerRef  = useRef(null);
  const lgrrcLogoTimerRef = useRef(null);
  const inactTimerRef = useRef(null);
  const inactBarRef   = useRef(null);

  const s = appData.settings;

  const handleDataChange = useCallback(newData => {
    setAppData(newData);
  }, []);

  const loadAllData = useCallback(() => {
    fetch("/api/settings")
      .then(r => { if (!r.ok) throw new Error(`settings ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, settings: { ...p.settings, ...data } })))
      .catch(err => console.error("Settings API load failed:", err));

    fetch("/api/services/internal")
      .then(r => { if (!r.ok) throw new Error(`internal ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, services: data })));

    fetch("/api/services/external")
      .then(r => { if (!r.ok) throw new Error(`external ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, externalServices: data })));

    fetch("/api/issuances")
      .then(r => { if (!r.ok) throw new Error(`issuances ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, policiesAndIssuances: { ...p.policiesAndIssuances, items: data } })));

    fetch("/api/issuances/meta")
      .then(r => { if (!r.ok) throw new Error(`issuances/meta ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({
        ...p,
        policiesAndIssuances: {
          ...p.policiesAndIssuances,
          title: data.title || p.policiesAndIssuances?.title,
          subtitle: data.subtitle || p.policiesAndIssuances?.subtitle,
        },
      })));

    fetch("/api/feedback")
      .then(r => { if (!r.ok) throw new Error(`feedback ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, feedbackAndComplaints: data })))
      .catch(err => console.error("Feedback API load failed:", err));

    fetch("/api/calendar-events")
      .then(r => { if (!r.ok) throw new Error(`calendar-events ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, calendarEvents: Array.isArray(data) ? data : [] })))
      .catch(err => console.error("Calendar events API load failed:", err));

    fetch("/api/offices")
      .then(r => { if (!r.ok) throw new Error(`offices ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, officeDirectory: data })));


    fetch("/api/key-officials")
      .then(r => { if (!r.ok) throw new Error(`key-officials ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, keyOfficials: data })))
      .catch(err => console.error("Key officials API load failed:", err));
    fetch("/api/profile")
      .then(r => { if (!r.ok) throw new Error(`profile ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, organizationalProfile: data })));

    fetch("/api/announcements")
      .then(r => { if (!r.ok) throw new Error(`announcements ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, announcements: data })))
      .catch(err => console.error("API load failed:", err));

    fetch("/api/programs")
      .then(r => { if (!r.ok) throw new Error(`programs ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, programs: data })))
      .catch(err => console.error("Programs API load failed:", err));
  }, []);

  /* ── Clock ── */
  useEffect(() => {
    const tick = () => {
      const n      = new Date();
      const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      setClockTime(`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`);
      setClockDate(`${days[n.getDay()]}, ${months[n.getMonth()]} ${n.getDate()} ${n.getFullYear()}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── API fetches ── */
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const socketBaseUrl = getElectronApiBaseUrl() || undefined;

    const socket = io(socketBaseUrl, {
      transports: import.meta.env.DEV ? ["polling"] : ["websocket", "polling"],
    });

    socket.on("kiosk:data-changed", () => {
      loadAllData();
    });

    socket.on("announcements:changed", payload => {
      if (Array.isArray(payload?.announcements)) {
        setAppData(previous => ({
          ...previous,
          announcements: payload.announcements,
        }));
      }
    });

    return () => {
      socket.off("kiosk:data-changed");
      socket.off("announcements:changed");
      socket.disconnect();
    };
  }, [loadAllData]);

  /* ── Inactivity timer ── */
  const startInactivity = useCallback(() => {
    clearTimeout(inactTimerRef.current);
    const bar = inactBarRef.current;
    if (!bar) return;
    const t = (s.resetTimer || 60) * 1000;
    bar.style.transition = "none";
    bar.style.transform  = "scaleX(1)";
    void bar.offsetWidth;
    bar.style.transition = `transform ${t / 1000}s linear`;
    bar.style.transform  = "scaleX(0)";
    inactTimerRef.current = setTimeout(() => {
      setScreen("idle");
      setCurrentPage(0);
      setCurrentService(null);
      setModalSection(null);
    }, t);
  }, [s.resetTimer]);

  const clearInactivity = useCallback(() => {
    clearTimeout(inactTimerRef.current);
    const bar = inactBarRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.transform  = "scaleX(1)";
  }, []);

  useEffect(() => {
    if (screen === "main" || screen === "menu") startInactivity();
    else clearInactivity();
  }, [screen, startInactivity, clearInactivity]);

  /* ── Pause inactivity timer when modal or admin overlay is open ── */
  useEffect(() => {
    if (modalSection !== null || showAdmin || mainScreenModalOpen || showCalendarPage) {
      clearInactivity();
    } else if (screen === "main" || screen === "menu") {
      startInactivity();
    }
  }, [modalSection, showAdmin, mainScreenModalOpen, showCalendarPage, screen, startInactivity, clearInactivity]);

  const handleUserAction = useCallback(() => {
    if (screen === "main" || screen === "menu") startInactivity();
  }, [screen, startInactivity]);

  /* ── Navigation helpers ── */
  const showMain = () => {
    setIdleHiding(true);
    setTimeout(() => {
      setScreen("menu");
      setIdleHiding(false);
    }, 600);
  };

  /**
   * Intercept sidebar nav items → open the matching modal.
   * Service grid cards (internal / external) → go to main screen.
   */
  const selectSection = (sectionId) => {
    const MODAL_SECTIONS = ["profile", "offices", "feedback", "issuances"];
    if (MODAL_SECTIONS.includes(sectionId)) {
      setServiceSearch("");
      setModalSection(sectionId);
      return;
    }
    setServiceSearch("");
    setActiveSection(sectionId);
    setScreen("main");
    setCurrentPage(0);
    setCurrentService(null);
  };

  const closeModal = () => setModalSection(null);

  const returnToMenu = () => {
    setScreen("menu");
    setActiveSection(null);
    setCurrentPage(0);
    setCurrentService(null);
  };

  const closeCalendarPage = () => {
    setShowCalendarPage(false);
  };

  /* ── Derived data ── */
  const SERVICES_PER_PAGE      = Math.max(9, Number(s.perPage) || 9);
  const services               = appData.services               || [];
  const externalServices       = appData.externalServices       || [];
  const feedbackAndComplaints  = appData.feedbackAndComplaints  || { title: "", contact: { email: "", telephone: "" }, sections: [] };
  const officeDirectory        = appData.officeDirectory        || { title: "", region: "", entries: [] };
  const organizationalProfile  = appData.organizationalProfile  || {
    title: "",
    mandate: "",
    mission: "",
    vision: "",
    servicePledge: {
      intro: "",
      serviceCommitment: "",
      pbest: [],
      officeHoursCommitment: "",
      closing: "",
    },
  };
  const policiesAndIssuances   = appData.policiesAndIssuances   || { title: "", subtitle: "", items: [] };
  const announcements          = appData.announcements          || [];
  const programs               = appData.programs               || [];

  const servicesForSection = activeSection === "external" ? externalServices : services;
  const serviceSearchQuery = serviceSearch.trim().toLowerCase();
  const filteredServicesForSection = serviceSearchQuery
    ? servicesForSection.filter(service => {
        const searchBlob = [
          service.label,
          service.classification,
          service.office,
          service.desc,
          service.who,
          service.fees,
          service.processingTime,
        ]
          .map(value => String(value || "").toLowerCase())
          .join(" ");
        return searchBlob.includes(serviceSearchQuery);
      })
    : servicesForSection;
  const totalPages         = Math.max(1, Math.ceil(filteredServicesForSection.length / SERVICES_PER_PAGE));
  const pageServices       = filteredServicesForSection.slice(
    currentPage * SERVICES_PER_PAGE,
    (currentPage + 1) * SERVICES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [activeSection, serviceSearch]);

  /* ── Secret admin tap ── */
  const handleLogoClick = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    clearTimeout(logoTimerRef.current);
    if (next >= 5) {
      setLogoTaps(0);
      setShowAdmin(true);
    } else {
      logoTimerRef.current = setTimeout(() => setLogoTaps(0), 4000);
    }
  };

  const handleLgrrcLogoClick = () => {
    const next = lgrrcLogoTaps + 1;
    setLgrrcLogoTaps(next);
    clearTimeout(lgrrcLogoTimerRef.current);

    if (next >= 4) {
      setLgrrcLogoTaps(0);

      try {
        window.open("", "_self");
        window.close();
      } catch {
        // Ignore close errors. App environments handle this action.
      }
    } else {
      lgrrcLogoTimerRef.current = setTimeout(() => setLgrrcLogoTaps(0), 4000);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(logoTimerRef.current);
      clearTimeout(lgrrcLogoTimerRef.current);
    };
  }, []);

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div className="kiosk-root" onClick={handleUserAction} onTouchStart={handleUserAction} onKeyDownCapture={handleUserAction}>

      {/* ── Idle screen ── */}
      {(screen === "idle" || idleHiding) && (
        <KioskIdleScreen
          hiding={idleHiding}
          settings={s}
          announcements={announcements}
          programs={programs}
          onLgrrcLogoClick={handleLgrrcLogoClick}
          onShowMain={showMain}
        />
      )}

      {/* ── Menu screen ── */}
      {screen === "menu" && (
        <KioskMenuScreen
          visible={screen === "menu" && !showCalendarPage}
          settings={s}
          announcements={announcements}
          calendarEvents={appData.calendarEvents}
          onLgrrcLogoClick={handleLgrrcLogoClick}
          onSelectSection={selectSection}
          onShowCalendar={() => setShowCalendarPage(true)}
          inactBarRef={inactBarRef}
          onUserActivity={handleUserAction}
        />
      )}

      {/* ── Calendar Page ── */}
      {showCalendarPage && (
        <KioskCalendarPage
          visible={showCalendarPage}
          settings={s}
          announcements={announcements}
          calendarEvents={appData.calendarEvents}
          onBackToMenu={closeCalendarPage}
          onLgrrcLogoClick={handleLgrrcLogoClick}
        />
      )}

      {/* ── Main / services screen ── */}
      {screen === "main" && (
        <KioskMainScreen
          visible={screen === "main"}
          settings={s}
          feedbackAndComplaints={feedbackAndComplaints}
          officeDirectory={officeDirectory}
          organizationalProfile={organizationalProfile}
          policiesAndIssuances={policiesAndIssuances}
          announcements={announcements}
          programs={programs}
          currentService={currentService}
          setCurrentService={setCurrentService}
          pageServices={pageServices}
          currentPage={currentPage}
          totalPages={totalPages}
          servicesLength={filteredServicesForSection.length}
          perPage={SERVICES_PER_PAGE}
          onPrevPage={() => setCurrentPage(p => p - 1)}
          onNextPage={() => setCurrentPage(p => p + 1)}
          clockTime={clockTime}
          clockDate={clockDate}
          onLogoClick={handleLogoClick}
          onLgrrcLogoClick={handleLgrrcLogoClick}
          inactBarRef={inactBarRef}
          activeSection={activeSection}
          onReturnToMenu={returnToMenu}
          onModalStateChange={setMainScreenModalOpen}
          serviceSearch={serviceSearch}
          onServiceSearchChange={setServiceSearch}
        />
      )}

      {/* ══ MODALS — overlay any screen ══ */}

      {/* Profile → mmv_modal.jsx */}
      {modalSection === "profile" && (
        <ProfileModal
          organizationalProfile={organizationalProfile}
          onClose={closeModal}
        />
      )}

      {/* Offices → list_of_offices_modal.jsx */}
      {modalSection === "offices" && (
        <OfficesModal
          officeDirectory={officeDirectory}
          onClose={closeModal}
        />
      )}

      {/* Feedback · Issuances → inline KioskModal */}
      {(modalSection === "feedback" ||
        modalSection === "issuances") && !showCalendarPage && (
        <KioskModal
          section={modalSection}
          feedbackAndComplaints={feedbackAndComplaints}
          policiesAndIssuances={policiesAndIssuances}
          announcements={announcements}
          onClose={closeModal}
        />
      )}

      {/* ── Admin overlay ── */}
      {showAdmin && !showCalendarPage && (
        <AdminAccessOverlay
          appData={appData}
          onDataChange={handleDataChange}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from "react";
import "./style/KioskApp.css";
import { KIOSK_DEFAULT_DATA } from "./data/kioskDefaultData";
import { loadData, saveData } from "./utils/kioskStorage";
import AdminAccessOverlay from "./components/admin/AdminAccessOverlay";
import KioskIdleScreen from "./components/kiosk/KioskIdleScreen";
import KioskMenuScreen from "./components/kiosk/KioskMenuScreen";
import KioskMainScreen from "./components/kiosk/KioskMainScreen";

// ── Extracted modal components ──
import ProfileModal from "./components/kiosk/modals/mmv_modal";
import OfficesModal from "./components/kiosk/modals/list_of_offices_modal";


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
  const [appData, setAppData]               = useState(() => loadData(KIOSK_DEFAULT_DATA));
  const [screen, setScreen]                 = useState("idle");
  const [activeSection, setActiveSection]   = useState(null);
  const [idleHiding, setIdleHiding]         = useState(false);
  const [currentPage, setCurrentPage]       = useState(0);
  const [currentService, setCurrentService] = useState(null);
  const [showAdmin, setShowAdmin]           = useState(false);
  const [clockTime, setClockTime]           = useState("");
  const [clockDate, setClockDate]           = useState("");
  const [logoTaps, setLogoTaps]             = useState(0);

  // "profile" | "offices" | "feedback" | "issuances" | null
  const [modalSection, setModalSection] = useState(null);

  const logoTimerRef  = useRef(null);
  const inactTimerRef = useRef(null);
  const inactBarRef   = useRef(null);

  const s = appData.settings;

  useEffect(() => {
    const hasSuperAdminPin = typeof appData.settings?.superAdminPin === "string" && appData.settings.superAdminPin.length === 4;
    const hasAdminPin = typeof appData.settings?.adminPin === "string" && appData.settings.adminPin.length === 4;
    const shouldNormalizeAdmin = !hasAdminPin || appData.settings.adminPin === "0000";

    if (!hasSuperAdminPin || shouldNormalizeAdmin) {
      setAppData(prev => {
        const next = {
          ...prev,
          settings: {
            ...prev.settings,
            superAdminPin: hasSuperAdminPin ? prev.settings.superAdminPin : "0000",
            adminPin: shouldNormalizeAdmin ? "1111" : prev.settings.adminPin,
          },
        };
        saveData(next);
        return next;
      });
    }
  }, [appData.settings]);

  const handleDataChange = useCallback(newData => {
    setAppData(newData);
    saveData(newData);
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
    fetch("/api/settings")
      .then(r => { if (!r.ok) throw new Error(`settings ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, settings: { ...p.settings, ...data } })));

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
          title:    data.title    || p.policiesAndIssuances?.title,
          subtitle: data.subtitle || p.policiesAndIssuances?.subtitle,
        },
      })));

    fetch("/api/feedback")
      .then(r => { if (!r.ok) throw new Error(`feedback ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, feedbackAndComplaints: data })));

    fetch("/api/offices")
      .then(r => { if (!r.ok) throw new Error(`offices ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, officeDirectory: data })));

    fetch("/api/profile")
      .then(r => { if (!r.ok) throw new Error(`profile ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, organizationalProfile: data })));

    fetch("/api/announcements")
      .then(r => { if (!r.ok) throw new Error(`announcements ${r.status}`); return r.json(); })
      .then(data => setAppData(p => ({ ...p, announcements: data })))
      .catch(err => console.error("API load failed:", err));
  }, []);

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
      setModalSection(sectionId);
      return;
    }
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

  /* ── Derived data ── */
  const SERVICES_PER_PAGE      = Math.max(9, Number(s.perPage) || 9);
  const services               = appData.services               || [];
  const externalServices       = appData.externalServices       || KIOSK_DEFAULT_DATA.externalServices || [];
  const feedbackAndComplaints  = appData.feedbackAndComplaints  || KIOSK_DEFAULT_DATA.feedbackAndComplaints;
  const officeDirectory        = appData.officeDirectory        || KIOSK_DEFAULT_DATA.officeDirectory;
  const organizationalProfile  = appData.organizationalProfile  || KIOSK_DEFAULT_DATA.organizationalProfile;
  const policiesAndIssuances   = appData.policiesAndIssuances   || KIOSK_DEFAULT_DATA.policiesAndIssuances;
  const announcements          = appData.announcements          || [];
  const programs               = appData.programs               || KIOSK_DEFAULT_DATA.programs || [];

  const servicesForSection = activeSection === "external" ? externalServices : services;
  const totalPages         = Math.max(1, Math.ceil(servicesForSection.length / SERVICES_PER_PAGE));
  const pageServices       = servicesForSection.slice(
    currentPage * SERVICES_PER_PAGE,
    (currentPage + 1) * SERVICES_PER_PAGE
  );

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

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div className="kiosk-root" onClick={handleUserAction} onTouchStart={handleUserAction}>

      {/* ── Idle screen ── */}
      {(screen === "idle" || idleHiding) && (
        <KioskIdleScreen
          hiding={idleHiding}
          settings={s}
          announcements={announcements}
          onShowMain={showMain}
        />
      )}

      {/* ── Menu screen ── */}
      {screen === "menu" && (
        <KioskMenuScreen
          visible={screen === "menu"}
          settings={s}
          announcements={announcements}
          calendarEvents={appData.calendarEvents}
          onSelectSection={selectSection}
          inactBarRef={inactBarRef}
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
          servicesLength={servicesForSection.length}
          perPage={SERVICES_PER_PAGE}
          onPrevPage={() => setCurrentPage(p => p - 1)}
          onNextPage={() => setCurrentPage(p => p + 1)}
          clockTime={clockTime}
          clockDate={clockDate}
          onLogoClick={handleLogoClick}
          inactBarRef={inactBarRef}
          activeSection={activeSection}
          onReturnToMenu={returnToMenu}
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
        modalSection === "issuances") && (
        <KioskModal
          section={modalSection}
          feedbackAndComplaints={feedbackAndComplaints}
          policiesAndIssuances={policiesAndIssuances}
          announcements={announcements}
          onClose={closeModal}
        />
      )}

      {/* ── Admin overlay ── */}
      {showAdmin && (
        <AdminAccessOverlay
          appData={appData}
          onDataChange={handleDataChange}
          onClose={() => setShowAdmin(false)}
          defaultData={KIOSK_DEFAULT_DATA}
        />
      )}
    </div>
  );
}
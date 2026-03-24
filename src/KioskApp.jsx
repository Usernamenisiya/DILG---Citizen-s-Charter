import { useCallback, useEffect, useRef, useState } from "react";
import "./KioskApp.css";
import { KIOSK_DEFAULT_DATA } from "./data/kioskDefaultData";
import { loadData, saveData } from "./utils/kioskStorage";
import AdminAccessOverlay from "./components/admin/AdminAccessOverlay";
import KioskIdleScreen from "./components/kiosk/KioskIdleScreen";
import KioskMenuScreen from "./components/kiosk/KioskMenuScreen";
import KioskMainScreen from "./components/kiosk/KioskMainScreen";

/* ── helper: parse contact string ── */
function parseOfficeContact(rawContact) {
  const text = String(rawContact || "").trim();
  if (!text) return { mainLine: "", extension: "", raw: "" };
  const match = text.match(/^(.*?)(?:\s*(?:,|-)?\s*loc\.?\s*[:.]?\s*([A-Za-z0-9-]+))$/i);
  if (!match) return { mainLine: text, extension: "", raw: text };
  return {
    mainLine: String(match[1] || "").trim().replace(/[\s,.-]+$/, ""),
    extension: String(match[2] || "").trim(),
    raw: text,
  };
}

const DILG_COLORS = ["#002C76", "#C9282D", "#FFDE15"];

/* ══════════════════════════════════════════════════════
   ROOT-LEVEL MODAL
   ══════════════════════════════════════════════════════ */
function KioskModal({ section, organizationalProfile, officeDirectory, onClose }) {
  if (!section) return null;

  const isProfile = section === "profile";
  const headerColor = "#002C76";

  return (
    <div className="kmodal-backdrop" onClick={onClose}>
      <div
        className="kmodal-box kmodal-box--large"
        style={{ "--modal-color": headerColor }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="kmodal-header">
          <div className="kmodal-header-stripe" />
          <div className="kmodal-title">
            {isProfile
              ? (organizationalProfile?.title || "Mandate, Mission, Vision & Service Pledge")
              : (officeDirectory?.title || "List of Offices")}
          </div>
          <button className="kmodal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="kmodal-body">

          {/* PROFILE */}
          {isProfile && !!organizationalProfile && (
            <div className="kmodal-pv2-grid">

              <div className="kmodal-pv2-card" style={{ "--pvc": "#002C76" }}>
                <div className="kmodal-pv2-stripe" />
                <div className="kmodal-pv2-inner">
                  <div className="kmodal-pv2-heading">Mandate</div>
                  <p className="kmodal-pv2-text">{organizationalProfile.mandate}</p>
                </div>
              </div>

              <div className="kmodal-pv2-card" style={{ "--pvc": "#C9282D" }}>
                <div className="kmodal-pv2-stripe" />
                <div className="kmodal-pv2-inner">
                  <div className="kmodal-pv2-heading">Mission</div>
                  <p className="kmodal-pv2-text">{organizationalProfile.mission}</p>
                </div>
              </div>

              <div className="kmodal-pv2-card kmodal-pv2-card--wide kmodal-pv2-card--gold" style={{ "--pvc": "#FFDE15" }}>
                <div className="kmodal-pv2-stripe" />
                <div className="kmodal-pv2-inner">
                  <div className="kmodal-pv2-heading">Vision</div>
                  <p className="kmodal-pv2-text">{organizationalProfile.vision}</p>
                </div>
              </div>

              <div className="kmodal-pv2-card kmodal-pv2-card--wide" style={{ "--pvc": "#002C76" }}>
                <div className="kmodal-pv2-stripe" />
                <div className="kmodal-pv2-inner">
                  <div className="kmodal-pv2-heading">Service Pledge</div>
                  <div className="kmodal-pledge-cols">
                    <div className="kmodal-pledge-left">
                      {!!organizationalProfile.servicePledge?.intro && (
                        <p className="kmodal-pv2-text">{organizationalProfile.servicePledge.intro}</p>
                      )}
                      {!!organizationalProfile.servicePledge?.serviceCommitment && (
                        <p className="kmodal-pv2-text">{organizationalProfile.servicePledge.serviceCommitment}</p>
                      )}
                      {!!organizationalProfile.servicePledge?.officeHoursCommitment && (
                        <p className="kmodal-pv2-text">{organizationalProfile.servicePledge.officeHoursCommitment}</p>
                      )}
                      {!!organizationalProfile.servicePledge?.closing && (
                        <p className="kmodal-pv2-text kmodal-pv2-text--closing">{organizationalProfile.servicePledge.closing}</p>
                      )}
                    </div>
                    {!!organizationalProfile.servicePledge?.pbest?.length && (
                      <div className="kmodal-pbest">
                        <div className="kmodal-pbest-label">PBEST Framework</div>
                        <ul className="kmodal-pbest-list">
                          {organizationalProfile.servicePledge.pbest.map((item, i) => (
                            <li key={i}><span className="kmodal-pbest-dot" />{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* OFFICES */}
          {!isProfile && !!officeDirectory && (
            <div className="kmodal-office-grid">
              {(officeDirectory.entries || []).map((entry, idx) => {
                const contactInfo = parseOfficeContact(entry.contact);
                const color = DILG_COLORS[idx % DILG_COLORS.length];
                const isGold = color === "#FFDE15";
                return (
                  <div key={idx} className={`kmodal-pv2-card${isGold ? " kmodal-pv2-card--gold" : ""}`} style={{ "--pvc": color }}>
                    <div className="kmodal-pv2-stripe" />
                    <div className="kmodal-pv2-inner">
                      <div className="kmodal-pv2-heading kmodal-pv2-heading--office">{entry.office}</div>
                      {!!entry.address && (
                        <div className="kmodal-office-row">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            width="20" height="20" style={{ flexShrink: 0, color: isGold ? "#7a5f00" : color, marginTop: 3 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="kmodal-pv2-text">{entry.address}</span>
                        </div>
                      )}
                      {!!contactInfo.mainLine && (
                        <div className="kmodal-office-row">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            width="20" height="20" style={{ flexShrink: 0, color: isGold ? "#7a5f00" : color, marginTop: 3 }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                          </svg>
                          <div>
                            <div className="kmodal-pv2-text">{contactInfo.mainLine}</div>
                            {!!contactInfo.extension && (
                              <div className="kmodal-pv2-text" style={{ opacity: 0.65 }}>Loc. {contactInfo.extension}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {!contactInfo.mainLine && (
                        <p className="kmodal-pv2-text" style={{ opacity: 0.4 }}>No contact provided</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
  const [appData, setAppData] = useState(() => loadData(KIOSK_DEFAULT_DATA));
  const [screen, setScreen] = useState("idle");
  const [activeSection, setActiveSection] = useState(null);
  const [idleHiding, setIdleHiding] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentService, setCurrentService] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");
  const [logoTaps, setLogoTaps] = useState(0);
  const [modalSection, setModalSection] = useState(null); // "profile" | "offices" | null
  const logoTimerRef = useRef(null);
  const inactTimerRef = useRef(null);
  const inactBarRef = useRef(null);

  const s = appData.settings;

  const handleDataChange = useCallback(newData => {
    setAppData(newData);
    saveData(newData);
  }, []);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setClockTime(String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0"));
      setClockDate(days[n.getDay()] + ", " + months[n.getMonth()] + " " + n.getDate() + " " + n.getFullYear());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => { if (!res.ok) throw new Error(`Failed to load settings (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, settings: { ...p.settings, ...data } })));

    fetch('/api/services/internal')
      .then(res => { if (!res.ok) throw new Error(`Failed to load internal services (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, services: data })));

    fetch('/api/services/external')
      .then(res => { if (!res.ok) throw new Error(`Failed to load external services (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, externalServices: data })));

    fetch('/api/issuances')
      .then(res => { if (!res.ok) throw new Error(`Failed to load issuances (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, policiesAndIssuances: { ...p.policiesAndIssuances, items: data } })))

    fetch('/api/issuances/meta')
      .then(res => { if (!res.ok) throw new Error(`Failed to load issuance metadata (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({
        ...p,
        policiesAndIssuances: {
          ...p.policiesAndIssuances,
          title: data.title || p.policiesAndIssuances?.title,
          subtitle: data.subtitle || p.policiesAndIssuances?.subtitle,
        },
      })));

    fetch('/api/feedback')
      .then(res => { if (!res.ok) throw new Error(`Failed to load feedback (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, feedbackAndComplaints: data })));

    fetch('/api/offices')
      .then(res => { if (!res.ok) throw new Error(`Failed to load offices (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, officeDirectory: data })));

    fetch('/api/profile')
      .then(res => { if (!res.ok) throw new Error(`Failed to load profile (${res.status})`); return res.json(); })
      .then(data => setAppData(p => ({ ...p, organizationalProfile: data })))
      .catch(err => { console.error("API load failed:", err); });
  }, []);

  const startInactivity = useCallback(() => {
    clearTimeout(inactTimerRef.current);
    const bar = inactBarRef.current;
    if (!bar) return;
    const t = (s.resetTimer || 60) * 1000;
    bar.style.transition = "none";
    bar.style.transform = "scaleX(1)";
    void bar.offsetWidth;
    bar.style.transition = `transform ${t / 1000}s linear`;
    bar.style.transform = "scaleX(0)";
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
    bar.style.transform = "scaleX(1)";
  }, []);

  useEffect(() => {
    if (screen === "main" || screen === "menu") startInactivity();
    else clearInactivity();
  }, [screen, startInactivity, clearInactivity]);

  const handleUserAction = useCallback(() => {
    if (screen === "main" || screen === "menu") startInactivity();
  }, [screen, startInactivity]);

  const showMain = () => {
    setIdleHiding(true);
    setTimeout(() => {
      setScreen("menu");
      setIdleHiding(false);
    }, 600);
  };

  /* Intercept profile & offices → modal; everything else → main screen */
  const selectSection = (sectionId) => {
    if (sectionId === "profile" || sectionId === "offices") {
      setModalSection(sectionId);
      return;
    }
    setActiveSection(sectionId);
    setScreen("main");
    setCurrentPage(0);
    setCurrentService(null);
  };

  const returnToMenu = () => {
    setScreen("menu");
    setActiveSection(null);
    setCurrentPage(0);
    setCurrentService(null);
  };

  const returnToIdle = () => {
    setScreen("idle");
    setActiveSection(null);
    setCurrentPage(0);
    setCurrentService(null);
  };

  const SERVICES_PER_PAGE = s.perPage || 8;
  const services = appData.services || [];
  const externalServices = appData.externalServices || KIOSK_DEFAULT_DATA.externalServices || [];
  const feedbackAndComplaints = appData.feedbackAndComplaints || KIOSK_DEFAULT_DATA.feedbackAndComplaints;
  const officeDirectory = appData.officeDirectory || KIOSK_DEFAULT_DATA.officeDirectory;
  const organizationalProfile = appData.organizationalProfile || KIOSK_DEFAULT_DATA.organizationalProfile;
  const policiesAndIssuances = appData.policiesAndIssuances || KIOSK_DEFAULT_DATA.policiesAndIssuances;
  const servicesForSection = activeSection === "external" ? externalServices : services;
  const totalPages = Math.max(1, Math.ceil(servicesForSection.length / SERVICES_PER_PAGE));
  const pageServices = servicesForSection.slice(currentPage * SERVICES_PER_PAGE, (currentPage + 1) * SERVICES_PER_PAGE);

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

  return (
    <div className="kiosk-root" onClick={handleUserAction} onTouchStart={handleUserAction}>
      {(screen === "idle" || idleHiding) && (
        <KioskIdleScreen hiding={idleHiding} settings={s} onShowMain={showMain} />
      )}

      {screen === "menu" && (
        <KioskMenuScreen
          visible={screen === "menu"}
          settings={s}
          onSelectSection={selectSection}
          inactBarRef={inactBarRef}
        />
      )}

      {screen === "main" && (
        <KioskMainScreen
          visible={screen === "main"}
          settings={s}
          feedbackAndComplaints={feedbackAndComplaints}
          officeDirectory={officeDirectory}
          organizationalProfile={organizationalProfile}
          policiesAndIssuances={policiesAndIssuances}
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

      {/* ══ ROOT-LEVEL MODAL — overlays any screen ══ */}
      {!!modalSection && (
        <KioskModal
          section={modalSection}
          organizationalProfile={organizationalProfile}
          officeDirectory={officeDirectory}
          onClose={() => setModalSection(null)}
        />
      )}

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
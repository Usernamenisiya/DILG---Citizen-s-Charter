import { useCallback, useEffect, useRef, useState } from "react";
import "./KioskApp.css";
import { KIOSK_DEFAULT_DATA } from "./data/kioskDefaultData";
import { loadData, saveData } from "./utils/kioskStorage";
import AdminAccessOverlay from "./components/admin/AdminAccessOverlay";
import KioskIdleScreen from "./components/kiosk/KioskIdleScreen";
import KioskMenuScreen from "./components/kiosk/KioskMenuScreen";
import KioskMainScreen from "./components/kiosk/KioskMainScreen";

export default function KioskApp() {
  const [appData, setAppData] = useState(() => loadData(KIOSK_DEFAULT_DATA));
  const [screen, setScreen] = useState("idle");
  const [activeSection, setActiveSection] = useState(null);
  const [idleHiding, setIdleHiding] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentService, setCurrentService] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [queueNum, setQueueNum] = useState("---");
  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");
  const [logoTaps, setLogoTaps] = useState(0);
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

  const selectSection = (sectionId) => {
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

  const SERVICES_PER_PAGE = s.perPage || 6;
  const services = appData.services;
  const externalServices = appData.externalServices || KIOSK_DEFAULT_DATA.externalServices || [];
  const feedbackAndComplaints = appData.feedbackAndComplaints || KIOSK_DEFAULT_DATA.feedbackAndComplaints;
  const officeDirectory = appData.officeDirectory || KIOSK_DEFAULT_DATA.officeDirectory;
  const organizationalProfile = appData.organizationalProfile || KIOSK_DEFAULT_DATA.organizationalProfile;
  const policiesAndIssuances = appData.policiesAndIssuances || KIOSK_DEFAULT_DATA.policiesAndIssuances;
  const servicesForSection = activeSection === "external" ? externalServices : services;
  const totalPages = Math.max(1, Math.ceil(servicesForSection.length / SERVICES_PER_PAGE));
  const pageServices = servicesForSection.slice(currentPage * SERVICES_PER_PAGE, (currentPage + 1) * SERVICES_PER_PAGE);

  const openQueueModal = () => {
    setQueueNum(String(Math.floor(Math.random() * 900) + 100));
    setQueueOpen(true);
    setTimeout(() => setQueueOpen(false), 10000);
  };

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
          onOpenQueueModal={openQueueModal}
          queueOpen={queueOpen}
          queueNum={queueNum}
          onCloseQueueModal={() => setQueueOpen(false)}
          inactBarRef={inactBarRef}
          activeSection={activeSection}
          onReturnToMenu={returnToMenu}
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

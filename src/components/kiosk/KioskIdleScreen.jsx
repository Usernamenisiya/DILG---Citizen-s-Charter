import { useEffect, useMemo, useState } from "react";
import dilgIcon from "../../Dilg.svg";
import touchIcon from "../../assets/icons/touch.svg";
import idleVideo from "../../assets/video/samplevid.mp4";

const DEFAULT_ANNOUNCEMENT =
  "Welcome to the DILG Citizens Charter Kiosk. We are committed to providing fast, efficient, and courteous public service.";

export default function KioskIdleScreen({ hiding, settings, announcements = [], onShowMain }) {
  const tickerItems = useMemo(() => {
    const fromList = (announcements || [])
      .map(a => String(a?.message || "").trim())
      .filter(Boolean);
    if (fromList.length) return fromList;
    const fallback = String(settings.announcement || "").trim();
    return [fallback || DEFAULT_ANNOUNCEMENT];
  }, [announcements, settings.announcement]);

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
  }, [tickerItems]);

  const announcement = tickerItems[announcementIndex] || DEFAULT_ANNOUNCEMENT;

  return (
    <div className={`idle-screen${hiding ? " hiding" : ""}`} onClick={!hiding ? onShowMain : undefined}>

      {/* ── VIDEO BACKGROUND ── */}
      <video
        className="idle-video-bg"
        src={idleVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark overlay so content stays readable */}
      <div className="idle-video-overlay" />
      <div className="idle-pat" />

      {/* ── HEADER: logo + title LEFT · announcement ticker RIGHT ── */}
      <div className="idle-header">
        <div className="idle-header-left">
          <div className="idle-header-logo">
            <img src={dilgIcon} alt="DILG Seal" />
          </div>
          <div className="idle-header-text">
            <div className="idle-header-title">{settings.kioskTitle}</div>
            <div className="idle-header-tagline">{settings.tagline}</div>
            <div className="idle-header-office">{settings.office} | {settings.address}</div>
          </div>
        </div>

        {/* Announcement ticker */}
        <div className="idle-ticker">
          <div className="idle-ticker-badge">
            <svg viewBox="0 0 24 24" fill="white" width="50" height="50">
              <path d="M18 3a1 1 0 0 0-1 .26L9.54 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.57l1.24 3.38A1 1 0 0 0 7.75 19H9a1 1 0 0 0 .94-.66L11.35 15H11l-.01-.01L17 18.74A1 1 0 0 0 18 19a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-8.5 12H8.3l-1.1-3H10l.1.28zM17 17l-6.5-3.5v-5L17 5v12z"/>
              <path d="M20.5 8.5a1 1 0 0 0 0 7 4 4 0 0 0 0-7z"/>
            </svg>
            <span>ANNOUNCEMENT</span>
          </div>
          <div className="idle-ticker-track">
            <div className="idle-ticker-inner">
              <span>{announcement}</span>
              <span className="idle-ticker-sep">◆</span>
              <span>{announcement}</span>
              <span className="idle-ticker-sep">◆</span>
              <span>{announcement}</span>
              <span className="idle-ticker-sep">◆</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAP PROMPT — bottom center, faded ── */}
      <div className="idle-tap">
        <div className="tap-ring">
          <img className="touchIcon" src={touchIcon} alt="Touch icon" />
        </div>
        <div className="tap-label">Pindutin para Magsimula</div>
      </div>

      <div className="idle-footer">
        Department of the Interior and Local Government | Republic of the Philippines | {settings.hours}
      </div>
    </div>
  );
}
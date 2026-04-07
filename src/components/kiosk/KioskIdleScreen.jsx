import { useEffect, useMemo, useState } from "react";
import dilgIcon from "../../Dilg.svg";
import lgrrcLogo from "../../lgrrc_logo.jpg"; 
import rictuLogo from "../../assets/images/RICTU_LOGO.png";
import istmsLogo from "../../assets/images/ISTMS-LOGO.png";
import csuLogo from "../../assets/images/CSU_LOGO.png";
import touchIcon from "../../assets/icons/touch.svg";
import fallbackIdleVideo from "../../assets/video/samplevid.mp4";

const DEFAULT_ANNOUNCEMENT =
  "Welcome to the DILG Citizens Charter Kiosk. We are committed to providing fast, efficient, and courteous public service.";

export default function KioskIdleScreen({ hiding, settings, announcements = [], onShowMain }) {
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
  const officeHours = String(settings.hours || "Monday to Friday, 8:00 AM - 5:00 PM").trim();
  
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);

  const selectedIdleVideoUrls = useMemo(() => {
    const fromList = Array.isArray(settings.idleVideoUrls)
      ? settings.idleVideoUrls.map(url => String(url || "").trim()).filter(Boolean)
      : [];
    if (fromList.length) return fromList;
    const single = String(settings.idleVideoUrl || "").trim();
    return single ? [single] : [];
  }, [settings.idleVideoUrls, settings.idleVideoUrl]);

  const videoPlaylist = selectedIdleVideoUrls.map(videoUrl => ({ videoUrl }));
  
  const currentPlayingVideo = videoPlaylist[currentPlayingIndex];
  const idleVideoSource = currentPlayingVideo?.videoUrl
    ? String(currentPlayingVideo.videoUrl || "").trim()
    : fallbackIdleVideo;

  useEffect(() => {
    setCurrentPlayingIndex(0);
  }, [selectedIdleVideoUrls.join("|")]);

  const handleVideoEnded = () => {
    if (videoPlaylist.length > 0) {
      setCurrentPlayingIndex(prev => (prev + 1) % videoPlaylist.length);
    }
  };

  return (
    <div className={`idle-screen${hiding ? " hiding" : ""}`} onClick={!hiding ? onShowMain : undefined}>

      {/* ── VIDEO BACKGROUND ── */}
      <video
        key={idleVideoSource}
        className="idle-video-bg"
        src={idleVideoSource}
        autoPlay
        loop={videoPlaylist.length <= 1}
        muted
        playsInline
        onEnded={handleVideoEnded}
      />

      {/* Dark overlay so content stays readable */}
      <div className="idle-video-overlay" />
      <div className="idle-pat" />

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
              key={`idle-announcement-${announcementIndex}`}
              className="idle-ticker-inner"
            >
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

      {/* ── TAP PROMPT — bottom center ── */}
      <div className="idle-tap">
        <div className="tap-ring">
          <img className="touchIcon" src={touchIcon} alt="Touch icon" />
        </div>
        <div className="tap-label">Pindutin para Magsimula</div>
      </div>

      {/* ── CENTER TITLE ── */}
      <div className="idle-center-title">Citizen's Charter & Information Kiosk</div>

      {/* ── CENTER TITLE ── */}

      {/* ── FOOTER ── */}
      <div className="idle-footer idle-footer--transparent">
        
        {/* Left: Logos + Dept Name + Tagline */}
        <div className="idle-footer-left">
          <div className="idle-footer-logos">
            <img src={dilgIcon} alt="DILG Seal" className="footer-logo" />
            <img src={lgrrcLogo} alt="LGRRC Logo" className="footer-logo lgrrc-logo" />
          </div>
          <div className="idle-footer-text">
            <div className="idle-footer-office">Department of the Interior and Local Government - Caraga</div>
            <div className="idle-footer-tagline">{settings.tagline}</div>
            <div className="idle-footer-copyright">Copyright 2026 DILG Caraga. All rights reserved.</div>
            
          </div>
        </div>
        
        {/* Right: Logos with Powered by */}
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
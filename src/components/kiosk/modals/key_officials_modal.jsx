import { useEffect, useState } from "react";
import orgChart from "../../../assets/images/Organizational Chart.jpg";
import { apiUrl } from "../../../utils/runtime";

export default function KeyOfficialsModal({ onClose, onInteract }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState("Key Officials");
  const [imageUrl, setImageUrl] = useState(orgChart);

  useEffect(() => {
    let active = true;
    fetch(apiUrl("/api/key-officials"))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load key officials data.");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const nextTitle = String(data?.title || "").trim();
        const nextImageUrl = String(data?.imageUrl || "").trim();
        if (nextTitle) setTitle(nextTitle);
        if (nextImageUrl) setImageUrl(nextImageUrl);
      })
      .catch(() => {
        // Keep static fallback image when API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="kmodal-backdrop"
      onClick={!isFullscreen ? onClose : undefined}
      onClickCapture={onInteract}
      onTouchStartCapture={onInteract}
      style={isFullscreen ? { alignItems: "stretch", padding: 0 } : {}}
    >
      <div
        className="kmodal-box"
        style={{
          "--modal-color": "#002C76",
          ...(isFullscreen ? {
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            margin: 0,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
          } : {}),
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="kmodal-header" style={{ flexShrink: 0 }}>
          <div className="kmodal-header-stripe" />
          <div className="kmodal-title">{title}</div>

          {/* Fullscreen toggle button */}
          <button
            onClick={() => setIsFullscreen(f => !f)}
            title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginRight: "10px",
              transition: "background 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          >
            {isFullscreen ? (
              <>
                {/* Compress icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                  <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                </svg>
                Exit Fullscreen
              </>
            ) : (
              <>
                {/* Expand icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
                  <path d="M3 8V3h5"/><path d="M21 8V3h-5"/>
                  <path d="M3 16v5h5"/><path d="M21 16v5h-5"/>
                </svg>
                Fullscreen
              </>
            )}
          </button>

          {/* Close button */}
          <button className="kmodal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div
          className="kmodal-body"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "24px",
            overflowY: "auto",
            flex: isFullscreen ? 1 : undefined,
          }}
        >
          <img
            src={imageUrl}
            alt="Organizational Chart"
            onError={() => setImageUrl(orgChart)}
            style={{
              maxWidth: "100%",
              width: isFullscreen ? "100%" : undefined,
              height: "auto",
              borderRadius: isFullscreen ? "0" : "10px",
              boxShadow: isFullscreen ? "none" : "0 4px 24px rgba(0,0,0,0.15)",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
}
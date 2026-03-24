const DILG_COLORS = ["#002C76", "#C9282D", "#FFDE15"];

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

export default function OfficesModal({ officeDirectory, onClose }) {
  if (!officeDirectory) return null;

  return (
    <div className="kmodal-backdrop" onClick={onClose}>
      <div
        className="kmodal-box"
        style={{ "--modal-color": "#002C76" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="kmodal-header">
          <div className="kmodal-header-stripe" />
          <div className="kmodal-title">
            {officeDirectory.title || "List of Offices"}
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
          <div className="kmodal-office-grid">
            {(officeDirectory.entries || []).map((entry, idx) => {
              const contactInfo = parseOfficeContact(entry.contact);
              const color = DILG_COLORS[idx % DILG_COLORS.length];
              const isGold = color === "#FFDE15";
              return (
                <div
                  key={idx}
                  className={`kmodal-pv2-card${isGold ? " kmodal-pv2-card--gold" : ""}`}
                  style={{ "--pvc": color }}
                >
                  <div className="kmodal-pv2-stripe" />
                  <div className="kmodal-pv2-inner">
                    <div className="kmodal-pv2-heading kmodal-pv2-heading--office">
                      {entry.office}
                    </div>

                    {!!entry.address && (
                      <div className="kmodal-office-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          width="20" height="20"
                          style={{ flexShrink: 0, color: isGold ? "#7a5f00" : color, marginTop: 3 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="kmodal-pv2-text">{entry.address}</span>
                      </div>
                    )}

                    {!!contactInfo.mainLine && (
                      <div className="kmodal-office-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          width="20" height="20"
                          style={{ flexShrink: 0, color: isGold ? "#7a5f00" : color, marginTop: 3 }}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                        </svg>
                        <div>
                          <div className="kmodal-pv2-text">{contactInfo.mainLine}</div>
                          {!!contactInfo.extension && (
                            <div className="kmodal-pv2-text" style={{ opacity: 0.65 }}>
                              Loc. {contactInfo.extension}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!contactInfo.mainLine && (
                      <p className="kmodal-pv2-text" style={{ opacity: 0.4 }}>
                        No contact provided
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

       
        
      </div>
    </div>
  );
}
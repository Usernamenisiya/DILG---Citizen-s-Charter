export default function ProfileModal({ organizationalProfile, onClose }) {
  if (!organizationalProfile) return null;

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
            {organizationalProfile.title || "Mandate, Mission, Vision & Service Pledge"}
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
          <div className="kmodal-pv2-grid">

            {/* Mandate */}
            <div className="kmodal-pv2-card" style={{ "--pvc": "#002C76" }}>
              <div className="kmodal-pv2-stripe" />
              <div className="kmodal-pv2-inner">
                <div className="kmodal-pv2-heading">Mandate</div>
                <p className="kmodal-pv2-text">{organizationalProfile.mandate}</p>
              </div>
            </div>

            {/* Mission */}
            <div className="kmodal-pv2-card" style={{ "--pvc": "#C9282D" }}>
              <div className="kmodal-pv2-stripe" />
              <div className="kmodal-pv2-inner">
                <div className="kmodal-pv2-heading">Mission</div>
                <p className="kmodal-pv2-text">{organizationalProfile.mission}</p>
              </div>
            </div>

            {/* Vision — full width, gold */}
            <div className="kmodal-pv2-card kmodal-pv2-card--wide kmodal-pv2-card--gold" style={{ "--pvc": "#FFDE15" }}>
              <div className="kmodal-pv2-stripe" />
              <div className="kmodal-pv2-inner">
                <div className="kmodal-pv2-heading">Vision</div>
                <p className="kmodal-pv2-text">{organizationalProfile.vision}</p>
              </div>
            </div>

            {/* Service Pledge — full width, blue */}
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
                      <p className="kmodal-pv2-text kmodal-pv2-text--closing">
                        {organizationalProfile.servicePledge.closing}
                      </p>
                    )}
                  </div>
                  {!!organizationalProfile.servicePledge?.pbest?.length && (
                    <div className="kmodal-pbest">
                      <div className="kmodal-pbest-label">PBEST Framework</div>
                      <ul className="kmodal-pbest-list">
                        {organizationalProfile.servicePledge.pbest.map((item, i) => (
                          <li key={i}>
                            <span className="kmodal-pbest-dot" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        
      </div>
    </div>
  );
}
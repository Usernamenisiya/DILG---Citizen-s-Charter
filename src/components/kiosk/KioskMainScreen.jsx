import dilgIcon from "../../Dilg.svg";
import { getServiceBadgeClass } from "../../utils/serviceBadgeClass";
import { useEffect, useRef, useState } from "react";
import { ServiceIcon } from "../ServiceIcon";

export default function KioskMainScreen({
  visible,
  settings,
  feedbackAndComplaints,
  officeDirectory,
  organizationalProfile,
  policiesAndIssuances,
  currentService,
  setCurrentService,
  pageServices,
  currentPage,
  totalPages,
  servicesLength,
  perPage,
  onPrevPage,
  onNextPage,
  clockTime,
  clockDate,
  onLogoClick,
  inactBarRef,
  activeSection,
  onReturnToMenu,
}) {
  const parseOfficeContact = rawContact => {
    const text = String(rawContact || "").trim();
    if (!text) return { mainLine: "", extension: "", raw: "" };

    const match = text.match(/^(.*?)(?:\s*(?:,|-)?\s*loc\.?\s*[:.]?\s*([A-Za-z0-9-]+))$/i);
    if (!match) return { mainLine: text, extension: "", raw: text };

    return {
      mainLine: String(match[1] || "").trim().replace(/[\s,.-]+$/, ""),
      extension: String(match[2] || "").trim(),
      raw: text,
    };
  };

  /* ── Modal state ── */
  const [modal, setModal] = useState(null); // { title, color, content: JSX }

  const openModal = (title, color, content) => setModal({ title, color, content });
  const closeModal = () => setModal(null);

  /* Auto-show scrollbar while scrolling, hide after idle */
  const contentRef = useRef(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let timer;
    const onScroll = () => {
      el.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("is-scrolling"), 900);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, []);

  return (
    <div className={`main-screen${visible ? " visible" : ""}`}>
      <header className="header">
        <div className="header-left">
          <div className="header-logo" onClick={onLogoClick}>
            <img src={dilgIcon} alt="DILG Logo" />
          </div>
          <div className="header-title">
            {settings.office} - Citizen's Charter Kiosk
            <span>Department of the Interior and Local Government | {settings.address}</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-clock">
            {clockTime}
            <span className="date">{clockDate}</span>
          </div>
        </div>
      </header>


      <div className="screen-bar">
        {currentService ? (
          <>
            <button className="back-btn" onClick={() => setCurrentService(null)}>Back to {activeSection === "internal" ? "Services" : activeSection === "external" ? "External" : "Menu"}</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="sc-label">{activeSection === "internal" ? "Internal Services" : activeSection === "external" ? "External Services" : "Menu"}</div>
              <div className="sc-sep"><img src="/src/assets/icons/rightarrow.png" alt=">" className="sc-sep-glyph" /></div>
              <div className="sc-label sub">{currentService.label}</div>
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={onReturnToMenu}>Back to Menu</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              {(activeSection === "internal" || activeSection === "external") ? (
                <div className="greeting sc-greeting">
                  {activeSection === "external" ? "Magandang araw! Pumili ng external service" : "Magandang araw! Pumili ng serbisyo"} — <strong>{settings.hours}</strong>
                </div>
              ) : (
                <div className="sc-label">
                  {activeSection === "feedback" ? "Feedback & Complaints" : activeSection === "offices" ? "List of Offices" : activeSection === "profile" ? "Mandate, Mission, Vision" : activeSection === "issuances" ? "Policies & Issuances" : "Menu"}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="content" ref={contentRef}>
        <div className="content-shell">
        {!currentService ? (
          <div className="card-menu">
            {(activeSection === "internal" || activeSection === "external") && (
              <>
                <div className="service-grid">
                  {pageServices.map((svc, i) => (
                    <div key={svc.id} className="service-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setCurrentService(svc)}>
                      <div className="card-top">
                        <div className="card-icon">
                          <ServiceIcon icon={svc.icon} label={svc.label} size={30} className="card-icon-glyph" />
                        </div>
                        <span className={`card-badge ${getServiceBadgeClass(svc.classification)}`}>{svc.classification}</span>
                      </div>
                      <div className="card-label">{svc.label}</div>
                      <div className="card-meta">
                        <div className="card-time">
                          {activeSection === "external"
                            ? `Inquire At: ${svc.office || "DILG Office"}`
                            : `Estimated Time: ${svc.processingTime}`}
                        </div>
                        {!!svc.fees && svc.fees !== "None" && <div className="card-fee">Fee: {svc.fees}</div>}
                        <div className="card-arr"><img src="/src/assets/icons/rightarrow.png" alt="view" className="card-arr-glyph" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "feedback" && !!feedbackAndComplaints && (
              <div className="feedback-panel" style={{ marginTop: 0 }}>
                <div className="feedback-panel-head">
                  <h3>{feedbackAndComplaints.title || "Feedback and Complaints Mechanism"}</h3>
                  <div className="feedback-contact">
                    <span>Email: {feedbackAndComplaints.contact?.email || "N/A"}</span>
                    <span>Tel: {feedbackAndComplaints.contact?.telephone || "N/A"}</span>
                  </div>
                </div>
                <div className="feedback-grid">
                  {(feedbackAndComplaints.sections || []).map((section, idx) => (
                    <div key={idx} className="feedback-item">
                      <h4>{section.heading}</h4>
                      {(section.paragraphs || []).map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                      {!!section.items?.length && (
                        <ul>
                          {section.items.map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "offices" && !!officeDirectory && (
              <div className="pv2-wrap">
                <div className="pv2-grid pv2-grid--3col">
                  {(officeDirectory.entries || []).map((entry, idx) => {
                    const contactInfo = parseOfficeContact(entry.contact);
                    /*new*/
                    const officeNameLower = (entry.office || "").toLowerCase();
                    const isProvince = officeNameLower.includes("province");
                    const isRedOffice = officeNameLower.includes("regional") || officeNameLower.includes("finance") || officeNameLower.includes("administrative") || officeNameLower.includes("lgcdd") || officeNameLower.includes("lgmed");
                    const color = isProvince ? "#FFDE15" : isRedOffice ? "#C9282D" : "#002C76";
                    return (
                      <div
                        key={idx}
                        className={`pv2-card pv2-card--clickable${color === "#FFDE15" ? " pv2-card--gold" : ""}`}
                        style={{ "--pvc": color }}
                        onClick={() => openModal(entry.office, color === "#FFDE15" ? "#002C76" : color,
                          <div className="modal-office-detail">
                            {!!entry.address && (
                              <div className="modal-office-row">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                  width="28" height="28" style={{ flexShrink: 0, color: color === "#FFDE15" ? "#002C76" : color }}>
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <div>
                                  <div className="modal-office-label">Address</div>
                                  <div className="modal-body-text">{entry.address}</div>
                                </div>
                              </div>
                            )}
                            {!!contactInfo.mainLine && (
                              <div className="modal-office-row">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                  width="28" height="28" style={{ flexShrink: 0, color: color === "#FFDE15" ? "#002C76" : color }}>
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                                </svg>
                                <div>
                                  <div className="modal-office-label">Contact</div>
                                  <div className="modal-body-text">{contactInfo.mainLine}</div>
                                  {!!contactInfo.extension && (
                                    <div className="modal-body-text" style={{ opacity: 0.7 }}>Loc. {contactInfo.extension}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            {!contactInfo.mainLine && (
                              <div className="modal-body-text" style={{ opacity: 0.45 }}>No contact information available.</div>
                            )}
                          </div>
                        )}>
                        <div className="pv2-stripe" />
                        <div className="pv2-body pv2-body--office">
                          <div className="pv2-heading pv2-heading--office">{entry.office}</div>
                          {!!entry.address && (
                            <div className="pv2-office-row">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                width="18" height="18" style={{ flexShrink: 0, color: "var(--pvc)", marginTop: 2 }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              <span className="pv2-text">{entry.address}</span>
                            </div>
                          )}
                          {!!contactInfo.mainLine && (
                            <div className="pv2-office-row">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                width="18" height="18" style={{ flexShrink: 0, color: "var(--pvc)", marginTop: 2 }}>
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                              </svg>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span className="pv2-text">{contactInfo.mainLine}</span>
                                {!!contactInfo.extension && (
                                  <span className="pv2-text pv2-text--ext">Loc. {contactInfo.extension}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {!contactInfo.mainLine && (
                            <div className="pv2-office-row pv2-office-row--muted">
                              <span className="pv2-text" style={{ opacity: 0.45 }}>No contact provided</span>
                            </div>
                          )}
                          <div className="pv2-tap-hint">Tap for details</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════
                PROFILE — redesigned to match menu card language
                ════════════════════════════════════════════════════ */}
            {activeSection === "profile" && !!organizationalProfile && (
              <div className="pv2-wrap">

                {/* 2-column card grid — click to open modal */}
                <div className="pv2-grid">

                  {/* Mandate */}
                  <div className="pv2-card pv2-card--clickable" style={{ "--pvc": "#002C76" }}
                    onClick={() => openModal("Mandate", "#002C76",
                      <p className="modal-body-text">{organizationalProfile.mandate}</p>
                    )}>
                    <div className="pv2-stripe" />
                    <div className="pv2-body">
                      <div className="pv2-heading">Mandate</div>
                      <p className="pv2-text pv2-text--preview">{organizationalProfile.mandate}</p>
                      <div className="pv2-tap-hint">Tap to read more</div>
                    </div>
                  </div>

                  {/* Mission */}
                  <div className="pv2-card pv2-card--clickable" style={{ "--pvc": "#C9282D" }}
                    onClick={() => openModal("Mission", "#C9282D",
                      <p className="modal-body-text">{organizationalProfile.mission}</p>
                    )}>
                    <div className="pv2-stripe" />
                    <div className="pv2-body">
                      <div className="pv2-heading">Mission</div>
                      <p className="pv2-text pv2-text--preview">{organizationalProfile.mission}</p>
                      <div className="pv2-tap-hint">Tap to read more</div>
                    </div>
                  </div>

                  {/* Vision — full width */}
                  <div className="pv2-card pv2-card--wide pv2-card--gold pv2-card--clickable" style={{ "--pvc": "#FFDE15" }}
                    onClick={() => openModal("Vision", "#002C76",
                      <p className="modal-body-text">{organizationalProfile.vision}</p>
                    )}>
                    <div className="pv2-stripe" />
                    <div className="pv2-body">
                      <div className="pv2-heading">Vision</div>
                      <p className="pv2-text pv2-text--preview">{organizationalProfile.vision}</p>
                      <div className="pv2-tap-hint">Tap to read more</div>
                    </div>
                  </div>

                  {/* Service Pledge — full-width */}
                  <div className="pv2-card pv2-card--wide pv2-card--clickable" style={{ "--pvc": "#002C76" }}
                    onClick={() => openModal("Service Pledge", "#C9282D",
                      <div>
                        {!!organizationalProfile.servicePledge?.intro && (
                          <p className="modal-body-text">{organizationalProfile.servicePledge.intro}</p>
                        )}
                        {!!organizationalProfile.servicePledge?.serviceCommitment && (
                          <p className="modal-body-text">{organizationalProfile.servicePledge.serviceCommitment}</p>
                        )}
                        {!!organizationalProfile.servicePledge?.pbest?.length && (
                          <div className="modal-pbest">
                            <div className="modal-pbest-label">PBEST Framework</div>
                            <ul className="modal-pbest-list">
                              {organizationalProfile.servicePledge.pbest.map((item, i) => (
                                <li key={i}><span className="modal-pbest-dot" />{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {!!organizationalProfile.servicePledge?.officeHoursCommitment && (
                          <p className="modal-body-text">{organizationalProfile.servicePledge.officeHoursCommitment}</p>
                        )}
                        {!!organizationalProfile.servicePledge?.closing && (
                          <p className="modal-body-text modal-body-text--closing">{organizationalProfile.servicePledge.closing}</p>
                        )}
                      </div>
                    )}>
                    <div className="pv2-stripe" />
                    <div className="pv2-body">
                      <div className="pv2-heading">Service Pledge</div>
                      <p className="pv2-text pv2-text--preview">{organizationalProfile.servicePledge?.intro}</p>
                      <div className="pv2-tap-hint">Tap to read more</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeSection === "issuances" && !!policiesAndIssuances && (
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
                        {!!item.coverage && <div><strong>Coverage:</strong> {item.coverage}</div>}
                        {!!item.effectivity && <div><strong>Effectivity:</strong> {item.effectivity}</div>}
                        {!!item.supersedes && <div><strong>Supersedes:</strong> {item.supersedes}</div>}
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
          </div>
        ) : (
          <div>
            <div className="detail-banner">
              <div className="detail-icon">
                <ServiceIcon icon={currentService.icon} label={currentService.label} size={36} className="detail-icon-glyph" color="#fff" />
              </div>
              <div className="detail-meta">
                <h2>{currentService.label}</h2>
                <p>{currentService.desc}</p>
                <div className="d-chips">
                  <span className="chip cls">Class: {currentService.classification}</span>
                  <span className="chip">Estimated Time: {currentService.processingTime}</span>
                  <span className="chip">{currentService.fees && currentService.fees !== "None" ? "Fee: " + currentService.fees : "No Fees"}</span>
                  <span className="chip">Who: {currentService.who}</span>
                  <span className="chip">Office: {currentService.office}</span>
                </div>
              </div>
            </div>
            <div className="detail-cols">
              <div className="detail-box">
                <h3>Requirements</h3>
                {(currentService.requirements || []).map((r, i) => (
                  <div key={i} className="req-item">
                    <div className="req-n">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <div>{r.text}</div>
                      <div className="req-wh">Where: {r.where}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="detail-box">
                <h3>How to Avail</h3>
                {(currentService.steps || []).map((step, i) => (
                  <div key={i} className="step-item">
                    <div className="step-c">{i + 1}</div>
                    <div>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {!currentService && (activeSection === "internal" || activeSection === "external") && (
        <div className="pagination">
          <button className="nav-btn" disabled={currentPage === 0} onClick={onPrevPage}>Previous</button>
          <div className="page-info">Page <span>{currentPage + 1}</span> of <span>{totalPages}</span></div>
          <button className="nav-btn" disabled={(currentPage + 1) * perPage >= servicesLength} onClick={onNextPage}>Next</button>
        </div>
      )}

      <div className="inact-bar" ref={inactBarRef} />

      {/* ══ POP-UP MODAL ══ */}
      {modal && (
        <div className="kmodal-backdrop" onClick={closeModal}>
          <div
            className="kmodal-box"
            style={{ "--modal-color": modal.color }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="kmodal-header">
              <div className="kmodal-header-stripe" />
              <div className="kmodal-title">{modal.title}</div>
              <button className="kmodal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  width="28" height="28">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="kmodal-body">
              {modal.content}
            </div>

            {/* Footer close button */}
            <div className="kmodal-footer">
              <button className="kmodal-footer-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
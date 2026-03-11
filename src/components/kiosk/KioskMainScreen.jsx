import dilgIcon from "../../Dilg.svg";
import { getServiceBadgeClass } from "../../utils/serviceBadgeClass";

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
  onOpenQueueModal,
  queueOpen,
  queueNum,
  onCloseQueueModal,
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
              <div className="sc-sep">&gt;</div>
              <div className="sc-label sub">{currentService.label}</div>
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={onReturnToMenu}>Back to Menu</button>
            <div className="sc-label" style={{ marginLeft: "auto" }}>
              {activeSection === "internal" ? "Internal Services" : activeSection === "external" ? "External Services" : activeSection === "feedback" ? "Feedback & Complaints" : activeSection === "offices" ? "List of Offices" : activeSection === "profile" ? "Mandate, Mission, Vision" : activeSection === "issuances" ? "Policies & Issuances" : "Menu"}
            </div>
          </>
        )}
      </div>

      <div className="content">
        <div className="content-shell">
        {!currentService ? (
          <div>
            {(activeSection === "internal" || activeSection === "external") && (
              <>
                <div className="greeting">
                  {activeSection === "external" ? "Magandang araw! Pumili ng external service" : "Magandang araw! Pumili ng serbisyo"} - <strong>{settings.hours}</strong>
                </div>
                <div className="service-grid">
                  {pageServices.map((svc, i) => (
                    <div key={svc.id} className="service-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setCurrentService(svc)}>
                      <div className="card-top">
                        <div className="card-icon"><img src={svc.icon} alt={svc.label} /></div>
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
              <div className="office-panel" style={{ marginTop: 0 }}>
                <div className="office-panel-head">
                  <h3>{officeDirectory.title || "List of Offices"}</h3>
                  <span>{officeDirectory.region || ""}</span>
                </div>
                <div className="office-grid">
                  {(officeDirectory.entries || []).map((entry, idx) => (
                    <div key={idx} className="office-item">
                      {(() => {
                        const contactInfo = parseOfficeContact(entry.contact);
                        return (
                          <div className="office-item-inner">
                            <div className="office-section">
                              <div className="office-section-label">Office</div>
                              <h4>{entry.office}</h4>
                            </div>

                            <div className="office-section">
                              <div className="office-section-label">Address</div>
                              <p>{entry.address || "Not provided"}</p>
                            </div>

                            {!!contactInfo.mainLine && (
                              <div className="office-section office-section-contact">
                                <div className="office-section-label">Contact</div>
                                <div className="office-contact-line">
                                  <span className="office-contact-label">Main Line:</span>
                                  <strong>{contactInfo.mainLine}</strong>
                                </div>
                                {!!contactInfo.extension && (
                                  <div className="office-contact-line">
                                    <span className="office-contact-label">Extension:</span>
                                    <strong>{contactInfo.extension}</strong>
                                  </div>
                                )}
                              </div>
                            )}
                            {!contactInfo.mainLine && (
                              <div className="office-section office-section-contact">
                                <div className="office-section-label">Contact</div>
                                <div className="office-contact-line">
                                  <strong>Not provided</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "profile" && !!organizationalProfile && (
              <div className="profile-panel" style={{ marginTop: 0 }}>
                <div className="profile-panel-head">
                  <h3>{organizationalProfile.title || "Mandate, Mission, Vision and Service Pledge"}</h3>
                </div>

                <div className="profile-grid">
                  <div className="profile-item">
                    <h4>I. Mandate</h4>
                    <p>{organizationalProfile.mandate}</p>
                  </div>

                  <div className="profile-item">
                    <h4>II. Mission</h4>
                    <p>{organizationalProfile.mission}</p>
                  </div>

                  <div className="profile-item">
                    <h4>III. Vision</h4>
                    <p>{organizationalProfile.vision}</p>
                  </div>

                  <div className="profile-item profile-item-wide">
                    <h4>IV. Service Pledge</h4>
                    <p>{organizationalProfile.servicePledge?.intro}</p>
                    <p>{organizationalProfile.servicePledge?.serviceCommitment}</p>
                    {!!organizationalProfile.servicePledge?.pbest?.length && (
                      <ul>
                        {organizationalProfile.servicePledge.pbest.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                    <p>{organizationalProfile.servicePledge?.officeHoursCommitment}</p>
                    <p>{organizationalProfile.servicePledge?.closing}</p>
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
              <div className="detail-icon"><img src={currentService.icon} alt={currentService.label} /></div>
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
                <div className="queue-area">
                  <div className="no-fee-lbl">
                    {currentService.fees && currentService.fees !== "None" ? "Fees: " + currentService.fees : "No Fees Charged | Zero Contact Policy"}
                  </div>
                  <button className="get-q-btn" onClick={onOpenQueueModal}>Get Queue Number</button>
                </div>
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

      <div className={`modal-ov${queueOpen ? " open" : ""}`}>
        <div className="modal">
          <div className="q-label">Your Queue Number</div>
          <div className="q-num">{queueNum}</div>
          <div className="q-svc">{currentService?.label}</div>
          <div className="q-note">Please wait for your number to be called at the service window.</div>
          <button className="btn-done" onClick={onCloseQueueModal}>Done</button>
        </div>
      </div>
    </div>
  );
}

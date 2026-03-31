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
  announcements,
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

  const normalizeAnnouncementFiles = announcement => {
    const rawFiles = Array.isArray(announcement?.attachments)
      ? announcement.attachments
      : Array.isArray(announcement?.files)
        ? announcement.files
        : [];

    return rawFiles
      .map((file, idx) => {
        if (typeof file === "string") {
          const url = file.trim();
          if (!url) return null;
          return {
            name: `Attachment ${idx + 1}`,
            url,
          };
        }
        const name = String(file?.name || file?.label || file?.title || "").trim();
        const url = String(file?.url || file?.href || file?.path || "").trim();
        if (!url) return null;
        return {
          name: name || `Attachment ${idx + 1}`,
          url,
        };
      })
      .filter(Boolean);
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

  const getServiceCardColor = (classification) => {
    const c = String(classification || "").toLowerCase();
    if (c.includes("simple")) return "#002C76";
    if (c.includes("complex") || c.includes("highly")) return "#C9282D";
    return "#FFDE15";
  };

  const isInternalSection = activeSection === "internal";
  const isExternalSection = activeSection === "external";

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
            <button className="back-btn" onClick={() => setCurrentService(null)}>Back to {isInternalSection ? "Internal Services" : isExternalSection ? "External Services" : "Menu"}</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="sc-label">{isInternalSection ? "Internal Services" : isExternalSection ? "External Services" : "Menu"}</div>
              <div className="sc-sep"><img src="/src/assets/icons/rightarrow.png" alt=">" className="sc-sep-glyph" /></div>
              <div className="sc-label sub">{currentService.label}</div>
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={onReturnToMenu}>Back to Menu</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              {(isInternalSection || isExternalSection) ? (
                <div className="greeting sc-greeting">
                  {isExternalSection ? "Magandang araw! Piliin ang external service na kailangan ninyo." : "Magandang araw! Piliin ang serbisyong kailangan ninyo."} - <strong>{settings.hours}</strong>
                </div>
              ) : (
                <div className="sc-label">
                  {activeSection === "feedback" ? "Feedback & Complaints" : activeSection === "offices" ? "List of Offices" : activeSection === "profile" ? "Mandate, Mission, Vision" : activeSection === "issuances" ? "Policies & Issuances" : activeSection === "announcement" ? "Announcements"   : activeSection === "Officials" ? "Key Officials" : "Menu"}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={`content${!currentService && (isInternalSection || isExternalSection) ? " content--services" : ""}`} ref={contentRef}>
        <div className="content-shell">
        {!currentService ? (
          <div className={`card-menu${isInternalSection || isExternalSection ? " card-menu--services" : ""}`}>
            {(isInternalSection || isExternalSection) && (
              <div className="mnav-grid svc-grid">
                {pageServices.map((svc, i) => {
                  const cardColor = getServiceCardColor(svc.classification);
                  const isGoldCard = cardColor === "#FFDE15";
                  return (
                    <div
                      key={svc.id}
                      className={`mnav-card mnav-card--svc${isGoldCard ? " mnav-card--svc-gold" : ""}`}
                      style={{ "--card-color": cardColor, animationDelay: `${i * 0.05}s` }}
                      onClick={() => setCurrentService(svc)}
                    >
                      {/* Colored top stripe */}
                      <div className="mnav-card-stripe" />

                      {/* Icon + Label */}
                      <div className="mnav-card-main">
                        <div className="svc-card-icon-wrap">
                          <ServiceIcon
                            icon={svc.icon}
                            label={svc.label}
                            size={34}
                            color={isGoldCard ? "#7a5f00" : cardColor}
                            className="card-icon-glyph"
                          />
                        </div>
                        <div className="mnav-card-label">{svc.label}</div>
                      </div>

                      {/* Badge + Meta */}
                      <div className="mnav-card-sub">
                        <span className={`card-badge ${getServiceBadgeClass(svc.classification)}`}>
                          {svc.classification}
                        </span>
                        <div className="mnav-card-desc">
                          {isExternalSection
                            ? `Inquire At: ${String(svc.office || "").trim() || "DILG Office"}`
                            : `Est. Time: ${String(svc.processingTime || "").trim() || "See service details"}`}
                        </div>
                        {!!svc.fees && svc.fees !== "None" && (
                          <div className="mnav-card-desc">Fee: {svc.fees}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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

            {activeSection === "announcement" && (
              <div className="announcement-page" style={{ marginTop: 0 }}>
                <div className="announcement-page-head">
                  <h3>Announcements</h3>
                  <span>
                    Active announcements: <strong>{(announcements || []).length}</strong>
                  </span>
                </div>

                {!!(announcements || []).length && (
                  <div className="announcement-page-sub">
                    Select an announcement to view full details and attachments.
                  </div>
                )}

                <div className="announcement-page-list">
                  {(announcements || []).map((item, idx) => {
                    const files = normalizeAnnouncementFiles(item);
                    const title = String(item?.title || "").trim() || `Announcement ${idx + 1}`;
                    const summary = String(item?.message || "").trim();
                    const details = String(item?.details || "").trim();
                    const postedBy = String(item?.postedBy || "").trim();
                    const where = String(item?.where || "").trim();
                    const postedOn = String(item?.postedOn || "").trim();
                    const effectiveUntil = String(item?.effectiveUntil || "").trim();
                    const involvedParties = String(item?.involvedParties || "").trim();

                    return (
                      <button
                        key={item.id || idx}
                        className="announcement-page-item"
                        onClick={() =>
                          openModal(
                            title,
                            "#002C76",
                            <div className="announcement-modal-content">
                              {!!summary && (
                                <section className="announcement-modal-section">
                                  <div className="announcement-modal-heading">Summary</div>
                                  <p className="modal-body-text">{summary}</p>
                                </section>
                              )}

                              {!!details && (
                                <section className="announcement-modal-section">
                                  <div className="announcement-modal-heading">Details</div>
                                  <p className="modal-body-text">{details}</p>
                                </section>
                              )}

                              {(postedBy || where || postedOn || effectiveUntil) && (
                                <section className="announcement-modal-section">
                                  <div className="announcement-modal-heading">Who / When / Where</div>
                                  <div className="announcement-meta-grid">
                                    {!!postedBy && (
                                      <div className="announcement-meta-item">
                                        <span>Posted by</span>
                                        <strong>{postedBy}</strong>
                                      </div>
                                    )}
                                    {!!where && (
                                      <div className="announcement-meta-item">
                                        <span>Where</span>
                                        <strong>{where}</strong>
                                      </div>
                                    )}
                                    {!!postedOn && (
                                      <div className="announcement-meta-item">
                                        <span>Posted on</span>
                                        <strong>{postedOn}</strong>
                                      </div>
                                    )}
                                    {!!effectiveUntil && (
                                      <div className="announcement-meta-item">
                                        <span>Effective until</span>
                                        <strong>{effectiveUntil}</strong>
                                      </div>
                                    )}
                                  </div>
                                </section>
                              )}

                              {!!involvedParties && (
                                <section className="announcement-modal-section">
                                  <div className="announcement-modal-heading">Who Might Be Involved</div>
                                  <p className="modal-body-text">{involvedParties}</p>
                                </section>
                              )}

                              {!!files.length && (
                                <section className="announcement-modal-section">
                                  <div className="announcement-modal-heading">Attached Files</div>
                                  <div className="announcement-file-list">
                                    {files.map((file, fileIdx) => (
                                      <a
                                        key={`${file.url}-${fileIdx}`}
                                        className="announcement-file-link"
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {file.name}
                                      </a>
                                    ))}
                                  </div>
                                </section>
                              )}

                              {!summary && !details && !postedBy && !where && !postedOn && !effectiveUntil && !involvedParties && !files.length && (
                                <section className="announcement-modal-section">
                                  <p className="modal-body-text" style={{ opacity: 0.7 }}>
                                    No additional details available for this announcement.
                                  </p>
                                </section>
                              )}
                            </div>
                          )
                        }
                      >
                        <div className="announcement-page-item-no">{String(idx + 1).padStart(2, "0")}</div>
                        <div className="announcement-page-item-content">
                          <div className="announcement-page-item-title">{title}</div>
                          <div className="announcement-page-item-text">{summary || details || "Tap to view details"}</div>
                          {(postedBy || where || postedOn || effectiveUntil) && (
                            <div className="announcement-page-item-text" style={{ fontSize: 14, opacity: 0.86 }}>
                              {postedBy ? `Posted by ${postedBy}` : ""}
                              {where ? `${postedBy ? " | " : ""}Where: ${where}` : ""}
                              {postedOn ? `${postedBy || where ? " | " : ""}Posted: ${postedOn}` : ""}
                              {effectiveUntil ? `${postedBy || where || postedOn ? " | " : ""}Until: ${effectiveUntil}` : ""}
                            </div>
                          )}
                          {!!involvedParties && (
                            <div className="announcement-page-item-text" style={{ fontSize: 14, opacity: 0.86 }}>
                              Involved: {involvedParties}
                            </div>
                          )}
                        </div>
                        <div className="announcement-page-item-meta">
                          {!!files.length && <span>{files.length} file{files.length > 1 ? "s" : ""}</span>}
                          <span>View</span>
                        </div>
                      </button>
                    );
                  })}

                  {!(announcements || []).length && (
                    <div className="announcement-empty">No active announcements available.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (() => {
          const svcColor = getServiceCardColor(currentService.classification);
          const isGold   = svcColor === "#FFDE15";
          const accentColor = isGold ? "#7a5f00" : svcColor;
          return (
            <div className="svc-detail">

              {/* ── HERO BANNER ── */}
              <div className="svc-detail-hero" style={{ "--svc-accent": accentColor, "--svc-color": svcColor }}>
                <div className="svc-detail-hero-stripe" />
                <div className="svc-detail-hero-body">

                  {/* Icon bubble */}
                  <div className="svc-detail-icon-wrap">
                    <ServiceIcon
                      icon={currentService.icon}
                      label={currentService.label}
                      size={44}
                      color="#ffffff"
                      className="svc-detail-icon-glyph"
                    />
                  </div>

                  {/* Title + desc */}
                  <div className="svc-detail-title-block">
                    <div className="svc-detail-title">{currentService.label}</div>
                    {!!String(currentService.desc || "").trim() && (
                      <div className="svc-detail-desc">{currentService.desc}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── METADATA CARD — below hero ── */}
              <div className="svc-meta-card" style={{ "--svc-accent": accentColor, "--svc-color": svcColor }}>
                <div className="svc-meta-card-stripe" />
                <div className="svc-meta-grid">

                  <div className="svc-meta-item svc-meta-item--class">
                    <div className="svc-meta-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                      </svg>
                      Classification
                    </div>
                    <div className="svc-meta-value">{currentService.classification || "—"}</div>
                  </div>

                  {!isExternalSection && (
                    <div className="svc-meta-item">
                      <div className="svc-meta-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Processing Time
                      </div>
                      <div className="svc-meta-value">
                        {String(currentService.processingTime || "").trim() || "See service details"}
                      </div>
                    </div>
                  )}

                  {isExternalSection && (
                    <div className="svc-meta-item">
                      <div className="svc-meta-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Inquire At
                      </div>
                      <div className="svc-meta-value">
                        {String(currentService.office || "DILG Office").trim()}
                      </div>
                    </div>
                  )}

                  <div className="svc-meta-item">
                    <div className="svc-meta-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Fees
                    </div>
                    <div className="svc-meta-value">
                      {currentService.fees && currentService.fees !== "None"
                        ? currentService.fees
                        : "None / Free"}
                    </div>
                  </div>

                  {!!String(currentService.who || "").trim() && (
                    <div className="svc-meta-item">
                      <div className="svc-meta-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Who May Avail
                      </div>
                      <div className="svc-meta-value">{currentService.who}</div>
                    </div>
                  )}

                  {!isExternalSection && !!String(currentService.office || "").trim() && (
                    <div className="svc-meta-item">
                      <div className="svc-meta-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        Office
                      </div>
                      <div className="svc-meta-value">{currentService.office}</div>
                    </div>
                  )}

                </div>
              </div>

              {/* ── TWO PANELS ── */}
              <div className="svc-detail-panels">

                {/* Requirements */}
                <div className="svc-panel" style={{ "--panel-color": accentColor }}>
                  <div className="svc-panel-header">
                    <div className="svc-panel-stripe" />
                    <div className="svc-panel-title">
                      {isExternalSection ? "Required Documents" : "Requirements"}
                    </div>
                    <div className="svc-panel-count">
                      {(currentService.requirements || []).length} item{(currentService.requirements || []).length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="svc-panel-body">
                    {(currentService.requirements || []).length ? (
                      (currentService.requirements || []).map((r, i) => (
                        <div key={i} className="svc-req-row">
                          <div className="svc-req-num" style={{ background: accentColor }}>
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="svc-req-content">
                            <div className="svc-req-text">{r.text}</div>
                            {!!String(r.where || "").trim() && (
                              <div className="svc-req-where">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                {r.where}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="svc-panel-empty">No requirements listed.</div>
                    )}
                  </div>
                </div>

                {/* Steps / How to Avail */}
                <div className="svc-panel" style={{ "--panel-color": accentColor }}>
                  <div className="svc-panel-header">
                    <div className="svc-panel-stripe" />
                    <div className="svc-panel-title">
                      {isExternalSection ? "Service Flow" : "How to Avail"}
                    </div>
                    <div className="svc-panel-count">
                      {(currentService.steps || []).length} step{(currentService.steps || []).length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="svc-panel-body">
                    {(currentService.steps || []).length ? (
                      (currentService.steps || []).map((step, i) => (
                        <div key={i} className="svc-step-row">
                          <div className="svc-step-left">
                            <div className="svc-step-num" style={{ background: accentColor }}>{i + 1}</div>
                            {i < (currentService.steps || []).length - 1 && (
                              <div className="svc-step-connector" style={{ background: accentColor }} />
                            )}
                          </div>
                          <div className="svc-step-text">{step}</div>
                        </div>
                      ))
                    ) : (
                      <div className="svc-panel-empty">No steps listed.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
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
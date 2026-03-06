import dilgIcon from "../../Dilg.svg";
import { getServiceBadgeClass } from "../../utils/serviceBadgeClass";

export default function KioskMainScreen({
  visible,
  settings,
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
}) {
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
            <button className="back-btn" onClick={() => setCurrentService(null)}>Back to Services</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="sc-label">Internal Services</div>
              <div className="sc-sep">&gt;</div>
              <div className="sc-label sub">{currentService.label}</div>
            </div>
          </>
        ) : (
          <div className="sc-label">Internal Services</div>
        )}
      </div>

      <div className="content">
        {!currentService ? (
          <div>
            <div className="greeting">Magandang araw! Pumili ng serbisyo - <strong>{settings.hours}</strong></div>
            <div className="service-grid">
              {pageServices.map((svc, i) => (
                <div key={svc.id} className="service-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setCurrentService(svc)}>
                  <div className="card-top">
                    <div className="card-icon"><img src={svc.icon} alt={svc.label} /></div>
                    <span className={`card-badge ${getServiceBadgeClass(svc.classification)}`}>{svc.classification}</span>
                  </div>
                  <div className="card-label">{svc.label}</div>
                  <div className="card-meta">
                    <div className="card-time">Time: {svc.processingTime}</div>
                    <div className="card-fee">{svc.fees && svc.fees !== "None" ? "Fee: " + svc.fees : "Free"}</div>
                    <div className="card-arr">&gt;</div>
                  </div>
                </div>
              ))}
            </div>
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
                  <span className="chip">Time: {currentService.processingTime}</span>
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

      {!currentService && (
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

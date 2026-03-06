import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import dilgIcon from './Dilg.svg';


// ── Icon imports ──────────────────────────────────────────────────────────────
import leaveIcon         from "./assets/icons/leave.png";
import travelIcon        from "./assets/icons/travel.png";
import certIcon          from "./assets/icons/certification.png";
import equipmentIcon     from "./assets/icons/equipment.png";
import vehicleIcon       from "./assets/icons/vehicle.png";
import procurementIcon   from "./assets/icons/procurement.png";
import claimsRoIcon      from "./assets/icons/claims-regional.png";
import claimsPoIcon      from "./assets/icons/claims-provincial.png";
import ictIcon           from "./assets/icons/ict.png";
import legalIcon         from "./assets/icons/legal.png";
import touchIcon         from "./assets/icons/touch.svg";

// ── helpers ──────────────────────────────────────────────────────────────────
const STORE_KEY = "dilg_kiosk_v1";

const DEFAULT_DATA = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  settings: {
    kioskTitle: "Citizen's Charter Information Kiosk",
    office: "DILG Region XIII (Caraga)",
    address: "Purok 1-A, Doongan, Butuan City",
    tagline: "Serbisyong Maaasahan, Madali at Mabilis",
    hours: "Monday to Friday, 8:00 AM – 5:00 PM",
    perPage: 6,
    resetTimer: 60,
    adminPin: "0000",
    updateUrl: "",
    autoCheckUpdates: false,
  },
  services: [
    {
      id: "s1", icon: leaveIcon, label: "Leave Application", classification: "Simple",
      processingTime: "1 WD, 4 hrs, 40 min", fees: "None",
      desc: "Processing of leave applications based on CSC rules and regulations and DILG policies.",
      who: "All DILG Officials and Employees", office: "FAD – Personnel Section (FAD–PS)",
      requirements: [{ text: "Fully accomplished CSC Form No. 6 (Application for Leave) with signature of immediate supervisor and appropriate attachments", where: "DILG Intranet / CSC website" }],
      steps: ["Submit accomplished leave application form with complete attachments via physical submission or Document Management System (DMS).", "Agency verifies correctness of form, reviews leave balance, evaluates, and endorses to the approving authority.", "Approving authority (Regional Director / Provincial Director) approves or disapproves the leave.", "Receive notification on status and a copy of the approved or disapproved leave application."]
    },
    {
      id: "s2", icon: travelIcon, label: "Request for Authority to Travel Abroad", classification: "Complex",
      processingTime: "6 WDs, 2 hrs, 10 min", fees: "None",
      desc: "Facilitates requests for authorization for personal travel abroad based on DILG policies.",
      who: "DILG Regional and Field Office Personnel", office: "FAD – Personnel Section (FAD–PS)",
      requirements: [{ text: "Letter request indicating date and place of travel", where: "Client" }, { text: "CSC Form No. 6 (Application for Leave)", where: "DILG Intranet / CSC website" }, { text: "CSC Form No. 7 (Clearance Form)", where: "DILG Intranet / CSC website" }],
      steps: ["Submit letter request with leave and clearance forms to the Field or Regional Office.", "Agency facilitates approval of CSC Forms and processes leave application.", "Regional Office drafts endorsement and forwards to Central Office for Travel Authority preparation.", "USLG/SILG signs the Travel Authority. Receive approved Travel Authority or disapproval letter."]
    },
    {
      id: "s3", icon: certIcon, label: "Request for Certification and Records on Personnel Matters", classification: "Simple",
      processingTime: "2 WDs, 7 hrs, 20 min", fees: "None",
      desc: "Facilitates requests for certificates on employment and other personnel records of active and inactive employees.",
      who: "Former and Present DILG Employees", office: "FAD – Personnel Section (FAD–PS)",
      requirements: [{ text: "Properly filled-out Personnel Records Requisition Form (1 original copy)", where: "DILG Regional Office website" }],
      steps: ["Submit the requisition form personally, through e-mail, or via Document Management System (DMS).", "Agency checks appropriateness of request, gathers records, and prepares the requested document/s.", "Claim the requested document/s and accomplish the Client Satisfaction Measurement (CSM) form."]
    },
    {
      id: "s4", icon: equipmentIcon, label: "Request for Release of Equipment", classification: "Simple",
      processingTime: "35 minutes", fees: "None",
      desc: "Monitors the release and return of office equipment within DILG offices.",
      who: "DILG Central, Regional, and Field Offices", office: "FAD – General Support Section (FAD–GSS)",
      requirements: [{ text: "Request for Equipment Release Form (1 original or electronic copy), signed by immediate supervisor", where: "FAD–GSS" }],
      steps: ["Submit signed request form personally, via e-mail, or through Document Management System (DMS).", "Agency receives, checks, reviews, and approves the request form; details are logged.", "Receive the approved form and obtain the equipment. Upon return, submit the form again for recording."]
    },
    {
      id: "s5", icon: vehicleIcon, label: "Provision of Vehicular Support Service", classification: "Simple",
      processingTime: "32 minutes", fees: "None",
      desc: "Administrative process of providing transport assistance to all DILG Central, Regional, and Field Office employees.",
      who: "DILG Central, Regional, and Field Offices", office: "FAD – General Support Section (FAD–GSS)",
      requirements: [{ text: "Request for Vehicular Support Service Form (1 original or electronic copy)", where: "AS–GSD Motorpool / FAD–GSS" }, { text: "Supporting documents (e.g., approved travel order, itinerary)", where: "Client" }],
      steps: ["Submit request form with supporting documents at least 24 hours before the travel date.", "Agency evaluates the request for official nature and vehicle availability; assigns driver and vehicle.", "Receive approval or disapproval notice with details of the assigned driver and vehicle."]
    },
    {
      id: "s6", icon: procurementIcon, label: "Procurement, Inspection, Acceptance, and Issuance of Goods and Services", classification: "Highly Technical",
      processingTime: "Varies per mode", fees: "None",
      desc: "Procurement per RA No. 9184 (Government Procurement Reform Act) and inspection/acceptance per COA rules.",
      who: "End-users, Suppliers, and Service Providers", office: "FAD–GSS / BAC Secretariat",
      requirements: [{ text: "Approved and funded Purchase Request (PR) – 1 original + 1 photocopy", where: "End-user Office" }, { text: "Project Procurement Management Plan (PPMP) – 1 photocopy", where: "AS–PMD / BAC Secretariat" }, { text: "Terms of Reference (TOR) – 1 original", where: "End-user Office" }, { text: "Market Analysis with quotations – 1 original", where: "End-user Office" }, { text: "Certificate of Availability of Funds – 1 original", where: "FMS – Budget and Accounting Divisions" }],
      steps: ["End-user submits approved and funded PR with PPMP and supporting documents to the BAC Secretariat.", "BAC determines procurement method and posts the invitation to bid on PhilGEPS and the DILG website.", "Pre-bidding conference, opening of bids, and detailed evaluation are conducted by the BAC.", "Post-qualification; resolution recommending award; Notice of Award (NOA) is issued.", "Supplier submits performance security; PO/Contract and Notice to Proceed (NTP) are issued."]
    },
    {
      id: "s7", icon: claimsRoIcon, label: "Processing and Payment of Claims (Regional Offices)", classification: "Complex",
      processingTime: "5 WDs and 7 hrs", fees: "None",
      desc: "Processing and payment of various claims through LDDAP-ADA or issuance of check per accounting rules.",
      who: "DILG Officials & Employees, Financial Institutions (GSIS, HDMF, EMPC, PHIC, etc.)", office: "FAD – Accounting Section / Cashier Section",
      requirements: [{ text: "Obligation Request and Status (ORS) – 1 original + 3 photocopies", where: "COA website / Government Accounting Manual Vol. 2" }, { text: "Authority of accountable officer from Head of Agency (for cash advances)", where: "Office of the Regional Director" }, { text: "Approved Fidelity Bond for cash accountability of ₱5,001 and above", where: "Bureau of Treasury / FMS" }],
      steps: ["Submit complete claim documents to the FAD – Accounting Section.", "Agency reviews and processes the claim; prepares Disbursement Voucher (DV).", "Approved DV forwarded to the Cashier for payment via LDDAP-ADA or check issuance.", "Receive payment and sign payroll/voucher as acknowledgment."]
    },
    {
      id: "s8", icon: claimsPoIcon, label: "Processing and Payment of Claims (Provincial Offices)", classification: "Complex",
      processingTime: "3 WDs and 7 hrs", fees: "None",
      desc: "Processing and payment of claims for Provincial Offices through LDDAP-ADA or check per COA and accounting rules.",
      who: "DILG Officials & Employees, Financial Institutions (GSIS, HDMF, EMPC, PHIC, etc.)", office: "FAD – Accounting Section / Cashier Section",
      requirements: [{ text: "Obligation Request and Status (ORS) – 1 original + 3 photocopies", where: "COA website / Government Accounting Manual Vol. 2" }, { text: "Authority of accountable officer from Head of Agency (for cash advances)", where: "Office of the Provincial Director" }, { text: "Approved Fidelity Bond for cash accountability of ₱5,001 and above", where: "Bureau of Treasury / FMS" }],
      steps: ["Submit complete claim documents to the Provincial Office – Accounting Section.", "Agency reviews the claim and prepares the Disbursement Voucher (DV).", "Approved DV forwarded to the Cashier; payment released via LDDAP-ADA or check.", "Receive payment and sign payroll/voucher as acknowledgment."]
    },
    {
      id: "s9", icon: ictIcon, label: "Provision of Preventive Maintenance and Technical Assistance on ICT Resources", classification: "Simple",
      processingTime: "2 WDs, 4 hrs, 15 min", fees: "None",
      desc: "Provides appropriate action on ICT-related complaints and requests for preventive maintenance and technical assistance.",
      who: "DILG Regional and Field Office Personnel", office: "Regional ICT Unit (RICTU)",
      requirements: [{ text: "Accomplished Technical Assistance Request Form (TARF) – 1 copy", where: "RICTU / DILG Office Website" }],
      steps: ["Submit duly accomplished Technical Assistance Request Form (TARF) to RICTU personnel.", "RICTU receives, records, and conducts initial assessment of the ICT concern.", "RICTU performs preventive maintenance or technical assistance, or escalates as needed.", "Receive resolution confirmation and accomplish the Client Satisfaction Measurement (CSM) form."]
    },
    {
      id: "s10", icon: legalIcon, label: "Review of MOAs/MOUs/Contracts/Department & Presidential Issuances", classification: "Highly Technical",
      processingTime: "25 WDs and 4 hrs", fees: "None",
      desc: "Evaluation and preparation of comments and recommendations on draft policies, MOAs, MOUs, and contracts involving the Department.",
      who: "DILG Officials/Employees/Field Personnel, LGU Officials, and the General Public", office: "DILG Regional Office – Legal Division",
      requirements: [{ text: "Letter request addressed to SILG/other Department Officials/Head of LLLS (1 original or electronic copy)", where: "Client" }, { text: "Draft MOA/MOU/Contract/Department or Presidential Issuance for review", where: "Client" }],
      steps: ["Submit the request with the draft document to the concerned DILG Regional Office.", "Agency receives, records, routes the document, and conducts legal research on applicable laws.", "Evaluates document and prepares review comments and recommendations.", "Regional Director approves comments; endorses to Central Office for complex matters.", "Receive the reviewed document with official comments and recommendations."]
    }
  ]
};

function loadData() {
  try {
    const r = localStorage.getItem(STORE_KEY);
    return r ? JSON.parse(r) : JSON.parse(JSON.stringify(DEFAULT_DATA));
  } catch { return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
}
function saveData(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { }
}
function badgeClass(c) {
  return c === "Simple" ? "badge-simple" : c === "Complex" ? "badge-complex" : "badge-ht";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ServiceEditor({ service, onSave, onBack }) {
  const [form, setForm] = useState({
    icon: service?.icon || "",
    classification: service?.classification || "Simple",
    label: service?.label || "",
    desc: service?.desc || "",
    processingTime: service?.processingTime || "",
    fees: service?.fees || "None",
    who: service?.who || "",
    office: service?.office || "",
    requirements: service?.requirements ? [...service.requirements] : [],
    steps: service?.steps ? [...service.steps] : [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setReq = (i, key, val) => setForm(f => { const r = [...f.requirements]; r[i] = { ...r[i], [key]: val }; return { ...f, requirements: r }; });
  const delReq = i => setForm(f => { const r = [...f.requirements]; r.splice(i, 1); return { ...f, requirements: r }; });
  const addReq = () => setForm(f => ({ ...f, requirements: [...f.requirements, { text: "", where: "" }] }));
  const setStep = (i, v) => setForm(f => { const s = [...f.steps]; s[i] = v; return { ...f, steps: s }; });
  const delStep = i => setForm(f => { const s = [...f.steps]; s.splice(i, 1); return { ...f, steps: s }; });
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ""] }));

  const handleSave = () => {
    if (!form.label.trim()) { alert("Service name is required."); return; }
    onSave({
      ...form,
      id: service?.id || ("svc_" + Date.now()),
      requirements: form.requirements.filter(r => r.text.trim()),
      steps: form.steps.filter(s => s.trim())
    });
  };

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="a-btn a-btn-ghost a-btn-sm" onClick={onBack}>← Back</button>
        <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: ".04em", flex: 1 }}>
          {service ? "Edit Service" : "Add New Service"}
        </div>
        <button className="a-btn a-btn-primary" onClick={handleSave}>💾 Save Service</button>
      </div>

      <div className="a-field">
        <label className="a-label">Classification</label>
        <select className="a-select" value={form.classification} onChange={e => set("classification", e.target.value)}>
          <option>Simple</option>
          <option>Complex</option>
          <option>Highly Technical</option>
        </select>
      </div>

      <div className="a-field">
        <label className="a-label">Service Name</label>
        <input className="a-input" value={form.label} onChange={e => set("label", e.target.value)} />
      </div>
      <div className="a-field">
        <label className="a-label">Short Description</label>
        <textarea className="a-textarea" rows={2} value={form.desc} onChange={e => set("desc", e.target.value)} />
      </div>

      <div className="a-row">
        <div className="a-field">
          <label className="a-label">Processing Time</label>
          <input className="a-input" value={form.processingTime} onChange={e => set("processingTime", e.target.value)} />
        </div>
        <div className="a-field">
          <label className="a-label">Fees</label>
          <input className="a-input" value={form.fees} onChange={e => set("fees", e.target.value)} />
        </div>
      </div>

      <div className="a-row">
        <div className="a-field">
          <label className="a-label">Who May Avail</label>
          <input className="a-input" value={form.who} onChange={e => set("who", e.target.value)} />
        </div>
        <div className="a-field">
          <label className="a-label">Responsible Office</label>
          <input className="a-input" value={form.office} onChange={e => set("office", e.target.value)} />
        </div>
      </div>

      <div className="a-divider" />

      <div className="a-field">
        <label className="a-label">Requirements</label>
        <div className="dyn-list">
          {form.requirements.map((r, i) => (
            <div key={i} className="dyn-item">
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <input className="a-input" value={r.text} placeholder="Requirement description..." onChange={e => setReq(i, "text", e.target.value)} />
                <input className="a-input" value={r.where} placeholder="Where to secure..." onChange={e => setReq(i, "where", e.target.value)} />
              </div>
              <button className="dyn-item-del" onClick={() => delReq(i)}>✕</button>
            </div>
          ))}
        </div>
        <button className="dyn-add-btn" onClick={addReq}>+ Add Requirement</button>
      </div>

      <div className="a-divider" />

      <div className="a-field">
        <label className="a-label">Steps – How to Avail</label>
        <div className="dyn-list">
          {form.steps.map((s, i) => (
            <div key={i} className="dyn-item">
              <input className="a-input" value={s} placeholder="Describe this step..." onChange={e => setStep(i, e.target.value)} />
              <button className="dyn-item-del" onClick={() => delStep(i)}>✕</button>
            </div>
          ))}
        </div>
        <button className="dyn-add-btn" onClick={addStep}>+ Add Step</button>
      </div>
    </div>
  );
}

// ── AdminPanel ────────────────────────────────────────────────────────────────
function AdminPanel({ appData, onDataChange, onClose }) {
  const [activeTab, setActiveTab] = useState("services");
  const [editingIdx, setEditingIdx] = useState(null);
  const [settingsForm, setSettingsForm] = useState({ ...appData.settings });
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [updateUrl, setUpdateUrl] = useState(appData.settings.updateUrl || "");
  const [autoCheck, setAutoCheck] = useState(appData.settings.autoCheckUpdates || false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);
  const [pasteJson, setPasteJson] = useState("");

  const showStatus = (setter, type, msg) => {
    setter({ type, msg });
    setTimeout(() => setter(null), 5000);
  };

  const saveSettings = () => {
    const s = {
      ...settingsForm,
      perPage: parseInt(settingsForm.perPage) || 6,
      resetTimer: parseInt(settingsForm.resetTimer) || 60,
    };
    onDataChange({ ...appData, settings: { ...appData.settings, ...s, adminPin: appData.settings.adminPin } });
    showStatus(setSettingsStatus, "success", "✓ Settings saved successfully.");
  };

  const changePin = () => {
    if (oldPin !== appData.settings.adminPin) { showStatus(setSettingsStatus, "error", "✗ Current PIN is incorrect."); return; }
    if (!/^\d{4}$/.test(newPin)) { showStatus(setSettingsStatus, "error", "✗ New PIN must be exactly 4 digits."); return; }
    onDataChange({ ...appData, settings: { ...appData.settings, adminPin: newPin } });
    setOldPin(""); setNewPin("");
    showStatus(setSettingsStatus, "success", "✓ PIN changed successfully.");
  };

  const checkUpdates = async () => {
    if (!updateUrl.trim()) { showStatus(setUpdateStatus, "error", "✗ Please enter an update URL first."); return; }
    showStatus(setUpdateStatus, "info", "⟳ Checking for updates...");
    try {
      const r = await fetch(updateUrl, { cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const remote = await r.json();
      if (!remote.version) throw new Error("Invalid update file format.");
      if (remote.version <= appData.version) {
        showStatus(setUpdateStatus, "success", "✓ Already up to date (version " + appData.version + ").");
        setPendingUpdate(null);
      } else {
        showStatus(setUpdateStatus, "info", "⬆ Update available: version " + remote.version);
        setPendingUpdate(remote);
      }
    } catch (e) {
      showStatus(setUpdateStatus, "error", "✗ Could not fetch update: " + e.message);
    }
  };

  const applyUpdate = () => {
    if (!pendingUpdate) return;
    const pin = appData.settings.adminPin;
    const newData = {
      ...appData,
      services: pendingUpdate.services || appData.services,
      version: pendingUpdate.version,
      lastUpdated: new Date().toISOString(),
    };
    if (pendingUpdate.settings) newData.settings = { ...pendingUpdate.settings, adminPin: pin };
    onDataChange(newData);
    setPendingUpdate(null);
    showStatus(setUpdateStatus, "success", "✓ Update applied! Now at version " + pendingUpdate.version + ".");
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "dilg-kiosk-backup.json"; a.click();
  };

  const exportUpdateFile = () => {
    const d = JSON.parse(JSON.stringify(appData)); delete d.settings.adminPin;
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "kiosk-update.json"; a.click();
  };

  const importData = (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.services || !data.settings) throw new Error("Invalid backup format.");
      onDataChange({ ...data, settings: { ...data.settings, adminPin: appData.settings.adminPin } });
      showStatus(setBackupStatus, "success", "✓ Imported! " + data.services.length + " services loaded.");
    } catch (e) {
      showStatus(setBackupStatus, "error", "✗ Import failed: " + e.message);
    }
  };

  const confirmReset = () => {
    if (!window.confirm("Reset ALL data to factory defaults? PIN resets to 0000.")) return;
    onDataChange(JSON.parse(JSON.stringify(DEFAULT_DATA)));
    showStatus(setBackupStatus, "success", "✓ Reset to defaults complete.");
  };

  const navItems = [
    { id: "services", label: "Services" },
    { id: "settings", label: "Settings" },
    { id: "updates",  label: "Updates"  },
    { id: "backup",   label: "Backup"   },
  ];

  const StatusMsg = ({ status }) =>
    status ? <div className={`a-status ${status.type}`}>{status.msg}</div> : null;

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-title">Admin Panel</div>
          <div className="admin-brand-sub">DILG Kiosk CMS</div>
        </div>
        <nav className="admin-nav">
          {navItems.map(n => (
            <div
              key={n.id}
              className={`admin-nav-item${activeTab === n.id ? " active" : ""}`}
              onClick={() => { setActiveTab(n.id); setEditingIdx(null); }}
            >
              {n.label}
            </div>
          ))}
        </nav>
        <div className="admin-footer">
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginBottom: 8 }}>Data v{appData.version}</div>
          <button className="admin-logout" onClick={onClose}>✕ Exit Admin</button>
        </div>
      </div>

      <div className="admin-content">

        {/* ── SERVICES ── */}
        {activeTab === "services" && (
          editingIdx === null ? (
            <div>
              <div className="admin-tab-title">Services</div>
              <div className="admin-tab-sub">Add, edit, or remove services shown on the kiosk.</div>
              <button className="a-btn a-btn-success" style={{ marginBottom: 18 }} onClick={() => setEditingIdx(-1)}>
                + Add New Service
              </button>
              <div className="svc-list">
                {appData.services.map((s, idx) => (
                  <div key={s.id} className="svc-row">
                    <div className="svc-row-icon">
                      {s.icon && <img src={s.icon} alt={s.label} />}
                    </div>
                    <div className="svc-row-info">
                      <div className="svc-row-name">{s.label}</div>
                      <div className="svc-row-meta">{s.classification} · {s.processingTime} · Fees: {s.fees || "None"}</div>
                    </div>
                    <div className="svc-row-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setEditingIdx(idx)}>✏️ Edit</button>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => {
                        if (!window.confirm(`Delete "${s.label}"?`)) return;
                        const services = appData.services.filter((_, i) => i !== idx);
                        onDataChange({ ...appData, services, version: appData.version + 1 });
                      }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ServiceEditor
              service={editingIdx >= 0 ? appData.services[editingIdx] : null}
              onBack={() => setEditingIdx(null)}
              onSave={(svc) => {
                const services = [...appData.services];
                if (editingIdx >= 0) services[editingIdx] = svc; else services.push(svc);
                onDataChange({ ...appData, services, version: appData.version + 1, lastUpdated: new Date().toISOString() });
                setEditingIdx(null);
              }}
            />
          )
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div>
            <div className="admin-tab-title">Settings</div>
            <div className="admin-tab-sub">Configure kiosk display text, timers, and admin PIN.</div>
            <StatusMsg status={settingsStatus} />
            <div className="settings-grid">
              {[
                ["s_title",   "Kiosk Title (Idle Screen)", "kioskTitle", true ],
                ["s_office",  "Office Name",               "office",     false],
                ["s_address", "Address",                   "address",    false],
                ["s_tagline", "Tagline",                   "tagline",    true ],
                ["s_hours",   "Office Hours",              "hours",      true ],
              ].map(([id, lbl, key, wide]) => (
                <div key={id} className={`a-field${wide ? " settings-wide" : ""}`}>
                  <label className="a-label">{lbl}</label>
                  <input
                    className="a-input"
                    value={settingsForm[key] || ""}
                    onChange={e => setSettingsForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="a-field">
                <label className="a-label">Services Per Page</label>
                <input className="a-input" type="number" min={3} max={9}
                  value={settingsForm.perPage || 6}
                  onChange={e => setSettingsForm(f => ({ ...f, perPage: e.target.value }))} />
              </div>
              <div className="a-field">
                <label className="a-label">Inactivity Reset (seconds)</label>
                <input className="a-input" type="number" min={10} max={300}
                  value={settingsForm.resetTimer || 60}
                  onChange={e => setSettingsForm(f => ({ ...f, resetTimer: e.target.value }))} />
              </div>
            </div>

            <div className="a-divider" />
            <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Change Admin PIN</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 14 }}>
              Default PIN is <strong style={{ color: "var(--gold)" }}>0000</strong>.
            </div>
            <div className="a-row">
              <div className="a-field">
                <label className="a-label">Current PIN</label>
                <input className="a-input" type="password" maxLength={4} value={oldPin} onChange={e => setOldPin(e.target.value)} />
              </div>
              <div className="a-field">
                <label className="a-label">New PIN (4 digits)</label>
                <input className="a-input" type="password" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="a-btn a-btn-primary" onClick={saveSettings}>💾 Save Settings</button>
              <button className="a-btn a-btn-ghost"   onClick={changePin}>🔒 Change PIN</button>
            </div>
          </div>
        )}

        {/* ── UPDATES ── */}
        {activeTab === "updates" && (
          <div>
            <div className="admin-tab-title">Online Updates</div>
            <div className="admin-tab-sub">Fetch the latest service data from a remote JSON file.</div>
            <StatusMsg status={updateStatus} />
            <div className="update-url-row">
              <div className="a-field">
                <label className="a-label">Update JSON URL</label>
                <input className="a-input" value={updateUrl} placeholder="https://example.com/kiosk-update.json"
                  onChange={e => setUpdateUrl(e.target.value)} />
              </div>
              <button className="a-btn a-btn-primary" onClick={checkUpdates} style={{ flexShrink: 0 }}>🔍 Check Now</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <input type="checkbox" checked={autoCheck} onChange={e => setAutoCheck(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--gold)" }} />
              <label style={{ fontSize: 13, color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
                Auto-check for updates on kiosk startup
              </label>
            </div>
            {pendingUpdate && (
              <div>
                <div className="a-divider" />
                <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  Changes in version {pendingUpdate.version}:
                </div>
                <div className="update-diff">
                  <div className="update-diff-item">{pendingUpdate.services?.length} services in update</div>
                  {pendingUpdate.settings && <div className="update-diff-item" style={{ color: "#a0b4ff" }}>⚙️ Settings updated</div>}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button className="a-btn a-btn-success" onClick={applyUpdate}>✓ Apply Update</button>
                  <button className="a-btn a-btn-ghost"   onClick={() => setPendingUpdate(null)}>Dismiss</button>
                </div>
              </div>
            )}
            <div className="a-divider" />
            <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 4 }}>
              Export as Update File
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 10 }}>Download current kiosk data as JSON.</div>
            <button className="a-btn a-btn-ghost" onClick={exportUpdateFile}>⬇ Download kiosk-update.json</button>
          </div>
        )}

        {/* ── BACKUP ── */}
        {activeTab === "backup" && (
          <div>
            <div className="admin-tab-title">Backup & Restore</div>
            <div className="admin-tab-sub">Export all data or restore from a previous backup. PIN is never exported.</div>
            <StatusMsg status={backupStatus} />
            <div className="backup-actions">
              <button className="a-btn a-btn-primary" onClick={exportBackup}>⬇ Export Full Backup</button>
              <button className="a-btn a-btn-danger"  onClick={confirmReset}>↩ Reset to Defaults</button>
            </div>
            <div className="a-divider" />
            <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Import Backup</div>
            <label className="backup-import-area" style={{ display: "block" }}>
              <p>📂 <strong>Click to select a backup JSON file</strong></p>
              <p style={{ marginTop: 4, fontSize: 12 }}>or paste JSON below and click Import</p>
              <input type="file" accept=".json" style={{ display: "none" }} onChange={e => {
                const f = e.target.files[0]; if (!f) return;
                const r = new FileReader(); r.onload = ev => importData(ev.target.result); r.readAsText(f);
              }} />
            </label>
            <textarea
              value={pasteJson}
              onChange={e => setPasteJson(e.target.value)}
              placeholder="Paste backup JSON here..."
              style={{ width: "100%", height: 100, marginTop: 12, padding: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "#fff", fontSize: 11, fontFamily: "monospace", outline: "none", resize: "vertical" }}
            />
            <button className="a-btn a-btn-ghost" style={{ marginTop: 10 }} onClick={() => importData(pasteJson)}>
              📥 Import from Pasted JSON
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── AdminOverlay ──────────────────────────────────────────────────────────────
function AdminOverlay({ appData, onDataChange, onClose }) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinErrorAnim, setPinErrorAnim] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const pinKey = (d) => {
    if (pinInput.length >= 4) return;
    const next = pinInput + d;
    setPinInput(next);
    if (next.length === 4) {
      if (next === appData.settings.adminPin) {
        setTimeout(() => setAuthenticated(true), 150);
      } else {
        setPinError("Incorrect PIN. Try again."); setPinErrorAnim(true);
        setTimeout(() => { setPinInput(""); setPinError(""); setPinErrorAnim(false); }, 700);
      }
    }
  };

  const pinDel = () => setPinInput(p => p.slice(0, -1));

  useEffect(() => {
    const handler = (e) => {
      if (authenticated) return;
      if (e.key >= "0" && e.key <= "9") pinKey(e.key);
      else if (e.key === "Backspace") pinDel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="admin-overlay">
      {!authenticated ? (
        <div className="pin-screen">
          <div className="pin-logo">🔐</div>
          <div className="pin-title">Admin Access</div>
          <div className="pin-sub">Enter your 4-digit PIN to continue</div>
          <div className="pin-dots">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`pin-dot${i < pinInput.length ? " filled" : ""}${pinErrorAnim ? " error" : ""}`} />
            ))}
          </div>
          <div className="pin-pad">
            {["1","2","3","4","5","6","7","8","9"].map(d => (
              <button key={d} className="pin-btn" onClick={() => pinKey(d)}>{d}</button>
            ))}
            <button className="pin-btn zero" onClick={() => pinKey("0")}>0</button>
            <button className="pin-btn" onClick={pinDel}>⌫</button>
          </div>
          <div className="pin-err">{pinError}</div>
          <button className="pin-cancel" onClick={onClose}>✕ Cancel</button>
        </div>
      ) : (
        <AdminPanel appData={appData} onDataChange={onDataChange} onClose={onClose} />
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function DILGKiosk() {
  const [appData, setAppData] = useState(() => loadData());
  const [screen, setScreen] = useState("idle");
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

  const handleDataChange = useCallback((newData) => {
    setAppData(newData);
    saveData(newData);
  }, []);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      setClockTime(String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0"));
      setClockDate(days[n.getDay()] + ", " + months[n.getMonth()] + " " + n.getDate() + " " + n.getFullYear());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const startInactivity = useCallback(() => {
    clearTimeout(inactTimerRef.current);
    const bar = inactBarRef.current; if (!bar) return;
    const t = (s.resetTimer || 60) * 1000;
    bar.style.transition = "none"; bar.style.transform = "scaleX(1)";
    void bar.offsetWidth;
    bar.style.transition = `transform ${t / 1000}s linear`;
    bar.style.transform = "scaleX(0)";
    inactTimerRef.current = setTimeout(() => {
      setScreen("idle"); setCurrentPage(0); setCurrentService(null);
    }, t);
  }, [s.resetTimer]);

  const clearInactivity = useCallback(() => {
    clearTimeout(inactTimerRef.current);
    const bar = inactBarRef.current; if (!bar) return;
    bar.style.transition = "none"; bar.style.transform = "scaleX(1)";
  }, []);

  useEffect(() => {
    if (screen === "main") startInactivity();
    else clearInactivity();
  }, [screen, startInactivity, clearInactivity]);

  const handleUserAction = useCallback(() => {
    if (screen === "main") startInactivity();
  }, [screen, startInactivity]);

  const showMain = () => {
    setIdleHiding(true);
    setTimeout(() => { setScreen("main"); setIdleHiding(false); }, 600);
  };

  const PER_PAGE = s.perPage || 6;
  const services = appData.services;
  const totalPages = Math.ceil(services.length / PER_PAGE);
  const pageServices = services.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  const openQueueModal = () => {
    setQueueNum(String(Math.floor(Math.random() * 900) + 100));
    setQueueOpen(true);
    setTimeout(() => setQueueOpen(false), 10000);
  };

  const handleLogoClick = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    clearTimeout(logoTimerRef.current);
    if (next >= 5) { setLogoTaps(0); setShowAdmin(true); }
    else logoTimerRef.current = setTimeout(() => setLogoTaps(0), 4000);
  };

  return (
    <div className="kiosk-root" onClick={handleUserAction} onTouchStart={handleUserAction}>

      {/* IDLE SCREEN */}
      {(screen === "idle" || idleHiding) && (
        <div className={`idle-screen${idleHiding ? " hiding" : ""}`} onClick={!idleHiding ? showMain : undefined}>
          <div className="idle-bg" /><div className="idle-pat" />
          <div className="idle-seal"><img src={dilgIcon} alt="DILG Seal" /></div>
          <div className="idle-title">{s.kioskTitle}</div>
          <div className="idle-sub">{s.tagline}</div>
          <div className="idle-office">{s.office} · {s.address}</div>
          <div className="idle-tap">
            <div className="tap-ring">
             <img className="touchIcon" src={touchIcon} />
            </div>
            <div className="tap-label">Pindutin para Magsimula</div>
          </div>
          <div className="idle-footer">
            Department of the Interior and Local Government · Republic of the Philippines · {s.hours}
          </div>
        </div>
      )}

      {/* MAIN SCREEN */}
      <div className={`main-screen${screen === "main" ? " visible" : ""}`}>
        <header className="header">
          <div className="header-left">
            <div className="header-logo" onClick={handleLogoClick}>
              <img src={dilgIcon} alt="DILG Logo" />
            </div>
            <div className="header-title">
              {s.office} – Citizen's Charter Kiosk
              <span>Department of the Interior and Local Government · {s.address}</span>
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
              <button className="back-btn" onClick={() => setCurrentService(null)}>← Back to Services</button>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <div className="sc-label">Internal Services</div>
                <div className="sc-sep">›</div>
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
              <div className="greeting">Magandang araw! Pumili ng serbisyo — <strong>{s.hours}</strong></div>
              <div className="service-grid">
                {pageServices.map((svc, i) => (
                  <div key={svc.id} className="service-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setCurrentService(svc)}>
                    <div className="card-top">
                      <div className="card-icon">
                        <img src={svc.icon} alt={svc.label} />
                      </div>
                      <span className={`card-badge ${badgeClass(svc.classification)}`}>{svc.classification}</span>
                    </div>
                    <div className="card-label">{svc.label}</div>
                    <div className="card-meta">
                      <div className="card-time">⏱ {svc.processingTime}</div>
                      <div className="card-fee">{svc.fees && svc.fees !== "None" ? "💰 " + svc.fees : "Free"}</div>
                      <div className="card-arr">→</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="detail-banner">
                <div className="detail-icon">
                  <img src={currentService.icon} alt={currentService.label} />
                </div>
                <div className="detail-meta">
                  <h2>{currentService.label}</h2>
                  <p>{currentService.desc}</p>
                  <div className="d-chips">
                    <span className="chip cls">📌 {currentService.classification}</span>
                    <span className="chip">⏱ {currentService.processingTime}</span>
                    <span className="chip">{currentService.fees && currentService.fees !== "None" ? "💰 " + currentService.fees : "🆓 No Fees"}</span>
                    <span className="chip">👤 {currentService.who}</span>
                    <span className="chip">🏢 {currentService.office}</span>
                  </div>
                </div>
              </div>
              <div className="detail-cols">
                <div className="detail-box">
                  <h3>📋 Requirements</h3>
                  {(currentService.requirements || []).map((r, i) => (
                    <div key={i} className="req-item">
                      <div className="req-n">{String(i + 1).padStart(2, "0")}</div>
                      <div>
                        <div>{r.text}</div>
                        <div className="req-wh">📍 {r.where}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="detail-box">
                  <h3>🪜 How to Avail</h3>
                  {(currentService.steps || []).map((step, i) => (
                    <div key={i} className="step-item">
                      <div className="step-c">{i + 1}</div>
                      <div>{step}</div>
                    </div>
                  ))}
                  <div className="queue-area">
                    <div className="no-fee-lbl">
                      {currentService.fees && currentService.fees !== "None"
                        ? "Fees: " + currentService.fees
                        : "No Fees Charged · Zero Contact Policy"}
                    </div>
                    <button className="get-q-btn" onClick={openQueueModal}>Get Queue Number</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!currentService && (
          <div className="pagination">
            <button className="nav-btn" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
            <div className="page-info">Page <span>{currentPage + 1}</span> of <span>{totalPages}</span></div>
            <button className="nav-btn" disabled={(currentPage + 1) * PER_PAGE >= services.length} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
          </div>
        )}

        <div className="inact-bar" ref={inactBarRef} />
      </div>

      {/* QUEUE MODAL */}
      <div className={`modal-ov${queueOpen ? " open" : ""}`}>
        <div className="modal">
          <div className="q-label">Your Queue Number</div>
          <div className="q-num">{queueNum}</div>
          <div className="q-svc">{currentService?.label}</div>
          <div className="q-note">Please wait for your number to be called at the service window.</div>
          <button className="btn-done" onClick={() => setQueueOpen(false)}>Done</button>
        </div>
      </div>

      {/* ADMIN OVERLAY */}
      {showAdmin && (
        <AdminOverlay
          appData={appData}
          onDataChange={handleDataChange}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}
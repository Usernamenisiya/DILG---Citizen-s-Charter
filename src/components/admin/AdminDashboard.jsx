import { useState } from "react";
import ServiceFormEditor from "./ServiceFormEditor";
import IssuanceFormEditor from "./IssuanceFormEditor";
import { ServiceIcon } from "../ServiceIcon";

export default function AdminDashboard({ appData, onDataChange, onClose, defaultData }) {
  const defaultFeedback = appData.feedbackAndComplaints || defaultData.feedbackAndComplaints || {
    title: "Feedback and Complaints Mechanism",
    contact: { email: "", telephone: "" },
    sections: [],
  };
  const defaultIssuances = appData.policiesAndIssuances || defaultData.policiesAndIssuances || {
    title: "Policies and Issuances",
    subtitle: "Compliance references and deadlines",
    items: [],
  };
  const defaultOfficeDirectory = appData.officeDirectory || defaultData.officeDirectory || {
    title: "List of Offices",
    region: "",
    entries: [],
  };
  const defaultExternalServices = appData.externalServices || defaultData.externalServices || [];
  const defaultProfile = appData.organizationalProfile || defaultData.organizationalProfile || {
    title: "Mandate, Mission, Vision and Service Pledge",
    mandate: "",
    mission: "",
    vision: "",
    servicePledge: {
      intro: "",
      serviceCommitment: "",
      pbest: [],
      officeHoursCommitment: "",
      closing: "",
    },
  };
  const currentIssuances = appData.policiesAndIssuances || defaultIssuances;
  const currentExternalServices = appData.externalServices || defaultExternalServices;
  const currentOfficeDirectory = appData.officeDirectory || defaultOfficeDirectory;
  const currentAnnouncements = appData.announcements || [];

  const [activeTab, setActiveTab] = useState("services");
  const [editingIdx, setEditingIdx] = useState(null);
  const [externalEditingIdx, setExternalEditingIdx] = useState(null);
  const [issuanceEditingIdx, setIssuanceEditingIdx] = useState(null);
  const [officeEditingIdx, setOfficeEditingIdx] = useState(null);
  const [announcementEditingIdx, setAnnouncementEditingIdx] = useState(null);
  const [settingsForm, setSettingsForm] = useState({ ...appData.settings });
  const [feedbackForm, setFeedbackForm] = useState(JSON.parse(JSON.stringify(defaultFeedback)));
  const [issuanceMetaForm, setIssuanceMetaForm] = useState({
    title: defaultIssuances.title || "Policies and Issuances",
    subtitle: defaultIssuances.subtitle || "Compliance references and deadlines",
  });
  const [profileForm, setProfileForm] = useState({
    title: defaultProfile.title || "Mandate, Mission, Vision and Service Pledge",
    mandate: defaultProfile.mandate || "",
    mission: defaultProfile.mission || "",
    vision: defaultProfile.vision || "",
    pledgeIntro: defaultProfile.servicePledge?.intro || "",
    pledgeServiceCommitment: defaultProfile.servicePledge?.serviceCommitment || "",
    pbestText: (defaultProfile.servicePledge?.pbest || []).join("\n"),
    pledgeOfficeHours: defaultProfile.servicePledge?.officeHoursCommitment || "",
    pledgeClosing: defaultProfile.servicePledge?.closing || "",
  });
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [officeMetaForm, setOfficeMetaForm] = useState({
    title: defaultOfficeDirectory.title || "List of Offices",
    region: defaultOfficeDirectory.region || "",
  });
  const [officeForm, setOfficeForm] = useState({ office: "", address: "", contact: "" });
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [issuanceStatus, setIssuanceStatus] = useState(null);
  const [officeStatus, setOfficeStatus] = useState(null);
  const [profileStatus, setProfileStatus] = useState(null);
  const [announcementStatus, setAnnouncementStatus] = useState(null);
  const [updateUrl, setUpdateUrl] = useState(appData.settings.updateUrl || "");
  const [autoCheck, setAutoCheck] = useState(appData.settings.autoCheckUpdates || false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);
  const [pasteJson, setPasteJson] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({ message: "" });

  const callApi = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const data = await response.json();
        if (data?.error) message = data.error;
      } catch {
        // Ignore invalid JSON responses.
      }
      throw new Error(message);
    }

    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const showStatus = (setter, type, msg) => {
    setter({ type, msg });
    setTimeout(() => setter(null), 5000);
  };

  const saveSettings = async () => {
    const s = {
      ...settingsForm,
      perPage: parseInt(settingsForm.perPage) || 6,
      resetTimer: parseInt(settingsForm.resetTimer) || 60,
      updateUrl,
      autoCheckUpdates: autoCheck,
    };

    const nextSettings = { ...appData.settings, ...s, adminPin: appData.settings.adminPin };

    try {
      await callApi("/api/settings", {
        method: "PUT",
        body: JSON.stringify(nextSettings),
      });
      onDataChange({ ...appData, settings: nextSettings });
      showStatus(setSettingsStatus, "success", "✓ Settings saved successfully.");
    } catch (e) {
      showStatus(setSettingsStatus, "error", `✗ ${e.message}`);
    }
  };

  const changePin = async () => {
    if (oldPin !== appData.settings.adminPin) {
      showStatus(setSettingsStatus, "error", "✗ Current PIN is incorrect.");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      showStatus(setSettingsStatus, "error", "✗ New PIN must be exactly 4 digits.");
      return;
    }
    const nextSettings = { ...appData.settings, adminPin: newPin };
    try {
      await callApi("/api/settings", {
        method: "PUT",
        body: JSON.stringify(nextSettings),
      });
      onDataChange({ ...appData, settings: nextSettings });
      setOldPin("");
      setNewPin("");
      showStatus(setSettingsStatus, "success", "✓ PIN changed successfully.");
    } catch (e) {
      showStatus(setSettingsStatus, "error", `✗ ${e.message}`);
    }
  };

  const saveFeedback = async () => {
    const normalizeLines = txt =>
      String(txt || "")
        .split("\n")
        .map(v => v.trim())
        .filter(Boolean);

    const sections = (feedbackForm.sections || []).map((section, idx) => {
      const paragraphSource = section.paragraphsText ?? (section.paragraphs || []).join("\n");
      const itemSource = section.itemsText ?? (section.items || []).join("\n");

      if (idx === 2) {
        return {
          heading: section.heading || "",
          paragraphs: normalizeLines(paragraphSource),
          items: normalizeLines(itemSource),
        };
      }

      return {
        heading: section.heading || "",
        paragraphs: normalizeLines(paragraphSource),
      };
    });

    const updatedFeedback = {
      title: feedbackForm.title || "Feedback and Complaints Mechanism",
      contact: {
        email: feedbackForm.contact?.email || "",
        telephone: feedbackForm.contact?.telephone || "",
      },
      sections,
    };

    try {
      await callApi("/api/feedback", {
        method: "PUT",
        body: JSON.stringify(updatedFeedback),
      });
      onDataChange({
        ...appData,
        feedbackAndComplaints: updatedFeedback,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      setFeedbackForm(JSON.parse(JSON.stringify(updatedFeedback)));
      showStatus(setFeedbackStatus, "success", "✓ Feedback and complaints content saved.");
    } catch (e) {
      showStatus(setFeedbackStatus, "error", `✗ ${e.message}`);
    }
  };

  const addFeedbackSection = () => {
    setFeedbackForm(f => ({
      ...f,
      sections: [...(f.sections || []), { heading: "", paragraphs: [] }],
    }));
  };

  const removeFeedbackSection = idx => {
    setFeedbackForm(f => ({
      ...f,
      sections: (f.sections || []).filter((_, i) => i !== idx),
    }));
  };

  const saveIssuanceMeta = async () => {
    const current = appData.policiesAndIssuances || defaultIssuances;
    const updated = {
      ...current,
      title: issuanceMetaForm.title || "Policies and Issuances",
      subtitle: issuanceMetaForm.subtitle || "Compliance references and deadlines",
      items: current.items || [],
    };

    try {
      await callApi("/api/issuances/meta", {
        method: "PUT",
        body: JSON.stringify({
          title: updated.title,
          subtitle: updated.subtitle,
        }),
      });
      onDataChange({
        ...appData,
        policiesAndIssuances: updated,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setIssuanceStatus, "success", "✓ Issuance panel heading saved.");
    } catch (e) {
      showStatus(setIssuanceStatus, "error", `✗ ${e.message}`);
    }
  };

  const saveProfile = async () => {
    const pbest = String(profileForm.pbestText || "")
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

    const updatedProfile = {
      title: profileForm.title || "Mandate, Mission, Vision and Service Pledge",
      mandate: profileForm.mandate || "",
      mission: profileForm.mission || "",
      vision: profileForm.vision || "",
      servicePledge: {
        intro: profileForm.pledgeIntro || "",
        serviceCommitment: profileForm.pledgeServiceCommitment || "",
        pbest,
        officeHoursCommitment: profileForm.pledgeOfficeHours || "",
        closing: profileForm.pledgeClosing || "",
      },
    };

    try {
      await callApi("/api/profile", {
        method: "PUT",
        body: JSON.stringify(updatedProfile),
      });
      onDataChange({
        ...appData,
        organizationalProfile: updatedProfile,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setProfileStatus, "success", "✓ Mandate, Mission, Vision and Service Pledge saved.");
    } catch (e) {
      showStatus(setProfileStatus, "error", `✗ ${e.message}`);
    }
  };

  const saveOfficeMeta = async () => {
    const updated = {
      ...currentOfficeDirectory,
      title: officeMetaForm.title || "List of Offices",
      region: officeMetaForm.region || "",
      entries: currentOfficeDirectory.entries || [],
    };

    try {
      await callApi("/api/offices/meta", {
        method: "PUT",
        body: JSON.stringify({ title: updated.title, region: updated.region }),
      });
      onDataChange({
        ...appData,
        officeDirectory: updated,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setOfficeStatus, "success", "✓ Office directory heading saved.");
    } catch (e) {
      showStatus(setOfficeStatus, "error", `✗ ${e.message}`);
    }
  };

  const startEditOffice = idx => {
    const entry = (currentOfficeDirectory.entries || [])[idx] || { office: "", address: "", contact: "" };
    setOfficeForm({
      office: entry.office || "",
      address: entry.address || "",
      contact: entry.contact || "",
    });
    setOfficeEditingIdx(idx);
  };

  const startAddOffice = () => {
    setOfficeForm({ office: "", address: "", contact: "" });
    setOfficeEditingIdx(-1);
  };

  const saveOfficeEntry = async () => {
    const officeName = String(officeForm.office || "").trim();
    if (!officeName) {
      showStatus(setOfficeStatus, "error", "✗ Office name is required.");
      return;
    }

    const nextEntry = {
      office: officeName,
      address: String(officeForm.address || "").trim(),
      contact: String(officeForm.contact || "").trim(),
    };

    try {
      const editingEntry = officeEditingIdx >= 0 ? (currentOfficeDirectory.entries || [])[officeEditingIdx] : null;
      let savedEntry = null;

      if (editingEntry?.id) {
        await callApi(`/api/offices/${editingEntry.id}`, {
          method: "PUT",
          body: JSON.stringify(nextEntry),
        });
        savedEntry = { ...editingEntry, ...nextEntry };
      } else {
        savedEntry = await callApi("/api/offices", {
          method: "POST",
          body: JSON.stringify(nextEntry),
        });
      }

      const entries = [...(currentOfficeDirectory.entries || [])];
      if (officeEditingIdx >= 0) entries[officeEditingIdx] = savedEntry;
      else entries.push(savedEntry);

      onDataChange({
        ...appData,
        officeDirectory: {
          ...currentOfficeDirectory,
          title: officeMetaForm.title || currentOfficeDirectory.title || "List of Offices",
          region: officeMetaForm.region || currentOfficeDirectory.region || "",
          entries,
        },
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      setOfficeEditingIdx(null);
      setOfficeForm({ office: "", address: "", contact: "" });
      showStatus(setOfficeStatus, "success", "✓ Office entry saved.");
    } catch (e) {
      showStatus(setOfficeStatus, "error", `✗ ${e.message}`);
    }
  };

  const deleteOfficeEntry = async idx => {
    const entry = (currentOfficeDirectory.entries || [])[idx];
    if (!entry) return;
    if (!window.confirm(`Delete "${entry.office || "office entry"}"?`)) return;

    try {
      if (entry.id) {
        await callApi(`/api/offices/${entry.id}`, { method: "DELETE" });
      }
      const entries = (currentOfficeDirectory.entries || []).filter((_, i) => i !== idx);
      onDataChange({
        ...appData,
        officeDirectory: {
          ...currentOfficeDirectory,
          entries,
        },
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setOfficeStatus, "success", "✓ Office entry deleted.");
    } catch (e) {
      showStatus(setOfficeStatus, "error", `✗ ${e.message}`);
    }
  };

  const startAddAnnouncement = () => {
    setAnnouncementForm({ message: "" });
    setAnnouncementEditingIdx(-1);
  };

  const startEditAnnouncement = idx => {
    const entry = currentAnnouncements[idx] || { message: "" };
    setAnnouncementForm({ message: entry.message || "" });
    setAnnouncementEditingIdx(idx);
  };

  const saveAnnouncement = async () => {
    const message = String(announcementForm.message || "").trim();
    if (!message) {
      showStatus(setAnnouncementStatus, "error", "✗ Announcement message is required.");
      return;
    }

    try {
      const editingEntry = announcementEditingIdx >= 0 ? currentAnnouncements[announcementEditingIdx] : null;
      let savedEntry = null;

      if (editingEntry?.id) {
        await callApi(`/api/announcements/${editingEntry.id}`, {
          method: "PUT",
          body: JSON.stringify({ message }),
        });
        savedEntry = { ...editingEntry, message };
      } else {
        savedEntry = await callApi("/api/announcements", {
          method: "POST",
          body: JSON.stringify({ message }),
        });
      }

      const announcements = [...currentAnnouncements];
      if (announcementEditingIdx >= 0) announcements[announcementEditingIdx] = savedEntry;
      else announcements.push(savedEntry);

      onDataChange({
        ...appData,
        announcements,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      setAnnouncementEditingIdx(null);
      setAnnouncementForm({ message: "" });
      showStatus(setAnnouncementStatus, "success", "✓ Announcement saved.");
    } catch (e) {
      showStatus(setAnnouncementStatus, "error", `✗ ${e.message}`);
    }
  };

  const deleteAnnouncement = async idx => {
    const entry = currentAnnouncements[idx];
    if (!entry) return;
    if (!window.confirm("Delete this announcement?")) return;

    try {
      if (entry.id) {
        await callApi(`/api/announcements/${entry.id}`, { method: "DELETE" });
      }
      const announcements = currentAnnouncements.filter((_, i) => i !== idx);
      onDataChange({
        ...appData,
        announcements,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setAnnouncementStatus, "success", "✓ Announcement deleted.");
    } catch (e) {
      showStatus(setAnnouncementStatus, "error", `✗ ${e.message}`);
    }
  };

  const checkUpdates = async () => {
    if (!updateUrl.trim()) {
      showStatus(setUpdateStatus, "error", "✗ Please enter an update URL first.");
      return;
    }
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
      externalServices: pendingUpdate.externalServices || appData.externalServices,
      organizationalProfile: pendingUpdate.organizationalProfile || appData.organizationalProfile,
      officeDirectory: pendingUpdate.officeDirectory || appData.officeDirectory,
      policiesAndIssuances: pendingUpdate.policiesAndIssuances || appData.policiesAndIssuances,
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
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dilg-kiosk-backup.json";
    a.click();
  };

  const exportUpdateFile = () => {
    const d = JSON.parse(JSON.stringify(appData));
    delete d.settings.adminPin;
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kiosk-update.json";
    a.click();
  };

  const importData = jsonStr => {
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
    onDataChange(JSON.parse(JSON.stringify(defaultData)));
    showStatus(setBackupStatus, "success", "✓ Reset to defaults complete.");
  };

  const navItems = [
    { id: "services", label: "Internal Services" },
    { id: "external-services", label: "External Services" },
    { id: "issuances", label: "Issuances" },
    { id: "profile", label: "Profile" },
    { id: "feedback", label: "Feedback" },
    { id: "announcements", label: "Announcements" },
    { id: "offices", label: "Offices" },
    { id: "settings", label: "Settings" },
    { id: "updates", label: "Updates" },
    { id: "backup", label: "Backup" },
  ];

  const StatusMsg = ({ status }) => (status ? <div className={`a-status ${status.type}`}>{status.msg}</div> : null);

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
              onClick={() => {
                setActiveTab(n.id);
                setEditingIdx(null);
                setExternalEditingIdx(null);
                setIssuanceEditingIdx(null);
                setOfficeEditingIdx(null);
                setAnnouncementEditingIdx(null);
              }}
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
        {activeTab === "services" && (
          editingIdx === null ? (
            <div className="admin-sub-content">
              <div className="admin-tab-title">Services</div>
              <div className="admin-tab-sub">Add, edit, or remove services shown on the kiosk.</div>
              <button className="a-btn a-btn-success" style={{ marginBottom: 18 }} onClick={() => setEditingIdx(-1)}>
                + Add New Service
              </button>
              <div className="svc-list">
                {appData.services.map((s, idx) => (
                  <div key={s.id} className="svc-row">
                    <div className="svc-row-icon">
                      <ServiceIcon icon={s.icon} label={s.label} size={22} className="svc-row-icon-glyph" />
                    </div>
                    <div className="svc-row-info">
                      <div className="svc-row-name">{s.label}</div>
                      <div className="svc-row-meta">{s.classification} · {s.processingTime} · Fees: {s.fees || "None"}</div>
                    </div>
                    <div className="svc-row-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setEditingIdx(idx)}>✏️ Edit</button>
                      <button
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={async () => {
                          if (!window.confirm(`Delete "${s.label}"?`)) return;
                          const response = await fetch(`/api/services/internal/${s.id}`, { method: "DELETE" });
                          if (!response.ok) {
                            const errText = await response.text();
                            alert("Failed to delete service from database: " + (errText || response.status));
                            return;
                          }
                          const services = appData.services.filter((_, i) => i !== idx);
                          onDataChange({ ...appData, services, version: appData.version + 1, lastUpdated: new Date().toISOString() });
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ServiceFormEditor
              serviceType="internal"
              service={editingIdx >= 0 ? appData.services[editingIdx] : null}
              onBack={() => setEditingIdx(null)}
              onSave={svc => {
                const services = [...appData.services];
                if (editingIdx >= 0) services[editingIdx] = svc;
                else services.push(svc);
                onDataChange({ ...appData, services, version: appData.version + 1, lastUpdated: new Date().toISOString() });
                setEditingIdx(null);
              }}
            />
          )
        )}

        {activeTab === "external-services" && (
          externalEditingIdx === null ? (
            <div className="admin-sub-content">
              <div className="admin-tab-title">External Services</div>
              <div className="admin-tab-sub">Add, edit, or remove external services shown on the kiosk.</div>
              <button className="a-btn a-btn-success" style={{ marginBottom: 18 }} onClick={() => setExternalEditingIdx(-1)}>
                + Add New External Service
              </button>
              <div className="svc-list">
                {currentExternalServices.map((s, idx) => (
                  <div key={s.id || idx} className="svc-row">
                    <div className="svc-row-icon">
                      <ServiceIcon icon={s.icon} label={s.label} size={22} className="svc-row-icon-glyph" />
                    </div>
                    <div className="svc-row-info">
                      <div className="svc-row-name">{s.label}</div>
                      <div className="svc-row-meta">{s.classification} · {s.processingTime} · Fees: {s.fees || "None"}</div>
                    </div>
                    <div className="svc-row-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setExternalEditingIdx(idx)}>✏️ Edit</button>
                      <button
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={async () => {
                          if (!window.confirm(`Delete "${s.label}"?`)) return;
                          const response = await fetch(`/api/services/external/${s.id}`, { method: "DELETE" });
                          if (!response.ok) {
                            const errText = await response.text();
                            alert("Failed to delete service from database: " + (errText || response.status));
                            return;
                          }
                          const externalServices = currentExternalServices.filter((_, i) => i !== idx);
                          onDataChange({
                            ...appData,
                            externalServices,
                            version: appData.version + 1,
                            lastUpdated: new Date().toISOString(),
                          });
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ServiceFormEditor
              serviceType="external"
              service={externalEditingIdx >= 0 ? currentExternalServices[externalEditingIdx] : null}
              onBack={() => setExternalEditingIdx(null)}
              onSave={svc => {
                const externalServices = [...currentExternalServices];
                if (externalEditingIdx >= 0) {
                  externalServices[externalEditingIdx] = svc;
                } else {
                  externalServices.push({
                    ...svc,
                    id: svc.id || "ext_" + Date.now(),
                    icon: svc.icon || currentExternalServices[0]?.icon || appData.services[0]?.icon || "",
                  });
                }
                onDataChange({
                  ...appData,
                  externalServices,
                  version: appData.version + 1,
                  lastUpdated: new Date().toISOString(),
                });
                setExternalEditingIdx(null);
              }}
            />
          )
        )}

        {activeTab === "issuances" && (
          issuanceEditingIdx === null ? (
            <div className="admin-sub-content">
              <div className="admin-tab-title">Policies and Issuances</div>
              <div className="admin-tab-sub">Manage circular summaries, compliance highlights, and deadlines displayed on the kiosk.</div>
              <StatusMsg status={issuanceStatus} />

              <div className="a-row">
                <div className="a-field">
                  <label className="a-label">Panel Title</label>
                  <input
                    className="a-input"
                    value={issuanceMetaForm.title}
                    onChange={e => setIssuanceMetaForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Panel Subtitle</label>
                  <input
                    className="a-input"
                    value={issuanceMetaForm.subtitle}
                    onChange={e => setIssuanceMetaForm(f => ({ ...f, subtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <button className="a-btn a-btn-primary" onClick={saveIssuanceMeta}>Save Issuance Panel</button>
                <button className="a-btn a-btn-success" onClick={() => setIssuanceEditingIdx(-1)}>+ Add New Issuance</button>
              </div>

              <div className="svc-list">
                {(currentIssuances.items || []).map((item, idx) => (
                  <div key={item.id} className="svc-row">
                    <div className="svc-row-info">
                      <div className="svc-row-name">{item.circularNo || item.title || "Untitled Issuance"}</div>
                      <div className="svc-row-meta">{item.date || "No date"} · {item.subject || "No subject"}</div>
                    </div>
                    <div className="svc-row-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setIssuanceEditingIdx(idx)}>Edit</button>
                      <button
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={async () => {
                          if (!window.confirm(`Delete "${item.circularNo || item.title || "issuance"}"?`)) return;
                          try {
                            await callApi(`/api/issuances/${item.id}`, { method: "DELETE" });
                            const current = appData.policiesAndIssuances || defaultIssuances;
                            const items = (current.items || []).filter((_, i) => i !== idx);
                            onDataChange({
                              ...appData,
                              policiesAndIssuances: { ...current, items },
                              version: appData.version + 1,
                              lastUpdated: new Date().toISOString(),
                            });
                            showStatus(setIssuanceStatus, "success", "✓ Issuance deleted.");
                          } catch (e) {
                            showStatus(setIssuanceStatus, "error", `✗ ${e.message}`);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <IssuanceFormEditor
              issuance={issuanceEditingIdx >= 0 ? currentIssuances.items?.[issuanceEditingIdx] : null}
              onBack={() => setIssuanceEditingIdx(null)}
              onSave={async issuance => {
                try {
                  const isEditing = issuanceEditingIdx >= 0;
                  const url = isEditing ? `/api/issuances/${issuance.id}` : "/api/issuances";
                  const method = isEditing ? "PUT" : "POST";
                  const saved = await callApi(url, {
                    method,
                    body: JSON.stringify(issuance),
                  });

                  const nextIssuance = !isEditing && saved?.id ? { ...issuance, id: saved.id } : issuance;
                  const current = appData.policiesAndIssuances || defaultIssuances;
                  const items = [...(current.items || [])];
                  if (isEditing) items[issuanceEditingIdx] = nextIssuance;
                  else items.push(nextIssuance);

                  onDataChange({
                    ...appData,
                    policiesAndIssuances: {
                      ...current,
                      title: issuanceMetaForm.title || current.title,
                      subtitle: issuanceMetaForm.subtitle || current.subtitle,
                      items,
                    },
                    version: appData.version + 1,
                    lastUpdated: new Date().toISOString(),
                  });
                  setIssuanceEditingIdx(null);
                  showStatus(setIssuanceStatus, "success", "✓ Issuance saved.");
                } catch (e) {
                  showStatus(setIssuanceStatus, "error", `✗ ${e.message}`);
                }
              }}
            />
          )
        )}

        {activeTab === "settings" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Settings</div>
            <div className="admin-tab-sub">Configure kiosk display text, timers, and admin PIN.</div>
            <StatusMsg status={settingsStatus} />
            <div className="settings-grid">
              {[
                ["s_title", "Kiosk Title (Idle Screen)", "kioskTitle", true],
                ["s_office", "Office Name", "office", false],
                ["s_address", "Address", "address", false],
                ["s_tagline", "Tagline", "tagline", true],
                ["s_hours", "Office Hours", "hours", true],
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
                <input
                  className="a-input"
                  type="number"
                  min={9}
                  max={9}
                  value={settingsForm.perPage || 9}
                  onChange={e => setSettingsForm(f => ({ ...f, perPage: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <label className="a-label">Inactivity Reset (seconds)</label>
                <input
                  className="a-input"
                  type="number"
                  min={10}
                  max={300}
                  value={settingsForm.resetTimer || 60}
                  onChange={e => setSettingsForm(f => ({ ...f, resetTimer: e.target.value }))}
                />
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
              <button className="a-btn a-btn-ghost" onClick={changePin}>🔒 Change PIN</button>
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Feedback and Complaints</div>
            <div className="admin-tab-sub">Edit the kiosk's feedback and complaints mechanism section shown on the main services screen.</div>
            <StatusMsg status={feedbackStatus} />

            <div className="a-field">
              <label className="a-label">Section Title</label>
              <input
                className="a-input"
                value={feedbackForm.title || ""}
                onChange={e => setFeedbackForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="a-row">
              <div className="a-field">
                <label className="a-label">Contact Email</label>
                <input
                  className="a-input"
                  value={feedbackForm.contact?.email || ""}
                  onChange={e =>
                    setFeedbackForm(f => ({
                      ...f,
                      contact: { ...(f.contact || {}), email: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="a-field">
                <label className="a-label">Telephone</label>
                <input
                  className="a-input"
                  value={feedbackForm.contact?.telephone || ""}
                  onChange={e =>
                    setFeedbackForm(f => ({
                      ...f,
                      contact: { ...(f.contact || {}), telephone: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12, marginBottom: 12 }}>
              <button className="a-btn a-btn-success" onClick={addFeedbackSection}>+ Add Section</button>
            </div>

            {(feedbackForm.sections || []).map((section, idx) => (
              <div key={idx}>
                <div className="a-divider" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div className="a-label" style={{ marginBottom: 0 }}>Section {idx + 1}</div>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => removeFeedbackSection(idx)}>Delete Section</button>
                </div>
                <div className="a-field">
                  <label className="a-label">Heading</label>
                  <input
                    className="a-input"
                    value={section.heading || ""}
                    onChange={e =>
                      setFeedbackForm(f => ({
                        ...f,
                        sections: (f.sections || []).map((s, i) => (i === idx ? { ...s, heading: e.target.value } : s)),
                      }))
                    }
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Paragraphs (one per line)</label>
                  <textarea
                    className="a-textarea"
                    style={{ minHeight: 90 }}
                    value={section.paragraphsText ?? (section.paragraphs || []).join("\n")}
                    onChange={e =>
                      setFeedbackForm(f => ({
                        ...f,
                        sections: (f.sections || []).map((s, i) => (i === idx ? { ...s, paragraphsText: e.target.value } : s)),
                      }))
                    }
                  />
                </div>
                {idx === 2 && (
                  <div className="a-field">
                    <label className="a-label">Complaint Required Details (one per line)</label>
                    <textarea
                      className="a-textarea"
                      style={{ minHeight: 80 }}
                      value={section.itemsText ?? (section.items || []).join("\n")}
                      onChange={e =>
                        setFeedbackForm(f => ({
                          ...f,
                          sections: (f.sections || []).map((s, i) => (i === idx ? { ...s, itemsText: e.target.value } : s)),
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="a-btn a-btn-primary" onClick={saveFeedback}>💾 Save Feedback Content</button>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Announcements</div>
            <div className="admin-tab-sub">Add, edit, or remove ticker announcements shown on Idle and Menu screens.</div>
            <StatusMsg status={announcementStatus} />

            {announcementEditingIdx !== null && (
              <div>
                <div className="a-field">
                  <label className="a-label">Announcement Message</label>
                  <textarea
                    className="a-textarea"
                    value={announcementForm.message}
                    onChange={e => setAnnouncementForm({ message: e.target.value })}
                    placeholder="Type announcement text..."
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <button className="a-btn a-btn-primary" onClick={saveAnnouncement}>Save Announcement</button>
                  <button
                    className="a-btn a-btn-ghost"
                    onClick={() => {
                      setAnnouncementEditingIdx(null);
                      setAnnouncementForm({ message: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {announcementEditingIdx === null && (
              <button className="a-btn a-btn-success" style={{ marginBottom: 18 }} onClick={startAddAnnouncement}>
                + Add New Announcement
              </button>
            )}

            <div className="svc-list">
              {currentAnnouncements.map((item, idx) => (
                <div key={item.id || idx} className="svc-row">
                  <div className="svc-row-info">
                    <div className="svc-row-name">Announcement {idx + 1}</div>
                    <div className="svc-row-meta" style={{ color: "#334b84", fontSize: 12 }}>{item.message}</div>
                  </div>
                  <div className="svc-row-actions">
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEditAnnouncement(idx)}>Edit</button>
                    <button className="a-btn a-btn-danger a-btn-sm" onClick={() => deleteAnnouncement(idx)}>Delete</button>
                  </div>
                </div>
              ))}
              {!currentAnnouncements.length && (
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>No announcements yet. Add one to show in the ticker.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "offices" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">List of Offices</div>
            <div className="admin-tab-sub">Manage office directory title, region, and office contact entries shown in the kiosk.</div>
            <StatusMsg status={officeStatus} />

            <div className="a-row">
              <div className="a-field">
                <label className="a-label">Panel Title</label>
                <input
                  className="a-input"
                  value={officeMetaForm.title}
                  onChange={e => setOfficeMetaForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <label className="a-label">Region Label</label>
                <input
                  className="a-input"
                  value={officeMetaForm.region}
                  onChange={e => setOfficeMetaForm(f => ({ ...f, region: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <button className="a-btn a-btn-primary" onClick={saveOfficeMeta}>Save Office Directory Header</button>
              <button className="a-btn a-btn-success" onClick={startAddOffice}>+ Add Office Entry</button>
            </div>

            {officeEditingIdx !== null && (
              <div>
                <div className="a-divider" />
                <div className="a-field">
                  <label className="a-label">Office Name</label>
                  <input
                    className="a-input"
                    value={officeForm.office}
                    onChange={e => setOfficeForm(f => ({ ...f, office: e.target.value }))}
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Address</label>
                  <textarea
                    className="a-textarea"
                    value={officeForm.address}
                    onChange={e => setOfficeForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Contact</label>
                  <input
                    className="a-input"
                    value={officeForm.contact}
                    onChange={e => setOfficeForm(f => ({ ...f, contact: e.target.value }))}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  <button className="a-btn a-btn-primary" onClick={saveOfficeEntry}>Save Office Entry</button>
                  <button className="a-btn a-btn-ghost" onClick={() => setOfficeEditingIdx(null)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="svc-list">
              {(currentOfficeDirectory.entries || []).map((entry, idx) => (
                <div key={`${entry.office}-${idx}`} className="svc-row">
                  <div className="svc-row-info">
                    <div className="svc-row-name">{entry.office || "Untitled Office"}</div>
                    <div className="svc-row-meta">{entry.contact || "No contact"}</div>
                    {!!entry.address && <div className="svc-row-meta">{entry.address}</div>}
                  </div>
                  <div className="svc-row-actions">
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEditOffice(idx)}>Edit</button>
                    <button
                      className="a-btn a-btn-danger a-btn-sm"
                      onClick={() => deleteOfficeEntry(idx)}
                      >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Mandate, Mission, Vision and Service Pledge</div>
            <div className="admin-tab-sub">Edit the institutional profile section shown on the kiosk menu.</div>
            <StatusMsg status={profileStatus} />

            <div className="a-field">
              <label className="a-label">Section Title</label>
              <input
                className="a-input"
                value={profileForm.title}
                onChange={e => setProfileForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">I. Mandate</label>
              <textarea
                className="a-textarea"
                value={profileForm.mandate}
                onChange={e => setProfileForm(f => ({ ...f, mandate: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">II. Mission</label>
              <textarea
                className="a-textarea"
                value={profileForm.mission}
                onChange={e => setProfileForm(f => ({ ...f, mission: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">III. Vision</label>
              <textarea
                className="a-textarea"
                value={profileForm.vision}
                onChange={e => setProfileForm(f => ({ ...f, vision: e.target.value }))}
              />
            </div>

            <div className="a-divider" />

            <div className="a-field">
              <label className="a-label">IV. Service Pledge - Intro</label>
              <textarea
                className="a-textarea"
                value={profileForm.pledgeIntro}
                onChange={e => setProfileForm(f => ({ ...f, pledgeIntro: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">IV. Service Pledge - Service Commitment</label>
              <textarea
                className="a-textarea"
                value={profileForm.pledgeServiceCommitment}
                onChange={e => setProfileForm(f => ({ ...f, pledgeServiceCommitment: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">PBEST Items (one per line)</label>
              <textarea
                className="a-textarea"
                value={profileForm.pbestText}
                onChange={e => setProfileForm(f => ({ ...f, pbestText: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">Office Hours Commitment</label>
              <textarea
                className="a-textarea"
                value={profileForm.pledgeOfficeHours}
                onChange={e => setProfileForm(f => ({ ...f, pledgeOfficeHours: e.target.value }))}
              />
            </div>

            <div className="a-field">
              <label className="a-label">Closing Statement</label>
              <textarea
                className="a-textarea"
                value={profileForm.pledgeClosing}
                onChange={e => setProfileForm(f => ({ ...f, pledgeClosing: e.target.value }))}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="a-btn a-btn-primary" onClick={saveProfile}>Save Profile Content</button>
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Online Updates</div>
            <div className="admin-tab-sub">Fetch the latest service data from a remote JSON file.</div>
            <StatusMsg status={updateStatus} />
            <div className="update-url-row">
              <div className="a-field">
                <label className="a-label">Update JSON URL</label>
                <input className="a-input" value={updateUrl} placeholder="https://example.com/kiosk-update.json" onChange={e => setUpdateUrl(e.target.value)} />
              </div>
              <button className="a-btn a-btn-primary" onClick={checkUpdates} style={{ flexShrink: 0 }}>🔍 Check Now</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={autoCheck}
                onChange={e => setAutoCheck(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
              />
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
                  {pendingUpdate.officeDirectory && <div className="update-diff-item">Office directory data included</div>}
                  {pendingUpdate.policiesAndIssuances && <div className="update-diff-item">Policies and issuances data included</div>}
                  {pendingUpdate.settings && <div className="update-diff-item" style={{ color: "#a0b4ff" }}>⚙️ Settings updated</div>}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button className="a-btn a-btn-success" onClick={applyUpdate}>✓ Apply Update</button>
                  <button className="a-btn a-btn-ghost" onClick={() => setPendingUpdate(null)}>Dismiss</button>
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

        {activeTab === "backup" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Backup & Restore</div>
            <div className="admin-tab-sub">Export all data or restore from a previous backup. PIN is never exported.</div>
            <StatusMsg status={backupStatus} />
            <div className="backup-actions">
              <button className="a-btn a-btn-primary" onClick={exportBackup}>⬇ Export Full Backup</button>
              <button className="a-btn a-btn-danger" onClick={confirmReset}>↩ Reset to Defaults</button>
            </div>
            <div className="a-divider" />
            <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Import Backup</div>
            <label className="backup-import-area" style={{ display: "block" }}>
              <p>📂 <strong>Click to select a backup JSON file</strong></p>
              <p style={{ marginTop: 4, fontSize: 12 }}>or paste JSON below and click Import</p>
              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = ev => importData(ev.target.result);
                  r.readAsText(f);
                }}
              />
            </label>
            <textarea
              value={pasteJson}
              onChange={e => setPasteJson(e.target.value)}
              placeholder="Paste backup JSON here..."
              style={{
                width: "100%",
                height: 100,
                marginTop: 12,
                padding: 10,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 11,
                fontFamily: "monospace",
                outline: "none",
                resize: "vertical",
              }}
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

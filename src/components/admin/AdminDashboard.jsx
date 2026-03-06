import { useState } from "react";
import ServiceFormEditor from "./ServiceFormEditor";

export default function AdminDashboard({ appData, onDataChange, onClose, defaultData }) {
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
      updateUrl,
      autoCheckUpdates: autoCheck,
    };
    onDataChange({ ...appData, settings: { ...appData.settings, ...s, adminPin: appData.settings.adminPin } });
    showStatus(setSettingsStatus, "success", "✓ Settings saved successfully.");
  };

  const changePin = () => {
    if (oldPin !== appData.settings.adminPin) {
      showStatus(setSettingsStatus, "error", "✗ Current PIN is incorrect.");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      showStatus(setSettingsStatus, "error", "✗ New PIN must be exactly 4 digits.");
      return;
    }
    onDataChange({ ...appData, settings: { ...appData.settings, adminPin: newPin } });
    setOldPin("");
    setNewPin("");
    showStatus(setSettingsStatus, "success", "✓ PIN changed successfully.");
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
    { id: "services", label: "Services" },
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
                      <button
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={() => {
                          if (!window.confirm(`Delete "${s.label}"?`)) return;
                          const services = appData.services.filter((_, i) => i !== idx);
                          onDataChange({ ...appData, services, version: appData.version + 1 });
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

        {activeTab === "settings" && (
          <div>
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
                  min={3}
                  max={9}
                  value={settingsForm.perPage || 6}
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

        {activeTab === "updates" && (
          <div>
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
          <div>
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

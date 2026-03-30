import { useState } from "react";

export default function IssuanceFormEditor({ issuance, onSave, onBack }) {
  const [form, setForm] = useState({
    title: issuance?.title || "",
    circularNo: issuance?.circularNo || "",
    subject: issuance?.subject || "",
    date: issuance?.date || "",
    coverage: issuance?.coverage || "",
    effectivity: issuance?.effectivity || "",
    supersedes: issuance?.supersedes || "",
    approvingAuthority: issuance?.approvingAuthority || "",
    highlightsText: (issuance?.highlights || []).join("\n"),
    deadlinesText: (issuance?.deadlines || []).map(d => `${d.dueDate} | ${d.label}`).join("\n"),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.circularNo.trim() && !form.title.trim()) {
      alert("Circular number or title is required.");
      return;
    }

    const highlights = form.highlightsText
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

    const deadlines = form.deadlinesText
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|");
        if (parts.length < 2) {
          return { dueDate: "Deadline", label: line };
        }
        return { dueDate: parts[0].trim(), label: parts.slice(1).join("|").trim() };
      });

    const issuanceData = {
      id: issuance?.id || "iss_" + Date.now(),
      title: form.title.trim(),
      circularNo: form.circularNo.trim(),
      subject: form.subject.trim(),
      date: form.date.trim(),
      coverage: form.coverage.trim(),
      effectivity: form.effectivity.trim(),
      supersedes: form.supersedes.trim(),
      approvingAuthority: form.approvingAuthority.trim(),
      highlights,
      deadlines,
    };

    if (onSave) onSave(issuanceData);
  };

  return (
    <div className="admin-sub-content" style={{ color: "#0e2a68" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="a-btn a-btn-ghost a-btn-sm" onClick={onBack}>Back</button>
        <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, color: "#07225f", letterSpacing: ".04em", flex: 1 }}>
          {issuance ? "Edit Issuance" : "Add New Issuance"}
        </div>
        <button className="a-btn a-btn-primary" onClick={handleSave}>Save Issuance</button>
      </div>

      <div className="a-row">
        <div className="a-field">
          <label className="a-label">Circular Number</label>
          <input className="a-input" value={form.circularNo} onChange={e => set("circularNo", e.target.value)} />
        </div>
        <div className="a-field">
          <label className="a-label">Date</label>
          <input className="a-input" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
      </div>

      <div className="a-field">
        <label className="a-label">Title (optional)</label>
        <input className="a-input" value={form.title} onChange={e => set("title", e.target.value)} />
      </div>

      <div className="a-field">
        <label className="a-label">Subject</label>
        <textarea className="a-textarea" rows={3} value={form.subject} onChange={e => set("subject", e.target.value)} />
      </div>

      <div className="a-field">
        <label className="a-label">Coverage</label>
        <input className="a-input" value={form.coverage} onChange={e => set("coverage", e.target.value)} />
      </div>

      <div className="a-row">
        <div className="a-field">
          <label className="a-label">Effectivity</label>
          <input className="a-input" value={form.effectivity} onChange={e => set("effectivity", e.target.value)} />
        </div>
        <div className="a-field">
          <label className="a-label">Supersedes</label>
          <input className="a-input" value={form.supersedes} onChange={e => set("supersedes", e.target.value)} />
        </div>
      </div>

      <div className="a-field">
        <label className="a-label">Approving Authority</label>
        <input className="a-input" value={form.approvingAuthority} onChange={e => set("approvingAuthority", e.target.value)} />
      </div>

      <div className="a-field">
        <label className="a-label">Highlights (one per line)</label>
        <textarea
          className="a-textarea"
          rows={6}
          value={form.highlightsText}
          onChange={e => set("highlightsText", e.target.value)}
        />
      </div>

      <div className="a-field">
        <label className="a-label">Deadlines (one per line, format: due date | requirement)</label>
        <textarea
          className="a-textarea"
          rows={5}
          value={form.deadlinesText}
          onChange={e => set("deadlinesText", e.target.value)}
        />
      </div>
    </div>
  );
}

import { useState } from "react";

export default function ServiceFormEditor({ service, onSave, onBack }) {
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
  const setReq = (i, key, val) =>
    setForm(f => {
      const r = [...f.requirements];
      r[i] = { ...r[i], [key]: val };
      return { ...f, requirements: r };
    });
  const delReq = i =>
    setForm(f => {
      const r = [...f.requirements];
      r.splice(i, 1);
      return { ...f, requirements: r };
    });
  const addReq = () =>
    setForm(f => ({ ...f, requirements: [...f.requirements, { text: "", where: "" }] }));
  const setStep = (i, v) =>
    setForm(f => {
      const s = [...f.steps];
      s[i] = v;
      return { ...f, steps: s };
    });
  const delStep = i =>
    setForm(f => {
      const s = [...f.steps];
      s.splice(i, 1);
      return { ...f, steps: s };
    });
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ""] }));

  const handleSave = () => {
    if (!form.label.trim()) {
      alert("Service name is required.");
      return;
    }
    onSave({
      ...form,
      id: service?.id || "svc_" + Date.now(),
      requirements: form.requirements.filter(r => r.text.trim()),
      steps: form.steps.filter(s => s.trim()),
    });
  };

  return (
    <div style={{ color: "#fff" }} className="admin-sub-content">
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
        <label className="a-label">Steps - How to Avail</label>
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

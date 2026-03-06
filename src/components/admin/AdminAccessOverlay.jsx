import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminAccessOverlay({ appData, onDataChange, onClose, defaultData }) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinErrorAnim, setPinErrorAnim] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const pinKey = d => {
    if (pinInput.length >= 4) return;
    const next = pinInput + d;
    setPinInput(next);
    if (next.length === 4) {
      if (next === appData.settings.adminPin) {
        setTimeout(() => setAuthenticated(true), 150);
      } else {
        setPinError("Incorrect PIN. Try again.");
        setPinErrorAnim(true);
        setTimeout(() => {
          setPinInput("");
          setPinError("");
          setPinErrorAnim(false);
        }, 700);
      }
    }
  };

  const pinDel = () => setPinInput(p => p.slice(0, -1));

  useEffect(() => {
    const handler = e => {
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
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => (
              <button key={d} className="pin-btn" onClick={() => pinKey(d)}>{d}</button>
            ))}
            <button className="pin-btn zero" onClick={() => pinKey("0")}>0</button>
            <button className="pin-btn" onClick={pinDel}>⌫</button>
          </div>
          <div className="pin-err">{pinError}</div>
          <button className="pin-cancel" onClick={onClose}>✕ Cancel</button>
        </div>
      ) : (
        <AdminDashboard appData={appData} onDataChange={onDataChange} onClose={onClose} defaultData={defaultData} />
      )}
    </div>
  );
}

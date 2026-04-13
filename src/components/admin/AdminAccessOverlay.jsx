import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Lock, Shield, User, X } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import "../../style/AdminPanel.css";

export default function AdminAccessOverlay({ appData, onDataChange, onClose }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const superAdminPassword = appData.settings.superAdminPin || "0000";
  const adminPassword = appData.settings.adminPin || "1111";
  const expectedPassword = selectedRole === "super-admin" ? superAdminPassword : adminPassword;

  const resetAuthState = () => {
    setPasswordInput("");
    setPasswordError("");
    setShowPassword(false);
  };

  const getHoldToShowHandlers = setter => ({
    onMouseDown: e => {
      e.preventDefault();
      setter(true);
    },
    onMouseUp: () => setter(false),
    onMouseLeave: () => setter(false),
    onTouchStart: () => setter(true),
    onTouchEnd: () => setter(false),
    onTouchCancel: () => setter(false),
    onBlur: () => setter(false),
  });

  const chooseRole = role => {
    setSelectedRole(role);
    resetAuthState();
  };

  const backToRoleSelect = () => {
    setSelectedRole(null);
    resetAuthState();
  };

  const submitPassword = e => {
    e.preventDefault();
    if (!selectedRole) return;
    if (passwordInput === expectedPassword) {
      setAuthenticated(true);
      return;
    }

    setPasswordError("Incorrect password. Try again.");
    setPasswordInput("");
  };

  useEffect(() => {
    setPasswordError("");
  }, [selectedRole]);

  return (
    <div className="admin-overlay">
      {!authenticated ? (
        <div className="pin-screen">
          <div className="pin-logo"><Lock size={44} strokeWidth={2.2} /></div>
          {!selectedRole ? (
            <>
              <div className="pin-title">Choose Access</div>
              <div className="pin-sub">Select role to continue</div>
              <div style={{ display: "grid", gap: 12, width: "100%", marginBottom: 10 }}>
                <button className="a-btn a-btn-primary" onClick={() => chooseRole("super-admin")}>
                  <Shield size={15} className="btn-icon" /> Super Admin
                </button>
                <button className="a-btn a-btn-ghost" onClick={() => chooseRole("admin")}>
                  <User size={15} className="btn-icon" /> Admin
                </button>
              </div>
              <button className="pin-cancel" onClick={onClose}><X size={14} className="btn-icon" /> Cancel</button>
            </>
          ) : (
            <>
              <div className="pin-title">{selectedRole === "super-admin" ? "Super Admin" : "Admin"} Access</div>
              <div className="pin-sub">Enter your password to continue</div>
              <form onSubmit={submitPassword} style={{ width: "100%", maxWidth: 360 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="a-input"
                    style={{ flex: 1 }}
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={e => {
                      if (passwordError) setPasswordError("");
                      setPasswordInput(e.target.value);
                    }}
                    placeholder="Password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="a-btn a-btn-ghost"
                    aria-label="Hold to show password"
                    title="Hold to show password"
                    {...getHoldToShowHandlers(setShowPassword)}
                  >
                    <Eye size={16} className="btn-icon" />
                  </button>
                </div>
                <div className="pin-err">{passwordError}</div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                  <button className="a-btn a-btn-primary" type="submit">Access Dashboard</button>
                </div>
              </form>
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                <button className="pin-cancel" onClick={backToRoleSelect}><ArrowLeft size={14} className="btn-icon" /> Back</button>
                <button className="pin-cancel" onClick={onClose}><X size={14} className="btn-icon" /> Cancel</button>
              </div>
            </>
          )}
        </div>
      ) : (
        selectedRole === "super-admin" ? (
          <SuperAdminDashboard
            appData={appData}
            onDataChange={onDataChange}
            onClose={onClose}
          />
        ) : (
          <AdminDashboard
            appData={appData}
            onDataChange={onDataChange}
            onClose={onClose}
          />
        )
      )}
    </div>
  );
}

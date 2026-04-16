import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FolderOpen,
  GripVertical,
  KeyRound,
  LogOut,
  MapPin,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import ServiceFormEditor from "./ServiceFormEditor";
import IssuanceFormEditor from "./IssuanceFormEditor";
import { ServiceIcon } from "../ServiceIcon";

function AdminFormModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="admin-form-overlay" onClick={onClose}>
      <div className="admin-form-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-form-modal-head">
          <div className="admin-form-modal-title">{title}</div>
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={onClose}>
            <X size={14} className="btn-icon" /> Close
          </button>
        </div>
        <div className="admin-form-modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "danger", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="admin-confirm-overlay" onClick={onCancel}>
      <div className="admin-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-confirm-title">{title || "Please Confirm"}</div>
        <div className="admin-confirm-message">{message}</div>
        <div className="admin-confirm-actions">
          <button type="button" className="a-btn a-btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`a-btn ${tone === "danger" ? "a-btn-danger" : "a-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalSelect({ value, onChange, options = [], className = "a-select" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = event => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = event => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedOption = options.find(option => option.value === value) || options[0] || { value: "", label: "Select" };

  return (
    <div className={`a-dropdown ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className={`${className} a-dropdown-trigger`}
        onClick={() => setOpen(current => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={14} className="a-dropdown-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="a-dropdown-menu" role="listbox">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedOption.value}
              className={`a-dropdown-option ${option.value === selectedOption.value ? "active" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ role = "super-admin", appData, onDataChange, onClose }) {
  const isSuperAdmin = role === "super-admin";
  const canDelete = isSuperAdmin;
  const superAdminPin = String(appData.settings.superAdminPin ?? "0000");
  const adminPin = String(appData.settings.adminPin ?? "1111");
  const defaultFeedback = appData.feedbackAndComplaints || {
    title: "Feedback and Complaints Mechanism",
    contact: { email: "", telephone: "" },
    sections: [],
  };
  const defaultIssuances = appData.policiesAndIssuances || {
    title: "Policies and Issuances",
    subtitle: "Compliance references and deadlines",
    items: [],
  };
  const defaultOfficeDirectory = appData.officeDirectory || {
    title: "List of Offices",
    region: "",
    entries: [],
  };
  const defaultExternalServices = appData.externalServices || [];
  const defaultProfile = appData.organizationalProfile || {
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
  const currentCalendarEvents = appData.calendarEvents || [];
  const currentPrograms = appData.programs || [];

  const [activeTab, setActiveTab] = useState("services");
  const [editingIdx, setEditingIdx] = useState(null);
  const [externalEditingIdx, setExternalEditingIdx] = useState(null);
  const [issuanceEditingIdx, setIssuanceEditingIdx] = useState(null);
  const [officeEditingIdx, setOfficeEditingIdx] = useState(null);
  const [announcementEditingIdx, setAnnouncementEditingIdx] = useState(null);
  const [calendarEditingIdx, setCalendarEditingIdx] = useState(null);
  const [programEditingIdx, setProgramEditingIdx] = useState(null);
  const [calendarForm, setCalendarForm] = useState({
    title: "",
    date: "",
    timeFrom: "",
    timeUntil: "",
    timePeriod: "pm",
    location: "",
    office: "",
    attendees: [],
    attendeeInput: "",
    category: "internal",
    description: "",
  });
  const [calendarStatus, setCalendarStatus] = useState(null);
  const [holidaySyncYear, setHolidaySyncYear] = useState(String(new Date().getFullYear()));
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "",
    uploadedDate: new Date().toISOString().split("T")[0],
  });
  const [programStatus, setProgramStatus] = useState(null);
  const [draggingProgramIdx, setDraggingProgramIdx] = useState(null);
  const [dragOverProgramIdx, setDragOverProgramIdx] = useState(null);
  const [idleVideosStatus, setIdleVideosStatus] = useState(null);
  const [currentIdleVideos, setCurrentIdleVideos] = useState([]);
  const [keyOfficialsStatus, setKeyOfficialsStatus] = useState(null);
  const [keyOfficialsForm, setKeyOfficialsForm] = useState({
    title: "Key Officials",
    imageUrl: "",
    updatedAt: "",
  });
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
  const [adminOldPin, setAdminOldPin] = useState("");
  const [adminNewPin, setAdminNewPin] = useState("");
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showAdminOldPin, setShowAdminOldPin] = useState(false);
  const [showAdminNewPin, setShowAdminNewPin] = useState(false);
  const [passwordModal, setPasswordModal] = useState({ open: false, type: null });
  const [officeMetaForm, setOfficeMetaForm] = useState({
    title: defaultOfficeDirectory.title || "List of Offices",
    region: defaultOfficeDirectory.region || "",
  });

  const [officeForm, setOfficeForm] = useState({ office: "", address: "", contact: "", type: "office" });
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
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    details: "",
    postedBy: "",
    where: "",
    postedOn: "",
    effectiveUntil: "",
    involvedParties: "",
    tickerDisplay: "message",
    attachmentsText: "",
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    tone: "danger",
    resolve: null,
  });

  // Store refs for feedback section heading inputs
  const feedbackSectionRefs = useRef({});
  const feedbackTitleRef = useRef(null); // Ref to the top of feedback section
  // Track which feedback section index to scroll to after saving
  const [scrollToFeedbackSectionIdx, setScrollToFeedbackSectionIdx] = useState(null);

  // Helper function to scroll to an element within the admin-content scrollable container
  const scrollToElementInContainer = (element) => {
    if (!element) return;
    
    // Find the scrollable admin-content container
    const scrollContainer = element.closest(".admin-content");
    if (!scrollContainer) {
      // Fallback to regular scrollIntoView
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Calculate the position relative to the container
    const elementTop = element.offsetTop;
    
    // Scroll to center the element in the visible container
    const targetScroll = elementTop - (scrollContainer.clientHeight / 2) + (element.clientHeight / 2);
    scrollContainer.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const callApi = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", "X-Admin-Role": role, ...(options.headers || {}) },
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

  const requestConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        title: options.title || "Please Confirm",
        message,
        confirmLabel: options.confirmLabel || "Confirm",
        tone: options.tone || "danger",
        resolve,
      });
    });
  };

  const closeConfirm = (result) => {
    const resolver = confirmState.resolve;
    setConfirmState({
      open: false,
      title: "",
      message: "",
      confirmLabel: "Confirm",
      tone: "danger",
      resolve: null,
    });
    if (typeof resolver === "function") resolver(!!result);
  };

  const normalizeIdleVideoUrls = (settingsObj = {}) => {
    const fromList = Array.isArray(settingsObj.idleVideoUrls)
      ? settingsObj.idleVideoUrls.map(url => String(url || "").trim()).filter(Boolean)
      : [];
    if (fromList.length) return Array.from(new Set(fromList));
    const single = String(settingsObj.idleVideoUrl || "").trim();
    return single ? [single] : [];
  };

  const selectedIdleVideoUrls = normalizeIdleVideoUrls(settingsForm);

  const toggleIdleVideoSelection = (videoUrl, checked) => {
    const normalizedUrl = String(videoUrl || "").trim();
    if (!normalizedUrl) return;
    setSettingsForm(prev => {
      const existing = normalizeIdleVideoUrls(prev);
      const nextUrls = checked
        ? Array.from(new Set([...existing, normalizedUrl]))
        : existing.filter(url => url !== normalizedUrl);
      return {
        ...prev,
        idleVideoUrls: nextUrls,
        idleVideoUrl: nextUrls[0] || "",
      };
    });
  };

  const loadIdleVideos = async () => {
    try {
      const videos = await callApi("/api/idle-videos");
      setCurrentIdleVideos(Array.isArray(videos) ? videos : []);
    } catch (e) {
      showStatus(setIdleVideosStatus, "error", `✗ ${e.message}`);
    }
  };

  const loadKeyOfficials = async () => {
    try {
      const data = await callApi("/api/key-officials");
      setKeyOfficialsForm({
        title: String(data?.title || "Key Officials"),
        imageUrl: String(data?.imageUrl || ""),
        updatedAt: String(data?.updatedAt || ""),
      });
    } catch (e) {
      showStatus(setKeyOfficialsStatus, "error", `✗ ${e.message}`);
    }
  };

  const saveKeyOfficials = async () => {
    const title = String(keyOfficialsForm.title || "Key Officials").trim() || "Key Officials";
    const imageUrl = String(keyOfficialsForm.imageUrl || "").trim();
    if (!imageUrl) {
      showStatus(setKeyOfficialsStatus, "error", "✗ Please upload a key officials image first.");
      return;
    }

    try {
      const updated = await callApi("/api/key-officials", {
        method: "PUT",
        body: JSON.stringify({ title, imageUrl }),
      });
      setKeyOfficialsForm({
        title: String(updated?.title || title),
        imageUrl: String(updated?.imageUrl || imageUrl),
        updatedAt: String(updated?.updatedAt || new Date().toISOString()),
      });
      onDataChange({
        ...appData,
        keyOfficials: {
          title: String(updated?.title || title),
          imageUrl: String(updated?.imageUrl || imageUrl),
          updatedAt: String(updated?.updatedAt || new Date().toISOString()),
        },
      });
      showStatus(setKeyOfficialsStatus, "success", "✓ Key Officials details saved.");
    } catch (e) {
      showStatus(setKeyOfficialsStatus, "error", `✗ ${e.message}`);
    }
  };

  const uploadKeyOfficialsImage = async files => {
    const file = Array.from(files || [])[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/key-officials/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = `Upload failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // Ignore invalid upload error payload.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const nextImageUrl = String(data?.imageUrl || keyOfficialsForm.imageUrl || "");
      const nextUpdatedAt = String(data?.updatedAt || new Date().toISOString());
      setKeyOfficialsForm(prev => ({
        ...prev,
        imageUrl: nextImageUrl,
        updatedAt: nextUpdatedAt,
      }));
      onDataChange({
        ...appData,
        keyOfficials: {
          title: String(keyOfficialsForm.title || "Key Officials").trim() || "Key Officials",
          imageUrl: nextImageUrl,
          updatedAt: nextUpdatedAt,
        },
      });
      showStatus(setKeyOfficialsStatus, "success", "✓ Key Officials image uploaded.");
    } catch (e) {
      showStatus(setKeyOfficialsStatus, "error", `✗ ${e.message}`);
    }
  };

  useEffect(() => {
    loadIdleVideos();
    loadKeyOfficials();
  }, []);

  const parseTimeRange = raw => {
    const value = String(raw || "").trim();
    if (!value) return { from: "", until: "", period: "pm" };
    const match = value.match(/^(.+?)\s*-\s*(.+?)(?:\s*(am|pm))?$/i);
    if (!match) return { from: value, until: "", period: "pm" };
    return {
      from: match[1].trim(),
      until: match[2].trim(),
      period: (match[3] || "pm").toLowerCase(),
    };
  };

  const parseAttendees = raw => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
    return String(raw)
      .split(/\r?\n|,|•/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const formatTimeValue = raw => {
    const value = String(raw || "").trim();
    if (!value) return "";
    const digits = value.replace(/[^0-9]/g, "");
    if (!digits) return value;
    if (value.includes(":")) return value;
    const normalized = digits.slice(0, 4);
    if (normalized.length <= 2) return `${parseInt(normalized, 10)}:00`;
    if (normalized.length === 3) {
      return `${parseInt(normalized.slice(0, 1), 10)}:${normalized.slice(1).padEnd(2, "0")}`;
    }
    return `${parseInt(normalized.slice(0, 2), 10)}:${normalized.slice(2)}`;
  };

  const buildTimeRange = ({ timeFrom, timeUntil, timePeriod }) => {
    if (timeFrom && timeUntil) {
      return `${timeFrom} - ${timeUntil} ${timePeriod || "pm"}`;
    }
    return "";
  };

  const saveSettings = async () => {
    const s = {
      ...settingsForm,
      perPage: Math.max(9, parseInt(settingsForm.perPage, 10) || 9),
      resetTimer: parseInt(settingsForm.resetTimer) || 60,
      updateUrl,
      autoCheckUpdates: autoCheck,
    };

    const nextSettings = {
      ...appData.settings,
      ...s,
      adminPin: appData.settings.adminPin,
      superAdminPin,
    };

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

  const parseYouTubeStartSeconds = rawValue => {
    const value = String(rawValue || "").trim().toLowerCase();
    if (!value) return 0;
    if (/^\d+$/.test(value)) return Number(value);

    const hours = (value.match(/(\d+)h/) || [])[1];
    const minutes = (value.match(/(\d+)m/) || [])[1];
    const seconds = (value.match(/(\d+)s/) || [])[1];
    const total = (Number(hours || 0) * 3600) + (Number(minutes || 0) * 60) + Number(seconds || 0);
    return Number.isFinite(total) ? total : 0;
  };

  const normalizeProgramVideoUrl = rawUrl => {
    const input = String(rawUrl || "").trim();
    if (!input) return "";

    const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;

    try {
      const url = new URL(withProtocol);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      const path = url.pathname;
      let videoId = "";

      if (host === "youtu.be") {
        videoId = path.replace(/^\/+/, "").split("/")[0] || "";
      } else if (host === "youtube.com" || host === "m.youtube.com") {
        if (path === "/watch") {
          videoId = url.searchParams.get("v") || "";
        } else if (path.startsWith("/embed/")) {
          videoId = path.replace("/embed/", "").split("/")[0] || "";
        } else if (path.startsWith("/shorts/")) {
          videoId = path.replace("/shorts/", "").split("/")[0] || "";
        }
      }

      if (videoId) {
        const startSeconds = parseYouTubeStartSeconds(
          url.searchParams.get("t") || url.searchParams.get("start") || url.searchParams.get("time_continue")
        );
        const suffix = startSeconds > 0 ? `?start=${startSeconds}` : "";
        return `https://www.youtube.com/embed/${videoId}${suffix}`;
      }
    } catch {
      // Keep original URL for non-YouTube or malformed links.
    }

    return input;
  };

  const getHoldToShowHandlers = (setShowState) => ({
    onMouseDown: () => setShowState(true),
    onMouseUp: () => setShowState(false),
    onMouseLeave: () => setShowState(false),
    onTouchStart: () => setShowState(true),
    onTouchEnd: () => setShowState(false),
  });

  const changeSuperAdminPin = async () => {
    if (!isSuperAdmin) {
      showStatus(setSettingsStatus, "error", "✗ Only Super Admin can change the Super Admin password.");
      return;
    }
    if (String(oldPin) !== superAdminPin) {
      showStatus(setSettingsStatus, "error", "✗ Current password is incorrect.");
      return;
    }
    if (String(newPin || "").length < 4) {
      showStatus(setSettingsStatus, "error", "✗ New password must be at least 4 characters.");
      return;
    }
    const nextSettings = {
      ...appData.settings,
      superAdminPin: newPin,
      adminPin,
    };
    try {
      await callApi("/api/settings", {
        method: "PUT",
        body: JSON.stringify(nextSettings),
      });
      onDataChange({ ...appData, settings: nextSettings });
      setOldPin("");
      setNewPin("");
      showStatus(setSettingsStatus, "success", "✓ Super Admin password changed successfully.");
    } catch (e) {
      showStatus(setSettingsStatus, "error", `✗ ${e.message}`);
    }
  };

  const changeAdminPin = async () => {
    const currentValue = isSuperAdmin ? adminOldPin : oldPin;
    const nextValue = isSuperAdmin ? adminNewPin : newPin;

    if (String(currentValue) !== adminPin) {
      showStatus(setSettingsStatus, "error", "✗ Current Admin password is incorrect.");
      return;
    }
    if (String(nextValue || "").length < 4) {
      showStatus(setSettingsStatus, "error", "✗ New Admin password must be at least 4 characters.");
      return;
    }
    const nextSettings = {
      ...appData.settings,
      adminPin: nextValue,
      superAdminPin,
    };
    try {
      await callApi("/api/settings", {
        method: "PUT",
        body: JSON.stringify(nextSettings),
      });
      onDataChange({ ...appData, settings: nextSettings });
      if (isSuperAdmin) {
        setAdminOldPin("");
        setAdminNewPin("");
      } else {
        setOldPin("");
        setNewPin("");
      }
      showStatus(setSettingsStatus, "success", "✓ Admin password changed successfully.");
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
      
      // Scroll to top of feedback section after saving
      setTimeout(() => {
        if (feedbackTitleRef.current) {
          scrollToElementInContainer(feedbackTitleRef.current);
        }
      }, 50);
    } catch (e) {
      showStatus(setFeedbackStatus, "error", `✗ ${e.message}`);
    }
  };

  const addFeedbackSection = () => {
    const newSectionIndex = (feedbackForm.sections || []).length;
    
    setFeedbackForm(f => ({
      ...f,
      sections: [...(f.sections || []), { heading: "", paragraphs: [] }],
    }));
    
    // Set scroll target to the new section being added
    setScrollToFeedbackSectionIdx(newSectionIndex);
  };

  const removeFeedbackSection = idx => {
    if (!canDelete) {
      showStatus(setFeedbackStatus, "error", "✗ Admin role cannot delete items.");
      return;
    }
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
    const entry = (currentOfficeDirectory.entries || [])[idx] || { office: "", address: "", contact: "", type: "office" };
    setOfficeForm({
      office: entry.office || "",
      address: entry.address || "",
      contact: entry.contact || "",
      type: entry.type || "office",
    });
    setOfficeEditingIdx(idx);
  };

  const startAddOffice = () => {
    setOfficeForm({ office: "", address: "", contact: "", type: "office" });
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
      type: officeForm.type || "office",
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
      setOfficeForm({ office: "", address: "", contact: "", type: "office" });
      showStatus(setOfficeStatus, "success", "✓ Office entry saved.");
    } catch (e) {
      showStatus(setOfficeStatus, "error", `✗ ${e.message}`);
    }
  };

  const deleteOfficeEntry = async idx => {
    if (!canDelete) {
      showStatus(setOfficeStatus, "error", "✗ Admin role cannot delete items.");
      return;
    }
    const entry = (currentOfficeDirectory.entries || [])[idx];
    if (!entry) return;
    if (!await requestConfirm(`Delete "${entry.office || "office entry"}"?`, { title: "Delete Office Entry", confirmLabel: "Delete", tone: "danger" })) return;

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
    setActiveTab("announcements");
    setEditingIdx(null);
    setExternalEditingIdx(null);
    setIssuanceEditingIdx(null);
    setOfficeEditingIdx(null);
    setAnnouncementForm({
      title: "",
      message: "",
      details: "",
      postedBy: "",
      where: "",
      postedOn: "",
      effectiveUntil: "",
      involvedParties: "",
      tickerDisplay: "message",
      attachmentsText: "",
    });
    setAnnouncementEditingIdx(-1);
  };

  const startEditAnnouncement = idx => {
    setActiveTab("announcements");
    setEditingIdx(null);
    setExternalEditingIdx(null);
    setIssuanceEditingIdx(null);
    setOfficeEditingIdx(null);
    const entry = currentAnnouncements[idx] || { message: "" };
    const attachmentsText = (entry.attachments || [])
      .map(file => {
        const fileName = String(file?.name || "").trim();
        const fileUrl = String(file?.url || "").trim();
        if (!fileUrl) return "";
        return fileName ? `${fileName} | ${fileUrl}` : fileUrl;
      })
      .filter(Boolean)
      .join("\n");

    setAnnouncementForm({
      title: entry.title || "",
      message: entry.message || "",
      details: entry.details || "",
      postedBy: entry.postedBy || entry.posted_by || "",
      where: entry.where || entry.announcementWhere || "",
      postedOn: entry.postedOn || entry.posted_on || "",
      effectiveUntil: entry.effectiveUntil || entry.effective_until || "",
      involvedParties: entry.involvedParties || entry.involved_parties || "",
      tickerDisplay: entry.tickerDisplay === "title" ? "title" : "message",
      attachmentsText,
    });
    setAnnouncementEditingIdx(idx);
  };

  const saveAnnouncement = async () => {
    const editingEntry = announcementEditingIdx >= 0 ? currentAnnouncements[announcementEditingIdx] : null;
    const title = String(announcementForm.title || "").trim();
    const message = String(announcementForm.message || "").trim();
    const details = String(announcementForm.details || "").trim();
    const postedBy = String(announcementForm.postedBy || editingEntry?.postedBy || editingEntry?.posted_by || "").trim();
    const where = String(announcementForm.where || editingEntry?.where || editingEntry?.announcementWhere || "").trim();
    const postedOn = String(announcementForm.postedOn || editingEntry?.postedOn || editingEntry?.posted_on || "").trim();
    const effectiveUntil = String(announcementForm.effectiveUntil || editingEntry?.effectiveUntil || editingEntry?.effective_until || "").trim();
    const involvedParties = String(announcementForm.involvedParties || editingEntry?.involvedParties || editingEntry?.involved_parties || "").trim();
    const tickerDisplay = announcementForm.tickerDisplay === "title" ? "title" : "message";
    const attachments = String(announcementForm.attachmentsText || "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|");
        if (parts.length < 2) {
          return { name: "Attachment", url: line };
        }
        return {
          name: String(parts[0] || "Attachment").trim() || "Attachment",
          url: String(parts.slice(1).join("|") || "").trim(),
        };
      })
      .filter(file => !!file.url);

    if (!message) {
      showStatus(setAnnouncementStatus, "error", "✗ Announcement message is required.");
      return;
    }

    try {
      let savedEntry = null;
      const payload = {
        title,
        message,
        details,
        postedBy,
        where,
        postedOn,
        effectiveUntil,
        involvedParties,
        tickerDisplay,
        attachments,
      };

      if (editingEntry?.id) {
        await callApi(`/api/announcements/${editingEntry.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        savedEntry = { ...editingEntry, ...payload };
      } else {
        savedEntry = await callApi("/api/announcements", {
          method: "POST",
          body: JSON.stringify(payload),
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
      setAnnouncementForm({
        title: "",
        message: "",
        details: "",
        postedBy: "",
        where: "",
        postedOn: "",
        effectiveUntil: "",
        involvedParties: "",
        tickerDisplay: "message",
        attachmentsText: "",
      });
      showStatus(setAnnouncementStatus, "success", "✓ Announcement saved.");
    } catch (e) {
      showStatus(setAnnouncementStatus, "error", `✗ ${e.message}`);
    }
  };

  const uploadAnnouncementAttachments = async files => {
    const pickedFiles = Array.from(files || []);
    if (!pickedFiles.length) return;

    try {
      const formData = new FormData();
      pickedFiles.forEach(file => formData.append("files", file));

      const response = await fetch("/api/announcements/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = `Upload failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // Ignore invalid response payload
        }
        throw new Error(message);
      }

      const data = await response.json();
      const uploadedFiles = Array.isArray(data?.files) ? data.files : [];
      if (!uploadedFiles.length) {
        showStatus(setAnnouncementStatus, "error", "✗ No files were uploaded.");
        return;
      }

      const appendedLines = uploadedFiles
        .map(file => {
          const fileName = String(file?.name || "Attachment").trim() || "Attachment";
          const fileUrl = String(file?.url || "").trim();
          if (!fileUrl) return "";
          return `${fileName} | ${fileUrl}`;
        })
        .filter(Boolean)
        .join("\n");

      setAnnouncementForm(prev => ({
        ...prev,
        attachmentsText: [String(prev.attachmentsText || "").trim(), appendedLines]
          .filter(Boolean)
          .join("\n"),
      }));

      showStatus(setAnnouncementStatus, "success", `✓ Uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""}.`);
    } catch (error) {
      showStatus(setAnnouncementStatus, "error", `✗ ${error.message}`);
    }
  };

  const deleteAnnouncement = async idx => {
    if (!canDelete) {
      showStatus(setAnnouncementStatus, "error", "✗ Admin role cannot delete items.");
      return;
    }
    const entry = currentAnnouncements[idx];
    if (!entry) return;
    if (!await requestConfirm("Delete this announcement?", { title: "Delete Announcement", confirmLabel: "Delete", tone: "danger" })) return;

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

  const startAddCalendarEvent = () => {
    setCalendarForm({
      title: "",
      date: "",
      timeFrom: "",
      timeUntil: "",
      timePeriod: "pm",
      location: "",
      office: "",
      attendees: [],
      attendeeInput: "",
      category: "internal",
      description: "",
    });
    setCalendarEditingIdx(-1);
  };

  const startEditCalendarEvent = idx => {
    const entry = currentCalendarEvents[idx] || {};
    const parsed = parseTimeRange(entry.time);
    setCalendarForm({
      title: entry.title || "",
      date: entry.date || "",
      timeFrom: parsed.from,
      timeUntil: parsed.until,
      timePeriod: parsed.period,
      location: entry.location || "",
      office: entry.office || "",
      attendees: parseAttendees(entry.attendees),
      attendeeInput: "",
      category: entry.category || "internal",
      description: entry.description || "",
    });
    setCalendarEditingIdx(idx);
  };

  const saveCalendarEvent = async () => {
    const title = String(calendarForm.title || "").trim();
    const date = String(calendarForm.date || "").trim();
    if (!title || !date) {
      showStatus(setCalendarStatus, "error", "✗ Event title and date are required.");
      return;
    }

    const event = {
      ...calendarForm,
      time: buildTimeRange(calendarForm),
      attendees: Array.isArray(calendarForm.attendees)
        ? calendarForm.attendees.filter(Boolean).map(String)
        : parseAttendees(calendarForm.attendees),
      id: calendarEditingIdx >= 0 && currentCalendarEvents[calendarEditingIdx]?.id
        ? currentCalendarEvents[calendarEditingIdx].id
        : `evt_${Date.now()}`,
    };
    try {
      const savedEvent = calendarEditingIdx >= 0
        ? await callApi(`/api/calendar-events/${event.id}`, {
          method: "PUT",
          body: JSON.stringify(event),
        })
        : await callApi("/api/calendar-events", {
          method: "POST",
          body: JSON.stringify(event),
        });

      const calendarEvents = [...currentCalendarEvents];
      if (calendarEditingIdx >= 0) {
        calendarEvents[calendarEditingIdx] = savedEvent || event;
      } else {
        calendarEvents.push(savedEvent || event);
      }

      onDataChange({
        ...appData,
        calendarEvents,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      setCalendarEditingIdx(null);
      setCalendarStatus({ type: "success", msg: "✓ Calendar event saved." });
    } catch (e) {
      showStatus(setCalendarStatus, "error", `✗ ${e.message}`);
    }
  };

  const deleteCalendarEvent = async idx => {
    if (!canDelete) {
      showStatus(setCalendarStatus, "error", "✗ Admin role cannot delete items.");
      return;
    }
    const entry = currentCalendarEvents[idx];
    if (!entry) return;
    if (!await requestConfirm(`Delete event "${entry.title || entry.id}"?`, { title: "Delete Calendar Event", confirmLabel: "Delete", tone: "danger" })) return;

    try {
      await callApi(`/api/calendar-events/${entry.id}`, { method: "DELETE" });
      const calendarEvents = currentCalendarEvents.filter((_, i) => i !== idx);
      onDataChange({
        ...appData,
        calendarEvents,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setCalendarStatus, "success", "✓ Calendar event deleted.");
    } catch (e) {
      showStatus(setCalendarStatus, "error", `✗ ${e.message}`);
    }
  };

  const syncPhilippineHolidays = async () => {
    const parsedYear = Number(holidaySyncYear);
    if (!Number.isFinite(parsedYear) || parsedYear < 2000 || parsedYear > new Date().getFullYear() + 5) {
      showStatus(setCalendarStatus, "error", "✗ Enter a valid year.");
      return;
    }

    try {
      let result;
      try {
        result = await callApi("/api/calendar-events/sync-holidays", {
          method: "POST",
          body: JSON.stringify({ year: parsedYear, replaceExisting: true }),
        });
      } catch (primaryError) {
        // Some deployments rewrite API prefixes differently.
        if (!String(primaryError?.message || "").includes("404")) throw primaryError;
        result = await callApi("/calendar-events/sync-holidays", {
          method: "POST",
          body: JSON.stringify({ year: parsedYear, replaceExisting: true }),
        });
      }

      const nextEvents = Array.isArray(result?.events)
        ? result.events
        : await callApi("/api/calendar-events");

      onDataChange({
        ...appData,
        calendarEvents: Array.isArray(nextEvents) ? nextEvents : [],
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });

      const inserted = Number(result?.inserted || 0);
      const updated = Number(result?.updated || 0);
      showStatus(setCalendarStatus, "success", `✓ Synced holidays: ${inserted} added, ${updated} updated.`);
    } catch (e) {
      showStatus(setCalendarStatus, "error", `✗ ${e.message}`);
    }
  };

  const startEditProgram = idx => {
    const prog = currentPrograms[idx] || {};
    setProgramForm({
      title: prog.title || "",
      description: prog.description || "",
      videoUrl: prog.videoUrl || "",
      category: prog.category || "",
      uploadedDate: prog.uploadedDate || new Date().toISOString().split("T")[0],
    });
    setProgramEditingIdx(idx);
  };

  const uploadProgramVideos = async files => {
    const pickedFiles = Array.from(files || []);
    if (!pickedFiles.length) return;

    try {
      const formData = new FormData();
      pickedFiles.forEach(file => formData.append("files", file));

      const response = await fetch("/api/programs/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = `Upload failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // Ignore invalid response payload
        }
        throw new Error(message);
      }

      const data = await response.json();
      const uploadedFiles = Array.isArray(data?.files) ? data.files : [];
      if (!uploadedFiles.length) {
        showStatus(setProgramStatus, "error", "✗ No files were uploaded.");
        return;
      }

      const firstUploaded = uploadedFiles[0];
      setProgramForm(prev => ({
        ...prev,
        videoUrl: String(firstUploaded?.url || "").trim() || prev.videoUrl,
      }));
      showStatus(setProgramStatus, "success", `✓ Uploaded ${uploadedFiles.length} video${uploadedFiles.length > 1 ? "s" : ""}.`);
    } catch (error) {
      showStatus(setProgramStatus, "error", `✗ ${error.message}`);
    }
  };

  const saveProgram = async () => {
    const editingEntry = programEditingIdx >= 0 ? currentPrograms[programEditingIdx] : null;
    const title = String(programForm.title || "").trim();
    const videoUrl = normalizeProgramVideoUrl(programForm.videoUrl);
    const description = String(programForm.description || "").trim();
    const category = String(programForm.category || "").trim();
    const uploadedDate = String(programForm.uploadedDate || new Date().toISOString().split("T")[0]).trim();
    if (!title || !videoUrl) {
      showStatus(setProgramStatus, "error", "✗ Program title and uploaded video are required.");
      return;
    }

    try {
      const payload = {
        title,
        description,
        videoUrl,
        category,
        uploadedDate,
      };

      let savedEntry = null;
      if (editingEntry?.id) {
        await callApi(`/api/programs/${editingEntry.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        savedEntry = { ...editingEntry, ...payload };
      } else {
        savedEntry = await callApi("/api/programs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const programs = [...currentPrograms];
      if (programEditingIdx >= 0) {
        programs[programEditingIdx] = savedEntry;
      } else {
        programs.push(savedEntry);
      }

      onDataChange({
        ...appData,
        programs,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      setProgramForm({
        title: "",
        description: "",
        videoUrl: "",
        category: "",
        uploadedDate: new Date().toISOString().split("T")[0],
      });
      setProgramStatus({ type: "success", msg: "✓ Program saved." });
    } catch (e) {
      showStatus(setProgramStatus, "error", `✗ ${e.message}`);
    }
  };

  const uploadIdleVideos = async files => {
    const pickedFiles = Array.from(files || []);
    if (!pickedFiles.length) return;

    try {
      const formData = new FormData();
      pickedFiles.forEach(file => formData.append("files", file));

      const response = await fetch("/api/idle-videos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = `Upload failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // Ignore invalid response payload
        }
        throw new Error(message);
      }

      const data = await response.json();
      const uploadedFiles = Array.isArray(data?.files) ? data.files : [];
      if (!uploadedFiles.length) {
        showStatus(setIdleVideosStatus, "error", "✗ No videos were uploaded.");
        return;
      }

      const latestUploadedUrl = String(uploadedFiles[0]?.videoUrl || uploadedFiles[0]?.url || "").trim();
      if (latestUploadedUrl) {
        setSettingsForm(prev => {
          const existing = normalizeIdleVideoUrls(prev);
          const nextUrls = existing.length ? existing : [latestUploadedUrl];
          return {
            ...prev,
            idleVideoUrl: nextUrls[0] || "",
            idleVideoUrls: nextUrls,
          };
        });
      }
      await loadIdleVideos();
      showStatus(setIdleVideosStatus, "success", `✓ Uploaded ${uploadedFiles.length} idle video${uploadedFiles.length > 1 ? "s" : ""}.`);
    } catch (error) {
      showStatus(setIdleVideosStatus, "error", `✗ ${error.message}`);
    }
  };

  const saveIdleVideoSelection = async () => {
    const normalizedSelected = normalizeIdleVideoUrls(settingsForm);
    const nextSettings = {
      ...appData.settings,
      ...settingsForm,
      idleVideoUrls: normalizedSelected,
      idleVideoUrl: normalizedSelected[0] || "",
      adminPin: appData.settings.adminPin,
      superAdminPin,
    };

    try {
      await callApi("/api/settings", {
        method: "PUT",
        body: JSON.stringify(nextSettings),
      });
      onDataChange({ ...appData, settings: nextSettings });
      setSettingsForm(nextSettings);
      showStatus(setIdleVideosStatus, "success", "✓ Idle screen video selection saved.");
    } catch (e) {
      showStatus(setIdleVideosStatus, "error", `✗ ${e.message}`);
    }
  };

  const deleteIdleVideo = async (id, title) => {
    if (!canDelete) {
      showStatus(setIdleVideosStatus, "error", "✗ Admin role cannot delete items.");
      return;
    }
    if (!await requestConfirm(`Delete idle video "${title || "Untitled Video"}"?`, { title: "Delete Idle Video", confirmLabel: "Delete", tone: "danger" })) return;

    try {
      await callApi(`/api/idle-videos/${id}`, { method: "DELETE" });
      const deletedUrl = String(
        (currentIdleVideos.find(video => Number(video.id) === Number(id)) || {}).videoUrl || ""
      ).trim();
      const currentSelection = normalizeIdleVideoUrls(settingsForm);
      const nextSelection = currentSelection.filter(url => String(url || "").trim() !== deletedUrl);
      const isDeletedSelected = nextSelection.length !== currentSelection.length;

      if (isDeletedSelected) {
        const nextSettings = {
          ...appData.settings,
          ...settingsForm,
          idleVideoUrls: nextSelection,
          idleVideoUrl: nextSelection[0] || "",
          adminPin: appData.settings.adminPin,
          superAdminPin,
        };
        await callApi("/api/settings", {
          method: "PUT",
          body: JSON.stringify(nextSettings),
        });
        onDataChange({ ...appData, settings: nextSettings });
        setSettingsForm(nextSettings);
      }

      await loadIdleVideos();
      showStatus(setIdleVideosStatus, "success", "✓ Idle video deleted.");
    } catch (e) {
      showStatus(setIdleVideosStatus, "error", `✗ ${e.message}`);
    }
  };

  const deleteProgram = async idx => {
    if (!canDelete) {
      showStatus(setProgramStatus, "error", "✗ Admin role cannot delete items.");
      return;
    }
    const prog = currentPrograms[idx];
    if (!prog) return;
    if (!await requestConfirm(`Delete program "${prog.title || prog.id}"?`, { title: "Delete Program", confirmLabel: "Delete", tone: "danger" })) return;

    try {
      if (prog.id) {
        await callApi(`/api/programs/${prog.id}`, { method: "DELETE" });
      }

      const programs = currentPrograms.filter((_, i) => i !== idx);
      onDataChange({
        ...appData,
        programs,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setProgramStatus, "success", "✓ Program deleted.");
    } catch (e) {
      showStatus(setProgramStatus, "error", `✗ ${e.message}`);
    }
  };

  const reorderPrograms = async (fromIdx, toIdx) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const nextPrograms = [...currentPrograms];
    if (fromIdx >= nextPrograms.length || toIdx >= nextPrograms.length) return;

    const [movedProgram] = nextPrograms.splice(fromIdx, 1);
    nextPrograms.splice(toIdx, 0, movedProgram);

    onDataChange({
      ...appData,
      programs: nextPrograms,
      version: appData.version + 1,
      lastUpdated: new Date().toISOString(),
    });

    const orderedIds = nextPrograms.map(item => Number(item?.id)).filter(id => Number.isInteger(id) && id > 0);
    if (orderedIds.length !== nextPrograms.length) {
      showStatus(setProgramStatus, "info", "ⓘ Order updated locally only. Save unsaved program entries first to persist order.");
      return;
    }

    try {
      const savedOrder = await callApi("/api/programs/reorder", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });

      onDataChange({
        ...appData,
        programs: Array.isArray(savedOrder) ? savedOrder : nextPrograms,
        version: appData.version + 1,
        lastUpdated: new Date().toISOString(),
      });
      showStatus(setProgramStatus, "success", "✓ Program order updated.");
    } catch {
      showStatus(setProgramStatus, "error", "✗ Unable to save order to server. Local order changed, but persistent order was not updated.");
    }
  };

  const handleProgramDragStart = (idx, event) => {
    if (!canDelete) return;
    setDraggingProgramIdx(idx);
    setDragOverProgramIdx(idx);
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(idx));
    }
  };

  const handleProgramDragEnter = idx => {
    if (!canDelete || draggingProgramIdx === null || draggingProgramIdx === idx) return;
    setDragOverProgramIdx(idx);
  };

  const handleProgramDrop = async idx => {
    if (!canDelete || draggingProgramIdx === null) return;
    const fromIdx = draggingProgramIdx;
    setDraggingProgramIdx(null);
    setDragOverProgramIdx(null);
    await reorderPrograms(fromIdx, idx);
  };

  const handleProgramDragEnd = () => {
    setDraggingProgramIdx(null);
    setDragOverProgramIdx(null);
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

  const applyUpdate = async () => {
    if (!pendingUpdate) return;
    const pin = appData.settings.adminPin;
    const superPin = appData.settings.superAdminPin;
    const newData = {
      ...appData,
      services: pendingUpdate.services || appData.services,
      externalServices: pendingUpdate.externalServices || appData.externalServices,
      announcements: pendingUpdate.announcements || appData.announcements,
      calendarEvents: pendingUpdate.calendarEvents || appData.calendarEvents,
      programs: pendingUpdate.programs || appData.programs,
      idleVideos: currentIdleVideos,
      feedbackAndComplaints: pendingUpdate.feedbackAndComplaints || appData.feedbackAndComplaints,
      organizationalProfile: pendingUpdate.organizationalProfile || appData.organizationalProfile,
      officeDirectory: pendingUpdate.officeDirectory || appData.officeDirectory,
      policiesAndIssuances: pendingUpdate.policiesAndIssuances || appData.policiesAndIssuances,
      version: pendingUpdate.version,
      lastUpdated: new Date().toISOString(),
    };
    if (pendingUpdate.settings) {
      newData.settings = {
        ...pendingUpdate.settings,
        adminPin: pin,
        superAdminPin: superPin,
      };
    }

    try {
      await callApi("/api/data/import", {
        method: "POST",
        body: JSON.stringify({ data: newData, preservePins: true }),
      });
      onDataChange(newData);
      setPendingUpdate(null);
      showStatus(setUpdateStatus, "success", "✓ Update applied! Now at version " + pendingUpdate.version + ".");
      window.location.reload();
    } catch (e) {
      showStatus(setUpdateStatus, "error", `✗ ${e.message}`);
    }
  };

  const exportBackup = () => {
    const backupPayload = {
      ...appData,
      idleVideos: currentIdleVideos,
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dilg-kiosk-backup.json";
    a.click();
  };

  const exportUpdateFile = () => {
    const d = JSON.parse(JSON.stringify({
      ...appData,
      idleVideos: currentIdleVideos,
    }));
    delete d.settings.adminPin;
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kiosk-update.json";
    a.click();
  };

  const importData = async jsonStr => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.services || !data.settings) throw new Error("Invalid backup format.");
      const imported = {
        ...data,
        idleVideos: Array.isArray(data.idleVideos) ? data.idleVideos : currentIdleVideos,
        settings: {
          ...data.settings,
          adminPin: appData.settings.adminPin,
          superAdminPin: appData.settings.superAdminPin,
        },
      };
      await callApi("/api/data/import", {
        method: "POST",
        body: JSON.stringify({ data: imported, preservePins: true }),
      });
      onDataChange(imported);
      showStatus(setBackupStatus, "success", "✓ Imported! " + data.services.length + " services loaded.");
      window.location.reload();
    } catch (e) {
      showStatus(setBackupStatus, "error", "✗ Import failed: " + e.message);
    }
  };

  const confirmReset = () => {
    requestConfirm("Reset ALL data to factory defaults? Admin passwords reset to their database defaults.", { title: "Factory Reset", confirmLabel: "Reset", tone: "danger" }).then((confirmed) => {
      if (!confirmed) return;
      callApi("/api/reset-data", { method: "POST" })
        .then(() => {
          showStatus(setBackupStatus, "success", "✓ Reset to defaults complete.");
          window.location.reload();
        })
        .catch((e) => {
          showStatus(setBackupStatus, "error", `✗ ${e.message}`);
        });
    });
    return;
  };

  const navItems = [
    { id: "services", label: "Internal Services" },
    { id: "external-services", label: "External Services" },
    { id: "issuances", label: "Issuances" },
    { id: "profile", label: "Profile" },
    { id: "feedback", label: "Feedback" },
    { id: "announcements", label: "Announcements" },
    { id: "calendar-events", label: "Calendar Events" },
    { id: "key-officials", label: "Key Officials" },
    { id: "idle-videos", label: "Idle Screen Video" },
    { id: "programs", label: "LGUSS Programs" },
    { id: "offices", label: "Offices" },
    { id: "settings", label: "Settings" },
    { id: "updates", label: "Updates" },
    { id: "backup", label: "Backup" },
  ];

  const StatusMsg = ({ status }) => (status ? <div className={`a-status ${status.type}`}>{status.msg}</div> : null);
  const lockHint = !isSuperAdmin ? <span className="role-lock-hint"><Shield size={12} /> Super Admin only</span> : null;

  // Scroll to the target feedback section after saving or adding
  useEffect(() => {
    if (scrollToFeedbackSectionIdx !== null) {
      setTimeout(() => {
        const headingInput = feedbackSectionRefs.current[scrollToFeedbackSectionIdx];
        if (headingInput) {
          scrollToElementInContainer(headingInput);
          headingInput.focus(); // Focus on the heading input
        }
        setScrollToFeedbackSectionIdx(null); // Reset after scrolling
      }, 50);
    }
  }, [feedbackForm]); // Trigger when feedbackForm updates

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-title">{isSuperAdmin ? "Super Admin Panel" : "Admin Panel"}</div>
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
          <div style={{ fontSize: 11, color: "rgba(223,233,255,.75)", marginBottom: 8 }}>Data v{appData.version}</div>
          <button className="admin-logout" onClick={onClose}>
            <LogOut size={14} className="btn-icon" />
            {isSuperAdmin ? "Exit Super Admin" : "Exit Admin"}
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className={`admin-role-badge${isSuperAdmin ? " super-admin" : " admin"}`}>
          {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
        </div>
        {!isSuperAdmin && (
          <div className="a-status info" style={{ position: "relative", zIndex: 1, marginBottom: 12 }}>
            Admin mode: Create and update are enabled. Delete actions are disabled.
          </div>
        )}
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
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setEditingIdx(idx)}><Pencil size={13} className="btn-icon" /> Edit</button>
                      {canDelete && (
                        <button
                          className="a-btn a-btn-danger a-btn-sm"
                          onClick={async () => {
                            if (!await requestConfirm(`Delete "${s.label}"?`, { title: "Delete Service", confirmLabel: "Delete", tone: "danger" })) return;
                            await callApi(`/api/services/internal/${s.id}`, { method: "DELETE" });
                            const services = appData.services.filter((_, i) => i !== idx);
                            onDataChange({ ...appData, services, version: appData.version + 1, lastUpdated: new Date().toISOString() });
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {!canDelete && lockHint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <AdminFormModal
              open={editingIdx !== null}
              title={editingIdx >= 0 ? "Edit Service" : "Add New Service"}
              onClose={() => setEditingIdx(null)}
            >
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
            </AdminFormModal>
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
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setExternalEditingIdx(idx)}><Pencil size={13} className="btn-icon" /> Edit</button>
                      {canDelete && (
                        <button
                          className="a-btn a-btn-danger a-btn-sm"
                          onClick={async () => {
                            if (!await requestConfirm(`Delete "${s.label}"?`, { title: "Delete External Service", confirmLabel: "Delete", tone: "danger" })) return;
                            await callApi(`/api/services/external/${s.id}`, { method: "DELETE" });
                            const externalServices = currentExternalServices.filter((_, i) => i !== idx);
                            onDataChange({
                              ...appData,
                              externalServices,
                              version: appData.version + 1,
                              lastUpdated: new Date().toISOString(),
                            });
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {!canDelete && lockHint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <AdminFormModal
              open={externalEditingIdx !== null}
              title={externalEditingIdx >= 0 ? "Edit External Service" : "Add New External Service"}
              onClose={() => setExternalEditingIdx(null)}
            >
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
            </AdminFormModal>
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
                      {canDelete && (
                        <button
                          className="a-btn a-btn-danger a-btn-sm"
                          onClick={async () => {
                            if (!await requestConfirm(`Delete "${item.circularNo || item.title || "issuance"}"?`, { title: "Delete Issuance", confirmLabel: "Delete", tone: "danger" })) return;
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
                      )}
                      {!canDelete && lockHint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <AdminFormModal
              open={issuanceEditingIdx !== null}
              title={issuanceEditingIdx >= 0 ? "Edit Issuance" : "Add New Issuance"}
              onClose={() => setIssuanceEditingIdx(null)}
            >
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
            </AdminFormModal>
          )
        )}

        {activeTab === "settings" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Settings</div>
            <div className="admin-tab-sub">Configure kiosk display text, timers, and admin passwords.</div>
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
            <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 700, color: "#0b2f7a", marginBottom: 4 }}>
              Change Passwords
            </div>
            <div style={{ fontSize: 12, color: "#5370ab", marginBottom: 14 }}>
              Click a button to open a modal, enter the old password and the new password, then save.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isSuperAdmin ? (
                <>
                  <button
                    type="button"
                    className="a-btn a-btn-ghost"
                    onClick={() => {
                      setSettingsStatus(null);
                      setOldPin("");
                      setNewPin("");
                      setPasswordModal({ open: true, type: "super-admin" });
                    }}
                  >
                    <KeyRound size={14} className="btn-icon" /> Change Super Admin Password
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn-ghost"
                    onClick={() => {
                      setSettingsStatus(null);
                      setAdminOldPin("");
                      setAdminNewPin("");
                      setPasswordModal({ open: true, type: "admin" });
                    }}
                  >
                    <KeyRound size={14} className="btn-icon" /> Change Admin Password
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="a-btn a-btn-ghost"
                  onClick={() => {
                    setSettingsStatus(null);
                    setOldPin("");
                    setNewPin("");
                    setPasswordModal({ open: true, type: "admin" });
                  }}
                >
                  <KeyRound size={14} className="btn-icon" /> Change Admin Password
                </button>
              )}
            </div>

            <AdminFormModal
              open={passwordModal.open}
              title={passwordModal.type === "super-admin" ? "Change Super Admin Password" : "Change Admin Password"}
              onClose={() => {
                setPasswordModal({ open: false, type: null });
                setOldPin("");
                setNewPin("");
                setAdminOldPin("");
                setAdminNewPin("");
                setShowOldPin(false);
                setShowNewPin(false);
                setShowAdminOldPin(false);
                setShowAdminNewPin(false);
              }}
            >
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (passwordModal.type === "super-admin") {
                    changeSuperAdminPin();
                  } else {
                    changeAdminPin();
                  }
                }}
                autoComplete="off"
              >
                <StatusMsg status={settingsStatus} />
                <div className="a-field">
                  <label className="a-label">Current Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      className="a-input"
                      type={passwordModal.type === "super-admin" ? (showOldPin ? "text" : "password") : isSuperAdmin ? (showAdminOldPin ? "text" : "password") : (showOldPin ? "text" : "password")}
                      value={passwordModal.type === "super-admin" ? oldPin : isSuperAdmin ? adminOldPin : oldPin}
                      onChange={e => {
                        if (passwordModal.type === "super-admin") {
                          setOldPin(e.target.value);
                        } else if (isSuperAdmin) {
                          setAdminOldPin(e.target.value);
                        } else {
                          setOldPin(e.target.value);
                        }
                      }}
                      placeholder="Enter current password"
                      style={{ paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        color: "#666",
                      }}
                      {...(passwordModal.type === "super-admin" ? getHoldToShowHandlers(setShowOldPin) : isSuperAdmin ? getHoldToShowHandlers(setShowAdminOldPin) : getHoldToShowHandlers(setShowOldPin))}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
                <div className="a-field">
                  <label className="a-label">New Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      className="a-input"
                      type={passwordModal.type === "super-admin" ? (showNewPin ? "text" : "password") : isSuperAdmin ? (showAdminNewPin ? "text" : "password") : (showNewPin ? "text" : "password")}
                      value={passwordModal.type === "super-admin" ? newPin : isSuperAdmin ? adminNewPin : newPin}
                      onChange={e => {
                        if (passwordModal.type === "super-admin") {
                          setNewPin(e.target.value);
                        } else if (isSuperAdmin) {
                          setAdminNewPin(e.target.value);
                        } else {
                          setNewPin(e.target.value);
                        }
                      }}
                      placeholder="Enter new password"
                      style={{ paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        color: "#666",
                      }}
                      {...(passwordModal.type === "super-admin" ? getHoldToShowHandlers(setShowNewPin) : isSuperAdmin ? getHoldToShowHandlers(setShowAdminNewPin) : getHoldToShowHandlers(setShowNewPin))}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button className="a-btn a-btn-primary" type="submit">
                    <Save size={14} className="btn-icon" /> Save
                  </button>
                  <button
                    className="a-btn a-btn-ghost"
                    type="button"
                    onClick={() => {
                      setPasswordModal({ open: false, type: null });
                      setOldPin("");
                      setNewPin("");
                      setAdminOldPin("");
                      setAdminNewPin("");
                      setShowOldPin(false);
                      setShowNewPin(false);
                      setShowAdminOldPin(false);
                      setShowAdminNewPin(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </AdminFormModal>
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
                ref={feedbackTitleRef}
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
                  {canDelete && (
                    <button className="a-btn a-btn-danger a-btn-sm" onClick={() => removeFeedbackSection(idx)}>Delete Section</button>
                  )}
                  {!canDelete && lockHint}
                </div>
                <div className="a-field">
                  <label className="a-label">Heading</label>
                  <input
                    ref={input => feedbackSectionRefs.current[idx] = input}
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
              <button className="a-btn a-btn-primary" onClick={saveFeedback}><Save size={14} className="btn-icon" /> Save Feedback Content</button>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Announcements</div>
            <div className="admin-tab-sub">Add, edit, or remove ticker announcements shown on Idle and Menu screens.</div>
            <StatusMsg status={announcementStatus} />

            {announcementEditingIdx !== null && (
              <AdminFormModal
                open={announcementEditingIdx !== null}
                title={announcementEditingIdx >= 0 ? "Edit Announcement" : "Add New Announcement"}
                onClose={() => {
                  setAnnouncementEditingIdx(null);
                  setAnnouncementForm({
                    title: "",
                    message: "",
                    details: "",
                    postedBy: "",
                    where: "",
                    postedOn: "",
                    effectiveUntil: "",
                    involvedParties: "",
                    tickerDisplay: "message",
                    attachmentsText: "",
                  });
                }}
              >
              <div>
                <div className="a-field">
                  <label className="a-label">Announcement Title</label>
                  <input
                    className="a-input"
                    value={announcementForm.title}
                    onChange={e => setAnnouncementForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Optional title"
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Announcement Message <span style={{color: 'red'}}>*</span></label>
                  <textarea
                    className="a-textarea"
                    value={announcementForm.message}
                    onChange={e => setAnnouncementForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Type announcement text..."
                    autoFocus
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Additional Details</label>
                  <textarea
                    className="a-textarea"
                    value={announcementForm.details}
                    onChange={e => setAnnouncementForm(f => ({ ...f, details: e.target.value }))}
                    placeholder="Detailed information shown in popup modal..."
                    style={{ minHeight: 90 }}
                  />
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">Who Posted This Announcement</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="a-input"
                        value={announcementForm.postedBy}
                        onChange={e => setAnnouncementForm(f => ({ ...f, postedBy: e.target.value }))}
                        placeholder="e.g. Public Affairs Office"
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-ghost a-btn-sm"
                        onClick={() => setAnnouncementForm(f => ({ ...f, postedBy: "" }))}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="a-field">
                    <label className="a-label">Where</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="a-input"
                        value={announcementForm.where}
                        onChange={e => setAnnouncementForm(f => ({ ...f, where: e.target.value }))}
                        placeholder="e.g. Main Lobby Forum Area"
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-ghost a-btn-sm"
                        onClick={() => setAnnouncementForm(f => ({ ...f, where: "" }))}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">Who Might Be Involved</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="a-input"
                        value={announcementForm.involvedParties}
                        onChange={e => setAnnouncementForm(f => ({ ...f, involvedParties: e.target.value }))}
                        placeholder="e.g. Citizens, LGU Desk Officers"
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-ghost a-btn-sm"
                        onClick={() => setAnnouncementForm(f => ({ ...f, involvedParties: "" }))}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">Posted On</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="date"
                        className="a-input"
                        value={announcementForm.postedOn}
                        onChange={e => setAnnouncementForm(f => ({ ...f, postedOn: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-ghost a-btn-sm"
                        onClick={() => setAnnouncementForm(f => ({ ...f, postedOn: "" }))}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="a-field">
                    <label className="a-label">Effective Until</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="date"
                        className="a-input"
                        value={announcementForm.effectiveUntil}
                        onChange={e => setAnnouncementForm(f => ({ ...f, effectiveUntil: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-ghost a-btn-sm"
                        onClick={() => setAnnouncementForm(f => ({ ...f, effectiveUntil: "" }))}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                <div className="a-field">
                  <label className="a-label">Running Ticker Display Source</label>
                  <ModalSelect
                    className="a-select"
                    value={announcementForm.tickerDisplay}
                    onChange={nextValue => setAnnouncementForm(f => ({ ...f, tickerDisplay: nextValue === "title" ? "title" : "message" }))}
                    options={[
                      { value: "message", label: "Description / Message" },
                      { value: "title", label: "Title" },
                    ]}
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Attached Files (one per line)</label>
                  <textarea
                    className="a-textarea"
                    value={announcementForm.attachmentsText}
                    onChange={e => setAnnouncementForm(f => ({ ...f, attachmentsText: e.target.value }))}
                    placeholder="File Name | https://example.com/file.pdf"
                    style={{ minHeight: 80 }}
                  />
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <label className="a-btn a-btn-ghost" style={{ marginBottom: 0, cursor: "pointer" }}>
                      <Upload size={14} className="btn-icon" /> Upload Attachment Files
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
                        style={{ display: "none" }}
                        onChange={e => {
                          uploadAnnouncementAttachments(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <span style={{ fontSize: 11, color: "#4a6499" }}>
                      Uploaded files are automatically added to the list above.
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
                  <button className="a-btn a-btn-primary" onClick={saveAnnouncement}>Save Announcement</button>
                  <button
                    className="a-btn a-btn-ghost"
                    onClick={() => {
                      setAnnouncementEditingIdx(null);
                      setAnnouncementForm({
                        title: "",
                        message: "",
                        details: "",
                        postedBy: "",
                        where: "",
                        postedOn: "",
                        effectiveUntil: "",
                        involvedParties: "",
                        tickerDisplay: "message",
                        attachmentsText: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              </AdminFormModal>
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
                    <div className="svc-row-name">{item.title || `Announcement ${idx + 1}`}</div>
                    <div className="svc-row-meta" style={{ color: "#334b84", fontSize: 12 }}>{item.message}</div>
                    <div className="svc-row-meta" style={{ color: "#3f588f", fontSize: 11 }}>
                      Posted by: {item.postedBy || "N/A"}
                      {item.where ? ` | Where: ${item.where}` : ""}
                      {item.postedOn ? ` | Posted on: ${item.postedOn}` : ""}
                      {item.effectiveUntil ? ` | Effective until: ${item.effectiveUntil}` : ""}
                    </div>
                    {!!item.involvedParties && (
                      <div className="svc-row-meta" style={{ color: "#3f588f", fontSize: 11 }}>
                        Involved: {item.involvedParties}
                      </div>
                    )}
                    <div className="svc-row-meta" style={{ color: "#2f57a0", fontSize: 11 }}>
                      Ticker shows: {item.tickerDisplay === "title" ? "Title" : "Description / Message"}
                    </div>
                    {!!item.details && <div className="svc-row-meta" style={{ color: "#4a6499", fontSize: 11 }}>{item.details}</div>}
                    {!!item.attachments?.length && (
                      <div className="svc-row-meta" style={{ color: "#2f57a0", fontSize: 11 }}>
                        {item.attachments.length} file{item.attachments.length > 1 ? "s" : ""} attached
                      </div>
                    )}
                  </div>
                  <div className="svc-row-actions">
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEditAnnouncement(idx)}>Edit</button>
                    {canDelete && <button className="a-btn a-btn-danger a-btn-sm" onClick={() => deleteAnnouncement(idx)}>Delete</button>}
                    {!canDelete && lockHint}
                  </div>
                </div>
              ))}
              {!currentAnnouncements.length && (
                <div style={{ color: "#5370ab", fontSize: 13 }}>No announcements yet. Add one to show in the ticker.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "calendar-events" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Calendar Events</div>
            <div className="admin-tab-sub">Add, edit, or remove events shown in the kiosk calendar. Holidays can be synced from Google Calendar.</div>
            <StatusMsg status={calendarStatus} />

            {calendarEditingIdx !== null ? (
              <AdminFormModal
                open={calendarEditingIdx !== null}
                title={calendarEditingIdx >= 0 ? "Edit Calendar Event" : "Add New Calendar Event"}
                onClose={() => setCalendarEditingIdx(null)}
              >
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">Event Title <span style={{color: 'red'}}>*</span></label>
                    <input
                      className="a-input"
                      value={calendarForm.title}
                      onChange={e => setCalendarForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-label">Event Date <span style={{color: 'red'}}>*</span></label>
                    <input
                      type="date"
                      className="a-input"
                      value={calendarForm.date}
                      onChange={e => setCalendarForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">From</label>
                    <input
                      className="a-input"
                      list="calendar-time-values"
                      placeholder="3:00"
                      value={calendarForm.timeFrom}
                      onChange={e => setCalendarForm(f => ({ ...f, timeFrom: formatTimeValue(e.target.value) }))}
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-label">Until</label>
                    <input
                      className="a-input"
                      list="calendar-time-values"
                      placeholder="5:00"
                      value={calendarForm.timeUntil}
                      onChange={e => setCalendarForm(f => ({ ...f, timeUntil: formatTimeValue(e.target.value) }))}
                    />
                    <datalist id="calendar-time-values">
                      <option value="7:00" />
                      <option value="7:30" />
                      <option value="8:00" />
                      <option value="8:30" />
                      <option value="9:00" />
                      <option value="9:30" />
                      <option value="10:00" />
                      <option value="10:30" />
                      <option value="11:00" />
                      <option value="11:30" />
                      <option value="12:00" />
                      <option value="12:30" />
                      <option value="1:00" />
                      <option value="1:30" />
                      <option value="2:00" />
                      <option value="2:30" />
                      <option value="3:00" />
                      <option value="3:30" />
                      <option value="4:00" />
                      <option value="4:30" />
                      <option value="5:00" />
                      <option value="5:30" />
                      <option value="6:00" />
                      <option value="6:30" />
                      <option value="7:00" />
                      <option value="7:30" />
                    </datalist>
                  </div>
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">AM / PM</label>
                    <ModalSelect
                      className="a-select"
                      value={calendarForm.timePeriod}
                      onChange={nextValue => setCalendarForm(f => ({ ...f, timePeriod: nextValue }))}
                      options={[
                        { value: "am", label: "AM" },
                        { value: "pm", label: "PM" },
                      ]}
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-label">Category</label>
                    <ModalSelect
                      className="a-select"
                      value={calendarForm.category}
                      onChange={nextValue => setCalendarForm(f => ({ ...f, category: nextValue }))}
                      options={[
                        { value: "internal", label: "Internal" },
                        { value: "external", label: "External" },
                        { value: "deadline", label: "Deadlines" },
                        { value: "holiday", label: "Holiday" },
                      ]}
                    />
                  </div>
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">
                      <MapPin size={14} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />
                      Location
                    </label>
                    <input
                      className="a-input"
                      value={calendarForm.location}
                      onChange={e => setCalendarForm(f => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-label">Office</label>
                    <input
                      className="a-input"
                      value={calendarForm.office}
                      onChange={e => setCalendarForm(f => ({ ...f, office: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="a-row">
                  <div className="a-field">
                    <label className="a-label">Attending / Involved</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {(calendarForm.attendees || []).map((item, idx) => (
                        <span key={idx} className="a-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#eef3ff", borderRadius: 999, fontSize: 12 }}>
                          {item}
                          <button
                            type="button"
                            onClick={() => setCalendarForm(f => ({
                              ...f,
                              attendees: (f.attendees || []).filter((_, i) => i !== idx),
                            }))}
                            style={{ border: "none", background: "transparent", cursor: "pointer", lineHeight: 1 }}
                          >×</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="a-input"
                        placeholder="Add department/person"
                        value={calendarForm.attendeeInput}
                        onChange={e => setCalendarForm(f => ({ ...f, attendeeInput: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (!value) return;
                            setCalendarForm(f => ({
                              ...f,
                              attendees: [...(f.attendees || []), value],
                              attendeeInput: "",
                            }));
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="a-btn a-btn-secondary"
                        onClick={() => {
                          const value = String(calendarForm.attendeeInput || "").trim();
                          if (!value) return;
                          setCalendarForm(f => ({
                            ...f,
                            attendees: [...(f.attendees || []), value],
                            attendeeInput: "",
                          }));
                        }}
                      >Add</button>
                    </div>
                  </div>
                </div>
                <div className="a-field">
                  <label className="a-label">Description</label>
                  <textarea
                    className="a-textarea"
                    rows={4}
                    value={calendarForm.description}
                    onChange={e => setCalendarForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
                  <button className="a-btn a-btn-primary" onClick={saveCalendarEvent}>Save Event</button>
                  <button className="a-btn a-btn-ghost" onClick={() => setCalendarEditingIdx(null)}>Cancel</button>
                </div>
              </AdminFormModal>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "end", marginBottom: 18, flexWrap: "wrap" }}>
                  <button className="a-btn a-btn-success" onClick={startAddCalendarEvent}>
                    + Add New Event
                  </button>
                  <div className="a-field" style={{ minWidth: 140, marginBottom: 0 }}>
                    <label className="a-label">Holiday Year</label>
                    <input
                      className="a-input"
                      type="number"
                      min="2000"
                      max={String(new Date().getFullYear() + 5)}
                      value={holidaySyncYear}
                      onChange={e => setHolidaySyncYear(e.target.value)}
                    />
                  </div>
                  <button className="a-btn a-btn-primary" onClick={syncPhilippineHolidays}>
                    Sync Google Holidays
                  </button>
                </div>
                <div className="svc-list">
                  {currentCalendarEvents.map((item, idx) => (
                    <div key={item.id || idx} className="svc-row">
                      <div className="svc-row-info">
                        <div className="svc-row-name">{item.title || "Untitled Event"}</div>
                        <div className="svc-row-meta">{item.date || "No date"} · {item.category}</div>
                      </div>
                      <div className="svc-row-actions">
                        <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEditCalendarEvent(idx)}>Edit</button>
                        {canDelete && (
                          <button className="a-btn a-btn-danger a-btn-sm" onClick={() => deleteCalendarEvent(idx)}>Delete</button>
                        )}
                        {!canDelete && lockHint}
                      </div>
                    </div>
                  ))}
                  {!currentCalendarEvents.length && (
                    <div style={{ color: "#5370ab", fontSize: 13 }}>No calendar events yet. Add one to show in the calendar.</div>
                  )}
                </div>
              </>
            )}
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
              <AdminFormModal
                open={officeEditingIdx !== null}
                title={officeEditingIdx >= 0 ? "Edit Office Entry" : "Add Office Entry"}
                onClose={() => setOfficeEditingIdx(null)}
              >
              <div>
                <div className="a-field">
                  <label className="a-label">Office Name <span style={{color: 'red'}}>*</span></label>
                  <input
                    className="a-input"
                    value={officeForm.office}
                    onChange={e => setOfficeForm(f => ({ ...f, office: e.target.value }))}
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Type</label>
                  <ModalSelect
                    className="a-select"
                    value={officeForm.type || "office"}
                    onChange={nextValue => setOfficeForm(f => ({ ...f, type: nextValue }))}
                    options={[
                      { value: "office", label: "Office" },
                      { value: "province", label: "Province" },
                    ]}
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
                <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
                  <button className="a-btn a-btn-primary" onClick={saveOfficeEntry}>Save Office Entry</button>
                  <button className="a-btn a-btn-ghost" onClick={() => setOfficeEditingIdx(null)}>Cancel</button>
                </div>
              </div>
              </AdminFormModal>
            )}

            <div className="svc-list">
              {(currentOfficeDirectory.entries || []).map((entry, idx) => (
                <div key={`${entry.office}-${idx}`} className="svc-row">
                  <div className="svc-row-info">
                    <div className="svc-row-name">{entry.office || "Untitled Office"} {entry.type ? `(${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)})` : ""}</div>
                    <div className="svc-row-meta">{entry.contact || "No contact"}</div>
                    {!!entry.address && <div className="svc-row-meta">{entry.address}</div>}
                  </div>
                  <div className="svc-row-actions">
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEditOffice(idx)}>Edit</button>
                    {canDelete && (
                      <button
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={() => deleteOfficeEntry(idx)}
                      >
                        Delete
                      </button>
                    )}
                    {!canDelete && lockHint}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "programs" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">LGUSS Programs</div>
            <div className="admin-tab-sub">Manage LGUSS-only videos and programs shown in the LGUSS section on the kiosk. Drag items to rearrange display order.</div>
            <StatusMsg status={programStatus} />

            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <button
                className="a-btn a-btn-primary"
                onClick={() => {
                  setProgramForm({
                    title: "",
                    description: "",
                    videoUrl: "",
                    category: "",
                    uploadedDate: new Date().toISOString().split("T")[0],
                  });
                  setProgramEditingIdx(-1);
                }}
              >
                + Add Program
              </button>
            </div>

            {programEditingIdx !== null && (
              <AdminFormModal
                open={programEditingIdx !== null}
                title={programEditingIdx >= 0 ? "Edit Program" : "Add Program"}
                onClose={() => setProgramEditingIdx(null)}
              >
              <div>
                <StatusMsg status={programStatus} />
                <div className="a-field">
                  <label className="a-label">Program Title</label>
                  <input
                    className="a-input"
                    value={programForm.title}
                    onChange={e => setProgramForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., DILG Strategic Initiatives"
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Description</label>
                  <textarea
                    className="a-textarea"
                    value={programForm.description}
                    onChange={e => setProgramForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the video content"
                  />
                </div>
                <div className="a-field">
                  <label className="a-label">Upload Program Video</label>
                  <label className="a-file-input" style={{ marginTop: 10, display: "inline-flex", marginBottom: 0 }}>
                    <Upload size={14} className="btn-icon" /> Upload Video File
                    <input
                      type="file"
                      accept="video/*"
                      onChange={e => {
                        uploadProgramVideos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <small style={{ display: "block", marginTop: 8, color: "#666" }}>
                    Program videos are uploaded from your local device only.
                  </small>
                  {programForm.videoUrl && (
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ width: "100%", maxWidth: 280, borderRadius: 10, padding: 8, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#444" }}>Preview</div>
                      <video
                        src={programForm.videoUrl}
                        controls
                        style={{ width: "100%", maxHeight: 160, borderRadius: 8, background: "#000", display: "block" }}
                      >
                        Your browser does not support the video tag.
                      </video>
                      </div>
                    </div>
                  )}
                </div>
                <div className="a-field">
                  <label className="a-label">Category</label>
                  <input
                    className="a-input"
                    value={programForm.category}
                    onChange={e => setProgramForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., General Overview, Training, Programs"
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
                  <button className="a-btn a-btn-primary" onClick={saveProgram}>Save Program</button>
                  <button className="a-btn a-btn-ghost" onClick={() => setProgramEditingIdx(null)}>Cancel</button>
                </div>
              </div>
              </AdminFormModal>
            )}

            <div className="svc-list">
              {(currentPrograms || []).map((prog, idx) => (
                <div
                  key={`prog-${prog.id || idx}`}
                  className={`svc-row program-row${draggingProgramIdx === idx ? " dragging" : ""}${dragOverProgramIdx === idx && draggingProgramIdx !== idx ? " drag-over" : ""}`}
                  draggable={canDelete}
                  onDragStart={event => handleProgramDragStart(idx, event)}
                  onDragEnter={() => handleProgramDragEnter(idx)}
                  onDragOver={event => {
                    if (!canDelete) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={event => {
                    event.preventDefault();
                    handleProgramDrop(idx);
                  }}
                  onDragEnd={handleProgramDragEnd}
                >
                  {canDelete && (
                    <div className="program-drag-handle" aria-hidden="true" title="Drag to reorder">
                      <GripVertical size={16} />
                    </div>
                  )}
                  <div className="svc-row-info">
                    <div className="svc-row-name">{prog.title || "Untitled Program"}</div>
                    {prog.category && <div className="svc-row-meta">{prog.category}</div>}
                    {prog.description && <div className="svc-row-meta">{prog.description.substring(0, 80)}...</div>}
                    {prog.videoUrl && (
                      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-start" }}>
                        <video
                          src={prog.videoUrl}
                          controls
                          style={{ width: "100%", maxWidth: 220, maxHeight: 120, borderRadius: 8, background: "#000" }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                  <div className="svc-row-actions">
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEditProgram(idx)}>Edit</button>
                    {canDelete && (
                      <button
                        className="a-btn a-btn-danger a-btn-sm"
                        onClick={() => deleteProgram(idx)}
                      >
                        Delete
                      </button>
                    )}
                    {!canDelete && lockHint}
                  </div>
                </div>
              ))}
              {(!currentPrograms || currentPrograms.length === 0) && (
                <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                  No programs added yet. Click "+ Add Program" to add your first video.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "idle-videos" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Idle Screen Video</div>
            <div className="admin-tab-sub">Upload and choose videos used only for the idle background screen. This is separate from LGUSS videos.</div>
            <StatusMsg status={idleVideosStatus} />

            <div className="a-field settings-wide">
              <label className="a-file-input" style={{ display: "inline-flex", marginBottom: 8 }}>
                <Upload size={14} className="btn-icon" /> Upload Idle Videos
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={e => {
                    uploadIdleVideos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <small style={{ marginTop: 4, color: "#666" }}>
                Uploaded videos will appear in the list below.
              </small>
            </div>

            <div className="svc-list" style={{ marginTop: 16 }}>
              {(currentIdleVideos || []).map((video, idx) => (
                <div key={`idle-video-${video.id || idx}`} className="idle-video-list-row">
                  <div className="idle-video-pick" title={video.title || `Idle Video ${idx + 1}`}>
                    <input
                      type="checkbox"
                      className="idle-video-pick-checkbox"
                      checked={selectedIdleVideoUrls.includes(String(video.videoUrl || "").trim())}
                      onChange={e => toggleIdleVideoSelection(video.videoUrl, e.target.checked)}
                    />
                    <div className="idle-video-pick-content">
                      <div className="idle-video-pick-head">
                        <div className="idle-video-pick-title">{video.title || `Idle Video ${idx + 1}`}</div>
                        {canDelete && (
                          <button
                            className="a-btn a-btn-danger a-btn-sm"
                            onClick={() => deleteIdleVideo(video.id, video.title)}
                          >
                            Delete
                          </button>
                        )}
                        {!canDelete && lockHint}
                      </div>
                      <div className="idle-video-pick-meta">{video.videoUrl}</div>
                      {video.uploadedDate && <div className="idle-video-pick-meta">Uploaded: {video.uploadedDate}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {(!currentIdleVideos || currentIdleVideos.length === 0) && (
                <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                  No idle videos uploaded yet. Add one above.
                </div>
              )}
            </div>

            <div className="a-field settings-wide" style={{ marginTop: 14 }}>
              <small style={{ marginTop: 6, color: "#666" }}>
                {selectedIdleVideoUrls.length
                  ? `${selectedIdleVideoUrls.length} video${selectedIdleVideoUrls.length > 1 ? "s" : ""} selected. They will play in order.`
                  : "No videos selected. The default built-in idle video will be used."}
              </small>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="a-btn a-btn-primary" onClick={saveIdleVideoSelection}>
                  <Save size={14} className="btn-icon" /> Save Idle Video
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "key-officials" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Key Officials</div>
            <div className="admin-tab-sub">Manage the image and title shown in the Key Officials kiosk modal.</div>
            <StatusMsg status={keyOfficialsStatus} />

            <div className="a-field">
              <label className="a-label">Section Title</label>
              <input
                className="a-input"
                value={keyOfficialsForm.title}
                onChange={e => setKeyOfficialsForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Key Officials"
              />
            </div>

            <div className="a-field settings-wide">
              <label className="a-file-input" style={{ display: "inline-flex", marginBottom: 8 }}>
                <Upload size={14} className="btn-icon" /> Upload Key Officials Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    uploadKeyOfficialsImage(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <small style={{ marginTop: 4, color: "#666" }}>
                Upload a single image (organizational chart or officials layout).
              </small>
            </div>

            <div className="a-field settings-wide" style={{ marginTop: 16 }}>
              <label className="a-label">Preview</label>
              {keyOfficialsForm.imageUrl ? (
                <div style={{ border: "1px solid #dbe3f4", borderRadius: 10, padding: 12, background: "#f8fbff" }}>
                  <img
                    src={keyOfficialsForm.imageUrl}
                    alt="Key Officials"
                    style={{ width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 8, background: "#fff" }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12, color: "#5e6f94" }}>
                    Source: {keyOfficialsForm.imageUrl}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#888", border: "1px dashed #c9d4ee", borderRadius: 10 }}>
                  No key officials image uploaded yet.
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="a-btn a-btn-primary" onClick={saveKeyOfficials}>
                <Save size={14} className="btn-icon" /> Save Key Officials
              </button>
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
            {!isSuperAdmin && (
              <div className="a-status info">Only Super Admin can check and apply online updates.</div>
            )}
            <div className="update-url-row">
              <div className="a-field">
                <label className="a-label">Update JSON URL</label>
                <input className="a-input" value={updateUrl} placeholder="https://example.com/kiosk-update.json" onChange={e => setUpdateUrl(e.target.value)} />
              </div>
              <button className="a-btn a-btn-primary" onClick={checkUpdates} style={{ flexShrink: 0 }} disabled={!isSuperAdmin}><Search size={14} className="btn-icon" /> Check Now</button>
              {!isSuperAdmin && lockHint}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={autoCheck}
                onChange={e => setAutoCheck(e.target.checked)}
                disabled={!isSuperAdmin}
                style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
              />
              <label style={{ fontSize: 13, color: "#4b65a0", cursor: "pointer" }}>
                Auto-check for updates on kiosk startup
              </label>
            </div>
            {pendingUpdate && (
              <div>
                <div className="a-divider" />
                <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "#0b2f7a", marginBottom: 8 }}>
                  Changes in version {pendingUpdate.version}:
                </div>
                <div className="update-diff">
                  <div className="update-diff-item">{pendingUpdate.services?.length} services in update</div>
                  {pendingUpdate.officeDirectory && <div className="update-diff-item">Office directory data included</div>}
                  {pendingUpdate.policiesAndIssuances && <div className="update-diff-item">Policies and issuances data included</div>}
                  {pendingUpdate.settings && <div className="update-diff-item" style={{ color: "#1f63d2", display: "flex", alignItems: "center", gap: 6 }}><Settings size={13} /> Settings updated</div>}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button className="a-btn a-btn-success" onClick={applyUpdate} disabled={!isSuperAdmin}><CheckCircle2 size={14} className="btn-icon" /> Apply Update</button>
                  <button className="a-btn a-btn-ghost" onClick={() => setPendingUpdate(null)}>Dismiss</button>
                  {!isSuperAdmin && lockHint}
                </div>
              </div>
            )}
            <div className="a-divider" />
            <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 700, color: "#0b2f7a", marginBottom: 4 }}>
              Export as Update File
            </div>
            <div style={{ fontSize: 12, color: "#5370ab", marginBottom: 10 }}>Download current kiosk data as JSON.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="a-btn a-btn-ghost" onClick={exportUpdateFile} disabled={!isSuperAdmin}><Download size={14} className="btn-icon" /> Download kiosk-update.json</button>
              {!isSuperAdmin && lockHint}
            </div>
          </div>
        )}

        {activeTab === "backup" && (
          <div className="admin-sub-content">
            <div className="admin-tab-title">Backup & Restore</div>
            <div className="admin-tab-sub">Export all data or restore from a previous backup. Passwords are never exported.</div>
            <StatusMsg status={backupStatus} />
            {!isSuperAdmin && (
              <div className="a-status info">Only Super Admin can export, import, or reset kiosk data.</div>
            )}
            <div className="backup-actions">
              <button className="a-btn a-btn-primary" onClick={exportBackup} disabled={!isSuperAdmin}><Download size={14} className="btn-icon" /> Export Full Backup</button>
              <button className="a-btn a-btn-danger" onClick={confirmReset} disabled={!isSuperAdmin}><RotateCcw size={14} className="btn-icon" /> Reset to Defaults</button>
              {!isSuperAdmin && lockHint}
            </div>
            <div className="a-divider" />
            <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "#0b2f7a", marginBottom: 8 }}>Import Backup</div>
            <label className="backup-import-area" style={{ display: "block" }}>
              <p><FolderOpen size={15} className="btn-icon" /> <strong>Click to select a backup JSON file</strong></p>
              <p style={{ marginTop: 4, fontSize: 12 }}>or paste JSON below and click Import</p>
              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                disabled={!isSuperAdmin}
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
              disabled={!isSuperAdmin}
              placeholder="Paste backup JSON here..."
              style={{
                width: "100%",
                height: 100,
                marginTop: 12,
                padding: 10,
                background: "#f4f8ff",
                border: "1px solid rgba(143,170,230,.42)",
                borderRadius: 8,
                color: "#17387f",
                fontSize: 11,
                fontFamily: "monospace",
                outline: "none",
                resize: "vertical",
              }}
            />
            <button className="a-btn a-btn-ghost" style={{ marginTop: 10 }} onClick={() => importData(pasteJson)} disabled={!isSuperAdmin}>
              <Upload size={14} className="btn-icon" /> Import from Pasted JSON
            </button>
            {!isSuperAdmin && <div style={{ marginTop: 8 }}>{lockHint}</div>}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        tone={confirmState.tone}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </div>
  );
}

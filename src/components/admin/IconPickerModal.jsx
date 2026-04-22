import { useEffect, useMemo, useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { iconNames, normalizeLucideIconName } from "../ServiceIcon";

const FEATURED_ICONS = [
  "file-text",
  "files",
  "clipboard-list",
  "briefcase",
  "badge-check",
  "shield-check",
  "building-2",
  "landmark",
  "folder-open",
  "receipt-text",
  "user-check",
  "users",
  "mail",
  "phone",
  "calendar-check",
  "clock-3",
  "map-pinned",
  "circle-help",
  "search",
  "megaphone",
  "gavel",
  "scroll-text",
];

export default function IconPickerModal({ open, initialValue = "", onClose, onSelect }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = e => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const selectedIcon = normalizeLucideIconName(initialValue);

  const iconsToShow = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? iconNames.filter(name => name.includes(q))
      : [...FEATURED_ICONS, ...iconNames.filter(name => !FEATURED_ICONS.includes(name))];

    return matches.slice(0, q ? 120 : 72);
  }, [query]);

  if (!open) return null;

  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="icon-picker-header">
          <div>
            <div className="icon-picker-title">Choose Service Icon</div>
            <div className="icon-picker-subtitle">Search Lucide icons by keyword (example: file, user, briefcase)</div>
          </div>
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={onClose}>Close</button>
        </div>

        <div className="icon-picker-toolbar">
          <input
            className="a-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search icon names..."
          />
          <button
            type="button"
            className="a-btn a-btn-danger a-btn-sm"
            onClick={() => onSelect?.("")}
          >
            Remove Icon
          </button>
        </div>

        {!!selectedIcon && (
          <div className="icon-picker-selected">
            <span>Selected:</span>
            <DynamicIcon name={selectedIcon} size={18} strokeWidth={2} aria-hidden="true" />
            <strong>{selectedIcon}</strong>
          </div>
        )}

        <div className="icon-picker-grid">
          {iconsToShow.map(name => (
            <button
              type="button"
              key={name}
              className={`icon-choice${selectedIcon === name ? " active" : ""}`}
              onClick={() => onSelect?.(name)}
              title={name}
            >
              <DynamicIcon name={name} size={22} strokeWidth={2} aria-hidden="true" />
              <span>{name}</span>
            </button>
          ))}
        </div>

        {!iconsToShow.length && (
          <div className="icon-picker-empty">No icons found for "{query}".</div>
        )}
      </div>
    </div>
  );
}
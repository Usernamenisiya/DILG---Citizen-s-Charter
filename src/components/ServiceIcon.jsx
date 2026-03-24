import { DynamicIcon, iconNames } from "lucide-react/dynamic";

const ICON_NAME_SET = new Set(iconNames);

export function isImageIconSource(value) {
  const icon = String(value || "").trim();
  if (!icon) return false;

  if (
    icon.startsWith("http://") ||
    icon.startsWith("https://") ||
    icon.startsWith("/") ||
    icon.startsWith("./") ||
    icon.startsWith("../") ||
    icon.startsWith("data:image/")
  ) {
    return true;
  }

  return /\.(png|svg|jpg|jpeg|gif|webp|avif)(\?.*)?$/i.test(icon);
}

export function normalizeLucideIconName(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const normalized = raw
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

  return ICON_NAME_SET.has(normalized) ? normalized : null;
}

export function ServiceIcon({
  icon,
  label,
  size = 28,
  className = "",
  strokeWidth = 2,
  color,
}) {
  const imageSource = isImageIconSource(icon) ? String(icon).trim() : null;
  const lucideName = !imageSource ? normalizeLucideIconName(icon) : null;

  if (imageSource) {
    return <img src={imageSource} alt={label || "service icon"} className={className} />;
  }

  if (lucideName) {
    return (
      <DynamicIcon
        name={lucideName}
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        color={color}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 8,
        background: "rgba(0,56,168,.12)",
      }}
    />
  );
}

export { iconNames };
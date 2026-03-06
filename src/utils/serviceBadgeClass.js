export function getServiceBadgeClass(classification) {
  return classification === "Simple"
    ? "badge-simple"
    : classification === "Complex"
      ? "badge-complex"
      : "badge-ht";
}

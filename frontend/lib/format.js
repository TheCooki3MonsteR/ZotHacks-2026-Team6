// "Oct 9, 2026". Returns `fallback` for a missing or unreadable date.
export function formatDate(value, fallback = "") {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

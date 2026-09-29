/** Date helpers for the portal. The school is in Kigali (CAT, UTC+2, no DST). */
export const SCHOOL_TZ = "Africa/Kigali";
const OFFSET = "+02:00";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SCHOOL_TZ,
  }).format(new Date(iso));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: SCHOOL_TZ }).format(
    new Date(iso),
  );
}

/** `<input type="datetime-local">` value (Kigali wall time) → ISO instant. */
export function kigaliLocalToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const date = new Date(`${local}:00${OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO instant → `YYYY-MM-DD` in Kigali, for `<input type="date">`. */
export function isoToKigaliDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: SCHOOL_TZ }).format(new Date(iso));
}

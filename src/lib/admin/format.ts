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

/** ISO instant → `YYYY-MM-DDTHH:MM` in Kigali, for `<input type="datetime-local">`. */
export function isoToKigaliLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

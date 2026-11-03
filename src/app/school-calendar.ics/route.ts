/**
 * The school's events as an iCalendar feed. Parents subscribe to it once
 * (/school-calendar → "Add to your phone's calendar") and their phone keeps it
 * up to date. Times are Kigali time (UTC+2, no daylight saving), sent as UTC.
 */
import { feedEvents, type EventRow } from "@/lib/server/events";
import { siteUrl } from "@/lib/server/settings";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** RFC 5545 text: escape \ ; , and newlines, then fold lines at 75 octets. */
function text(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut -= 1;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

const compact = (iso: string) => iso.replace(/-/g, "");

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Kigali wall time → UTC stamp, e.g. 2026-11-03 + 09:00 → 20261103T070000Z. */
function utcStamp(date: string, time: string): string {
  return new Date(`${date}T${time}:00+02:00`).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function vevent(event: EventRow, host: string): string[] {
  const lines = [
    "BEGIN:VEVENT",
    `UID:event-${event.id}@${host}`,
    `DTSTAMP:${new Date(event.updated_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
  ];
  if (event.start_time) {
    lines.push(`DTSTART:${utcStamp(event.start_date, event.start_time)}`);
    const endDate = event.end_date || event.start_date;
    lines.push(`DTEND:${utcStamp(endDate, event.end_time || event.start_time)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compact(event.start_date)}`);
    lines.push(`DTEND;VALUE=DATE:${compact(addDays(event.end_date || event.start_date, 1))}`);
  }
  lines.push(`SUMMARY:${text(event.title)}`);
  const details = [event.audience ? `For: ${event.audience}` : "", event.description].filter(Boolean).join("\n\n");
  if (details) lines.push(`DESCRIPTION:${text(details)}`);
  if (event.location) lines.push(`LOCATION:${text(event.location)}`);
  lines.push(`CATEGORIES:${text(event.category)}`, "END:VEVENT");
  return lines;
}

export async function GET(request: Request) {
  const base = siteUrl(new URL(request.url).origin);
  const host = new URL(base).host;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${text(site.name)}//School calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(site.name)}`,
    "X-WR-TIMEZONE:Africa/Kigali",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...feedEvents().flatMap((event) => vevent(event, host)),
    "END:VCALENDAR",
  ];
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="new-light-academy.ics"`,
      "Cache-Control": "public, max-age=900",
    },
  });
}

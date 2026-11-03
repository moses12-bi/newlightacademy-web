/**
 * The school's own calendar: events staff add in the portal (Calendar). They
 * sit alongside the national term dates in CalendarMonths.tsx, which stay in
 * code because MINEDUC sets them.
 */
import { db, isBuildPhase, now } from "./db";

export const EVENT_CATEGORIES = ["Event", "Term date", "Holiday", "Meeting", "Exams", "Sports", "Celebration", "Trip"] as const;

export interface EventRow {
  id: number;
  title: string;
  category: string;
  /** YYYY-MM-DD, Kigali. */
  start_date: string;
  /** YYYY-MM-DD; empty = a one-day event. */
  end_date: string;
  /** HH:MM; empty = all day. */
  start_time: string;
  end_time: string;
  location: string;
  /** Who it is for, e.g. "All families", "Top Class", "P6 parents". */
  audience: string;
  description: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export type EventInput = Omit<EventRow, "id" | "created_at" | "updated_at">;

export function kigaliToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali" }).format(new Date());
}

export function lastDay(event: Pick<EventRow, "start_date" | "end_date">): string {
  return event.end_date || event.start_date;
}

export function listEvents(): EventRow[] {
  return db().prepare("SELECT * FROM events ORDER BY start_date, start_time").all() as unknown as EventRow[];
}

export function getEvent(id: number): EventRow | undefined {
  return db().prepare("SELECT * FROM events WHERE id = ?").get(id) as EventRow | undefined;
}

function safely<T>(fn: () => T, fallback: T): T {
  if (isBuildPhase()) return fallback;
  try {
    return fn();
  } catch (error) {
    console.warn("[calendar] portal database unavailable:", error);
    return fallback;
  }
}

/** Published events that have not finished yet, soonest first. */
export function upcomingEvents(limit = 200): EventRow[] {
  return safely(
    () =>
      db()
        .prepare(
          `SELECT * FROM events WHERE status = 'published' AND (CASE WHEN end_date != '' THEN end_date ELSE start_date END) >= ?
            ORDER BY start_date, start_time LIMIT ?`,
        )
        .all(kigaliToday(), limit) as unknown as EventRow[],
    [],
  );
}

/** What the calendar subscription carries: everything published from 90 days ago on. */
export function feedEvents(): EventRow[] {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return safely(
    () =>
      db()
        .prepare(
          `SELECT * FROM events WHERE status = 'published' AND (CASE WHEN end_date != '' THEN end_date ELSE start_date END) >= ?
            ORDER BY start_date, start_time`,
        )
        .all(since) as unknown as EventRow[],
    [],
  );
}

const COLUMNS = ["title", "category", "start_date", "end_date", "start_time", "end_time", "location", "audience", "description", "status"] as const;

export function saveEvent(input: EventInput, userId: number, id?: number): EventRow {
  const values = COLUMNS.map((column) => input[column]);
  if (id) {
    db()
      .prepare(`UPDATE events SET ${COLUMNS.map((column) => `${column} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
      .run(...values, now(), id);
    return getEvent(id)!;
  }
  const stamp = now();
  const result = db()
    .prepare(`INSERT INTO events (${COLUMNS.join(", ")}, created_by, created_at, updated_at) VALUES (${COLUMNS.map(() => "?").join(", ")}, ?, ?, ?)`)
    .run(...values, userId, stamp, stamp);
  return getEvent(Number(result.lastInsertRowid))!;
}

export function deleteEvent(id: number): void {
  db().prepare("DELETE FROM events WHERE id = ?").run(id);
}

/* ------------------------------------------------------------ formatting -- */

const UTC = { timeZone: "UTC" } as const;
const asDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

/** "Tuesday 3 November 2026", or "3 – 5 November 2026" for a range. */
export function eventDateText(event: Pick<EventRow, "start_date" | "end_date">): string {
  const from = asDate(event.start_date);
  if (!event.end_date || event.end_date === event.start_date) {
    return from.toLocaleDateString("en-GB", { ...UTC, weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(",", "");
  }
  const to = asDate(event.end_date);
  const full = (d: Date) => d.toLocaleDateString("en-GB", { ...UTC, day: "numeric", month: "long", year: "numeric" });
  if (from.getUTCFullYear() !== to.getUTCFullYear()) return `${full(from)} – ${full(to)}`;
  if (from.getUTCMonth() !== to.getUTCMonth()) {
    return `${from.toLocaleDateString("en-GB", { ...UTC, day: "numeric", month: "long" })} – ${full(to)}`;
  }
  return `${from.getUTCDate()} – ${full(to)}`;
}

export function eventTimeText(event: Pick<EventRow, "start_time" | "end_time">): string {
  if (!event.start_time) return "";
  return event.end_time ? `${event.start_time} – ${event.end_time}` : event.start_time;
}

/** "November 2026" — the heading events are grouped under. */
export function monthLabel(iso: string): string {
  return asDate(iso).toLocaleDateString("en-GB", { ...UTC, month: "long", year: "numeric" });
}

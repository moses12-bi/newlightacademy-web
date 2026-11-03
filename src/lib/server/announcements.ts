/**
 * Announcements for parents: written in the portal, listed on /announcements
 * and the Parents page. An urgent one also shows as a banner on every page.
 */
import { db, isBuildPhase, now } from "./db";

export interface AnnouncementRow {
  id: number;
  title: string;
  body: string;
  /** Who it is for, e.g. "All parents", "Top Class parents". */
  audience: string;
  priority: "normal" | "urgent";
  pinned: number;
  /** ISO instant; a future time keeps it hidden until then. */
  publish_at: string;
  /** ISO instant; empty = never expires. */
  expires_at: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export type AnnouncementInput = Omit<AnnouncementRow, "id" | "created_at" | "updated_at">;

export function listAnnouncements(): AnnouncementRow[] {
  return db().prepare("SELECT * FROM announcements ORDER BY publish_at DESC").all() as unknown as AnnouncementRow[];
}

export function getAnnouncement(id: number): AnnouncementRow | undefined {
  return db().prepare("SELECT * FROM announcements WHERE id = ?").get(id) as AnnouncementRow | undefined;
}

/** Where an announcement stands right now. */
export function announcementState(row: AnnouncementRow, at = now()): "draft" | "scheduled" | "live" | "expired" {
  if (row.status !== "published") return "draft";
  if (row.publish_at > at) return "scheduled";
  if (row.expires_at && row.expires_at <= at) return "expired";
  return "live";
}

function safely<T>(fn: () => T, fallback: T): T {
  if (isBuildPhase()) return fallback;
  try {
    return fn();
  } catch (error) {
    console.warn("[announcements] portal database unavailable:", error);
    return fallback;
  }
}

/** Live announcements: pinned first, then newest. */
export function liveAnnouncements(limit = 50): AnnouncementRow[] {
  const at = now();
  return safely(
    () =>
      db()
        .prepare(
          `SELECT * FROM announcements WHERE status = 'published' AND publish_at <= ? AND (expires_at = '' OR expires_at > ?)
            ORDER BY pinned DESC, publish_at DESC LIMIT ?`,
        )
        .all(at, at, limit) as unknown as AnnouncementRow[],
    [],
  );
}

/** Announcements that have expired — kept visible as a short archive. */
export function pastAnnouncements(limit = 20): AnnouncementRow[] {
  const at = now();
  return safely(
    () =>
      db()
        .prepare(
          `SELECT * FROM announcements WHERE status = 'published' AND expires_at != '' AND expires_at <= ?
            ORDER BY publish_at DESC LIMIT ?`,
        )
        .all(at, limit) as unknown as AnnouncementRow[],
    [],
  );
}

/** The newest live urgent announcement, for the site-wide banner. */
export function urgentAnnouncement(): AnnouncementRow | undefined {
  return liveAnnouncements().find((row) => row.priority === "urgent");
}

const COLUMNS = ["title", "body", "audience", "priority", "pinned", "publish_at", "expires_at", "status"] as const;

export function saveAnnouncement(input: AnnouncementInput, userId: number, id?: number): AnnouncementRow {
  const values = COLUMNS.map((column) => input[column]);
  if (id) {
    db()
      .prepare(`UPDATE announcements SET ${COLUMNS.map((column) => `${column} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
      .run(...values, now(), id);
    return getAnnouncement(id)!;
  }
  const stamp = now();
  const result = db()
    .prepare(
      `INSERT INTO announcements (${COLUMNS.join(", ")}, created_by, created_at, updated_at) VALUES (${COLUMNS.map(() => "?").join(", ")}, ?, ?, ?)`,
    )
    .run(...values, userId, stamp, stamp);
  return getAnnouncement(Number(result.lastInsertRowid))!;
}

export function deleteAnnouncement(id: number): void {
  db().prepare("DELETE FROM announcements WHERE id = ?").run(id);
}

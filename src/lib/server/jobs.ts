/** Vacancies published on /careers from the staff portal. */
import { db, isBuildPhase, now } from "./db";
import { slugify } from "./posts";

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Volunteer"] as const;
export const JOB_CATEGORIES = ["Teaching", "Teaching assistant", "Administration", "Support staff", "Management", "Other"] as const;

export interface JobRow {
  id: number;
  slug: string;
  title: string;
  job_type: string;
  category: string;
  department: string;
  location: string;
  salary: string;
  start_date: string;
  /** YYYY-MM-DD, Kigali date; applications close at the end of that day. Empty = open until filled. */
  closing_date: string;
  summary: string;
  description: string;
  /** One item per line. */
  responsibilities: string;
  /** One item per line. */
  requirements: string;
  how_to_apply: string;
  status: "draft" | "open" | "closed";
  created_at: string;
  updated_at: string;
}

export type JobInput = Omit<JobRow, "id" | "created_at" | "updated_at">;

/** Today in Kigali, as YYYY-MM-DD. */
function kigaliToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali" }).format(new Date());
}

/** Open for applications: published, and the closing date (if any) not yet past. */
export function isAccepting(job: JobRow): boolean {
  return job.status === "open" && (!job.closing_date || job.closing_date >= kigaliToday());
}

export function lines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function listJobs(): (JobRow & { applications: number })[] {
  return db()
    .prepare(
      `SELECT j.*, (SELECT COUNT(*) FROM messages m WHERE m.ref = 'job:' || j.id) AS applications
         FROM jobs j ORDER BY CASE j.status WHEN 'open' THEN 0 WHEN 'draft' THEN 1 ELSE 2 END, j.updated_at DESC`,
    )
    .all() as unknown as (JobRow & { applications: number })[];
}

export function getJob(id: number): JobRow | undefined {
  return db().prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
}

/** What /careers lists. Never throws — the page must render without the database. */
export function openJobs(): JobRow[] {
  if (isBuildPhase()) return [];
  try {
    return (db().prepare("SELECT * FROM jobs WHERE status = 'open' ORDER BY updated_at DESC").all() as unknown as JobRow[]).filter(
      isAccepting,
    );
  } catch (error) {
    console.warn("[careers] portal database unavailable:", error);
    return [];
  }
}

/** A published or closed vacancy by slug — closed ones still resolve, to say so. */
export function publicJob(slug: string): JobRow | undefined {
  try {
    return db().prepare("SELECT * FROM jobs WHERE slug = ? AND status != 'draft'").get(slug) as JobRow | undefined;
  } catch {
    return undefined;
  }
}

function uniqueSlug(wanted: string, exceptId?: number): string {
  const base = slugify(wanted);
  let candidate = base;
  for (let n = 2; ; n += 1) {
    const clash = db().prepare("SELECT id FROM jobs WHERE slug = ?").get(candidate) as { id: number } | undefined;
    if (!clash || clash.id === exceptId) return candidate;
    candidate = `${base}-${n}`;
  }
}

const COLUMNS = [
  "title",
  "job_type",
  "category",
  "department",
  "location",
  "salary",
  "start_date",
  "closing_date",
  "summary",
  "description",
  "responsibilities",
  "requirements",
  "how_to_apply",
  "status",
] as const;

export function saveJob(input: JobInput, id?: number): JobRow {
  const slug = uniqueSlug(input.slug || input.title, id);
  const values = COLUMNS.map((column) => input[column]);
  if (id) {
    db()
      .prepare(`UPDATE jobs SET slug = ?, ${COLUMNS.map((column) => `${column} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
      .run(slug, ...values, now(), id);
    return getJob(id)!;
  }
  const stamp = now();
  const result = db()
    .prepare(`INSERT INTO jobs (slug, ${COLUMNS.join(", ")}, created_at, updated_at) VALUES (?, ${COLUMNS.map(() => "?").join(", ")}, ?, ?)`)
    .run(slug, ...values, stamp, stamp);
  return getJob(Number(result.lastInsertRowid))!;
}

export function deleteJob(id: number): void {
  db().prepare("DELETE FROM jobs WHERE id = ?").run(id);
}

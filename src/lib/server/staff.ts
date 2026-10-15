/**
 * The Our Teachers grid. Seeded on first use from the portraits that shipped in
 * code; after that staff manage names, roles, portraits, order and the Head
 * Teacher (always shown first) in the portal.
 */
import { DEFAULT_TEAM, RETIRED_DEFAULT_PHOTOS, type TeamMember } from "@/components/sections/our-teachers/team-data";

import { db, getContent, isBuildPhase, now, setContent } from "./db";

/**
 * Bump when DEFAULT_TEAM changes in a way a live site should pick up.
 *   1 — the first six portraits (teacher-1 … teacher-6)
 *   2 — the school's studio portraits (staff-01 … staff-07)
 */
const STAFF_SEED_VERSION = 2;

export interface StaffRow {
  id: number;
  name: string;
  role: string;
  photo: string;
  width: number;
  height: number;
  is_head: number;
  position: number;
}

/**
 * Seeds the grid on first use, and brings a database seeded by an earlier
 * DEFAULT_TEAM up to date.
 *
 * The live site was seeded before the school's studio portraits arrived, and a
 * seeded database ignores later changes to DEFAULT_TEAM. So an upgrade retires
 * the old placeholder rows — but ONLY rows staff have not touched: no name, no
 * role, not the Head Teacher, still on one of the retired photos. Anything a
 * member of staff named, re-photographed, promoted or added in the portal is
 * theirs and is kept, and the new portraits are appended after it.
 */
function seed(): void {
  const recorded = getContent<number>("staff_seed_version");
  const version = recorded ?? (getContent<boolean>("staff_seeded") ? 1 : 0);
  if (version >= STAFF_SEED_VERSION) return;

  const handle = db();
  if (version >= 1 && RETIRED_DEFAULT_PHOTOS.length > 0) {
    const placeholders = RETIRED_DEFAULT_PHOTOS.map(() => "?").join(", ");
    handle
      .prepare(
        `DELETE FROM staff WHERE name = '' AND role = '' AND is_head = 0 AND photo IN (${placeholders})`,
      )
      .run(...RETIRED_DEFAULT_PHOTOS);
  }

  const max = handle.prepare("SELECT MAX(position) AS hi FROM staff").get() as { hi: number | null };
  let position = (max.hi ?? -1) + 1;
  const insert = handle.prepare(
    "INSERT INTO staff (name, role, photo, width, height, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  for (const member of DEFAULT_TEAM) {
    insert.run(member.name ?? "", member.role ?? "", member.photo, 800, 1000, position, now());
    position += 1;
  }
  setContent("staff_seeded", true);
  setContent("staff_seed_version", STAFF_SEED_VERSION);
}

/** Head Teacher first, then everyone else in the order staff set. */
export function listStaff(): StaffRow[] {
  seed();
  return db().prepare("SELECT * FROM staff ORDER BY is_head DESC, position, id").all() as unknown as StaffRow[];
}

export function publicTeam(): TeamMember[] {
  if (isBuildPhase()) return DEFAULT_TEAM;
  try {
    return listStaff().map((row) => ({
      photo: row.photo,
      name: row.name || undefined,
      role: row.role || (row.is_head ? "Head Teacher" : undefined),
    }));
  } catch (error) {
    console.warn("[staff] portal database unavailable, using defaults:", error);
    return DEFAULT_TEAM;
  }
}

export interface StaffInput {
  name: string;
  role: string;
  photo: string;
  width: number;
  height: number;
  isHead: boolean;
}

function clearOtherHeads(keepId: number): void {
  db().prepare("UPDATE staff SET is_head = 0 WHERE id != ?").run(keepId);
}

export function addStaff(input: StaffInput): number {
  seed();
  const max = db().prepare("SELECT MAX(position) AS hi FROM staff").get() as { hi: number | null };
  const result = db()
    .prepare("INSERT INTO staff (name, role, photo, width, height, is_head, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(input.name, input.role, input.photo, input.width, input.height, input.isHead ? 1 : 0, (max.hi ?? -1) + 1, now());
  const id = Number(result.lastInsertRowid);
  if (input.isHead) clearOtherHeads(id);
  return id;
}

export function updateStaff(id: number, input: StaffInput): void {
  db()
    .prepare("UPDATE staff SET name = ?, role = ?, photo = ?, width = ?, height = ?, is_head = ? WHERE id = ?")
    .run(input.name, input.role, input.photo, input.width, input.height, input.isHead ? 1 : 0, id);
  if (input.isHead) clearOtherHeads(id);
}

export function removeStaff(id: number): void {
  db().prepare("DELETE FROM staff WHERE id = ?").run(id);
}

export function moveStaff(id: number, direction: -1 | 1): void {
  const rows = listStaff().filter((row) => !row.is_head);
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  const update = db().prepare("UPDATE staff SET position = ? WHERE id = ?");
  rows.forEach((row, position) => update.run(position, row.id));
}

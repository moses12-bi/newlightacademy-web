/**
 * The Our Teachers grid. Seeded on first use from the portraits that shipped in
 * code; after that staff manage names, roles, portraits, order and the Head
 * Teacher (always shown first) in the portal.
 */
import { DEFAULT_TEAM, type TeamMember } from "@/components/sections/our-teachers/team-data";

import { db, getContent, isBuildPhase, now, setContent } from "./db";

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

function seed(): void {
  if (getContent<boolean>("staff_seeded")) return;
  const insert = db().prepare("INSERT INTO staff (name, role, photo, position, created_at) VALUES (?, ?, ?, ?, ?)");
  DEFAULT_TEAM.forEach((member, index) => insert.run(member.name ?? "", member.role ?? "", member.photo, index, now()));
  setContent("staff_seeded", true);
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

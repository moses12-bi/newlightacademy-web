/** Website form submissions — the portal's Inbox. */
import { db, now } from "./db";

export type MessageStatus = "new" | "read" | "replied" | "archived";

export interface MessageRow {
  id: number;
  form: string;
  name: string;
  email: string;
  phone: string;
  fields_json: string;
  status: MessageStatus;
  ip: string;
  /** What the message is about, e.g. `job:12` for an application to vacancy 12. */
  ref: string;
  /** Where an application stands (Applications screen); empty for ordinary enquiries. */
  stage: string;
  created_at: string;
}

export interface EmailRow {
  id: number;
  message_id: number | null;
  to_addr: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  error: string;
  created_at: string;
}

/** Human names for the `form` ids the public pages post. */
export const FORM_LABELS: Record<string, string> = {
  contact: "Contact",
  tour: "Tour request",
  apply: "Application",
  payment: "Payment question",
  visit: "Visit request",
  newsletter: "Newsletter sign-up",
  review: "Review",
  "job-application": "Job application",
  "student-application": "Student application",
};

export function formLabel(form: string): string {
  return FORM_LABELS[form] ?? form;
}

export function createMessage(input: {
  form: string;
  name: string;
  email: string;
  phone: string;
  fields: Record<string, string>;
  ip: string;
  ref?: string;
  stage?: string;
}): number {
  const result = db()
    .prepare("INSERT INTO messages (form, name, email, phone, fields_json, ip, ref, stage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(input.form, input.name, input.email, input.phone, JSON.stringify(input.fields), input.ip, input.ref ?? "", input.stage ?? "", now());
  return Number(result.lastInsertRowid);
}

export function listMessages(filter: "open" | "archived" | "all" = "open", ref = ""): MessageRow[] {
  const conditions = [filter === "open" ? "status != 'archived'" : filter === "archived" ? "status = 'archived'" : "1 = 1"];
  if (ref) conditions.push("ref = ?");
  return db()
    .prepare(`SELECT * FROM messages WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 500`)
    .all(...(ref ? [ref] : [])) as unknown as MessageRow[];
}

export function deleteMessage(id: number): void {
  db().prepare("DELETE FROM messages WHERE id = ?").run(id);
}

export function getMessage(id: number): MessageRow | undefined {
  return db().prepare("SELECT * FROM messages WHERE id = ?").get(id) as MessageRow | undefined;
}

export function setMessageStatus(id: number, status: MessageStatus): void {
  db().prepare("UPDATE messages SET status = ? WHERE id = ?").run(status, id);
}

export function emailsForMessage(id: number): EmailRow[] {
  return db().prepare("SELECT * FROM emails WHERE message_id = ? ORDER BY created_at").all(id) as unknown as EmailRow[];
}

export function listSentEmails(limit = 100): EmailRow[] {
  return db().prepare("SELECT * FROM emails ORDER BY created_at DESC LIMIT ?").all(limit) as unknown as EmailRow[];
}

export function countNewMessages(): number {
  return (db().prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'").get() as { n: number }).n;
}

export function setMessageStage(id: number, stage: string): void {
  db().prepare("UPDATE messages SET stage = ? WHERE id = ?").run(stage, id);
}

export function listApplications(form: "student-application" | "job-application"): MessageRow[] {
  return db()
    .prepare("SELECT * FROM messages WHERE form = ? ORDER BY created_at DESC LIMIT 1000")
    .all(form) as unknown as MessageRow[];
}

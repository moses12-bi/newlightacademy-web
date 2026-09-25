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
}): number {
  const result = db()
    .prepare("INSERT INTO messages (form, name, email, phone, fields_json, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(input.form, input.name, input.email, input.phone, JSON.stringify(input.fields), input.ip, now());
  return Number(result.lastInsertRowid);
}

export function listMessages(filter: "open" | "archived" | "all" = "open"): MessageRow[] {
  const where = filter === "open" ? "WHERE status != 'archived'" : filter === "archived" ? "WHERE status = 'archived'" : "";
  return db().prepare(`SELECT * FROM messages ${where} ORDER BY created_at DESC LIMIT 500`).all() as unknown as MessageRow[];
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

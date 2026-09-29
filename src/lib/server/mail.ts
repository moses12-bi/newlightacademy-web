/**
 * Outgoing email over SMTP. Every message sent — or that failed to send — is
 * written to the `emails` table, so the Inbox shows what actually went out.
 */
import nodemailer from "nodemailer";

import { site } from "@/lib/site";

import { db, now } from "./db";
import { getSetting } from "./settings";
import { siteDetails } from "./site-details";

export function mailConfigured(): boolean {
  return !!(getSetting("SMTP_HOST") && getSetting("SMTP_USER") && getSetting("SMTP_PASS"));
}

function transport() {
  const port = Number(getSetting("SMTP_PORT") || 465);
  return nodemailer.createTransport({
    host: getSetting("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user: getSetting("SMTP_USER"), pass: getSetting("SMTP_PASS") },
  });
}

export function mailFrom(): string {
  return getSetting("MAIL_FROM") || `${site.name} <${getSetting("SMTP_USER") || siteDetails().email}>`;
}

export function officeRecipients(): string {
  return getSetting("MAIL_TO") || siteDetails().email;
}

export interface OutgoingMail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  messageId?: number | null;
  sentBy?: number | null;
}

export async function sendMail(mail: OutgoingMail): Promise<{ ok: true } | { ok: false; error: string }> {
  const record = (status: string, error = "") =>
    db()
      .prepare(
        "INSERT INTO emails (message_id, direction, to_addr, subject, body, status, error, sent_by, created_at) VALUES (?, 'out', ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(mail.messageId ?? null, mail.to, mail.subject, mail.text, status, error, mail.sentBy ?? null, now());

  if (!mailConfigured()) {
    const error = "SMTP is not configured (Settings → Integrations → Email).";
    record("failed", error);
    return { ok: false, error };
  }
  try {
    await transport().sendMail({
      from: mailFrom(),
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
    });
    record("sent");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    record("failed", message);
    return { ok: false, error: message };
  }
}

export async function verifyMail(): Promise<string | null> {
  if (!mailConfigured()) return "SMTP host, user and password are required.";
  try {
    await transport().verify();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/**
 * Public form endpoint. Every enquiry form on the site posts here: the
 * submission is stored in the portal Inbox and emailed to the school office.
 * Review submissions go to the review moderation queue instead.
 */
import { after } from "next/server";
import type { NextRequest } from "next/server";

import { site } from "@/lib/site";
import { officeRecipients, sendMail } from "@/lib/server/mail";
import { createMessage, formLabel } from "@/lib/server/messages";
import { createReview } from "@/lib/server/reviews";
import { siteUrl } from "@/lib/server/settings";

const FORM_ID = /^[a-z][a-z0-9-]{1,30}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELDS = 40;
const MAX_VALUE = 5000;

/* Per-IP brake: 10 submissions per 10 minutes. */
const recent = new Map<string, number[]>();
function limited(ip: string): boolean {
  const cutoff = Date.now() - 10 * 60 * 1000;
  const hits = (recent.get(ip) ?? []).filter((time) => time > cutoff);
  hits.push(Date.now());
  recent.set(ip, hits);
  return hits.length > 10;
}

/** First non-empty field whose label mentions one of `candidates` (labels, not ids, arrive here). */
function pick(fields: Record<string, string>, ...candidates: string[]): string {
  for (const [key, value] of Object.entries(fields)) {
    const lower = key.toLowerCase();
    if (lower.includes("child")) continue;
    /* "Yes"/"No" are checkbox answers (consent lines), never a name or address. */
    if (candidates.some((candidate) => lower.includes(candidate)) && value && value !== "Yes" && value !== "No") return value;
  }
  return "";
}

function personName(fields: Record<string, string>): string {
  const first = pick(fields, "first name");
  const last = pick(fields, "last name", "surname");
  if (first) return [first, last !== first ? last : ""].filter(Boolean).join(" ");
  return pick(fields, "name");
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "Too many submissions — please try again in a few minutes." }, { status: 429 });

  let payload: { form?: unknown; values?: unknown; company?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  /* Honeypot: a field people never see. Bots that fill it get a quiet success. */
  if (typeof payload.company === "string" && payload.company !== "") return Response.json({ ok: true });

  const form = typeof payload.form === "string" && FORM_ID.test(payload.form) ? payload.form : "contact";
  const raw = payload.values && typeof payload.values === "object" ? (payload.values as Record<string, unknown>) : {};
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw).slice(0, MAX_FIELDS)) {
    if (typeof value === "boolean") fields[key.slice(0, 120)] = value ? "Yes" : "No";
    else if (typeof value === "string" || typeof value === "number") fields[key.slice(0, 120)] = String(value).slice(0, MAX_VALUE).trim();
  }
  if (Object.values(fields).every((value) => value === "" || value === "No")) {
    return Response.json({ error: "The form is empty." }, { status: 400 });
  }

  const email = pick(fields, "email", "e-mail");
  const name = personName(fields);
  const phone = pick(fields, "phone", "tel", "mobile");
  if (email && !EMAIL.test(email)) return Response.json({ error: "That email address does not look right." }, { status: 400 });

  if (form === "review") {
    const body = pick(fields, "review", "message", "comment");
    if (!body || !name) return Response.json({ error: "Please add your name and your review." }, { status: 400 });
    createReview({
      author_name: name.slice(0, 120),
      relation: pick(fields, "relation", "role").slice(0, 120),
      rating: Number(pick(fields, "rating")) || 5,
      body: body.slice(0, 3000),
      email,
      source: "website",
      status: "pending",
    });
  }

  const id = createMessage({ form, name, email, phone, fields, ip });

  /* Mail after the response, so a slow SMTP server never delays the visitor. */
  after(async () => {
    const lines = Object.entries(fields).map(([key, value]) => `${key}: ${value}`);
    await sendMail({
      to: officeRecipients(),
      replyTo: email || undefined,
      subject: `[${site.shortName} website] ${formLabel(form)}${name ? ` from ${name}` : ""}`,
      text: `${lines.join("\n")}\n\n—\nOpen in the staff portal: ${siteUrl(request.nextUrl.origin)}/admin/inbox/${id}`,
      messageId: id,
    });
  });

  return Response.json({ ok: true });
}

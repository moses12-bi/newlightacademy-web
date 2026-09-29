/**
 * Student applications from /how-to-apply. Multipart, so parents can attach
 * the child's documents. The application lands in Applications (and the
 * Inbox), files are kept privately on the server, and the office is emailed.
 */
import { after } from "next/server";
import type { NextRequest } from "next/server";

import { site } from "@/lib/site";
import { admissionsSettings, CLASSES } from "@/lib/server/admissions";
import { checkFile, MAX_FILES, storeAttachment } from "@/lib/server/files";
import { officeRecipients, sendMail } from "@/lib/server/mail";
import { createMessage } from "@/lib/server/messages";
import { siteUrl } from "@/lib/server/settings";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Per-IP brake: 10 applications per hour (families with several children). */
const recent = new Map<string, number[]>();
function limited(ip: string): boolean {
  const cutoff = Date.now() - 60 * 60 * 1000;
  const hits = (recent.get(ip) ?? []).filter((time) => time > cutoff);
  hits.push(Date.now());
  recent.set(ip, hits);
  return hits.length > 10;
}

function text(form: FormData, key: string, max = 300): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "Too many applications from this connection — please try again later." }, { status: 429 });
  if (!admissionsSettings().open) return Response.json({ error: "Online applications are closed at the moment." }, { status: 400 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "The upload did not arrive complete. Please try again." }, { status: 400 });
  }
  if (text(form, "company")) return Response.json({ ok: true });

  const parent = text(form, "parent_name", 120);
  const email = text(form, "email", 200);
  const phone = text(form, "phone", 40);
  const child = text(form, "child_name", 120);
  const dob = text(form, "child_dob", 20);
  const klass = text(form, "class", 60);
  if (!parent || !child) return Response.json({ error: "Please give your name and your child's name." }, { status: 400 });
  if (!phone) return Response.json({ error: "Please give a phone number." }, { status: 400 });
  if (email && !EMAIL.test(email)) return Response.json({ error: "That email address does not look right." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return Response.json({ error: "Please give your child's date of birth." }, { status: 400 });
  if (!CLASSES.includes(klass)) return Response.json({ error: "Please choose the class you are applying for." }, { status: 400 });
  if (form.get("consent") !== "on") return Response.json({ error: "Please agree to the school keeping these details." }, { status: 400 });

  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > MAX_FILES) return Response.json({ error: `Attach at most ${MAX_FILES} files.` }, { status: 400 });
  const checked: { file: File; bytes: Buffer; kind: { ext: string; mime: string } }[] = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const kind = checkFile(file.name, bytes);
    if (typeof kind === "string") return Response.json({ error: kind }, { status: 400 });
    checked.push({ file, bytes, kind });
  }

  const intake = admissionsSettings().intake;
  const fields: Record<string, string> = {
    "Child's full name": child,
    "Date of birth": dob,
    Gender: text(form, "child_gender", 20),
    "Class applying for": klass,
    ...(intake ? { Intake: intake } : {}),
    "Preferred start": text(form, "start", 60),
    "Current or previous school": text(form, "previous_school", 160),
    "Health, allergies or learning needs": text(form, "needs", 2000),
    "Parent or guardian": parent,
    "Relationship to child": text(form, "relationship", 60),
    Phone: phone,
    Email: email,
    "Home area": text(form, "area", 160),
    "How did you hear about us": text(form, "heard", 160),
    Files: checked.map(({ file }) => file.name).join(", "),
  };
  const id = createMessage({
    form: "student-application",
    name: parent,
    email,
    phone,
    fields,
    ip,
    ref: `class:${klass}`,
    stage: "New",
  });
  for (const { file, bytes, kind } of checked) storeAttachment(id, file.name, bytes, kind);

  after(async () => {
    await sendMail({
      to: officeRecipients(),
      replyTo: email || undefined,
      subject: `[${site.shortName} admissions] ${child} — ${klass}`,
      text: `${Object.entries(fields)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}\n\n—\nOpen in the staff portal: ${siteUrl(request.nextUrl.origin)}/admin/inbox/${id}`,
      messageId: id,
      attachments: checked.map(({ file, bytes, kind }) => ({ filename: file.name, content: bytes, contentType: kind.mime })),
    });
  });

  return Response.json({ ok: true });
}

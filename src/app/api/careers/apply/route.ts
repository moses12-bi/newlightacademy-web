/**
 * Job applications from /careers/[slug]. Multipart, because the applicant
 * attaches a CV. The application lands in the portal Inbox (linked to the
 * vacancy), the files are kept privately on the server, and the office is
 * emailed with the files attached.
 */
import { after } from "next/server";
import type { NextRequest } from "next/server";

import { site } from "@/lib/site";
import { checkFile, MAX_FILES, storeAttachment } from "@/lib/server/files";
import { getJob, isAccepting } from "@/lib/server/jobs";
import { officeRecipients, sendMail } from "@/lib/server/mail";
import { createMessage } from "@/lib/server/messages";
import { siteUrl } from "@/lib/server/settings";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Per-IP brake: 5 applications per hour. */
const recent = new Map<string, number[]>();
function limited(ip: string): boolean {
  const cutoff = Date.now() - 60 * 60 * 1000;
  const hits = (recent.get(ip) ?? []).filter((time) => time > cutoff);
  hits.push(Date.now());
  recent.set(ip, hits);
  return hits.length > 5;
}

function text(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "Too many applications from this connection — please try again later." }, { status: 429 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "The upload did not arrive complete. Please try again." }, { status: 400 });
  }
  if (text(form, "company", 200)) return Response.json({ ok: true });

  const job = getJob(Number(text(form, "job", 20)));
  if (!job || !isAccepting(job)) return Response.json({ error: "This vacancy is no longer accepting applications." }, { status: 400 });

  const name = text(form, "name", 120);
  const email = text(form, "email", 200);
  const phone = text(form, "phone", 40);
  const letter = text(form, "letter", 8000);
  if (!name) return Response.json({ error: "Please give your full name." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "Please give a valid email address." }, { status: 400 });
  if (!phone) return Response.json({ error: "Please give a phone number." }, { status: 400 });
  if (form.get("consent") !== "on") {
    return Response.json({ error: "Please agree to the school keeping your application." }, { status: 400 });
  }

  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return Response.json({ error: "Please attach your CV." }, { status: 400 });
  if (files.length > MAX_FILES) return Response.json({ error: `Attach at most ${MAX_FILES} files.` }, { status: 400 });

  const checked: { file: File; bytes: Buffer; kind: { ext: string; mime: string } }[] = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const kind = checkFile(file.name, bytes);
    if (typeof kind === "string") return Response.json({ error: kind }, { status: 400 });
    checked.push({ file, bytes, kind });
  }

  const fields: Record<string, string> = {
    Position: job.title,
    "Full name": name,
    Email: email,
    Phone: phone,
    "Current role or experience": text(form, "experience", 300),
    "Available from": text(form, "available", 60),
    "Cover letter": letter,
    Files: checked.map(({ file }) => file.name).join(", "),
  };
  const id = createMessage({ form: "job-application", name, email, phone, fields, ip, ref: `job:${job.id}` });
  for (const { file, bytes, kind } of checked) storeAttachment(id, file.name, bytes, kind);

  after(async () => {
    await sendMail({
      to: officeRecipients(),
      replyTo: email,
      subject: `[${site.shortName} careers] ${job.title} — ${name}`,
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

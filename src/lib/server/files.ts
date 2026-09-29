/**
 * Files people send with a form — CVs and certificates with a job application.
 * They are personal data, so they are kept on the server in DATA_DIR/uploads
 * (never on a public URL) and are downloadable only by signed-in staff.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { dataDir, db, now } from "./db";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES = 3;

const KINDS: { ext: string; mime: string; magic: (bytes: Buffer) => boolean }[] = [
  { ext: "pdf", mime: "application/pdf", magic: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: (b) => b[0] === 0x50 && b[1] === 0x4b,
  },
  { ext: "doc", mime: "application/msword", magic: (b) => b.subarray(0, 4).toString("hex") === "d0cf11e0" },
  { ext: "jpg", mime: "image/jpeg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { ext: "jpeg", mime: "image/jpeg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { ext: "png", mime: "image/png", magic: (b) => b.subarray(0, 4).toString("hex") === "89504e47" },
];

export const ACCEPTED_EXTENSIONS = KINDS.map((kind) => `.${kind.ext}`).join(",");

function uploadsDir(): string {
  const dir = path.join(dataDir(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Checks the extension *and* the file's first bytes, so a renamed file of another type is refused. */
export function checkFile(name: string, bytes: Buffer): { ext: string; mime: string } | string {
  if (bytes.length === 0) return `${name} is empty.`;
  if (bytes.length > MAX_FILE_BYTES) return `${name} is larger than 5 MB.`;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const kind = KINDS.find((entry) => entry.ext === ext);
  if (!kind || !kind.magic(bytes)) return `${name} must be a PDF, Word document, JPG or PNG.`;
  return { ext: kind.ext, mime: kind.mime };
}

export interface AttachmentRow {
  id: number;
  message_id: number;
  filename: string;
  stored_name: string;
  mime: string;
  size: number;
  created_at: string;
}

export function storeAttachment(messageId: number, filename: string, bytes: Buffer, kind: { ext: string; mime: string }): void {
  const stored = `${crypto.randomBytes(16).toString("hex")}.${kind.ext}`;
  fs.writeFileSync(path.join(uploadsDir(), stored), bytes, { mode: 0o600 });
  const safeName = filename.replace(/[^\w.\- ()]+/g, "_").slice(-120);
  db()
    .prepare("INSERT INTO attachments (message_id, filename, stored_name, mime, size, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(messageId, safeName, stored, kind.mime, bytes.length, now());
}

export function attachmentsFor(messageId: number): AttachmentRow[] {
  return db().prepare("SELECT * FROM attachments WHERE message_id = ? ORDER BY id").all(messageId) as unknown as AttachmentRow[];
}

export function getAttachment(id: number): AttachmentRow | undefined {
  return db().prepare("SELECT * FROM attachments WHERE id = ?").get(id) as AttachmentRow | undefined;
}

export function readAttachment(row: AttachmentRow): Buffer {
  return fs.readFileSync(path.join(uploadsDir(), path.basename(row.stored_name)));
}

/** Deletes the files from disk; the rows go with their message (ON DELETE CASCADE). */
export function deleteAttachmentFiles(messageId: number): void {
  for (const row of attachmentsFor(messageId)) {
    fs.rmSync(path.join(uploadsDir(), path.basename(row.stored_name)), { force: true });
  }
}

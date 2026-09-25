/**
 * Password hashing, session tokens and at-rest encryption for stored secrets.
 * Everything here is Node's own `crypto` — no third-party dependency.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { dataDir } from "./db";

/**
 * The key everything else is derived from. `SESSION_SECRET` in production; if it
 * is unset, a random one is generated once and kept in the data directory so a
 * restart does not sign everyone out or orphan the encrypted settings.
 */
function masterSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  const file = path.join(dataDir(), ".session-secret");
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    const generated = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(file, generated, { mode: 0o600 });
    return generated;
  }
}

function derivedKey(purpose: string): Buffer {
  return crypto.createHash("sha256").update(`${purpose}:${masterSecret()}`).digest();
}

/* scrypt with a per-password salt: `scrypt$<salt>$<hash>`. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/** Session tokens are stored hashed, so a leaked database cannot be replayed as cookies. */
export function hashToken(token: string): string {
  return crypto.createHmac("sha256", derivedKey("session")).update(token).digest("hex");
}

/** AES-256-GCM for API tokens and passwords kept in the settings table. */
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey("settings"), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `enc:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${data.toString("base64")}`;
}

export function decrypt(stored: string): string {
  if (!stored.startsWith("enc:")) return stored;
  const [, ivB64, tagB64, dataB64] = stored.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey("settings"), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

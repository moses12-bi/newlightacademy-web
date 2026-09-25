/**
 * Staff sign-in. Sessions are rows in the database keyed by a hashed random
 * token; the cookie holds only the token. Every portal page and every Server
 * Action calls `requireUser()` — the proxy's cookie check is only a fast
 * redirect, never the thing that grants access.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db, logActivity, now } from "./db";
import { hashPassword, hashToken, randomToken, verifyPassword } from "./crypto";

export const SESSION_COOKIE = "nla_session";
const SESSION_DAYS = 14;

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  last_login_at: string | null;
}

/**
 * First run: with no staff accounts yet, `ADMIN_EMAIL` + `ADMIN_PASSWORD` from
 * the environment become the first account. After that the variables are
 * ignored, so changing them cannot be used to take over the portal.
 */
function ensureBootstrapUser(): void {
  const count = db().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (count.n > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  createUser(email, "Administrator", password);
}

export function hasAnyUser(): boolean {
  ensureBootstrapUser();
  const count = db().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  return count.n > 0;
}

export function createUser(email: string, name: string, password: string): number {
  if (password.length < 10) throw new Error("Passwords must be at least 10 characters.");
  const result = db()
    .prepare("INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .run(email.trim().toLowerCase(), name.trim() || email, hashPassword(password), now());
  return Number(result.lastInsertRowid);
}

export function setPassword(userId: number, password: string): void {
  if (password.length < 10) throw new Error("Passwords must be at least 10 characters.");
  db().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), userId);
  /* Signing everyone else out is the point of changing a password. */
  db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function listUsers(): User[] {
  return db()
    .prepare("SELECT id, email, name, created_at, last_login_at FROM users ORDER BY created_at")
    .all() as unknown as User[];
}

export function deleteUser(userId: number): void {
  db().prepare("DELETE FROM users WHERE id = ?").run(userId);
}

/* A small in-memory brake on password guessing: 8 failures per email+IP per 15 minutes. */
const failures = new Map<string, { count: number; until: number }>();

export function loginThrottled(key: string): boolean {
  const entry = failures.get(key);
  return !!entry && entry.count >= 8 && entry.until > Date.now();
}

function noteFailure(key: string): void {
  const entry = failures.get(key);
  const until = Date.now() + 15 * 60 * 1000;
  failures.set(key, { count: entry && entry.until > Date.now() ? entry.count + 1 : 1, until });
}

export async function signIn(email: string, password: string, throttleKey: string): Promise<boolean> {
  ensureBootstrapUser();
  const row = db()
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as { id: number; password_hash: string } | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) {
    noteFailure(throttleKey);
    return false;
  }
  failures.delete(throttleKey);

  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db()
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(hashToken(token), row.id, now(), expires.toISOString());
  db().prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now(), row.id);
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(now());
  logActivity(row.id, "signed in");

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  store.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.created_at, u.last_login_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), now()) as User | undefined;
  return user ?? null;
}

/** Use at the top of every portal page and Server Action. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  return user;
}

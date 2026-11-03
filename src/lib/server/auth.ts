/**
 * Staff sign-in. Sessions are rows in the database keyed by a hashed random
 * token; the cookie holds only the token. Every portal page and every Server
 * Action calls `requireUser()` (or `requireAdmin()`) — the proxy's cookie check
 * is only a fast redirect, never the thing that grants access.
 *
 * Accounts are created by invitation: an administrator sends an emailed link,
 * and the person chooses their own password. Forgotten passwords are reset the
 * same way. Both links carry a random token stored only as a hash, used once,
 * and short-lived.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db, logActivity, now } from "./db";
import { hashPassword, hashToken, randomToken, verifyPassword } from "./crypto";

export const SESSION_COOKIE = "nla_session";
const SESSION_DAYS = 14;

/**
 * `admin`: everything, including staff accounts and Settings (integrations).
 * `staff`: all content — blog, social media, applications, inbox and so on.
 */
export type Role = "admin" | "staff";
export const ROLES: { id: Role; label: string; help: string }[] = [
  { id: "staff", label: "Staff", help: "Blog, social media, gallery, staff cards, careers, applications, reviews, inbox and email." },
  { id: "admin", label: "Administrator", help: "Everything staff can do, plus staff accounts and Settings." },
];

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  disabled: number;
  created_at: string;
  last_login_at: string | null;
}

const USER_COLUMNS = "u.id, u.email, u.name, u.role, u.disabled, u.created_at, u.last_login_at";
export const MIN_PASSWORD = 10;

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
  createUser(email, "Administrator", password, "admin");
}

export function hasAnyUser(): boolean {
  ensureBootstrapUser();
  const count = db().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  return count.n > 0;
}

export function passwordProblem(password: string, confirm?: string): string | null {
  if (password.length < MIN_PASSWORD) return `Passwords must be at least ${MIN_PASSWORD} characters.`;
  if (confirm !== undefined && password !== confirm) return "The two passwords do not match.";
  return null;
}

export function createUser(email: string, name: string, password: string, role: Role = "staff"): number {
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  const result = db()
    .prepare("INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(email.trim().toLowerCase(), name.trim() || email, hashPassword(password), role, now());
  return Number(result.lastInsertRowid);
}

export function getUser(id: number): User | undefined {
  return db().prepare(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = ?`).get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  return db().prepare(`SELECT ${USER_COLUMNS} FROM users u WHERE u.email = ?`).get(email.trim().toLowerCase()) as User | undefined;
}

/** Active administrators — there must always be at least one. */
export function countActiveAdmins(): number {
  return (db().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND disabled = 0").get() as { n: number }).n;
}

export function updateUser(id: number, changes: { name?: string; email?: string; role?: Role; disabled?: boolean }): void {
  const user = getUser(id);
  if (!user) return;
  db()
    .prepare("UPDATE users SET name = ?, email = ?, role = ?, disabled = ? WHERE id = ?")
    .run(
      changes.name?.trim() || user.name,
      changes.email?.trim().toLowerCase() || user.email,
      changes.role ?? user.role,
      changes.disabled === undefined ? user.disabled : changes.disabled ? 1 : 0,
      id,
    );
  /* A deactivated account is signed out everywhere at once. */
  if (changes.disabled) endSessions(id);
}

/** Signs a user out on every device, optionally keeping one session (this browser). */
export function endSessions(userId: number, keepToken?: string): void {
  if (keepToken) {
    db().prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").run(userId, hashToken(keepToken));
  } else {
    db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }
}

export async function currentSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export function setPassword(userId: number, password: string): void {
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  db().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), userId);
  /* Signing everyone else out is the point of changing a password. */
  db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function listUsers(): User[] {
  return db().prepare(`SELECT ${USER_COLUMNS} FROM users u ORDER BY u.disabled, u.created_at`).all() as unknown as User[];
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
    .prepare("SELECT id, password_hash, disabled FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as { id: number; password_hash: string; disabled: number } | undefined;
  /* A deactivated account gets the same answer as a wrong password. */
  if (!row || row.disabled || !verifyPassword(password, row.password_hash)) {
    noteFailure(throttleKey);
    return false;
  }
  failures.delete(throttleKey);
  await startSession(row.id);
  logActivity(row.id, "signed in");
  return true;
}

/** Creates a session for a user and sets the cookie in this response. */
export async function startSession(userId: number): Promise<void> {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db()
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(hashToken(token), userId, now(), expires.toISOString());
  db().prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now(), userId);
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(now());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
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
      `SELECT ${USER_COLUMNS}
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ? AND u.disabled = 0`,
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

/** For staff accounts and Settings: administrators only. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin?error=" + encodeURIComponent("Only administrators can open that page."));
  return user;
}

/* ------------------------------------------------- invitations & resets -- */

export type TokenKind = "invite" | "reset";

export const TOKEN_LIFETIME: Record<TokenKind, number> = {
  invite: 7 * 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

export interface AuthToken {
  id: number;
  kind: TokenKind;
  email: string;
  name: string;
  role: Role;
  user_id: number | null;
  created_by: number | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

/**
 * Issues a one-time link token. Earlier unused tokens of the same kind for the
 * same address are withdrawn, so only the newest link works. Returns the raw
 * token — it is never stored, only its hash.
 */
export function issueToken(input: { kind: TokenKind; email: string; name?: string; role?: Role; userId?: number; createdBy?: number }): string {
  const email = input.email.trim().toLowerCase();
  db().prepare("DELETE FROM auth_tokens WHERE kind = ? AND email = ? AND used_at IS NULL").run(input.kind, email);
  const token = randomToken(32);
  db()
    .prepare(
      "INSERT INTO auth_tokens (token_hash, kind, email, name, role, user_id, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      hashToken(token),
      input.kind,
      email,
      input.name?.trim() ?? "",
      input.role ?? "staff",
      input.userId ?? null,
      input.createdBy ?? null,
      now(),
      new Date(Date.now() + TOKEN_LIFETIME[input.kind]).toISOString(),
    );
  return token;
}

/** A token that exists, is of this kind, is unused and has not expired. */
export function findToken(raw: string, kind: TokenKind): AuthToken | undefined {
  if (!raw || raw.length > 200) return undefined;
  return db()
    .prepare("SELECT * FROM auth_tokens WHERE token_hash = ? AND kind = ? AND used_at IS NULL AND expires_at > ?")
    .get(hashToken(raw), kind, now()) as AuthToken | undefined;
}

function markUsed(id: number): void {
  db().prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ?").run(now(), id);
}

export function listPendingInvites(): (AuthToken & { invited_by: string | null })[] {
  return db()
    .prepare(
      `SELECT t.*, u.name AS invited_by FROM auth_tokens t LEFT JOIN users u ON u.id = t.created_by
        WHERE t.kind = 'invite' AND t.used_at IS NULL AND t.expires_at > ? ORDER BY t.created_at DESC`,
    )
    .all(now()) as unknown as (AuthToken & { invited_by: string | null })[];
}

export function getInvite(id: number): AuthToken | undefined {
  return db().prepare("SELECT * FROM auth_tokens WHERE id = ? AND kind = 'invite'").get(id) as AuthToken | undefined;
}

export function revokeInvite(id: number): void {
  db().prepare("DELETE FROM auth_tokens WHERE id = ? AND kind = 'invite' AND used_at IS NULL").run(id);
}

/** Turns an invitation into an account and signs the new user in. */
export async function acceptInvite(raw: string, name: string, password: string): Promise<User | string> {
  const invite = findToken(raw, "invite");
  if (!invite) return "This invitation link has expired or has already been used. Ask an administrator for a new one.";
  const problem = passwordProblem(password);
  if (problem) return problem;
  if (getUserByEmail(invite.email)) {
    markUsed(invite.id);
    return "An account with this email already exists. Sign in, or use “Forgot your password?”.";
  }
  const id = createUser(invite.email, name || invite.name || invite.email, password, invite.role);
  markUsed(invite.id);
  logActivity(id, "accepted invitation", invite.email);
  await startSession(id);
  return getUser(id)!;
}

/** Sets a new password from a reset link. Every other session of that user ends. */
export function completeReset(raw: string, password: string): User | string {
  const reset = findToken(raw, "reset");
  if (!reset || !reset.user_id) return "This reset link has expired or has already been used. Ask for a new one.";
  const user = getUser(reset.user_id);
  if (!user || user.disabled) return "This account is not active. Ask an administrator for help.";
  const problem = passwordProblem(password);
  if (problem) return problem;
  setPassword(user.id, password);
  markUsed(reset.id);
  db().prepare("DELETE FROM auth_tokens WHERE kind = 'reset' AND user_id = ? AND used_at IS NULL").run(user.id);
  logActivity(user.id, "reset password");
  return user;
}

/* A brake on reset requests: 5 per address or IP per 15 minutes. */
const resetRequests = new Map<string, number[]>();
export function resetThrottled(key: string): boolean {
  const cutoff = Date.now() - 15 * 60 * 1000;
  const hits = (resetRequests.get(key) ?? []).filter((time) => time > cutoff);
  hits.push(Date.now());
  resetRequests.set(key, hits);
  return hits.length > 5;
}

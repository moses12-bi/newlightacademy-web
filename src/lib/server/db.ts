/**
 * The staff portal's database: one SQLite file, opened with Node's built-in
 * `node:sqlite` driver so there is no native module to compile in the image.
 *
 * The file lives in `DATA_DIR` (default `./data`). In production that directory
 * must be a mounted volume — the container's own filesystem is thrown away on
 * every deploy, and the blog, the inbox and every connected account with it.
 *
 * Migrations are an ordered list of SQL strings; `PRAGMA user_version` records
 * how many have run. Append to the list — never edit an entry that has shipped.
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export function dataDir(): string {
  /* turbopackIgnore: the directory is only known at runtime, and must not make
     the build trace the whole project into the standalone output. */
  const dir = path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || path.join(process.cwd(), "data"));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'News',
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    image_width INTEGER NOT NULL DEFAULT 0,
    image_height INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    author_name TEXT NOT NULL,
    relation TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5,
    body TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'website',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );
  CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    form TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    fields_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    ip TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE emails (
    id INTEGER PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    direction TEXT NOT NULL DEFAULT 'out',
    to_addr TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT NOT NULL DEFAULT '',
    sent_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE social_posts (
    id INTEGER PRIMARY KEY,
    caption TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL DEFAULT '',
    media_url TEXT NOT NULL DEFAULT '',
    media_type TEXT NOT NULL DEFAULT 'none',
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE social_targets (
    id INTEGER PRIMARY KEY,
    social_post_id INTEGER NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    remote_id TEXT NOT NULL DEFAULT '',
    remote_url TEXT NOT NULL DEFAULT '',
    error TEXT NOT NULL DEFAULT '',
    attempted_at TEXT
  );
  CREATE TABLE activity (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE INDEX posts_status ON posts(status, published_at);
  CREATE INDEX messages_status ON messages(status, created_at);
  CREATE INDEX social_posts_due ON social_posts(status, scheduled_at);
  `,
];

function migrate(db: DatabaseSync): void {
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  for (let version = row.user_version; version < MIGRATIONS.length; version += 1) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[version]);
      db.exec(`PRAGMA user_version = ${version + 1}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

/* One connection per server process. Kept on globalThis so dev-mode module
   reloads do not open a new handle on every edit. */
const globalForDb = globalThis as unknown as { __nlaDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!globalForDb.__nlaDb) {
    const handle = new DatabaseSync(path.join(dataDir(), "portal.db"));
    handle.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    migrate(handle);
    globalForDb.__nlaDb = handle;
  }
  return globalForDb.__nlaDb;
}

export function now(): string {
  return new Date().toISOString();
}

export function logActivity(userId: number | null, action: string, detail = ""): void {
  db()
    .prepare("INSERT INTO activity (user_id, action, detail, created_at) VALUES (?, ?, ?, ?)")
    .run(userId, action, detail.slice(0, 500), now());
}

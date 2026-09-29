/**
 * Blog posts written in the portal. The public `/blog` pages read published
 * rows from here, merged with anything still listed in `src/lib/blog-posts.ts`.
 */
import { db, now } from "./db";

export interface PostRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  image_url: string;
  image_width: number;
  image_height: number;
  /** Focal point as CSS `object-position`, e.g. "50% 20%"; empty = automatic. */
  image_focus: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostInput {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  image_url: string;
  image_width: number;
  image_height: number;
  image_focus: string;
  status: "draft" | "published";
  /** ISO date (YYYY-MM-DD) shown on the post; defaults to today on first publish. */
  published_at: string;
}

export function slugify(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}

/** Every post, newest first. `scheduled`: published with a date still in the future. */
export function listPosts(): (PostRow & { scheduled: boolean })[] {
  const rows = db().prepare("SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC").all() as unknown as PostRow[];
  const stamp = now();
  return rows.map((row) => ({ ...row, scheduled: row.status === "published" && !!row.published_at && row.published_at > stamp }));
}

export function listPublishedPosts(): PostRow[] {
  return db()
    .prepare("SELECT * FROM posts WHERE status = 'published' AND published_at <= ? ORDER BY published_at DESC")
    .all(now()) as unknown as PostRow[];
}

export function getPostById(id: number): PostRow | undefined {
  return db().prepare("SELECT * FROM posts WHERE id = ?").get(id) as PostRow | undefined;
}

export function getPublishedPostBySlug(slug: string): PostRow | undefined {
  return db()
    .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= ?")
    .get(slug, now()) as PostRow | undefined;
}

function uniqueSlug(wanted: string, exceptId?: number): string {
  const base = slugify(wanted);
  let candidate = base;
  for (let n = 2; ; n += 1) {
    const clash = db().prepare("SELECT id FROM posts WHERE slug = ?").get(candidate) as { id: number } | undefined;
    if (!clash || clash.id === exceptId) return candidate;
    candidate = `${base}-${n}`;
  }
}

function publishedAt(input: PostInput, existing?: PostRow): string | null {
  if (input.published_at) return new Date(`${input.published_at}T08:00:00Z`).toISOString();
  if (existing?.published_at) return existing.published_at;
  return input.status === "published" ? now() : null;
}

export function createPost(input: PostInput, authorId: number): PostRow {
  const slug = uniqueSlug(input.slug || input.title);
  const stamp = now();
  const result = db()
    .prepare(
      `INSERT INTO posts (slug, title, category, excerpt, body, image_url, image_width, image_height, image_focus, status, published_at, created_at, updated_at, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      slug,
      input.title,
      input.category,
      input.excerpt,
      input.body,
      input.image_url,
      input.image_width,
      input.image_height,
      input.image_focus,
      input.status,
      publishedAt(input),
      stamp,
      stamp,
      authorId,
    );
  return getPostById(Number(result.lastInsertRowid))!;
}

export function updatePost(id: number, input: PostInput): PostRow {
  const existing = getPostById(id);
  if (!existing) throw new Error("Post not found");
  const slug = uniqueSlug(input.slug || input.title, id);
  db()
    .prepare(
      `UPDATE posts SET slug = ?, title = ?, category = ?, excerpt = ?, body = ?, image_url = ?, image_width = ?, image_height = ?,
              image_focus = ?, status = ?, published_at = ?, updated_at = ? WHERE id = ?`,
    )
    .run(
      slug,
      input.title,
      input.category,
      input.excerpt,
      input.body,
      input.image_url,
      input.image_width,
      input.image_height,
      input.image_focus,
      input.status,
      publishedAt(input, existing),
      now(),
      id,
    );
  return getPostById(id)!;
}

export function deletePost(id: number): void {
  db().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

/**
 * The blog as the public pages see it: posts published from the staff portal,
 * followed by any still hard-coded in `src/lib/blog-posts.ts`.
 */
import { blogArchiveSlugs, getPost as getStaticPost, getPosts as getStaticPosts, type BlogPost } from "@/lib/blog-posts";

import { getPublishedPostBySlug, listPublishedPosts, type PostRow } from "./posts";

/**
 * Where the crop centres. Staff can set it by clicking the photo in the editor;
 * otherwise a portrait photo is framed from near the top — where faces usually
 * are — rather than from its middle.
 */
function coverFocus(row: PostRow): string {
  if (row.image_focus) return row.image_focus;
  return row.image_height > row.image_width ? "50% 20%" : "50% 50%";
}

function toBlogPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    body: row.body,
    date: (row.published_at ?? row.created_at).slice(0, 10),
    image: row.image_url
      ? { src: row.image_url, width: row.image_width || 1200, height: row.image_height || 800, focus: coverFocus(row) }
      : undefined,
  };
}

/* The public pages must still render if the database cannot be opened. */
function safely<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.warn("[blog] portal database unavailable:", error);
    return fallback;
  }
}

export function publishedPosts(): BlogPost[] {
  const fromPortal = safely(() => listPublishedPosts().map(toBlogPost), []);
  const taken = new Set(fromPortal.map((post) => post.slug));
  return [...fromPortal, ...getStaticPosts(blogArchiveSlugs).filter((post) => !taken.has(post.slug))];
}

export function publishedPost(slug: string): BlogPost | undefined {
  const row = safely(() => getPublishedPostBySlug(slug), undefined);
  return row ? toBlogPost(row) : getStaticPost(slug);
}

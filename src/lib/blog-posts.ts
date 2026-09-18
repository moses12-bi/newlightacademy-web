/**
 * The school news feed, as a typed local data module.
 *
 * There is no CMS behind this app, so the cards on `/blog` and the three News
 * cards on `/home-2` are rendered from this list.
 *
 * The list is deliberately empty. Everything the template shipped here was
 * transcribed from another school's website, and none of it is New Light
 * Academy's news — publishing it, or writing replacements for it, would put
 * events on the site that never happened. The interface, the slug lists and the
 * helpers below are kept exactly as they are so the school can add its own
 * posts here later without any component changing.
 *
 * `body` is deliberately absent: a post is a card plus an excerpt until the
 * school decides it wants full articles.
 */
export interface BlogPost {
  slug: string;
  title: string;
  /** The teal badge on the card. */
  category: string;
  /** The short summary shown on the card. */
  excerpt: string;
  /** ISO date, e.g. "2026-01-31". */
  date: string;
  image: { src: string; width: number; height: number };
}

/** Empty until the school supplies its own news. */
export const blogPosts: BlogPost[] = [];

/** The posts the `/blog` archive lists, in its order. */
export const blogArchiveSlugs: string[] = [];

/** The posts the `/home-2` News row shows, in its order. */
export const homeTwoNewsSlugs: string[] = [];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPosts(slugs: string[]): BlogPost[] {
  return slugs.flatMap((slug) => {
    const post = getPost(slug);
    return post ? [post] : [];
  });
}

/** "4 February 2020" — the locale is fixed so server and client agree. */
export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

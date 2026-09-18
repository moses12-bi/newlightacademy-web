"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { FacebookIcon, TwitterIcon } from "@/components/ui/icons";
import type { BlogPost } from "@/lib/blog-posts";
import { site, socialByIcon } from "@/lib/site";

export interface BlogFeedProps {
  posts: BlogPost[];
}

/** Hand-drawn share glyph: this project has no icon package, and this one is
    only used here (Twitter and Facebook come from the shared icon module). */
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5H3.6V21h3.34V8.5ZM5.27 3A1.93 1.93 0 1 0 5.3 6.87 1.93 1.93 0 0 0 5.27 3ZM21 14.2c0-3.6-1.93-5.28-4.5-5.28a3.9 3.9 0 0 0-3.53 1.94V8.5H9.63c.04.94 0 12.5 0 12.5h3.34v-6.98a2.3 2.3 0 0 1 .11-.81 1.83 1.83 0 0 1 1.71-1.22c1.21 0 1.69.92 1.69 2.27V21H21Z" />
    </svg>
  );
}

const SHARE_TARGETS = [
  { key: "facebook", label: "Share on facebook", base: "https://www.facebook.com/sharer/sharer.php?u=", Icon: FacebookIcon },
  { key: "twitter", label: "Share on twitter", base: "https://twitter.com/intent/tweet?url=", Icon: TwitterIcon },
  { key: "linkedin", label: "Share on linkedin", base: "https://www.linkedin.com/sharing/share-offsite/?url=", Icon: LinkedinIcon },
] as const;

function matches(post: BlogPost, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === "") return true;
  return (
    post.title.toLowerCase().includes(needle) ||
    post.excerpt.toLowerCase().includes(needle) ||
    post.category.toLowerCase().includes(needle)
  );
}

/**
 * The blog archive band (post-595 #4e5a96a): the card list on the left, the
 * search box, share buttons and the Facebook card on the right.
 *
 * The search is a real client-side filter over the local post list — there is no
 * server to query — and the result count is announced politely. The Facebook
 * widget is a local link-out card: Facebook's SDK is never loaded.
 */
export default function BlogFeed({ posts }: BlogFeedProps) {
  const searchId = useId();
  const facebook = socialByIcon("facebook");
  const [query, setQuery] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  /* The deployed address is only known in the browser, so the share links start
     as plain links to each network and gain the `?url=` once mounted. */
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const visible = useMemo(() => posts.filter((post) => matches(post, query)), [posts, query]);
  const trimmed = query.trim();

  return (
    <section className="blog-feed">
      <ShapeDivider position="bottom" />

      <Container className="blog-feed__layout">
        <div className="blog-feed__main">
          <ul className="blog-cards">
            {visible.map((post) => (
              <li key={post.slug}>
                <article className="blog-card">
                  {/* The saved markup wraps the thumbnail in a second link to the
                      same post; here it is decorative, so the card exposes one
                      link per destination instead of three. */}
                  <div className="blog-card__thumb">
                    <Image
                      src={post.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className="blog-card__image"
                    />
                  </div>
                  <p className="blog-card__badge">{post.category}</p>
                  <div className="blog-card__text">
                    <h2 className="blog-card__title">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt ? <p className="blog-card__excerpt">{post.excerpt}</p> : null}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="blog-card__more"
                      aria-label={`Read more about ${post.title}`}
                    >
                      Continue reading ➝
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className="blog-empty">
              {trimmed === ""
                ? "There are no posts here yet. News from the school will appear on this page."
                : `No posts match “${trimmed}”. Try another word.`}
            </p>
          ) : null}

          {/* The saved archive ends with Elementor's `numbers_and_prev_next`
              pagination ("« Previous / Page 1 / Page 2 / Next »"). Page 2 is not
              in the capture, so there is nothing for a second page to show and a
              "Page 2" link would only lead to a 404. The control is therefore
              omitted rather than faked — see CONVERSION_NOTES.md. */}
        </div>

        <div className="blog-feed__side">
          <form className="blog-search" role="search" onSubmit={(event) => event.preventDefault()}>
            {/* `elementor-screen-only` in the save: the label is there for
                screen readers, the placeholder carries the visible text. */}
            <label htmlFor={searchId} className="sr-only">
              Search
            </label>
            <div className="blog-search__field">
              <input
                id={searchId}
                type="search"
                name="s"
                placeholder="Search..."
                className="blog-search__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className="blog-search__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 4 4" />
                </svg>
              </span>
            </div>
            <p className="blog-search__count" aria-live="polite">
              {visible.length === 1 ? "1 post" : `${visible.length} posts`}
              {trimmed === "" ? "" : ` matching “${trimmed}”`}
            </p>
          </form>

          <ul className="blog-share" data-reveal="fadeIn" data-delay="100">
            {SHARE_TARGETS.map(({ key, label, base, Icon }) => (
              <li key={key}>
                <a
                  className={`blog-share__button blog-share__button--${key}`}
                  href={shareUrl ? `${base}${encodeURIComponent(shareUrl)}` : base}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>

          {/* Links out rather than embedding Facebook's page plugin, so no
              third-party SDK runs here. The card renders only once a Facebook
              page has been confirmed as the school's. */}
          {facebook ? (
            <div className="blog-facebook" data-reveal="fadeIn" data-delay="200">
              <p className="blog-facebook__title">
                {site.name} on Facebook
              </p>
              <p className="blog-facebook__body">
                Follow us on Facebook for news, photos and updates from the school.
              </p>
              <a className="blog-facebook__link" href={facebook.href} target="_blank" rel="noreferrer">
                <FacebookIcon className="h-[18px] w-[18px]" />
                Open our Facebook page
              </a>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

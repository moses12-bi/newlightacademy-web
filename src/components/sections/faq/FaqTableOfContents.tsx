"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  title: string;
}

export interface FaqTableOfContentsProps {
  items: TocItem[];
}

/**
 * The `table-of-contents` widget — post-1068 #351d1a2: a numbered list, black
 * markers, sticky to the top of its column from tablet up.
 *
 * The list is plain in-page anchors, rendered on the server, so it works with
 * JavaScript unavailable. The only thing the client adds is the highlight on
 * the section you are currently reading: an IntersectionObserver watches the
 * group headings, and it is disconnected when the component unmounts. If the
 * observer never runs, nothing is highlighted and the links still work.
 */
export default function FaqTableOfContents({ items }: FaqTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  /* Every accordion panel is rendered open on the server and collapses when the
     accordion hydrates. A jump taken from this list before that happens is aimed
     at the taller layout, so the heading ends up hundreds of pixels above the
     top once the panels close. Re-apply the target for a short window, which
     covers both the jump the browser has already started and the collapse that
     follows it. */
  useEffect(() => {
    let frame = 0;

    const align = (id: string) => {
      if (!items.some((item) => item.id === id)) return;
      let height = document.documentElement.scrollHeight;
      const deadline = performance.now() + 900;
      /* Only act if the page actually changes height under the jump, so an
         ordinary click keeps the browser's own smooth scroll. Once it does, hold
         the corrected position briefly: the mis-aimed scroll is still running
         and would otherwise finish on top of a single correction. */
      let holdUntil = 0;
      const step = () => {
        const now = performance.now();
        const current = document.documentElement.scrollHeight;
        if (current !== height) {
          height = current;
          holdUntil = now + 400;
        }
        if (now < holdUntil) {
          document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
        }
        if (now < deadline) frame = window.requestAnimationFrame(step);
      };
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(step);
    };

    const onHashChange = () => align(window.location.hash.slice(1));
    if (window.location.hash) onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (headings.length === 0) return;

    /* Track which headings are above the fold line rather than which are simply
       visible, so the highlight follows reading order instead of jumping to
       whichever heading happens to enter from the bottom. */
    const seen = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          seen.set(entry.target.id, entry.boundingClientRect.top < 0 || entry.isIntersecting);
        }
        const current = items.filter((item) => seen.get(item.id)).at(-1);
        setActiveId(current ? current.id : null);
      },
      /* The bottom margin keeps only the top slice of the viewport active. */
      { rootMargin: "-104px 0px -70% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="faq-toc" aria-label="Table of Contents">
      <p className="faq-toc__header">Table of Contents</p>
      <ol className="faq-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={activeId === item.id ? "true" : undefined}>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

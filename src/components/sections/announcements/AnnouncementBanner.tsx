"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "nla-dismissed-announcement";

function readDismissed(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * The newest urgent announcement, across the top of every page. A visitor can
 * close it; it stays closed for that announcement only, so the next urgent one
 * still shows.
 */
export default function AnnouncementBanner({ id, title }: { id: number; title: string }) {
  /* null on the server and first paint, so the banner renders in the HTML and
     only disappears once the browser confirms it was dismissed. */
  const dismissed = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener("nla-dismiss", notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("nla-dismiss", notify);
      };
    },
    readDismissed,
    () => null,
  );
  if (dismissed === String(id)) return null;

  return (
    <div className="site-alert" role="region" aria-label="Urgent announcement">
      <p>
        <strong>Notice:</strong> {title}{" "}
        <Link href={`/announcements#announcement-${id}`}>Read more</Link>
      </p>
      <button
        type="button"
        aria-label="Close this notice"
        onClick={() => {
          try {
            window.localStorage.setItem(KEY, String(id));
          } catch {
            /* storage blocked: the banner just comes back on the next page */
          }
          window.dispatchEvent(new Event("nla-dismiss"));
        }}
      >
        ×
      </button>
    </div>
  );
}

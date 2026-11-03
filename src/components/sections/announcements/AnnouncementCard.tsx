import PostBody from "@/components/sections/blog/PostBody";
import type { AnnouncementRow } from "@/lib/server/announcements";

function published(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kigali" }).format(
    new Date(iso),
  );
}

/** One announcement, full text — on /announcements and (shortened) on the Parents page. */
export default function AnnouncementCard({ announcement, short }: { announcement: AnnouncementRow; short?: boolean }) {
  const text = short && announcement.body.length > 260 ? `${announcement.body.slice(0, 260).trimEnd()}…` : announcement.body;
  return (
    <article className={`notice${announcement.priority === "urgent" ? " notice--urgent" : ""}`} id={`announcement-${announcement.id}`}>
      <p className="notice__meta">
        {announcement.priority === "urgent" ? <span className="notice__badge">Urgent</span> : null}
        <time dateTime={announcement.publish_at}>{published(announcement.publish_at)}</time>
        {announcement.audience ? <span>{announcement.audience}</span> : null}
      </p>
      <h3 className="notice__title">{announcement.title}</h3>
      <PostBody text={text} />
    </article>
  );
}

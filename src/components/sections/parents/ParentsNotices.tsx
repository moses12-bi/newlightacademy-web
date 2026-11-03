import Link from "next/link";

import AnnouncementCard from "@/components/sections/announcements/AnnouncementCard";
import Container from "@/components/ui/Container";
import type { AnnouncementRow } from "@/lib/server/announcements";
import { eventDateText, eventTimeText, type EventRow } from "@/lib/server/events";

/** The latest announcements and the next school events, at the top of the Parents page. */
export default function ParentsNotices({ announcements, events }: { announcements: AnnouncementRow[]; events: EventRow[] }) {
  if (announcements.length === 0 && events.length === 0) return null;
  return (
    <section className="parents-notices" aria-label="Announcements and coming up">
      <Container>
        <div className="parents-notices__grid">
          <div>
            <h2>Announcements</h2>
            {announcements.length ? (
              announcements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} short />)
            ) : (
              <p>No announcements at the moment.</p>
            )}
            <Link href="/announcements" className="parents-notices__more">
              All announcements ➝
            </Link>
          </div>
          <div>
            <h2>Coming up</h2>
            {events.length ? (
              <ul className="parents-notices__events">
                {events.map((event) => (
                  <li key={event.id}>
                    <b>{event.title}</b>
                    <span>
                      {eventDateText(event)}
                      {eventTimeText(event) ? ` · ${eventTimeText(event)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No school events are planned yet.</p>
            )}
            <Link href="/school-calendar" className="parents-notices__more">
              School calendar ➝
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

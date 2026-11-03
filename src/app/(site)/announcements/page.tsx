import type { Metadata } from "next";

import AnnouncementCard from "@/components/sections/announcements/AnnouncementCard";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { liveAnnouncements, pastAnnouncements } from "@/lib/server/announcements";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Announcements",
  description: `Notices for ${site.name} parents and families: closures, meetings, reminders and news from the school office.`,
};

export default function AnnouncementsPage() {
  const live = liveAnnouncements();
  const past = pastAnnouncements();

  return (
    <>
      <PageHero title="Announcements" lead="Notices for parents and families from the school office." dividerFill={{ bottom: "var(--color-accent-8)" }} />
      <section className="notices-band">
        <Container className="notices">
          {live.length ? (
            live.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)
          ) : (
            <p className="notices__empty">There are no announcements at the moment.</p>
          )}
          {past.length ? (
            <details className="notices__past">
              <summary>Past announcements</summary>
              {past.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </details>
          ) : null}
        </Container>
      </section>
    </>
  );
}

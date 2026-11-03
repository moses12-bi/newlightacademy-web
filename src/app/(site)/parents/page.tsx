import type { Metadata } from "next";

import ParentsCards from "@/components/sections/parents/ParentsCards";
import ParentsHero from "@/components/sections/parents/ParentsHero";
import ParentsNotices from "@/components/sections/parents/ParentsNotices";
import ParentsVisit from "@/components/sections/parents/ParentsVisit";
import { liveAnnouncements } from "@/lib/server/announcements";
import { upcomingEvents } from "@/lib/server/events";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "For Our Parents",
  description:
    `School payments, finding us in Kinyinya, the shape of the school day and how to let us know about an absence — the things ${site.name} families ask us most, in one place.`,
};

export default function ParentsPage() {
  return (
    <>
      <ParentsHero />
      <ParentsNotices announcements={liveAnnouncements(3)} events={upcomingEvents(5)} />
      <ParentsCards />
      <ParentsVisit />
    </>
  );
}

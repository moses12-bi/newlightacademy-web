import type { Metadata } from "next";

import CalendarContact from "@/components/sections/school-calendar/CalendarContact";
import CalendarMonths, {
  formatCalendarDate,
  selectAcademicYear,
  type SelectedAcademicYear,
} from "@/components/sections/school-calendar/CalendarMonths";
import CalendarScene from "@/components/sections/school-calendar/CalendarScene";
import CalendarVisit from "@/components/sections/school-calendar/CalendarVisit";
import PageHero from "@/components/ui/PageHero";

/**
 * Regenerate once a day. The page picks which academic year to show from the
 * date, so without this the choice would be frozen at whatever day the site was
 * built and the calendar would quietly go stale a year later.
 */
export const revalidate = 86400;

/**
 * One sentence describing where we are in the published calendar. `awaiting` is
 * the honest case that matters: the last published year has finished and its
 * successor has not been added, so the page must not present old dates as if
 * they were the current term.
 */
function describe(selected: SelectedAcademicYear | null): string {
  if (!selected) {
    return "We follow the Rwanda national school calendar, set by the Ministry of Education and administered by NESA. Please ask the school office for the dates of the current term.";
  }

  const { year, state } = selected;

  if (state === "upcoming") {
    return `We follow the Rwanda national school calendar. The ${year.label} school year opens on ${formatCalendarDate(year.opensOn)}.`;
  }

  if (state === "awaiting") {
    return `We follow the Rwanda national school calendar. The dates below are for ${year.label}; the calendar for the next school year is set by the Ministry of Education and will appear here once NESA publishes it.`;
  }

  return `We follow the Rwanda national school calendar. These are the term and national examination dates for the ${year.label} school year.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const selected = selectAcademicYear(new Date());
  return {
    title: "School Calendar",
    description: describe(selected),
  };
}

export default function SchoolCalendarPage() {
  const selected = selectAcademicYear(new Date());
  const panels = selected ? selected.year.panels : [];

  return (
    <>
      {/* post-1095 #0e83956 */}
      <PageHero
        className="calendar-hero"
        title="School Calendar"
        lead={describe(selected)}
        dividerFill={{ top: "var(--color-accent-5)", bottom: "var(--color-accent-8)" }}
        image={{
          src: "/images/school-calendar/illustration-people-5.png",
          alt: "",
          width: 982,
          height: 800,
          reveal: "bounceInUp",
        }}
      />

      {panels.map((months, index) => (
        <CalendarMonths
          key={months[0].name}
          months={months}
          first={index === 0}
          last={index === panels.length - 1}
        />
      ))}

      <CalendarVisit />
      <CalendarScene />
      <CalendarContact />
    </>
  );
}

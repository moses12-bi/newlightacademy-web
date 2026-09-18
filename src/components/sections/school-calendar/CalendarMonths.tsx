import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

export interface CalendarEntry {
  event: string;
  date: string;
}

export interface CalendarMonth {
  name: string;
  entries: CalendarEntry[];
}

/** One academic year as MINEDUC publishes it, and as NESA administers it. */
export interface AcademicYear {
  /** "2026/2027" — how the year is named to parents. */
  label: string;
  /** First day of Term 1, ISO. Anchors which year the page shows. */
  opensOn: string;
  /** Last dated event of the year, ISO — the end of the national examinations,
      which run on past the close of Term 3. The year stays current until then. */
  closesOn: string;
  /** Panels, rendered two to a row. */
  panels: CalendarMonth[][];
}

/* Dates are held as ISO strings and formatted here rather than typed out by
   hand, so the weekday names cannot drift from the dates they describe. */
const UTC = { timeZone: "UTC" } as const;

/** "Monday 7 September 2026" — exported so the page can name a date in prose. */
export function formatCalendarDate(iso: string): string {
  return on(iso);
}

/** "Monday 7 September 2026" — en-GB puts a comma after the weekday; the date
    column reads better without it, so it is dropped. */
function on(iso: string): string {
  return new Date(`${iso}T12:00:00Z`)
    .toLocaleDateString("en-GB", {
      ...UTC,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(",", "");
}

/** "31 May – 18 June 2027", collapsing the parts the two ends share. */
function between(fromIso: string, toIso: string): string {
  const from = new Date(`${fromIso}T12:00:00Z`);
  const to = new Date(`${toIso}T12:00:00Z`);
  const day = (d: Date) => d.toLocaleDateString("en-GB", { ...UTC, day: "numeric" });
  const monthYear = (d: Date) =>
    d.toLocaleDateString("en-GB", { ...UTC, day: "numeric", month: "long", year: "numeric" });
  const dayMonth = (d: Date) =>
    d.toLocaleDateString("en-GB", { ...UTC, day: "numeric", month: "long" });

  if (from.getUTCFullYear() !== to.getUTCFullYear()) return `${monthYear(from)} – ${monthYear(to)}`;
  if (from.getUTCMonth() !== to.getUTCMonth()) return `${dayMonth(from)} – ${monthYear(to)}`;
  return `${day(from)} – ${monthYear(to)}`;
}

/**
 * The Rwanda national school calendar, set by MINEDUC and administered by NESA,
 * which an accredited school follows.
 *
 * `name` is only a heading, so panels are grouped by term rather than by month:
 * the Rwandan year runs September to July in three terms, and a month-by-month
 * grid would leave most columns empty. Each row renders two panels side by side
 * (`.calendar-pair > * { width: 50% }`).
 *
 * These are NATIONAL dates, not New Light Academy's own. A school still sets its
 * own opening day, any half-term break and its staff days, so the page says so
 * and sends parents to the office to confirm.
 *
 * TO ADD A YEAR: append an entry here. The page picks the right one from the
 * date on its own — nothing else needs touching. Until the next year is added,
 * the page keeps showing the last one and says its successor is awaited, rather
 * than presenting stale dates as current.
 *
 * 2026/2027 sourced from MINEDUC via NESA, reported by The New Times,
 * 29 July 2026. One unresolved discrepancy: The New Times and allAfrica both
 * give 17 December / 14 January, while a separate aggregator prints
 * 18 December / 4 January. The two agreeing sources are used here; confirm
 * against NESA's own release before a parent plans travel around the end of
 * Term 1.
 */
export const ACADEMIC_YEARS: AcademicYear[] = [
  {
    label: "2026/2027",
    opensOn: "2026-09-07",
    closesOn: "2027-07-23",
    panels: [
      [
        {
          name: "Term 1 · 2026",
          entries: [
            { event: "Term 1 begins", date: on("2026-09-07") },
            { event: "Term 1 ends", date: on("2026-12-17") },
            { event: "End-of-year holiday", date: between("2026-12-18", "2027-01-13") },
          ],
        },
        {
          name: "Term 2 · 2027",
          entries: [
            { event: "Term 2 begins", date: on("2027-01-14") },
            { event: "Term 2 ends", date: on("2027-04-02") },
            { event: "April holiday", date: between("2027-04-03", "2027-04-18") },
            /* Kwibuka falls inside the April break in 2027, so it is listed
               after the holiday it sits in rather than out of date order. */
            { event: "Kwibuka commemoration begins", date: on("2027-04-07") },
          ],
        },
      ],
      [
        {
          name: "Term 3 · 2027",
          entries: [
            { event: "Term 3 begins", date: on("2027-04-19") },
            { event: "Term 3 ends", date: on("2027-07-02") },
            { event: "Long holiday", date: "From 3 July 2027" },
          ],
        },
        {
          name: "National examinations · 2027",
          entries: [
            { event: "Practical examinations", date: between("2027-05-31", "2027-06-18") },
            { event: "Primary Leaving Examination (P6)", date: between("2027-07-06", "2027-07-08") },
            /* NESA also sets the secondary written examinations for 14-23 July
               2027. They are deliberately omitted: this school is accredited
               for pre-primary and primary only, so listing them would suggest a
               secondary section it does not run. Do not re-add them when
               copying the national calendar forward. */
          ],
        },
      ],
    ],
  },
];

/** Where `today` sits relative to the year the page is showing. */
export type AcademicYearState = "current" | "upcoming" | "awaiting";

export interface SelectedAcademicYear {
  year: AcademicYear;
  state: AcademicYearState;
}

/**
 * Picks the academic year to display for a given day, so the page stays correct
 * as time passes without anyone editing it.
 *
 *   current  — today falls inside the year
 *   upcoming — the year has not started yet (the long holiday before it)
 *   awaiting — today is past the last published year and its successor has not
 *              been added, so the page shows the last one and says so
 *
 * Pure and total: exported separately so the behaviour can be checked against
 * any date without rendering the page.
 */
export function selectAcademicYear(
  today: Date,
  years: AcademicYear[] = ACADEMIC_YEARS,
): SelectedAcademicYear | null {
  if (years.length === 0) return null;

  const sorted = [...years].sort((a, b) => a.opensOn.localeCompare(b.opensOn));
  const day = today.toISOString().slice(0, 10);

  const current = sorted.find((year) => year.opensOn <= day && day <= year.closesOn);
  if (current) return { year: current, state: "current" };

  const next = sorted.find((year) => year.opensOn > day);
  if (next) return { year: next, state: "upcoming" };

  return { year: sorted[sorted.length - 1], state: "awaiting" };
}

function MonthList({ month }: { month: CalendarMonth }) {
  return (
    <div className="calendar-month">
      <h2>{month.name}</h2>
      <dl className="calendar-list">
        {month.entries.map((entry) => (
          <div className="calendar-list__row" key={`${entry.event}-${entry.date}`}>
            <dt className="calendar-list__event">{entry.event}</dt>
            <dd className="calendar-list__date">{entry.date}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export interface CalendarMonthsProps {
  months: CalendarMonth[];
  /** #bb43474 opens the run with extra top padding. */
  first?: boolean;
  /** #27bcef0 closes it with the mountain illustration and a wavy edge. */
  last?: boolean;
}

export default function CalendarMonths({ months, first, last }: CalendarMonthsProps) {
  /* Nothing to show until the school supplies its term dates: render no band at
     all rather than an empty one. */
  if (months.length === 0) return null;

  const classes = [
    "calendar-months",
    first ? "calendar-months--first" : null,
    last ? "calendar-months--last" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} aria-label={months.map((month) => month.name).join(" and ")}>
      {last ? <ShapeDivider position="bottom" /> : null}
      <Container>
        <div className="calendar-pair">
          {months.map((month) => (
            <MonthList key={month.name} month={month} />
          ))}
        </div>
      </Container>
    </section>
  );
}

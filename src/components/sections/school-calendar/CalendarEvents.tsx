import Container from "@/components/ui/Container";
import { eventDateText, eventTimeText, monthLabel, type EventRow } from "@/lib/server/events";

/**
 * The school's own upcoming dates, added by staff in the portal (Calendar),
 * grouped by month. Shown above the national term dates.
 */
export default function CalendarEvents({ events }: { events: EventRow[] }) {
  const months: { label: string; events: EventRow[] }[] = [];
  for (const event of events) {
    const label = monthLabel(event.start_date);
    const group = months.at(-1);
    if (group?.label === label) group.events.push(event);
    else months.push({ label, events: [event] });
  }

  return (
    <section className="school-events" aria-labelledby="school-events-title">
      <Container>
        <div className="school-events__head">
          <h2 id="school-events-title">School events</h2>
          <p className="school-events__subscribe">
            <a href="/school-calendar.ics">Add to your phone&apos;s calendar</a>
            <span> — new and changed dates then appear there by themselves.</span>
          </p>
        </div>
        {months.length === 0 ? (
          <p className="school-events__empty">No school events are planned yet. The term dates below still apply.</p>
        ) : (
          months.map((month) => (
            <div key={month.label} className="school-events__month">
              <h3>{month.label}</h3>
              <ul>
                {month.events.map((event) => {
                  const day = new Date(`${event.start_date}T12:00:00Z`);
                  return (
                    <li key={event.id} className="school-event">
                      <p className="school-event__date" aria-hidden="true">
                        <span>{day.getUTCDate()}</span>
                        {day.toLocaleDateString("en-GB", { timeZone: "UTC", month: "short" })}
                      </p>
                      <div>
                        <p className="school-event__meta">
                          <span className="school-event__badge">{event.category}</span>
                          {event.audience ? <span>{event.audience}</span> : null}
                        </p>
                        <h4 className="school-event__title">{event.title}</h4>
                        <p className="school-event__when">
                          {eventDateText(event)}
                          {eventTimeText(event) ? ` · ${eventTimeText(event)}` : ""}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                        {event.description ? <p className="school-event__text">{event.description}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </Container>
    </section>
  );
}

import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { eventDateText, eventTimeText, kigaliToday, lastDay, listEvents } from "@/lib/server/events";

export const metadata = { title: "Calendar" };

export default async function CalendarAdmin({ searchParams }: PageProps<"/admin/calendar">) {
  const params = await searchParams;
  const today = kigaliToday();
  const events = listEvents();
  const upcoming = events.filter((event) => lastDay(event) >= today);
  const past = events.filter((event) => lastDay(event) < today).reverse();

  const table = (rows: typeof events) => (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>When</th>
            <th>Type</th>
            <th>For</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((event) => (
            <tr key={event.id}>
              <td>
                <Link href={`/admin/calendar/${event.id}`}>
                  <b>{event.title}</b>
                </Link>{" "}
                {event.status === "draft" ? <span className="adm-pill">Draft</span> : null}
                {event.location ? <div className="adm-muted adm-small">{event.location}</div> : null}
              </td>
              <td>
                {eventDateText(event)}
                <div className="adm-muted adm-small">{eventTimeText(event) || "All day"}</div>
              </td>
              <td>{event.category}</td>
              <td>{event.audience || <span className="adm-muted">Everyone</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Calendar</h1>
          <p>
            The school&apos;s own dates, shown on <a href="/school-calendar" target="_blank" rel="noreferrer">/school-calendar</a> above the
            national term dates. Parents can subscribe to them in their phone&apos;s calendar.
          </p>
        </div>
        <Link href="/admin/calendar/new" className="adm-btn">
          Add event
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />
      <h2 style={{ marginBottom: 12 }}>Coming up ({upcoming.length})</h2>
      {upcoming.length ? table(upcoming) : <div className="adm-card adm-empty">No upcoming events. Add the next one.</div>}
      {past.length ? (
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: "pointer", fontWeight: 800 }}>Past events ({past.length})</summary>
          <div style={{ marginTop: 12 }}>{table(past)}</div>
        </details>
      ) : null}
    </>
  );
}

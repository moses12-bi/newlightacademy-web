import type { EventRow } from "@/lib/server/events";

/** Calendar event form fields, rendered inside an ActionForm. */
export default function EventFields({ event, categories }: { event?: EventRow; categories: readonly string[] }) {
  return (
    <div className="adm-grid-2">
      <div className="adm-form">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}
        <label className="adm-field">
          <span>Title</span>
          <input type="text" name="title" defaultValue={event?.title} required maxLength={160} placeholder="e.g. Parents' meeting — Term 1" />
        </label>
        <div className="adm-row">
          <label className="adm-field">
            <span>Date</span>
            <input type="date" name="start_date" defaultValue={event?.start_date} required />
          </label>
          <label className="adm-field">
            <span>Until (optional)</span>
            <input type="date" name="end_date" defaultValue={event?.end_date} />
            <small>For events over several days.</small>
          </label>
        </div>
        <div className="adm-row">
          <label className="adm-field">
            <span>Starts at (optional)</span>
            <input type="time" name="start_time" defaultValue={event?.start_time} />
          </label>
          <label className="adm-field">
            <span>Ends at (optional)</span>
            <input type="time" name="end_time" defaultValue={event?.end_time} />
          </label>
        </div>
        <small className="adm-hint">Leave the times empty for an all-day event. Times are Kigali time.</small>
        <label className="adm-field">
          <span>Details (optional)</span>
          <textarea name="description" rows={5} defaultValue={event?.description} placeholder="What parents need to know or bring." />
        </label>
      </div>
      <div className="adm-form">
        <label className="adm-field">
          <span>Status</span>
          <select name="status" defaultValue={event?.status ?? "published"}>
            <option value="published">On the website</option>
            <option value="draft">Draft — hidden</option>
          </select>
        </label>
        <label className="adm-field">
          <span>Type</span>
          <select name="category" defaultValue={event?.category ?? "Event"}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>For</span>
          <input type="text" name="audience" defaultValue={event?.audience} list="event-audiences" placeholder="All families" />
          <datalist id="event-audiences">
            <option value="All families" />
            <option value="Nursery parents" />
            <option value="Primary parents" />
            <option value="P6 parents" />
            <option value="Staff" />
          </datalist>
        </label>
        <label className="adm-field">
          <span>Place (optional)</span>
          <input type="text" name="location" defaultValue={event?.location} placeholder="School hall" />
        </label>
      </div>
    </div>
  );
}

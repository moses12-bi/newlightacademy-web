import type { AnnouncementRow } from "@/lib/server/announcements";

/** Announcement form fields, rendered inside an ActionForm. Times are Kigali time. */
export default function AnnouncementFields({
  announcement,
  publishLocal,
  expiresLocal,
}: {
  announcement?: AnnouncementRow;
  publishLocal?: string;
  expiresLocal?: string;
}) {
  return (
    <div className="adm-grid-2">
      <div className="adm-form">
        {announcement ? <input type="hidden" name="id" value={announcement.id} /> : null}
        <label className="adm-field">
          <span>Title</span>
          <input type="text" name="title" defaultValue={announcement?.title} required maxLength={160} placeholder="e.g. School closes early on Friday" />
        </label>
        <label className="adm-field">
          <span>Message</span>
          <textarea name="body" rows={10} defaultValue={announcement?.body} required />
          <small>Leave a blank line between paragraphs. Start a line with “- ” for a bullet point.</small>
        </label>
      </div>
      <div className="adm-form">
        <label className="adm-field">
          <span>Status</span>
          <select name="status" defaultValue={announcement?.status ?? "published"}>
            <option value="published">Publish</option>
            <option value="draft">Draft — hidden</option>
          </select>
        </label>
        <label className="adm-field">
          <span>For</span>
          <input type="text" name="audience" defaultValue={announcement?.audience} list="announcement-audiences" placeholder="All parents" />
          <datalist id="announcement-audiences">
            <option value="All parents" />
            <option value="Nursery parents" />
            <option value="Primary parents" />
            <option value="P6 parents" />
          </datalist>
        </label>
        <label className="adm-check">
          <input type="checkbox" name="priority" value="urgent" defaultChecked={announcement?.priority === "urgent"} /> Urgent — also show as a
          banner on every page
        </label>
        <label className="adm-check">
          <input type="checkbox" name="pinned" defaultChecked={!!announcement?.pinned} /> Keep at the top of the list
        </label>
        <label className="adm-field">
          <span>Publish at (optional)</span>
          <input type="datetime-local" name="publish_at" defaultValue={publishLocal} />
          <small>Empty = straight away. A later time keeps it hidden until then.</small>
        </label>
        <label className="adm-field">
          <span>Remove after (optional)</span>
          <input type="datetime-local" name="expires_at" defaultValue={expiresLocal} />
          <small>E.g. the day after the event it is about. It then moves to past announcements.</small>
        </label>
      </div>
    </div>
  );
}

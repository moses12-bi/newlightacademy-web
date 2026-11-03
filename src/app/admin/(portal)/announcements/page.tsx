import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { announcementState, listAnnouncements } from "@/lib/server/announcements";

export const metadata = { title: "Announcements" };

const STATE = {
  live: { label: "Live", pill: "adm-pill--ok" },
  scheduled: { label: "Scheduled", pill: "adm-pill--warn" },
  expired: { label: "Expired", pill: "" },
  draft: { label: "Draft", pill: "" },
} as const;

export default async function AnnouncementsAdmin({ searchParams }: PageProps<"/admin/announcements">) {
  const params = await searchParams;
  const rows = listAnnouncements();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Announcements</h1>
          <p>
            Notices for parents on <a href="/announcements" target="_blank" rel="noreferrer">/announcements</a> and the Parents page. Urgent
            ones also appear as a banner across the whole website.
          </p>
        </div>
        <Link href="/admin/announcements/new" className="adm-btn">
          New announcement
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {rows.length === 0 ? (
        <div className="adm-card adm-empty">No announcements yet.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Status</th>
                <th>Published</th>
                <th>Removed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const state = STATE[announcementState(row)];
                return (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/admin/announcements/${row.id}`}>
                        <b>{row.title}</b>
                      </Link>{" "}
                      {row.priority === "urgent" ? <span className="adm-pill adm-pill--bad">Urgent</span> : null}{" "}
                      {row.pinned ? <span className="adm-pill">Pinned</span> : null}
                      <div className="adm-muted adm-small">{row.audience || "All parents"}</div>
                    </td>
                    <td>
                      <span className={`adm-pill ${state.pill}`}>{state.label}</span>
                    </td>
                    <td>{formatDateTime(row.publish_at)}</td>
                    <td>{row.expires_at ? formatDateTime(row.expires_at) : <span className="adm-muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

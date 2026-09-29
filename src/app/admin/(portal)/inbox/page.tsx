import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { getJob } from "@/lib/server/jobs";
import { formLabel, listMessages } from "@/lib/server/messages";
import { requireUser } from "@/lib/server/auth";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: PageProps<"/admin/inbox">) {
  await requireUser();
  const params = await searchParams;
  const view = params.view === "archived" ? "archived" : "open";
  const job = typeof params.job === "string" ? getJob(Number(params.job)) : undefined;
  const messages = listMessages(job ? "all" : view, job ? `job:${job.id}` : "");

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Inbox</h1>
          <p>Everything sent through the website&apos;s forms — tours, applications, questions and reviews.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/inbox" className={`adm-btn ${view === "open" ? "" : "adm-btn--ghost"}`}>
            Open
          </Link>
          <Link href="/admin/inbox?view=archived" className={`adm-btn ${view === "archived" ? "" : "adm-btn--ghost"}`}>
            Archived
          </Link>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {job ? (
        <p className="adm-flash adm-flash--ok">
          Applications for <b>{job.title}</b> (including archived). <Link href="/admin/inbox">Show everything</Link>
        </p>
      ) : null}
      {messages.length === 0 ? (
        <div className="adm-card adm-empty">No messages here.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Form</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} className={message.status === "new" ? "is-new" : undefined}>
                  <td>
                    <Link href={`/admin/inbox/${message.id}`}>
                      <b>{message.name || message.email || message.phone || "Anonymous"}</b>
                    </Link>
                    <div className="adm-muted adm-small">{[message.email, message.phone].filter(Boolean).join(" · ")}</div>
                  </td>
                  <td>{formLabel(message.form)}</td>
                  <td>{formatDateTime(message.created_at)}</td>
                  <td>
                    <span
                      className={`adm-pill ${message.status === "new" ? "adm-pill--new" : message.status === "replied" ? "adm-pill--ok" : ""}`}
                    >
                      {message.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

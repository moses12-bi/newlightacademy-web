import Link from "next/link";

import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { formLabel, listMessages } from "@/lib/server/messages";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: PageProps<"/admin/inbox">) {
  const params = await searchParams;
  const view = params.view === "archived" ? "archived" : "open";
  const messages = listMessages(view);

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

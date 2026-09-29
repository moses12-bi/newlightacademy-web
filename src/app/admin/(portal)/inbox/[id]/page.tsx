import Link from "next/link";
import { notFound } from "next/navigation";

import ActionForm from "@/components/admin/ActionForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import StageSelect from "@/components/admin/StageSelect";
import { JOB_STAGES, STUDENT_STAGES } from "@/lib/server/admissions";
import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { attachmentsFor } from "@/lib/server/files";
import { mailConfigured } from "@/lib/server/mail";
import { emailsForMessage, formLabel, getMessage, setMessageStatus } from "@/lib/server/messages";
import { siteDetails } from "@/lib/server/site-details";
import { site } from "@/lib/site";

import { deleteMessageAction, messageStatusAction, replyAction, setStageAction } from "../../../actions";

export const metadata = { title: "Message" };

function StatusButton({ id, status, label }: { id: number; status: string; label: string }) {
  return (
    <form action={messageStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      {status === "archived" ? <input type="hidden" name="back" value="list" /> : null}
      <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
        {label}
      </button>
    </form>
  );
}

export default async function MessagePage({ params, searchParams }: PageProps<"/admin/inbox/[id]">) {
  const { id } = await params;
  const flash = await searchParams;
  const message = getMessage(Number(id));
  if (!message) notFound();
  /* Opening a new message marks it read. */
  if (message.status === "new") setMessageStatus(message.id, "read");

  const fields = JSON.parse(message.fields_json) as Record<string, string>;
  const emails = emailsForMessage(message.id);
  const files = attachmentsFor(message.id);
  const firstName = message.name.split(" ")[0];

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/inbox" className="adm-small">
            ← Inbox
          </Link>
          <h1>
            {formLabel(message.form)}
            {message.name ? ` from ${message.name}` : ""}
          </h1>
          <p>{formatDateTime(message.created_at)}</p>
        </div>
        <div className="adm-actions">
          <StatusButton id={message.id} status="new" label="Mark unread" />
          {message.status === "archived" ? (
            <StatusButton id={message.id} status="read" label="Move to inbox" />
          ) : (
            <StatusButton id={message.id} status="archived" label="Archive" />
          )}
          <form action={deleteMessageAction}>
            <input type="hidden" name="id" value={message.id} />
            <ConfirmSubmit
              message={files.length ? "Delete this message and its attached files permanently?" : "Delete this message permanently?"}
              className="adm-btn adm-btn--danger adm-btn--sm"
            >
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </div>
      <Flash ok={flash.ok} error={flash.error} />

      <div className="adm-grid-2">
        <div className="adm-stack">
          {message.form === "student-application" || message.form === "job-application" ? (
            <section className="adm-card adm-actions" style={{ justifyContent: "space-between" }}>
              <div>
                <b>Application stage</b>
                <div className="adm-small adm-muted">
                  <Link href={`/admin/applications?type=${message.form === "job-application" ? "jobs" : "students"}`}>All applications →</Link>
                </div>
              </div>
              <StageSelect
                action={setStageAction}
                id={message.id}
                stage={message.stage}
                stages={message.form === "job-application" ? JOB_STAGES : STUDENT_STAGES}
                back={`/admin/inbox/${message.id}`}
                label="Application stage"
              />
            </section>
          ) : null}
          <section className="adm-card">
            <dl className="adm-kv">
              {Object.entries(fields).map(([key, value]) => (
                <div key={key} style={{ display: "contents" }}>
                  <dt>{key.replace(/[_-]+/g, " ")}</dt>
                  <dd>{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
          {files.length ? (
            <section className="adm-card adm-stack">
              <h2>Attached files</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                {files.map((file) => (
                  <li key={file.id}>
                    <a href={`/api/admin/files/${file.id}`}>{file.filename}</a>{" "}
                    <span className="adm-muted adm-small">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                  </li>
                ))}
              </ul>
              <p className="adm-small adm-muted">
                CVs are personal data. Delete the application once the post is filled and you no longer need it.
              </p>
            </section>
          ) : null}
          {emails.length ? (
            <section className="adm-card adm-stack">
              <h2>Emails</h2>
              {emails.map((email) => (
                <div key={email.id} className="adm-stack">
                  <p className="adm-small adm-muted">
                    {formatDateTime(email.created_at)} → {email.to_addr}{" "}
                    <span className={`adm-pill ${email.status === "sent" ? "adm-pill--ok" : "adm-pill--bad"}`}>{email.status}</span>
                    {email.error ? <span style={{ color: "var(--adm-red)" }}> {email.error}</span> : null}
                  </p>
                  <p className="adm-small">
                    <b>{email.subject}</b>
                  </p>
                  <div className="adm-thread adm-small">{email.body}</div>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Reply by email</h2>
          {!message.email ? (
            <p className="adm-muted">
              No email address was given.{message.phone ? ` Call or WhatsApp ${message.phone}.` : ""}
            </p>
          ) : (
            <>
              {!mailConfigured() ? (
                <p className="adm-flash adm-flash--warn">
                  Email is not set up yet — <Link href="/admin/settings#email">Settings → Email</Link>.
                </p>
              ) : null}
              <ActionForm action={replyAction} submitLabel="Send reply" pendingLabel="Sending…">
                <input type="hidden" name="id" value={message.id} />
                <p className="adm-small">
                  To <b>{message.email}</b>
                </p>
                <label className="adm-field">
                  <span>Subject</span>
                  <input type="text" name="subject" defaultValue={`Re: your ${formLabel(message.form).toLowerCase()} — ${site.name}`} />
                </label>
                <label className="adm-field">
                  <span>Message</span>
                  <textarea
                    name="body"
                    rows={10}
                    defaultValue={`Dear ${firstName || "parent"},\n\nThank you for contacting ${site.name}.\n\n\n\nKind regards,\n${site.name}\n${siteDetails().phone}`}
                  />
                </label>
              </ActionForm>
            </>
          )}
        </section>
      </div>
    </>
  );
}

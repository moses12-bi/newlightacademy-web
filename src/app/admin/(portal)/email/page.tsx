import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { mailConfigured, mailFrom } from "@/lib/server/mail";
import { listSentEmails } from "@/lib/server/messages";
import { site } from "@/lib/site";

import { composeEmailAction } from "../../actions";

export const metadata = { title: "Email" };

export default async function EmailPage({ searchParams }: PageProps<"/admin/email">) {
  const params = await searchParams;
  const ready = mailConfigured();
  const sent = listSentEmails();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Email</h1>
          <p>Send an email from the school address, and see everything the portal has sent.</p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {!ready ? (
        <p className="adm-flash adm-flash--warn">
          Outgoing email is not set up. Add the SMTP details under <Link href="/admin/settings#email">Settings → Email</Link>.
        </p>
      ) : null}

      <div className="adm-grid-2">
        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>New email</h2>
          <ActionForm action={composeEmailAction} submitLabel="Send" pendingLabel="Sending…">
            <p className="adm-small adm-muted">From {ready ? mailFrom() : site.email}</p>
            <label className="adm-field">
              <span>To</span>
              <input type="text" name="to" placeholder="parent@example.com, another@example.com" required />
              <small>Separate several addresses with commas. Up to 50 at a time.</small>
            </label>
            <label className="adm-field">
              <span>Subject</span>
              <input type="text" name="subject" required />
            </label>
            <label className="adm-field">
              <span>Message</span>
              <textarea name="body" rows={12} defaultValue={`\n\nKind regards,\n${site.name}\n${site.phone}`} required />
            </label>
          </ActionForm>
        </section>
        <section className="adm-stack">
          <h2>Sent</h2>
          {sent.length === 0 ? <div className="adm-card adm-empty">Nothing sent yet.</div> : null}
          {sent.map((email) => (
            <article key={email.id} className="adm-card adm-stack adm-small">
              <div className="adm-actions" style={{ justifyContent: "space-between" }}>
                <b>{email.subject}</b>
                <span className={`adm-pill ${email.status === "sent" ? "adm-pill--ok" : "adm-pill--bad"}`}>{email.status}</span>
              </div>
              <p className="adm-muted">
                {formatDateTime(email.created_at)} → {email.to_addr}
              </p>
              {email.error ? <p style={{ color: "var(--adm-red)" }}>{email.error}</p> : null}
              {email.message_id ? <Link href={`/admin/inbox/${email.message_id}`}>Open enquiry</Link> : null}
            </article>
          ))}
        </section>
      </div>
    </>
  );
}

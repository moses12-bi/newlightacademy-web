import ActionForm from "@/components/admin/ActionForm";
import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { requireUser, ROLES } from "@/lib/server/auth";
import { db, now } from "@/lib/server/db";

import { changePasswordAction, signOutEverywhereAction, updateProfileAction } from "../../actions";

export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const params = await searchParams;
  const user = await requireUser();
  const sessions = (
    db().prepare("SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND expires_at > ?").get(user.id, now()) as { n: number }
  ).n;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>My account</h1>
          <p>
            {ROLES.find((role) => role.id === user.role)?.label} · last sign-in {formatDateTime(user.last_login_at)}
          </p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <div className="adm-grid">
        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Profile</h2>
          <ActionForm action={updateProfileAction} submitLabel="Save profile" pendingLabel="Saving…">
            <label className="adm-field">
              <span>Name</span>
              <input type="text" name="name" defaultValue={user.name} required />
            </label>
            <label className="adm-field">
              <span>Email (used to sign in)</span>
              <input type="email" name="email" defaultValue={user.email} required />
            </label>
            <label className="adm-field">
              <span>Current password</span>
              <input type="password" name="current" autoComplete="current-password" />
              <small>Only needed to change your email.</small>
            </label>
          </ActionForm>
        </section>

        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Change password</h2>
          <ActionForm action={changePasswordAction} submitLabel="Change password" pendingLabel="Saving…">
            <label className="adm-field">
              <span>Current password</span>
              <input type="password" name="current" required autoComplete="current-password" />
            </label>
            <label className="adm-field">
              <span>New password</span>
              <input type="password" name="password" required minLength={10} autoComplete="new-password" />
              <small>At least 10 characters. A short sentence is easy to remember and hard to guess.</small>
            </label>
            <label className="adm-field">
              <span>New password again</span>
              <input type="password" name="confirm" required minLength={10} autoComplete="new-password" />
            </label>
            <p className="adm-small adm-muted">You will be signed out everywhere and asked to sign in with the new password.</p>
          </ActionForm>
        </section>

        <section className="adm-card adm-stack">
          <h2>Devices</h2>
          <p>
            You are signed in on {sessions} {sessions === 1 ? "device or browser" : "devices or browsers"}. If you used a shared or lost
            computer, sign out everywhere else.
          </p>
          <form action={signOutEverywhereAction}>
            <button type="submit" className="adm-btn adm-btn--ghost" disabled={sessions <= 1}>
              Sign out of other devices
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

import Link from "next/link";

import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import LinkResultForm from "@/components/admin/LinkResultForm";
import { formatDateTime } from "@/lib/admin/format";
import { listPendingInvites, listUsers, requireAdmin, ROLES, type User } from "@/lib/server/auth";
import { mailConfigured } from "@/lib/server/mail";

import { adminResetLinkAction, inviteUserAction, manageUserAction, resendInviteAction, revokeInviteAction } from "../../../actions";

export const metadata = { title: "Staff accounts" };

function Op({ user, op, label, confirm, danger }: { user: User; op: string; label: string; confirm?: string; danger?: boolean }) {
  return (
    <form action={manageUserAction}>
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="op" value={op} />
      {confirm ? (
        <ConfirmSubmit message={confirm} className={`adm-btn adm-btn--sm ${danger ? "adm-btn--danger" : "adm-btn--ghost"}`}>
          {label}
        </ConfirmSubmit>
      ) : (
        <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
          {label}
        </button>
      )}
    </form>
  );
}

export default async function UsersPage({ searchParams }: PageProps<"/admin/settings/users">) {
  const params = await searchParams;
  const me = await requireAdmin();
  const users = listUsers();
  const invites = listPendingInvites();
  const emailReady = mailConfigured();

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/settings" className="adm-small">
            ← Settings
          </Link>
          <h1>Staff accounts</h1>
          <p>Invite the people who update the website. Each person signs in with their own email and password.</p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />
      {!emailReady ? (
        <p className="adm-flash adm-flash--warn">
          Email is not set up yet, so invitations and reset links cannot be emailed — you will be given the link to pass on yourself.{" "}
          <Link href="/admin/settings#email">Set up email</Link>
        </p>
      ) : null}

      <div className="adm-grid-2">
        <div className="adm-stack">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Last sign-in</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={user.disabled ? { opacity: 0.6 } : undefined}>
                    <td>
                      <b>{user.name}</b> {user.id === me.id ? <span className="adm-pill">you</span> : null}{" "}
                      {user.disabled ? <span className="adm-pill adm-pill--bad">Deactivated</span> : null}
                      <div className="adm-muted adm-small">{user.email}</div>
                    </td>
                    <td>
                      <form action={manageUserAction} className="adm-actions">
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="op" value="role" />
                        <select name="role" defaultValue={user.role} aria-label={`Role for ${user.name}`} style={{ width: "auto" }}>
                          {ROLES.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="adm-small">{formatDateTime(user.last_login_at)}</td>
                    <td>
                      <div className="adm-actions">
                        {!user.disabled && user.id !== me.id ? (
                          <LinkResultForm
                            action={adminResetLinkAction}
                            submitLabel="Send reset link"
                            pendingLabel="Sending…"
                            className=""
                            buttonClass="adm-btn adm-btn--ghost adm-btn--sm"
                          >
                            <input type="hidden" name="id" value={user.id} />
                          </LinkResultForm>
                        ) : null}
                        {user.id !== me.id ? (
                          user.disabled ? (
                            <Op user={user} op="enable" label="Reactivate" />
                          ) : (
                            <Op
                              user={user}
                              op="disable"
                              label="Deactivate"
                              confirm={`Deactivate ${user.name}? They are signed out at once and cannot sign in until reactivated.`}
                            />
                          )
                        ) : null}
                        {user.id !== me.id ? (
                          <Op
                            user={user}
                            op="remove"
                            label="Remove"
                            danger
                            confirm={`Remove ${user.name}'s account permanently? Deactivating keeps a record instead.`}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="adm-card adm-stack">
            <h2>Pending invitations</h2>
            {invites.length === 0 ? <p className="adm-muted">None.</p> : null}
            {invites.map((invite) => (
              <div key={invite.id} className="adm-actions" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <b>{invite.name || invite.email}</b> <span className="adm-pill">{ROLES.find((role) => role.id === invite.role)?.label}</span>
                  <div className="adm-muted adm-small">
                    {invite.email} · invited {formatDateTime(invite.created_at)}
                    {invite.invited_by ? ` by ${invite.invited_by}` : ""} · expires {formatDateTime(invite.expires_at)}
                  </div>
                </div>
                <div className="adm-actions" style={{ alignItems: "flex-start" }}>
                  <LinkResultForm
                    action={resendInviteAction}
                    submitLabel="Resend"
                    pendingLabel="Sending…"
                    className=""
                    buttonClass="adm-btn adm-btn--ghost adm-btn--sm"
                  >
                    <input type="hidden" name="id" value={invite.id} />
                  </LinkResultForm>
                  <form action={revokeInviteAction}>
                    <input type="hidden" name="id" value={invite.id} />
                    <ConfirmSubmit message={`Cancel the invitation to ${invite.email}?`} className="adm-btn adm-btn--danger adm-btn--sm">
                      Cancel
                    </ConfirmSubmit>
                  </form>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Invite someone</h2>
          <LinkResultForm action={inviteUserAction} submitLabel="Send invitation" pendingLabel="Sending…">
            <label className="adm-field">
              <span>Name</span>
              <input type="text" name="name" required />
            </label>
            <label className="adm-field">
              <span>Email</span>
              <input type="email" name="email" required autoComplete="off" />
            </label>
            <fieldset className="adm-field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="adm-label" style={{ marginBottom: 6 }}>
                Role
              </legend>
              {ROLES.map((role) => (
                <label key={role.id} className="adm-check" style={{ alignItems: "flex-start", marginBottom: 6 }}>
                  <input type="radio" name="role" value={role.id} defaultChecked={role.id === "staff"} />
                  <span>
                    {role.label}
                    <small className="adm-hint" style={{ display: "block", fontWeight: 400 }}>
                      {role.help}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="adm-small adm-muted">They get an email with a link to choose their own password. The link works for 7 days.</p>
          </LinkResultForm>
        </section>
      </div>
    </>
  );
}

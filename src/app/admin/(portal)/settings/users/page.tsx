import Link from "next/link";

import ActionForm from "@/components/admin/ActionForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import { formatDateTime } from "@/lib/admin/format";
import { listUsers, requireUser } from "@/lib/server/auth";

import { addUserAction, changePasswordAction, removeUserAction } from "../../../actions";

export const metadata = { title: "Staff accounts" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/settings/users">) {
  const params = await searchParams;
  const me = await requireUser();
  const users = listUsers();

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/settings" className="adm-small">
            ← Settings
          </Link>
          <h1>Staff accounts</h1>
          <p>Everyone listed here can use every part of the portal.</p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Last sign-in</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <b>{user.name}</b> {user.id === me.id ? <span className="adm-pill">you</span> : null}
                </td>
                <td>{user.email}</td>
                <td>{formatDateTime(user.last_login_at)}</td>
                <td>
                  {user.id !== me.id ? (
                    <form action={removeUserAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <ConfirmSubmit message={`Remove ${user.email}?`} className="adm-btn adm-btn--danger adm-btn--sm">
                        Remove
                      </ConfirmSubmit>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-grid" style={{ marginTop: 16 }}>
        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Add a staff member</h2>
          <ActionForm action={addUserAction} submitLabel="Create account">
            <label className="adm-field">
              <span>Name</span>
              <input type="text" name="name" required />
            </label>
            <label className="adm-field">
              <span>Email</span>
              <input type="email" name="email" required autoComplete="off" />
            </label>
            <label className="adm-field">
              <span>Temporary password</span>
              <input type="password" name="password" required minLength={10} autoComplete="new-password" />
              <small>At least 10 characters. Share it privately and ask them to change it.</small>
            </label>
          </ActionForm>
        </section>
        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Change your password</h2>
          <ActionForm action={changePasswordAction} submitLabel="Change password">
            <label className="adm-field">
              <span>Current password</span>
              <input type="password" name="current" required autoComplete="current-password" />
            </label>
            <label className="adm-field">
              <span>New password</span>
              <input type="password" name="password" required minLength={10} autoComplete="new-password" />
            </label>
            <label className="adm-field">
              <span>New password again</span>
              <input type="password" name="confirm" required minLength={10} autoComplete="new-password" />
            </label>
          </ActionForm>
        </section>
      </div>
    </>
  );
}

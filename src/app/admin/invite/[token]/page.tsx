import Link from "next/link";

import AuthForm from "@/components/admin/AuthForm";
import AuthShell from "@/components/admin/AuthShell";
import { findToken, getUser, MIN_PASSWORD, ROLES } from "@/lib/server/auth";

import { acceptInviteAction } from "../../actions";

export const metadata = { title: "Join the staff portal" };

export default async function InvitePage({ params }: PageProps<"/admin/invite/[token]">) {
  const { token } = await params;
  const invite = findToken(token, "invite");

  if (!invite) {
    return (
      <AuthShell title="Invitation expired">
        <p className="adm-flash adm-flash--warn">
          This invitation has expired or has already been used. Invitations work once, for 7 days — ask a school administrator to send a
          new one.
        </p>
        <Link href="/admin/login" className="adm-small">
          Already have an account? Sign in
        </Link>
      </AuthShell>
    );
  }

  const inviter = invite.created_by ? getUser(invite.created_by) : undefined;
  const role = ROLES.find((entry) => entry.id === invite.role);

  return (
    <AuthShell title="Welcome">
      <p>
        {inviter ? `${inviter.name} has invited you` : "You have been invited"} to the staff portal as <b>{role?.label}</b>.
      </p>
      <p className="adm-small adm-muted">{role?.help}</p>
      <AuthForm action={acceptInviteAction} submitLabel="Create my account" pendingLabel="Creating…">
        <input type="hidden" name="token" value={token} />
        <label className="adm-field">
          <span>Email</span>
          <input type="email" name="username" value={invite.email} autoComplete="username" readOnly />
        </label>
        <label className="adm-field">
          <span>Your name</span>
          <input type="text" name="name" defaultValue={invite.name} required autoComplete="name" />
        </label>
        <label className="adm-field">
          <span>Choose a password</span>
          <input type="password" name="password" required minLength={MIN_PASSWORD} autoComplete="new-password" />
          <small>At least {MIN_PASSWORD} characters.</small>
        </label>
        <label className="adm-field">
          <span>Password again</span>
          <input type="password" name="confirm" required minLength={MIN_PASSWORD} autoComplete="new-password" />
        </label>
      </AuthForm>
    </AuthShell>
  );
}

import Link from "next/link";

import AuthForm from "@/components/admin/AuthForm";
import AuthShell from "@/components/admin/AuthShell";
import { findToken, getUser, MIN_PASSWORD } from "@/lib/server/auth";

import { resetPasswordAction } from "../../actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ params }: PageProps<"/admin/reset/[token]">) {
  const { token } = await params;
  const reset = findToken(token, "reset");
  const user = reset?.user_id ? getUser(reset.user_id) : undefined;

  if (!reset || !user || user.disabled) {
    return (
      <AuthShell title="Link expired">
        <p className="adm-flash adm-flash--warn">This reset link has expired or has already been used. Links work once, for 1 hour.</p>
        <Link href="/admin/forgot" className="adm-btn">
          Send a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      <p className="adm-muted">
        For <b>{user.email}</b>. You will be signed out on every other device.
      </p>
      <AuthForm action={resetPasswordAction} submitLabel="Save new password" pendingLabel="Saving…">
        <input type="hidden" name="token" value={token} />
        <input type="email" name="username" value={user.email} autoComplete="username" readOnly hidden />
        <label className="adm-field">
          <span>New password</span>
          <input type="password" name="password" required minLength={MIN_PASSWORD} autoComplete="new-password" autoFocus />
          <small>At least {MIN_PASSWORD} characters.</small>
        </label>
        <label className="adm-field">
          <span>New password again</span>
          <input type="password" name="confirm" required minLength={MIN_PASSWORD} autoComplete="new-password" />
        </label>
      </AuthForm>
    </AuthShell>
  );
}

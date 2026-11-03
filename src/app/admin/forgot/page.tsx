import Link from "next/link";

import AuthForm from "@/components/admin/AuthForm";
import AuthShell from "@/components/admin/AuthShell";

import { forgotPasswordAction } from "../actions";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password">
      <AuthForm
        action={forgotPasswordAction}
        submitLabel="Email me a reset link"
        pendingLabel="Sending…"
        doneMessage={
          <>
            <p>If there is an account for that address, a link to choose a new password is on its way. It works for 1 hour.</p>
            <p style={{ marginTop: 8 }}>
              No email after a few minutes? Check your spam folder, or ask a school administrator to send you a reset link from
              Settings → Staff accounts.
            </p>
          </>
        }
      >
        <p className="adm-muted">Enter the email you sign in with and we will send you a link to choose a new password.</p>
        <label className="adm-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="username" required autoFocus />
        </label>
      </AuthForm>
      <Link href="/admin/login" className="adm-small">
        ← Back to sign in
      </Link>
    </AuthShell>
  );
}

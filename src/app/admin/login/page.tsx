import Link from "next/link";
import { redirect } from "next/navigation";

import AuthShell from "@/components/admin/AuthShell";
import { currentUser, hasAnyUser } from "@/lib/server/auth";

import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await currentUser()) redirect("/admin");
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const ready = hasAnyUser();

  return (
    <AuthShell title="Staff portal">
      {params.changed ? <p className="adm-flash adm-flash--ok">Password changed. Sign in with the new one.</p> : null}
      {params.reset ? <p className="adm-flash adm-flash--ok">Your new password is saved. Sign in with it.</p> : null}
      {ready ? (
        <>
          <LoginForm next={next} />
          <Link href="/admin/forgot" className="adm-small">
            Forgot your password?
          </Link>
        </>
      ) : (
        <p className="adm-flash adm-flash--warn">
          No staff account exists yet. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> (at least 10 characters) in the
          server environment and restart — that becomes the first account.
        </p>
      )}
    </AuthShell>
  );
}

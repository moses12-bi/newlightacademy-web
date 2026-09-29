import Image from "next/image";
import { redirect } from "next/navigation";

import { currentUser, hasAnyUser } from "@/lib/server/auth";
import { site } from "@/lib/site";

import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await currentUser()) redirect("/admin");
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const ready = hasAnyUser();

  return (
    <div className="adm-login">
      <div className="adm-card adm-stack">
        <div className="adm-actions">
          <Image src="/images/fox-color.svg" alt="" width={48} height={44} unoptimized />
          <div>
            <h1>Staff portal</h1>
            <p className="adm-muted">{site.name}</p>
          </div>
        </div>
        {params.changed ? <p className="adm-flash adm-flash--ok">Password changed. Sign in with the new one.</p> : null}
        {ready ? (
          <LoginForm next={next} />
        ) : (
          <p className="adm-flash adm-flash--warn">
            No staff account exists yet. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> (at least 10
            characters) in the server environment and restart — that becomes the first account.
          </p>
        )}
      </div>
    </div>
  );
}

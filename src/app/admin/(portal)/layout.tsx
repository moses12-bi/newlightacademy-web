import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import AdminNav from "@/components/admin/AdminNav";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { countNewMessages } from "@/lib/server/messages";
import { site } from "@/lib/site";

import { logoutAction } from "../actions";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const newApplications = (
    db()
      .prepare("SELECT COUNT(*) AS n FROM messages WHERE form IN ('student-application', 'job-application') AND stage IN ('', 'New')")
      .get() as { n: number }
  ).n;
  const pendingReviews = (db().prepare("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'").get() as { n: number }).n;

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <Image src="/images/fox-color.svg" alt="" width={36} height={33} unoptimized />
          <span>
            {site.name}
            <small>Staff portal</small>
          </span>
        </Link>
        <AdminNav counts={{ inbox: countNewMessages(), reviews: pendingReviews, applications: newApplications }} />
        <div className="adm-side-foot">
          <span>
            Signed in as <b>{user.name}</b>
          </span>
          <a href="/" target="_blank" rel="noreferrer">
            View website ↗
          </a>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}

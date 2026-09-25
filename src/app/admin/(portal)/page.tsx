import Link from "next/link";

import { formatDateTime } from "@/lib/admin/format";
import { db } from "@/lib/server/db";
import { mailConfigured } from "@/lib/server/mail";
import { mediaConfigured } from "@/lib/server/media";
import { PLATFORM_LABELS, PLATFORMS, platformStatus } from "@/lib/server/social";

export const metadata = { title: "Dashboard" };

function count(sql: string): number {
  return (db().prepare(sql).get() as { n: number }).n;
}

export default async function Dashboard() {
  const stats = [
    { label: "New enquiries", value: count("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'"), href: "/admin/inbox" },
    { label: "Reviews to moderate", value: count("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'"), href: "/admin/reviews" },
    { label: "Published blog posts", value: count("SELECT COUNT(*) AS n FROM posts WHERE status = 'published'"), href: "/admin/blog" },
    {
      label: "Scheduled social posts",
      value: count("SELECT COUNT(*) AS n FROM social_posts WHERE status = 'scheduled'"),
      href: "/admin/social",
    },
  ];
  const activity = db()
    .prepare(
      "SELECT a.action, a.detail, a.created_at, u.name FROM activity a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 12",
    )
    .all() as { action: string; detail: string; created_at: string; name: string | null }[];

  const setup = [
    { ok: mailConfigured(), label: "Email (SMTP)", href: "/admin/settings#email" },
    { ok: mediaConfigured(), label: "Photo & video uploads (Cloudinary)", href: "/admin/settings#cloudinary" },
    ...PLATFORMS.map((platform) => ({
      ok: platformStatus(platform).configured,
      label: PLATFORM_LABELS[platform],
      href: "/admin/social/accounts",
    })),
  ];

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>What needs attention on the website and the school&apos;s channels.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/blog/new" className="adm-btn">
            New blog post
          </Link>
          <Link href="/admin/social" className="adm-btn adm-btn--ghost">
            New social post
          </Link>
        </div>
      </div>

      <div className="adm-grid">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="adm-card adm-stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </Link>
        ))}
      </div>

      <div className="adm-grid-2" style={{ marginTop: 16 }}>
        <section className="adm-card">
          <h2>Recent activity</h2>
          {activity.length === 0 ? (
            <p className="adm-empty">Nothing yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8 }}>
              {activity.map((entry, index) => (
                <li key={index} className="adm-small">
                  <b>{entry.name ?? "System"}</b> {entry.action}
                  {entry.detail ? <span className="adm-muted"> — {entry.detail}</span> : null}
                  <div className="adm-muted">{formatDateTime(entry.created_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="adm-card">
          <h2>Connections</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8 }}>
            {setup.map((item) => (
              <li key={item.label} className="adm-actions" style={{ justifyContent: "space-between" }}>
                <Link href={item.href}>{item.label}</Link>
                <span className={`adm-pill ${item.ok ? "adm-pill--ok" : "adm-pill--warn"}`}>{item.ok ? "Ready" : "Not set up"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

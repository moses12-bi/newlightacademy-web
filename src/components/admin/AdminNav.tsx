"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/social", label: "Social media" },
  { href: "/admin/applications", label: "Applications", countKey: "applications" },
  { href: "/admin/careers", label: "Careers" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/site", label: "School details" },
  { href: "/admin/reviews", label: "Reviews", countKey: "reviews" },
  { href: "/admin/inbox", label: "Inbox", countKey: "inbox" },
  { href: "/admin/email", label: "Email" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default function AdminNav({ counts }: { counts: { inbox: number; reviews: number; applications: number } }) {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="Portal">
      {ITEMS.map((item) => {
        const active = "exact" in item ? pathname === item.href : pathname.startsWith(item.href);
        const count = "countKey" in item ? counts[item.countKey] : 0;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            {item.label}
            {count > 0 ? <span className="adm-count" aria-label={`${count} new`}>{count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

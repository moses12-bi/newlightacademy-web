import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/admin.css";

export const metadata: Metadata = {
  title: { default: "Staff portal", template: "%s – Staff portal" },
  robots: { index: false, follow: false },
};

/* Every portal page reads the database and the session; none may be prerendered. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="adm">{children}</div>;
}

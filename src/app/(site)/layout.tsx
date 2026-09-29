import type { ReactNode } from "react";

import SiteChrome from "@/components/layout/SiteChrome";

/*
 * Pages are prerendered, then refreshed every five minutes — and immediately
 * whenever staff change school details, the gallery or the staff list — so
 * portal edits reach the site without a redeploy.
 */
export const revalidate = 300;

/** The public website: header, main landmark, footer and the motion runtime. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}

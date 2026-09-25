import type { ReactNode } from "react";

import SiteChrome from "@/components/layout/SiteChrome";

/** The public website: header, main landmark, footer and the motion runtime. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}

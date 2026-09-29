import type { ReactNode } from "react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PageMotion from "@/components/ui/PageMotion";
import { siteDetails } from "@/lib/server/site-details";

/**
 * The public site's frame. Shared by `(site)/layout.tsx` and the root
 * `not-found.tsx`, which renders outside the `(site)` group for unmatched URLs.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const details = siteDetails();
  return (
    <>
      {/* First focusable element on every page: the header's nav and dropdowns are
          ~35 tab stops, so keyboard users get a way past them. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[4px] focus:bg-accent-1 focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-accent-5"
      >
        Skip to content
      </a>
      <Header phone={details.phone} phoneHref={details.phoneHref} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <PageMotion />
    </>
  );
}

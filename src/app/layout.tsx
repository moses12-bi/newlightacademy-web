import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Catamaran } from "next/font/google";

import "./globals.css";

import PageMotion from "@/components/ui/PageMotion";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { site } from "@/lib/site";

/**
 * The whole theme is set in Catamaran. `variable` publishes the family as
 * `--font-catamaran`, which `globals.css` reads through `--font-display`.
 */
const catamaran = Catamaran({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  display: "swap",
  variable: "--font-catamaran",
});

/**
 * Every value below reads from `site`, so the school's identity is configured in
 * one place rather than restated per page. The SEO architecture — title
 * template, description, Open Graph block — is unchanged from the theme.
 */
const description = `${site.name} is a nursery and primary school in Kinyinya, Kigali, where children are encouraged to learn, grow, discover and build strong character.`;

export const metadata: Metadata = {
  title: {
    default: `${site.name} – Nursery & Primary School`,
    template: `%s – ${site.name}`,
  },
  description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} – Nursery & Primary School`,
    description,
    locale: "en_RW",
  },
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={catamaran.variable}>
      {/* The column layout keeps the footer at the bottom on short pages. */}
      <body className="flex min-h-screen flex-col">
        {/* First focusable element on every page: the header's nav and dropdowns are
            ~35 tab stops, so keyboard users get a way past them. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[4px] focus:bg-accent-1 focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-accent-5"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <PageMotion />
      </body>
    </html>
  );
}

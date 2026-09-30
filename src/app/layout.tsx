import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Catamaran } from "next/font/google";

import "./globals.css";

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
  // Canonical host. The .com redirects here (see Caddy), so search engines
  // consolidate ranking on one domain instead of splitting it across two.
  metadataBase: new URL("https://newlight-academy.rw"),
  title: {
    default: `${site.name} – Nursery & Primary School in Kigali`,
    template: `%s – ${site.name}`,
  },
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  keywords: [
    "New Light Academy",
    "nursery school Kigali",
    "primary school Kigali",
    "school Kinyinya",
    "school Gasabo",
    "preschool Rwanda",
    "kindergarten Kigali",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} – Nursery & Primary School in Kigali`,
    description,
    locale: "en_RW",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} – Nursery & Primary School in Kigali`,
    description,
  },
  robots: { index: true, follow: true },
};

/**
 * Schema.org markup so Google can show the school's name, location, phone and
 * social profiles as a rich result. Uses the same `site` config as everything
 * else, so it never drifts from what's on the page.
 */
const schoolJsonLd = {
  "@context": "https://schema.org",
  "@type": "ElementarySchool",
  name: site.name,
  description,
  url: "https://newlight-academy.rw",
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.addressLines[0],
    addressLocality: "Kinyinya, Gasabo",
    addressRegion: "Kigali",
    addressCountry: "RW",
  },
  areaServed: "Kigali, Rwanda",
  sameAs: site.socials.map((s) => s.href),
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={catamaran.variable}>
      {/* The column layout keeps the footer at the bottom on short pages. The
          public site's chrome lives in (site)/layout.tsx; the staff portal under
          /admin brings its own. */}
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

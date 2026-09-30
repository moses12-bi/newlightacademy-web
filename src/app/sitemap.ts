import type { MetadataRoute } from "next";

/**
 * Lists the public pages for search engines. The canonical host is the .rw
 * domain (see metadataBase in layout.tsx); the .com redirects to it, so only
 * one host appears here — Google indexes one set of URLs, not two.
 *
 * Admin (/admin/*) is intentionally absent and is disallowed in robots.ts.
 * Dynamic blog/careers detail pages can be added later by reading them from
 * the DB; the index pages here already give crawlers the entry point.
 */
const BASE = "https://newlight-academy.rw";

const paths = [
  "", // home
  "/about",
  "/programs",
  "/infants",
  "/toddlers",
  "/preschool",
  "/kindergarten",
  "/art-program",
  "/daily-schedule",
  "/school-calendar",
  "/flex-care",
  "/admissions",
  "/how-to-apply",
  "/schedule-a-tour",
  "/tuition",
  "/make-a-payment",
  "/our-teachers",
  "/parents",
  "/student-handbook",
  "/faq",
  "/location",
  "/gallery",
  "/reviews",
  "/blog",
  "/careers",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/admissions") || path === "/programs" ? 0.9 : 0.7,
  }));
}

import type { MetadataRoute } from "next";

/**
 * Let search engines crawl the public site, keep them out of the staff portal,
 * and point them at the sitemap. Host is the canonical .rw domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: "https://newlight-academy.rw/sitemap.xml",
    host: "https://newlight-academy.rw",
  };
}

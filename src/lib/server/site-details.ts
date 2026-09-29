/**
 * The school's contact details as the public site shows them: the defaults in
 * `src/lib/site.ts`, overridden by whatever staff saved under School details
 * in the portal.
 */
import { site, type SiteDetails, type SiteInfo, type SocialIcon, type SocialLink } from "@/lib/site";

import { getContent, isBuildPhase, setContent } from "./db";

export const SOCIAL_NETWORKS: { icon: SocialIcon; label: string; placeholder: string }[] = [
  { icon: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/…" },
  { icon: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/…" },
  { icon: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@…" },
  { icon: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@…" },
];

const KEY = "site_details";

/** `+250 788 307 542` → `tel:+250788307542`; empty stays empty. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

export function savedSiteDetails(): SiteDetails | undefined {
  return getContent<SiteDetails>(KEY);
}

/** The full site record with portal overrides applied. Never throws. */
export function siteDetails(): SiteInfo {
  if (isBuildPhase()) return site;
  try {
    const saved = savedSiteDetails();
    return saved ? { ...site, ...saved } : site;
  } catch (error) {
    console.warn("[site] portal database unavailable, using defaults:", error);
    return site;
  }
}

export function saveSiteDetails(input: {
  phone: string;
  email: string;
  addressLines: string[];
  addressDetail: string;
  socials: Partial<Record<SocialIcon, string>>;
}): void {
  const socials: SocialLink[] = SOCIAL_NETWORKS.flatMap(({ icon, label }) => {
    const href = input.socials[icon]?.trim();
    return href ? [{ icon, label, href }] : [];
  });
  const details: SiteDetails = {
    phone: input.phone.trim(),
    phoneHref: phoneHref(input.phone),
    email: input.email.trim(),
    addressLines: input.addressLines.map((line) => line.trim()).filter(Boolean),
    addressDetail: input.addressDetail.trim(),
    socials,
  };
  setContent(KEY, details);
}

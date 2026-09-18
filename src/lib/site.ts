/**
 * Single source of truth for New Light Academy's identity and contact details.
 *
 * Nothing school-editable belongs in a component: every name, tagline, phone
 * number and social account the UI prints comes from this module, so the school
 * can be re-pointed by editing one file.
 *
 * Fields the school has not yet confirmed are left as empty strings or empty
 * arrays on purpose. `hasPhone()`, `hasEmail()`, `hasAddress()` and
 * `socialByIcon()` exist so the UI can drop those rows cleanly rather than
 * render an empty label, a bare `tel:` link or an invented value.
 */

export type SocialIcon = "facebook" | "youtube" | "instagram";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface SiteInfo {
  /** Display name, used everywhere the school is named in running copy. */
  name: string;
  /** Registered name, for metadata and structured data. */
  legalName: string;
  /** Short form, for tight slots and image alt text. */
  shortName: string;
  /** The line that sits under the school name in the hero. */
  tagline: string;
  /** The motto carried on the school crest. */
  motto: string;
  /** Empty until the school confirms which number to publish. */
  phone: string;
  /** Empty when `phone` is empty — never render a bare `tel:`. */
  phoneHref: string;
  /** Empty until the school confirms the address to publish. */
  email: string;
  /** Empty array hides the address block entirely. */
  addressLines: string[];
  /** Cell and village, plus the landmark parents actually navigate by. */
  addressDetail: string;
  /** Google Plus Code, short form — usable as-is in Google Maps search. */
  plusCode: string;
  /** Decoded from `plusCode`; empty strings until a pin is confirmed on site. */
  coordinates: { lat: number; lng: number } | null;
  mapHref: string;
  /** Only accounts that have been confirmed to belong to the school. */
  socials: SocialLink[];
}

/**
 * The header and the mobile menu print the number as `+250 788 307 542`; the
 * footer and two page bands bracket the country code. Derive the second form so
 * both stay tied to one value.
 */
export function displayPhone(phone: string = site.phone): string {
  return phone.replace(/^\+(\d+)\s+/, "(+$1) ");
}

export const site: SiteInfo = {
  name: "New Light Academy",
  legalName: "New Light Academy",
  shortName: "NLA",
  tagline: "The Home of Happiness for Your Children",
  motto: "The Lord Is My Shepherd",

  /* Contact details as the school itself publishes them: the number and address
     below are the ones carried on its own Instagram profile and in its entry in
     the national register of accredited schools. Blank any line the school asks
     us not to publish — every consumer already hides an empty field. */
  phone: "+250 788 307 542",
  phoneHref: "tel:+250788307542",
  email: "newlightacademy291@gmail.com",
  /* Two lines, as the footer block was built for. The street comes from the
     school's address as supplied; `plusCode` below decodes to 6GCG34Q6+832 =
     -1.911737, 30.110141, which OpenStreetMap reverse-geocodes to
     "KG 384 Street, Kinyinya, Gasabo District, City of Kigali" — so the street
     name and the plus code corroborate each other independently. The cell
     (Gasharu) comes from the school's NESA register entry and its own videos. */
  addressLines: ["KG 384 St, Kinyinya", "Gasabo, Kigali"],
  addressDetail: "Gasharu cell, near the Kinyinya bus station",
  plusCode: "34Q6+832, Kigali",
  coordinates: { lat: -1.911737, lng: 30.110141 },
  mapHref: "/location",

  /* Facebook is deliberately absent: no page has been confirmed as the
     school's, and linking the wrong one is worse than linking none. */
  socials: [
    {
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCTLNM0vIwLKUanvf1mcvPmA",
      icon: "youtube",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/new_light_academy01/",
      icon: "instagram",
    },
  ],
};

/** True when there is a number worth printing and linking. */
export function hasPhone(): boolean {
  return site.phone.length > 0 && site.phoneHref.length > 0;
}

export function hasEmail(): boolean {
  return site.email.length > 0;
}

export function hasAddress(): boolean {
  return site.addressLines.length > 0;
}

/** True once a location precise enough to put a pin on has been confirmed. */
export function hasCoordinates(): boolean {
  return site.coordinates !== null;
}

/**
 * External map link, built from the plus code rather than from a place ID: the
 * school has no Google Business listing, so a plus code is the only handle that
 * resolves to the right spot.
 */
export function mapSearchUrl(): string {
  const query = site.plusCode || site.addressLines.join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Look a social account up by network instead of by array position, so removing
 * an unconfirmed account cannot silently repoint another link at the wrong one.
 */
export function socialByIcon(icon: SocialIcon): SocialLink | undefined {
  return site.socials.find((social) => social.icon === icon);
}

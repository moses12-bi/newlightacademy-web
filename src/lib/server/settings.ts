/**
 * Integration settings — SMTP, Meta, Google, TikTok, Cloudinary.
 *
 * Each value can come from the portal (Settings → Integrations, stored in the
 * database, secrets encrypted) or from an environment variable of the same
 * name. The portal value wins, so the school can rotate a token without a
 * redeploy; the environment is the fallback for anything set at deploy time.
 */
import { db, now } from "./db";
import { decrypt, encrypt } from "./crypto";

export interface SettingDef {
  key: string;
  label: string;
  group: SettingGroup;
  secret?: boolean;
  help?: string;
  placeholder?: string;
}

export type SettingGroup = "site" | "email" | "cloudinary" | "meta" | "google" | "tiktok";

export const SETTING_GROUPS: { id: SettingGroup; title: string; intro: string }[] = [
  {
    id: "site",
    title: "Website",
    intro: "The public address of the site. Used to build links in emails and the OAuth callback addresses below.",
  },
  {
    id: "email",
    title: "Email (SMTP)",
    intro:
      "Outgoing mail for form notifications and replies. For the school's Gmail account use smtp.gmail.com, port 465, the Gmail address as the user, and a Google App Password (Google Account → Security → App passwords) — not the normal password.",
  },
  {
    id: "cloudinary",
    title: "Cloudinary (photos and videos)",
    intro:
      "Where uploaded images and videos are stored. Instagram, Facebook and TikTok fetch media from these public URLs, so uploads must go here before they can be shared.",
  },
  {
    id: "meta",
    title: "Facebook & Instagram",
    intro:
      "Create an app at developers.facebook.com (type: Business), add Facebook Login, and set the redirect URI shown on the Social accounts page. Then press “Connect Facebook” there — the page token and Instagram account are filled in for you. You can also paste a long-lived Page access token by hand.",
  },
  {
    id: "google",
    title: "YouTube",
    intro:
      "Create an OAuth client (type: Web application) in Google Cloud Console with the YouTube Data API v3 enabled, add the redirect URI shown on the Social accounts page, then press “Connect YouTube”.",
  },
  {
    id: "tiktok",
    title: "TikTok",
    intro:
      "Create an app at developers.tiktok.com with Login Kit and the Content Posting API (Direct Post). Until TikTok audits the app, posts can only be published as private (SELF_ONLY).",
  },
];

export const SETTINGS: SettingDef[] = [
  { key: "SITE_URL", label: "Public site URL", group: "site", placeholder: "https://newlight-academy.rw" },

  { key: "SMTP_HOST", label: "SMTP host", group: "email", placeholder: "smtp.gmail.com" },
  { key: "SMTP_PORT", label: "SMTP port", group: "email", placeholder: "465" },
  { key: "SMTP_USER", label: "SMTP user", group: "email", placeholder: "newlightacademy291@gmail.com" },
  { key: "SMTP_PASS", label: "SMTP password / app password", group: "email", secret: true },
  {
    key: "MAIL_FROM",
    label: "Send as",
    group: "email",
    placeholder: "New Light Academy <newlightacademy291@gmail.com>",
  },
  {
    key: "MAIL_TO",
    label: "Deliver website enquiries to",
    group: "email",
    help: "Comma-separated. Defaults to the school email on the website.",
  },

  { key: "CLOUDINARY_CLOUD_NAME", label: "Cloud name", group: "cloudinary" },
  { key: "CLOUDINARY_API_KEY", label: "API key", group: "cloudinary" },
  { key: "CLOUDINARY_API_SECRET", label: "API secret", group: "cloudinary", secret: true },

  { key: "META_APP_ID", label: "Meta app ID", group: "meta" },
  { key: "META_APP_SECRET", label: "Meta app secret", group: "meta", secret: true },
  { key: "FACEBOOK_PAGE_ID", label: "Facebook Page ID", group: "meta" },
  { key: "FACEBOOK_PAGE_TOKEN", label: "Facebook Page access token", group: "meta", secret: true },
  {
    key: "INSTAGRAM_USER_ID",
    label: "Instagram business account ID",
    group: "meta",
    help: "The Instagram account must be a Business or Creator account linked to the Facebook Page.",
  },

  { key: "GOOGLE_CLIENT_ID", label: "Google OAuth client ID", group: "google" },
  { key: "GOOGLE_CLIENT_SECRET", label: "Google OAuth client secret", group: "google", secret: true },
  { key: "YOUTUBE_REFRESH_TOKEN", label: "YouTube refresh token", group: "google", secret: true },
  {
    key: "YOUTUBE_PRIVACY",
    label: "YouTube privacy for new uploads",
    group: "google",
    placeholder: "public",
    help: "public, unlisted or private.",
  },

  { key: "TIKTOK_CLIENT_KEY", label: "TikTok client key", group: "tiktok" },
  { key: "TIKTOK_CLIENT_SECRET", label: "TikTok client secret", group: "tiktok", secret: true },
  { key: "TIKTOK_REFRESH_TOKEN", label: "TikTok refresh token", group: "tiktok", secret: true },
  {
    key: "TIKTOK_PRIVACY_LEVEL",
    label: "TikTok privacy level",
    group: "tiktok",
    placeholder: "SELF_ONLY",
    help: "PUBLIC_TO_EVERYONE once the app has passed TikTok's audit.",
  },
];

const byKey = new Map(SETTINGS.map((def) => [def.key, def]));

export function getSetting(key: string): string {
  const row = db().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  if (row && row.value !== "") {
    try {
      return decrypt(row.value);
    } catch {
      console.warn(`[settings] could not decrypt ${key} — was SESSION_SECRET changed?`);
      return "";
    }
  }
  return process.env[key] ?? "";
}

export function setSetting(key: string, value: string): void {
  const def = byKey.get(key);
  if (!def) throw new Error(`Unknown setting ${key}`);
  const trimmed = value.trim();
  if (trimmed === "") {
    db().prepare("DELETE FROM settings WHERE key = ?").run(key);
    return;
  }
  const stored = def.secret ? encrypt(trimmed) : trimmed;
  db()
    .prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    )
    .run(key, stored, now());
}

/** Where a value currently comes from, for the settings screen. */
export function settingSource(key: string): "portal" | "env" | "unset" {
  const row = db().prepare("SELECT 1 FROM settings WHERE key = ?").get(key);
  if (row) return "portal";
  return process.env[key] ? "env" : "unset";
}

export function siteUrl(fallbackOrigin?: string): string {
  const configured = getSetting("SITE_URL");
  return (configured || fallbackOrigin || "https://newlight-academy.rw").replace(/\/+$/, "");
}

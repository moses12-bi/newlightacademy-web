/** Shared bits of the connect-an-account OAuth flows. */
import type { Platform } from "./social";

export type OAuthProvider = "meta" | "google" | "tiktok";

export const OAUTH_STATE_COOKIE = "nla_oauth_state";

export function callbackPath(provider: OAuthProvider): string {
  return `/api/admin/oauth/${provider}/callback`;
}

export const PROVIDER_FOR: Record<Platform, OAuthProvider> = {
  facebook: "meta",
  instagram: "meta",
  youtube: "google",
  tiktok: "tiktok",
};

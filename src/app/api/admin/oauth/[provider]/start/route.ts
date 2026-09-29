import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { currentUser } from "@/lib/server/auth";
import { randomToken } from "@/lib/server/crypto";
import { callbackPath, OAUTH_STATE_COOKIE, type OAuthProvider } from "@/lib/server/oauth";
import { getSetting, siteUrl } from "@/lib/server/settings";
import { metaAuthorizeUrl } from "@/lib/server/social/meta";
import { tiktokAuthorizeUrl } from "@/lib/server/social/tiktok";
import { googleAuthorizeUrl } from "@/lib/server/social/youtube";

const REQUIRED: Record<OAuthProvider, string[]> = {
  meta: ["META_APP_ID", "META_APP_SECRET"],
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  tiktok: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
};

/** Sends the signed-in user to the network's consent screen. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/oauth/[provider]/start">) {
  const back = new URL("/admin/social/accounts", siteUrl(request.nextUrl.origin));
  if (!(await currentUser())) return Response.redirect(new URL("/admin/login", siteUrl(request.nextUrl.origin)));

  const { provider } = await ctx.params;
  if (!(provider in REQUIRED)) return new Response("Unknown provider", { status: 404 });
  const key = provider as OAuthProvider;
  const missing = REQUIRED[key].filter((name) => !getSetting(name));
  if (missing.length) {
    back.searchParams.set("error", `Fill in ${missing.join(" and ")} under Settings → Integrations first.`);
    return Response.redirect(back);
  }

  const state = randomToken(16);
  (await cookies()).set(OAUTH_STATE_COOKIE, `${key}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin/oauth",
    maxAge: 600,
  });

  const redirectUri = `${siteUrl(request.nextUrl.origin)}${callbackPath(key)}`;
  const url =
    key === "meta" ? metaAuthorizeUrl(redirectUri, state) : key === "google" ? googleAuthorizeUrl(redirectUri, state) : tiktokAuthorizeUrl(redirectUri, state);
  return Response.redirect(url);
}

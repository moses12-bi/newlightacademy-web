import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { currentUser } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/db";
import { callbackPath, OAUTH_STATE_COOKIE, type OAuthProvider } from "@/lib/server/oauth";
import { setSetting, siteUrl } from "@/lib/server/settings";
import { connectMetaFromCode } from "@/lib/server/social/meta";
import { connectTiktokFromCode } from "@/lib/server/social/tiktok";
import { connectGoogleFromCode } from "@/lib/server/social/youtube";

/** Where the network sends the user back: swap the code for tokens and store them. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/oauth/[provider]/callback">) {
  const back = new URL("/admin/social/accounts", siteUrl(request.nextUrl.origin));
  const user = await currentUser();
  if (!user) return Response.redirect(new URL("/admin/login", siteUrl(request.nextUrl.origin)));

  const { provider } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const store = await cookies();
  const expected = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);

  if (!expected || expected !== `${provider}:${params.get("state")}`) {
    back.searchParams.set("error", "The connection attempt expired or did not match. Please try again.");
    return Response.redirect(back);
  }
  const code = params.get("code");
  if (!code) {
    back.searchParams.set("error", params.get("error_description") || params.get("error") || "Access was not granted.");
    return Response.redirect(back);
  }

  const key = provider as OAuthProvider;
  const redirectUri = `${siteUrl(request.nextUrl.origin)}${callbackPath(key)}`;
  try {
    if (key === "meta") {
      const connection = await connectMetaFromCode(code, redirectUri);
      setSetting("FACEBOOK_PAGE_ID", connection.pageId);
      setSetting("FACEBOOK_PAGE_TOKEN", connection.pageToken);
      if (connection.instagramId) setSetting("INSTAGRAM_USER_ID", connection.instagramId);
      back.searchParams.set(
        "ok",
        `Connected Facebook Page “${connection.pageName}”${connection.instagramId ? " and its Instagram account" : " (no Instagram business account is linked to this Page)"}.`,
      );
    } else if (key === "google") {
      await connectGoogleFromCode(code, redirectUri);
      back.searchParams.set("ok", "Connected YouTube.");
    } else if (key === "tiktok") {
      await connectTiktokFromCode(code, redirectUri);
      back.searchParams.set("ok", "Connected TikTok.");
    } else {
      return new Response("Unknown provider", { status: 404 });
    }
    logActivity(user.id, `connected ${key}`);
  } catch (error) {
    back.searchParams.set("error", error instanceof Error ? error.message : String(error));
  }
  return Response.redirect(back);
}

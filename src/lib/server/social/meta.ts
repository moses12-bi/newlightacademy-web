/**
 * Facebook Page and Instagram publishing through the Meta Graph API.
 *
 * One Page access token covers both: Instagram content publishing goes through
 * the Instagram business account linked to the Page.
 */
import { withTransform } from "../media";
import { getSetting } from "../settings";

import { jsonFetch, sleep } from "./http";
import type { PlatformStatus, PublishResult, SocialJob } from "./types";
import { PlatformError } from "./types";

export const GRAPH = "https://graph.facebook.com/v23.0";

function missing(keys: string[]): PlatformStatus {
  const empty = keys.filter((key) => !getSetting(key));
  return { configured: empty.length === 0, missing: empty };
}

export function facebookStatus(): PlatformStatus {
  return missing(["FACEBOOK_PAGE_ID", "FACEBOOK_PAGE_TOKEN"]);
}

export function instagramStatus(): PlatformStatus {
  return missing(["FACEBOOK_PAGE_TOKEN", "INSTAGRAM_USER_ID"]);
}

function withMessage(caption: string, link: string): string {
  return link && !caption.includes(link) ? `${caption}\n\n${link}`.trim() : caption;
}

export async function publishFacebook(job: SocialJob): Promise<PublishResult> {
  const pageId = getSetting("FACEBOOK_PAGE_ID");
  const token = getSetting("FACEBOOK_PAGE_TOKEN");
  const body = new URLSearchParams({ access_token: token });
  let endpoint: string;

  if (job.mediaType === "image") {
    endpoint = `${GRAPH}/${pageId}/photos`;
    body.set("url", job.mediaUrl);
    body.set("caption", withMessage(job.caption, job.link));
  } else if (job.mediaType === "video") {
    endpoint = `${GRAPH}/${pageId}/videos`;
    body.set("file_url", job.mediaUrl);
    body.set("description", withMessage(job.caption, job.link));
    if (job.title) body.set("title", job.title);
  } else {
    endpoint = `${GRAPH}/${pageId}/feed`;
    body.set("message", job.caption);
    if (job.link) body.set("link", job.link);
  }

  const result = await jsonFetch<{ id: string; post_id?: string }>(endpoint, { method: "POST", body });
  const id = result.post_id ?? result.id;
  return { remoteId: id, remoteUrl: `https://www.facebook.com/${id}` };
}

export async function publishInstagram(job: SocialJob): Promise<PublishResult> {
  const igUser = getSetting("INSTAGRAM_USER_ID");
  const token = getSetting("FACEBOOK_PAGE_TOKEN");
  if (job.mediaType === "none") throw new PlatformError("Instagram posts need a photo or a video.");

  /* Instagram has no clickable links in captions, but the address still helps. */
  const caption = withMessage(job.caption, job.link);
  const create = new URLSearchParams({ access_token: token, caption });
  if (job.mediaType === "image") {
    create.set("image_url", withTransform(job.mediaUrl, "f_jpg,q_auto"));
  } else {
    create.set("media_type", "REELS");
    create.set("video_url", job.mediaUrl);
  }
  const container = await jsonFetch<{ id: string }>(`${GRAPH}/${igUser}/media`, { method: "POST", body: create });

  /* Instagram processes the media asynchronously; publishing too early fails. */
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const state = await jsonFetch<{ status_code?: string; status?: string }>(
      `${GRAPH}/${container.id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`,
    );
    if (state.status_code === "FINISHED") break;
    if (state.status_code === "ERROR" || state.status_code === "EXPIRED") {
      throw new PlatformError(`Instagram could not process the media: ${state.status ?? state.status_code}`);
    }
    await sleep(job.mediaType === "video" ? 10_000 : 2_000);
  }

  const published = await jsonFetch<{ id: string }>(`${GRAPH}/${igUser}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({ access_token: token, creation_id: container.id }),
  });
  const media = await jsonFetch<{ permalink?: string }>(
    `${GRAPH}/${published.id}?fields=permalink&access_token=${encodeURIComponent(token)}`,
  ).catch(() => ({ permalink: "" }));
  return { remoteId: published.id, remoteUrl: media.permalink ?? "" };
}

/** Name of the connected Page and Instagram account, for the accounts screen. */
export async function describeMeta(): Promise<{ page?: string; instagram?: string }> {
  const token = getSetting("FACEBOOK_PAGE_TOKEN");
  const out: { page?: string; instagram?: string } = {};
  const pageId = getSetting("FACEBOOK_PAGE_ID");
  if (pageId && token) {
    const page = await jsonFetch<{ name: string }>(`${GRAPH}/${pageId}?fields=name&access_token=${encodeURIComponent(token)}`);
    out.page = page.name;
  }
  const igUser = getSetting("INSTAGRAM_USER_ID");
  if (igUser && token) {
    const ig = await jsonFetch<{ username: string }>(`${GRAPH}/${igUser}?fields=username&access_token=${encodeURIComponent(token)}`);
    out.instagram = `@${ig.username}`;
  }
  return out;
}

/**
 * After Facebook Login: swap the short-lived user token for a long-lived one,
 * then take the Page token from /me/accounts — a Page token obtained from a
 * long-lived user token does not expire.
 */
export interface MetaConnection {
  pageId: string;
  pageName: string;
  pageToken: string;
  instagramId: string;
}

export async function connectMetaFromCode(code: string, redirectUri: string): Promise<MetaConnection> {
  const appId = getSetting("META_APP_ID");
  const secret = getSetting("META_APP_SECRET");
  const short = await jsonFetch<{ access_token: string }>(
    `${GRAPH}/oauth/access_token?${new URLSearchParams({ client_id: appId, client_secret: secret, redirect_uri: redirectUri, code })}`,
  );
  const long = await jsonFetch<{ access_token: string }>(
    `${GRAPH}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: secret,
      fb_exchange_token: short.access_token,
    })}`,
  );
  const accounts = await jsonFetch<{
    data: { id: string; name: string; access_token: string; instagram_business_account?: { id: string } }[];
  }>(`${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(long.access_token)}`);

  if (!accounts.data.length) throw new PlatformError("This Facebook account manages no Pages, or Page access was not granted.");
  const wanted = getSetting("FACEBOOK_PAGE_ID");
  const page = accounts.data.find((entry) => entry.id === wanted) ?? accounts.data[0];
  return {
    pageId: page.id,
    pageName: page.name,
    pageToken: page.access_token,
    instagramId: page.instagram_business_account?.id ?? "",
  };
}

export function metaAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: getSetting("META_APP_ID"),
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "business_management",
      "instagram_basic",
      "instagram_content_publish",
    ].join(","),
  });
  return `https://www.facebook.com/v23.0/dialog/oauth?${params}`;
}

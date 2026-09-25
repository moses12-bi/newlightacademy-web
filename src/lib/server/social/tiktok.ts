/**
 * TikTok Content Posting API (Direct Post).
 *
 * Videos are sent as bytes (FILE_UPLOAD), so no domain verification is needed
 * for them. Photo posts can only be pulled from a URL on a domain verified in
 * the TikTok developer portal, so photos are served through this site's own
 * `/social-media/…` path — verify the site's domain once and they work.
 *
 * Until TikTok audits the app, every post is private (SELF_ONLY).
 */
import { cloudinaryCloud } from "../media";
import { getSetting, setSetting, siteUrl } from "../settings";

import { downloadMedia, jsonFetch, sleep } from "./http";
import type { PlatformStatus, PublishResult, SocialJob } from "./types";
import { PlatformError } from "./types";

const API = "https://open.tiktokapis.com/v2";
const SCOPES = ["user.info.basic", "video.publish", "video.upload"];

export function tiktokStatus(): PlatformStatus {
  const keys = ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET", "TIKTOK_REFRESH_TOKEN"];
  const empty = keys.filter((key) => !getSetting(key));
  return { configured: empty.length === 0, missing: empty };
}

export function tiktokAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_key: getSetting("TIKTOK_CLIENT_KEY"),
    scope: SCOPES.join(","),
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

async function token(body: Record<string, string>): Promise<TokenResponse> {
  const data = await jsonFetch<TokenResponse & { error?: string; error_description?: string }>(`${API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: getSetting("TIKTOK_CLIENT_KEY"),
      client_secret: getSetting("TIKTOK_CLIENT_SECRET"),
      ...body,
    }),
  });
  if (!data.access_token) throw new PlatformError(`TikTok token error: ${data.error_description ?? data.error ?? "unknown"}`);
  /* TikTok may rotate the refresh token; keep whichever it returned last. */
  if (data.refresh_token) setSetting("TIKTOK_REFRESH_TOKEN", data.refresh_token);
  return data;
}

export async function connectTiktokFromCode(code: string, redirectUri: string): Promise<void> {
  await token({ code, grant_type: "authorization_code", redirect_uri: redirectUri });
}

async function accessToken(): Promise<string> {
  return (await token({ grant_type: "refresh_token", refresh_token: getSetting("TIKTOK_REFRESH_TOKEN") })).access_token;
}

interface TikTokEnvelope<T> {
  data: T;
  error: { code: string; message: string };
}

async function api<T>(path: string, accessTokenValue: string, body?: unknown): Promise<T> {
  const result = await jsonFetch<TikTokEnvelope<T>>(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessTokenValue}`, "Content-Type": "application/json; charset=UTF-8" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (result.error && result.error.code !== "ok") throw new PlatformError(`TikTok: ${result.error.message || result.error.code}`);
  return result.data;
}

export async function describeTiktok(): Promise<string> {
  const access = await accessToken();
  const result = await jsonFetch<TikTokEnvelope<{ user: { display_name: string } }>>(
    `${API}/user/info/?fields=display_name`,
    { headers: { Authorization: `Bearer ${access}` } },
  );
  return result.data.user.display_name;
}

async function privacyLevel(access: string): Promise<string> {
  const info = await api<{ privacy_level_options: string[] }>("/post/publish/creator_info/query/", access);
  const wanted = getSetting("TIKTOK_PRIVACY_LEVEL") || "SELF_ONLY";
  if (info.privacy_level_options.includes(wanted)) return wanted;
  return info.privacy_level_options.includes("SELF_ONLY") ? "SELF_ONLY" : info.privacy_level_options[0];
}

/** Photos must come from a verified domain; re-home Cloudinary URLs onto this site. */
function verifiedPhotoUrl(url: string): string {
  const prefix = `https://res.cloudinary.com/${cloudinaryCloud()}/`;
  if (!url.startsWith(prefix)) return url;
  return `${siteUrl()}/social-media/${url.slice(prefix.length)}`;
}

export async function publishTiktok(job: SocialJob): Promise<PublishResult> {
  if (job.mediaType === "none") throw new PlatformError("TikTok posts need a video or a photo.");
  const access = await accessToken();
  const privacy = await privacyLevel(access);
  const text = job.link && !job.caption.includes(job.link) ? `${job.caption}\n\n${job.link}` : job.caption;

  let publishId: string;
  if (job.mediaType === "image") {
    const data = await api<{ publish_id: string }>("/post/publish/content/init/", access, {
      post_info: { title: (job.title || text).slice(0, 90), description: text.slice(0, 4000), privacy_level: privacy },
      source_info: { source: "PULL_FROM_URL", photo_images: [verifiedPhotoUrl(job.mediaUrl)], photo_cover_index: 0 },
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
    });
    publishId = data.publish_id;
  } else {
    const { bytes, type } = await downloadMedia(job.mediaUrl);
    const size = bytes.length;
    /* Chunks are 5–64 MB; a file under 64 MB goes up whole. The last chunk
       absorbs the remainder, as TikTok requires. */
    const chunk = size <= 64 * 1024 * 1024 ? size : 10 * 1024 * 1024;
    const count = Math.max(1, Math.floor(size / chunk));
    const init = await api<{ publish_id: string; upload_url: string }>("/post/publish/video/init/", access, {
      post_info: { title: text.slice(0, 2200), privacy_level: privacy },
      source_info: { source: "FILE_UPLOAD", video_size: size, chunk_size: chunk, total_chunk_count: count },
    });
    for (let index = 0; index < count; index += 1) {
      const start = index * chunk;
      const end = index === count - 1 ? size : start + chunk;
      const response = await fetch(init.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": type.startsWith("video/") ? type : "video/mp4",
          "Content-Length": String(end - start),
          "Content-Range": `bytes ${start}-${end - 1}/${size}`,
        },
        body: new Uint8Array(bytes.subarray(start, end)),
      });
      if (!response.ok) throw new PlatformError(`TikTok upload failed at chunk ${index + 1}: ${response.status}`);
    }
    publishId = init.publish_id;
  }

  /* Wait briefly for TikTok to finish; a slow review is not a failure. */
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const status = await api<{ status: string; fail_reason?: string; publicaly_available_post_id?: string[] }>(
      "/post/publish/status/fetch/",
      access,
      { publish_id: publishId },
    );
    if (status.status === "FAILED") throw new PlatformError(`TikTok rejected the post: ${status.fail_reason ?? "unknown reason"}`);
    if (status.status === "PUBLISH_COMPLETE") {
      const postId = status.publicaly_available_post_id?.[0];
      return { remoteId: postId ?? publishId, remoteUrl: postId ? `https://www.tiktok.com/video/${postId}` : "" };
    }
    await sleep(5_000);
  }
  return { remoteId: publishId, remoteUrl: "" };
}

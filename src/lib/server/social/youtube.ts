/**
 * YouTube uploads through the Data API v3, authorised with an OAuth refresh
 * token for the school's channel. YouTube only accepts videos — there is no API
 * for community posts.
 */
import { getSetting, setSetting } from "../settings";

import { jsonFetch } from "./http";
import type { PlatformStatus, PublishResult, SocialJob } from "./types";
import { PlatformError } from "./types";

const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"];

export function youtubeStatus(): PlatformStatus {
  const keys = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"];
  const empty = keys.filter((key) => !getSetting(key));
  return { configured: empty.length === 0, missing: empty };
}

export function googleAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: getSetting("GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    /* `consent` forces Google to issue a refresh token even on a repeat connect. */
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function connectGoogleFromCode(code: string, redirectUri: string): Promise<void> {
  const token = await jsonFetch<{ refresh_token?: string }>("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: getSetting("GOOGLE_CLIENT_ID"),
      client_secret: getSetting("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!token.refresh_token) throw new PlatformError("Google did not return a refresh token. Remove the app's access in your Google account and connect again.");
  setSetting("YOUTUBE_REFRESH_TOKEN", token.refresh_token);
}

async function accessToken(): Promise<string> {
  const token = await jsonFetch<{ access_token: string }>("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: getSetting("GOOGLE_CLIENT_ID"),
      client_secret: getSetting("GOOGLE_CLIENT_SECRET"),
      refresh_token: getSetting("YOUTUBE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  return token.access_token;
}

export async function describeYoutube(): Promise<string> {
  const token = await accessToken();
  const data = await jsonFetch<{ items?: { snippet: { title: string } }[] }>(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data.items?.[0]?.snippet.title ?? "(no channel on this account)";
}

export async function publishYoutube(job: SocialJob): Promise<PublishResult> {
  if (job.mediaType !== "video") throw new PlatformError("YouTube only accepts videos.");
  const token = await accessToken();

  const source = await fetch(job.mediaUrl, { cache: "no-store" });
  if (!source.ok || !source.body) throw new PlatformError(`Could not download the video (${source.status})`);
  const length = source.headers.get("content-length");
  const type = source.headers.get("content-type") || "video/*";

  const description = job.link && !job.caption.includes(job.link) ? `${job.caption}\n\n${job.link}` : job.caption;
  const privacy = getSetting("YOUTUBE_PRIVACY") || "public";

  /* Resumable upload: a JSON request for a session URL, then the bytes. */
  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": type,
      ...(length ? { "X-Upload-Content-Length": length } : {}),
    },
    body: JSON.stringify({
      snippet: { title: (job.title || job.caption.split("\n")[0] || "New Light Academy").slice(0, 100), description: description.slice(0, 5000), categoryId: "27" },
      status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
    }),
  });
  const session = init.headers.get("location");
  if (!init.ok || !session) throw new PlatformError(`YouTube refused the upload: ${init.status} ${(await init.text()).slice(0, 300)}`);

  const upload = await fetch(session, {
    method: "PUT",
    headers: { "Content-Type": type, ...(length ? { "Content-Length": length } : {}) },
    body: source.body,
    // Node's fetch needs this to stream a request body.
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  const video = (await upload.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
  if (!upload.ok || !video.id) throw new PlatformError(`YouTube upload failed: ${video.error?.message ?? upload.status}`);
  return { remoteId: video.id, remoteUrl: `https://www.youtube.com/watch?v=${video.id}` };
}

/**
 * The school's Cloudinary library, read and annotated from the server.
 *
 * Credentials come from the portal (Settings → Integrations), falling back to
 * the environment, exactly as uploads do (see media.ts). Nothing here reaches
 * the browser: listing uses the Admin API with the key and secret, and the two
 * writes (tags, contextual metadata) are signed Upload API calls.
 */
import crypto from "node:crypto";

import { cloudinaryCloud } from "./media";
import { getSetting } from "./settings";

/** Cache tag on the library listing; the portal expires it after a change. */
export const LIBRARY_CACHE_TAG = "cloudinary-library";

export interface LibraryAsset {
  publicId: string;
  url: string;
  width: number;
  height: number;
  /** The Cloudinary folder ("" for the top level). */
  folder: string;
  tags: string[];
  /** Contextual metadata, if set on the photo in Cloudinary or the portal. */
  alt?: string;
  caption?: string;
  createdAt: string;
}

interface Credentials {
  cloud: string;
  key: string;
  secret: string;
}

function credentials(): Credentials | null {
  const cloud = cloudinaryCloud();
  const key = getSetting("CLOUDINARY_API_KEY");
  const secret = getSetting("CLOUDINARY_API_SECRET");
  return cloud && key && secret ? { cloud, key, secret } : null;
}

export function libraryConfigured(): boolean {
  return credentials() !== null;
}

interface AdminResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  asset_folder?: string;
  folder?: string;
  tags?: string[];
  context?: { custom?: { alt?: string; caption?: string } };
  created_at: string;
}

/**
 * Every image in the library, or null when Cloudinary is not configured or
 * cannot be reached. `fresh` skips the five-minute cache (the portal wants the
 * current state; the public page is happy with a recent one).
 */
export async function listLibrary(fresh = false): Promise<LibraryAsset[] | null> {
  const creds = credentials();
  if (!creds) return null;
  const authorization = `Basic ${Buffer.from(`${creds.key}:${creds.secret}`).toString("base64")}`;
  const assets: LibraryAsset[] = [];
  let cursor = "";
  try {
    /* 500 per page; the library holds a few hundred photos, so one or two calls. */
    for (let page = 0; page < 20; page++) {
      const query = new URLSearchParams({ type: "upload", max_results: "500", tags: "true", context: "true" });
      if (cursor) query.set("next_cursor", cursor);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${creds.cloud}/resources/image?${query}`, {
        headers: { Authorization: authorization },
        ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 300, tags: [LIBRARY_CACHE_TAG] } }),
      });
      if (!response.ok) {
        console.warn(`[cloudinary] listing failed: ${response.status} ${response.statusText}`);
        return null;
      }
      const data = (await response.json()) as { resources?: AdminResource[]; next_cursor?: string };
      for (const r of data.resources ?? []) {
        assets.push({
          publicId: r.public_id,
          url: r.secure_url,
          width: r.width,
          height: r.height,
          folder: r.asset_folder ?? r.folder ?? "",
          tags: r.tags ?? [],
          alt: r.context?.custom?.alt,
          caption: r.context?.custom?.caption,
          createdAt: r.created_at,
        });
      }
      cursor = data.next_cursor ?? "";
      if (!cursor) break;
    }
    return assets;
  } catch (error) {
    console.warn("[cloudinary] listing threw:", error);
    return null;
  }
}

/** Cloudinary's request signature: sorted `key=value` pairs, then the secret, SHA-1. */
function sign(params: Record<string, string>, secret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + secret).digest("hex");
}

async function signedPost(path: string, params: Record<string, string>, publicIds: string[]): Promise<void> {
  const creds = credentials();
  if (!creds) throw new Error("Cloudinary is not configured (Settings → Integrations).");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signed = { ...params, public_ids: publicIds.join(","), timestamp };
  const body = new URLSearchParams({ ...params, timestamp, api_key: creds.key, signature: sign(signed, creds.secret) });
  for (const id of publicIds) body.append("public_ids[]", id);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${creds.cloud}/image/${path}`, {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(detail?.error?.message ?? `Cloudinary refused the change (${response.status}).`);
  }
}

export async function setTag(publicIds: string[], tag: string, on: boolean): Promise<void> {
  await signedPost("tags", { command: on ? "add" : "remove", tag }, publicIds);
}

/** `=` and `|` separate contextual metadata, so they are escaped inside values. */
function contextValue(value: string): string {
  return value.replace(/([=|\\])/g, "\\$1");
}

export async function setDescription(publicId: string, alt: string, caption: string): Promise<void> {
  await signedPost(
    "context",
    { command: "add", context: `alt=${contextValue(alt)}|caption=${contextValue(caption)}` },
    [publicId],
  );
}

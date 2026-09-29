import { PlatformError } from "./types";

/** fetch + JSON with the remote API's own error message surfaced. */
export async function jsonFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body — reported below if the status is an error */
  }
  if (!response.ok) {
    const body = data as { error?: { message?: string } | string; error_description?: string } | null;
    const message =
      (typeof body?.error === "object" ? body.error.message : undefined) ??
      body?.error_description ??
      (typeof body?.error === "string" ? body.error : undefined) ??
      text.slice(0, 300);
    throw new PlatformError(`${response.status} ${message || response.statusText}`);
  }
  return data as T;
}

export function form(values: Record<string, string>): URLSearchParams {
  return new URLSearchParams(values);
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Download a media file into memory, for APIs that take bytes rather than a URL. */
export async function downloadMedia(url: string, maxBytes = 512 * 1024 * 1024): Promise<{ bytes: Buffer; type: string }> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new PlatformError(`Could not download media (${response.status})`);
  const length = Number(response.headers.get("content-length") || 0);
  if (length > maxBytes) throw new PlatformError(`Media is larger than ${Math.round(maxBytes / 1048576)} MB`);
  const bytes = Buffer.from(await response.arrayBuffer());
  return { bytes, type: response.headers.get("content-type") || "application/octet-stream" };
}

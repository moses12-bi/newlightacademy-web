/**
 * Signed direct uploads to Cloudinary. The browser sends the file straight to
 * Cloudinary with a signature minted here, so large videos never pass through
 * this server (and never hit the Server Action body limit).
 */
import crypto from "node:crypto";

import { getSetting } from "./settings";

/**
 * Portraits, blog covers and social media posts. The gallery skips this folder,
 * except photos staff added from the portal's old Gallery page and those listed
 * in library-meta.ts.
 */
export const UPLOAD_FOLDER = "new-light-academy/portal";
/** Photos added on the portal's Gallery page; they appear in the gallery like any other library photo. */
export const GALLERY_FOLDER = "new-light-academy/gallery";

export type UploadPurpose = "media" | "gallery";

export function cloudinaryCloud(): string {
  return getSetting("CLOUDINARY_CLOUD_NAME") || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
}

export function mediaConfigured(): boolean {
  return !!(cloudinaryCloud() && getSetting("CLOUDINARY_API_KEY") && getSetting("CLOUDINARY_API_SECRET"));
}

export function signUpload(
  purpose: UploadPurpose = "media",
): { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string } {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = purpose === "gallery" ? GALLERY_FOLDER : UPLOAD_FOLDER;
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + getSetting("CLOUDINARY_API_SECRET"))
    .digest("hex");
  return { cloudName: cloudinaryCloud(), apiKey: getSetting("CLOUDINARY_API_KEY"), timestamp, folder, signature };
}

/**
 * A Cloudinary delivery URL with a transformation inserted after `/upload/`.
 * Instagram only accepts JPEG stills, so images bound for it pass through `f_jpg`.
 */
export function withTransform(url: string, transform: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

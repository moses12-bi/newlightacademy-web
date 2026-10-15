/**
 * Cloudinary delivery helpers that are safe in the browser: they need only the
 * cloud name, which is public (it is a segment of every delivery URL).
 *
 * Cloudinary is where New Light Academy's photographs live, and the gallery
 * follows the library. Reading it needs the API key and secret, so that lives
 * on the server: src/lib/server/cloudinary-library.ts and gallery.ts.
 */

import type { ImageLoaderProps } from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/**
 * next/image loader. Passed per-image rather than set globally, so local images
 * (the crest, the fox, the theme's illustrations) keep the default loader.
 *
 * `f_auto` serves AVIF or WebP by what the browser accepts, `q_auto` picks a
 * quality target per image, and `c_limit` never upscales past the original.
 * Cloudinary does the resizing, so Next's own optimiser is not involved.
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const transforms = [
    "f_auto",
    `q_${quality ? String(quality) : "auto"}`,
    `w_${width}`,
    "c_limit",
  ].join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${src}`;
}

/** True for a full Cloudinary delivery URL, the form stored for photos in the library. */
export function isCloudinaryUrl(src: string): boolean {
  return src.startsWith("https://res.cloudinary.com/") && src.includes("/image/upload/");
}

/**
 * next/image loader for a full Cloudinary delivery URL (gallery photos, staff
 * uploads). The resize goes into the URL, so Cloudinary serves the width the
 * browser asked for, as AVIF or WebP, and the original (up to 6048px in the
 * school's library) never passes through this server. Also usable directly
 * for a sized link: `cloudinaryUrlLoader({ src, width: 1920 })`.
 */
export function cloudinaryUrlLoader({ src, width, quality }: ImageLoaderProps): string {
  const transforms = `f_auto,q_${quality ? String(quality) : "auto"},w_${width},c_limit`;
  return src.replace("/image/upload/", `/image/upload/${transforms}/`);
}

/** A plain delivery URL, for anywhere an <Image> is not in play (og:image, links). */
export function cloudinaryUrl(publicId: string, transforms = "f_auto,q_auto,w_1200,c_limit"): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

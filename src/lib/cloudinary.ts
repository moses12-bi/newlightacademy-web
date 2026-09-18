/**
 * Cloudinary is where New Light Academy's photographs live, and it is the
 * gallery's source of truth: the list of images, their order and their captions
 * come from Cloudinary rather than from this repository, so the school can add
 * a photo without a code change.
 *
 * Two halves, deliberately separated:
 *
 *  - `cloudinaryLoader` runs in the browser and needs only the cloud name,
 *    which is public (it is a segment of every delivery URL).
 *  - `fetchGalleryPhotos` runs at build time on the server and uses the API key
 *    and secret, which must never reach the browser. Nothing in this module
 *    exports them, and the fetch is called only from a Server Component.
 */

import type { ImageLoaderProps } from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** A photo as the site consumes it, independent of Cloudinary's response shape. */
export interface GalleryPhoto {
  /** Cloudinary public id, e.g. "new-light-academy/gallery/graduation-01". */
  publicId: string;
  width: number;
  height: number;
  /** Alt text, from Cloudinary's `alt` context field. Never invented here. */
  alt: string;
  /** Optional visible caption, from the `caption` context field. */
  caption?: string;
}

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

/** A plain delivery URL, for anywhere an <Image> is not in play (og:image, links). */
export function cloudinaryUrl(publicId: string, transforms = "f_auto,q_auto,w_1200,c_limit"): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

interface CloudinarySearchResource {
  public_id: string;
  width: number;
  height: number;
  context?: { alt?: string; caption?: string };
}

/**
 * Reads the gallery from Cloudinary at build time.
 *
 * Returns `[]` on any failure — missing credentials, a network error, an API
 * change — rather than throwing. A gallery that renders its empty state is a
 * far better outcome than a build that dies, and the gallery page already has
 * an empty state because the photo list was empty for most of this project.
 *
 * Images are selected by the `nla-gallery` tag, so what appears on the site is
 * controlled by tagging in the Cloudinary console.
 */
export async function fetchGalleryPhotos(tag = "nla-gallery"): Promise<GalleryPhoto[]> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME ?? CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    console.warn("[cloudinary] credentials not set — gallery will render empty");
    return [];
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        expression: `tags=${tag}`,
        with_field: ["context"],
        sort_by: [{ public_id: "asc" }],
        max_results: 100,
      }),
      cache: "force-cache",
    });

    if (!response.ok) {
      console.warn(`[cloudinary] search failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as { resources?: CloudinarySearchResource[] };
    return (data.resources ?? []).map((resource) => ({
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      /* Alt text is whatever the school set in Cloudinary. An empty string marks
         the image decorative rather than inventing a description of it. */
      alt: resource.context?.alt ?? "",
      caption: resource.context?.caption,
    }));
  } catch (error) {
    console.warn("[cloudinary] search threw — gallery will render empty:", error);
    return [];
  }
}

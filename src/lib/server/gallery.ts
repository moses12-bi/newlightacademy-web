/**
 * The /gallery photographs follow the school's Cloudinary library: every photo
 * there is shown, except
 *
 *  - photos tagged `nla-hide` (set on the portal's Gallery page, or in the
 *    Cloudinary console);
 *  - the site's own files: Cloudinary's sample images, the crests (including
 *    the one saved in the library as a photo) and the placeholders, and the
 *    portal's upload folder (portraits, blog covers and social posts) — except
 *    the photos staff added to the gallery from the portal's old Gallery page;
 *  - a second copy of the same photo (an original and its resized copy): the
 *    larger copy is kept.
 *
 * Order: photos uploaded since the switch, newest first, then the library as
 * it stood, in the order of library-meta.ts. Descriptions and labels come from
 * the photo's Cloudinary metadata ("alt", "caption"), then from what staff
 * wrote on the old Gallery page, then from library-meta.ts.
 *
 * The page renders on each request from a listing cached for five minutes
 * (and expired at once by the portal), so a photo added in the Cloudinary
 * console appears within five minutes. If Cloudinary cannot be read, the page
 * keeps the last listing it had; with none yet (or no credentials), it shows
 * the photos that shipped in code — never one that has been hidden.
 */
import { cloudinaryGalleryPhotos } from "@/components/sections/gallery/cloudinary-photos";
import { LIBRARY_COPIES, LIBRARY_META, LIBRARY_ORDER, LOCAL_COPIES } from "@/components/sections/gallery/library-meta";
import { galleryPhotos, type GalleryPhoto } from "@/components/sections/gallery/photos";

import { libraryConfigured, listLibrary, type LibraryAsset } from "./cloudinary-library";
import { db, getContent, setContent } from "./db";
import { UPLOAD_FOLDER } from "./media";

/** The Cloudinary tag that keeps a photo off the public gallery. */
export const HIDE_TAG = "nla-hide";

/** Folders that hold the site's own files rather than photographs of school life. */
const SITE_FOLDERS = new Set(["new-light-academy", "new-light-academy/placeholder", "samples"]);
/** Library files that are artwork, not photographs: the school crest saved at the top level. */
const SITE_FILE_IDS = new Set(["IMG-20251116-WA0007.jpg"]);

/** Where the keys of hidden photos are remembered, for when Cloudinary cannot be read. */
const HIDDEN_KEYS_CONTENT = "gallery_hidden_keys";

/**
 * Which photo an asset is: the photos in the library at the switch are matched
 * by their exact public ids (so an original and its resized copy are one
 * photo); anything uploaded later is its own photo.
 */
export function photoKey(publicId: string): string {
  return LIBRARY_COPIES[publicId] ?? publicId;
}

/** The public id inside a Cloudinary delivery URL (version and extension removed). */
function publicIdFromUrl(src: string): string | null {
  const match = src.match(/\/image\/upload\/(?:[^/]*,[^/]*\/)?(?:v\d+\/)?(.+?)(?:\.(?:jpe?g|png|webp|gif|avif))?$/i);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Photos staff added on the portal's old Gallery page, with what they wrote about them. */
function oldGalleryUploads(): Map<string, string> {
  try {
    const rows = db().prepare("SELECT src, alt FROM gallery_photos").all() as unknown as { src: string; alt: string }[];
    const uploads = new Map<string, string>();
    for (const row of rows) {
      const publicId = publicIdFromUrl(row.src);
      if (publicId) uploads.set(publicId, row.alt);
    }
    return uploads;
  } catch {
    return new Map();
  }
}

function isSiteFile(asset: LibraryAsset, oldUploads: Map<string, string>): boolean {
  if (asset.tags.includes("samples") || asset.publicId.startsWith("cld-sample")) return true;
  if (SITE_FOLDERS.has(asset.folder)) return true;
  if (SITE_FILE_IDS.has(asset.publicId)) return true;
  if (asset.folder === UPLOAD_FOLDER) return !(photoKey(asset.publicId) in LIBRARY_META) && !oldUploads.has(asset.publicId);
  return false;
}

export interface LibraryPhoto extends GalleryPhoto {
  publicId: string;
  key: string;
  hidden: boolean;
}

const RANK = new Map(LIBRARY_ORDER.map((key, index) => [key, index]));

/** The library as the gallery sees it, hidden photos included, in display order. */
function arrange(assets: LibraryAsset[]): LibraryPhoto[] {
  const oldUploads = oldGalleryUploads();
  const usable = assets.filter((asset) => !isSiteFile(asset, oldUploads));
  const hiddenKeys = new Set(
    usable.filter((asset) => asset.tags.includes(HIDE_TAG)).map((asset) => photoKey(asset.publicId)),
  );
  const byKey = new Map<string, LibraryAsset>();
  for (const asset of usable) {
    const key = photoKey(asset.publicId);
    const seen = byKey.get(key);
    if (!seen || asset.width * asset.height > seen.width * seen.height) byKey.set(key, asset);
  }

  const photos = [...byKey.entries()].map(([key, asset]) => {
    const meta = LIBRARY_META[key];
    const photo: LibraryPhoto = {
      src: asset.url,
      width: asset.width,
      height: asset.height,
      ratio: asset.width / asset.height,
      /* Empty means "not written yet", so the grid's own fallback text applies. */
      alt: asset.alt || oldUploads.get(asset.publicId) || meta?.alt || undefined,
      label: asset.caption !== undefined ? asset.caption || undefined : meta?.label,
      publicId: asset.publicId,
      key,
      hidden: hiddenKeys.has(key),
    };
    return { createdAt: asset.createdAt, photo };
  });

  photos.sort((a, b) => {
    const ra = RANK.get(a.photo.key);
    const rb = RANK.get(b.photo.key);
    if (ra === undefined && rb === undefined) return b.createdAt.localeCompare(a.createdAt);
    if (ra === undefined) return -1;
    if (rb === undefined) return 1;
    return ra - rb;
  });
  return photos.map((entry) => entry.photo);
}

function toPublic(photo: LibraryPhoto): GalleryPhoto {
  return { src: photo.src, width: photo.width, height: photo.height, ratio: photo.ratio, alt: photo.alt, label: photo.label };
}

/** Records the hidden photos, so the fallback below never shows one of them. */
export function rememberHidden(keys: Iterable<string>): void {
  const next = [...new Set(keys)].sort();
  const previous = getContent<string[]>(HIDDEN_KEYS_CONTENT) ?? [];
  if (next.length !== previous.length || next.some((key, index) => key !== previous[index])) {
    setContent(HIDDEN_KEYS_CONTENT, next);
  }
}

/** Hide or show one photo in the remembered list (the portal calls this straight after tagging). */
export function markHidden(key: string, hidden: boolean): void {
  const keys = new Set(getContent<string[]>(HIDDEN_KEYS_CONTENT) ?? []);
  if (hidden) keys.add(key);
  else keys.delete(key);
  rememberHidden(keys);
}

/** The photos that shipped in code, minus any that have been hidden since. */
function fallback(): GalleryPhoto[] {
  let hidden: Set<string>;
  try {
    hidden = new Set(getContent<string[]>(HIDDEN_KEYS_CONTENT) ?? []);
  } catch {
    hidden = new Set();
  }
  return [...galleryPhotos, ...cloudinaryGalleryPhotos].filter((photo) => {
    const publicId = publicIdFromUrl(photo.src);
    const key = LOCAL_COPIES[photo.src] ?? (publicId ? photoKey(publicId) : photo.src);
    return !hidden.has(key);
  });
}

/** The last listing this server read, kept for when Cloudinary briefly cannot be reached. */
let lastGood: GalleryPhoto[] | null = null;

/** What the public gallery renders. */
export async function publicGallery(): Promise<GalleryPhoto[]> {
  if (!libraryConfigured()) return fallback();
  const assets = await listLibrary();
  if (!assets) return lastGood ?? fallback();
  const photos = arrange(assets);
  try {
    rememberHidden(photos.filter((photo) => photo.hidden).map((photo) => photo.key));
  } catch (error) {
    console.warn("[gallery] could not record the hidden photos:", error);
  }
  lastGood = photos.filter((photo) => !photo.hidden).map(toPublic);
  return lastGood;
}

/**
 * Every copy of a photo in the library, so hiding or showing it from the
 * portal applies to all of them.
 */
export async function copiesOf(publicId: string): Promise<string[]> {
  const assets = await listLibrary(true);
  const key = photoKey(publicId);
  const copies = (assets ?? []).filter((asset) => photoKey(asset.publicId) === key).map((asset) => asset.publicId);
  return copies.length > 0 ? copies : [publicId];
}

/** For the portal: the current library, hidden photos included, or null if Cloudinary cannot be read. */
export async function galleryLibrary(): Promise<LibraryPhoto[] | null> {
  const assets = await listLibrary(true);
  return assets ? arrange(assets) : null;
}

/**
 * The /gallery photographs follow the school's Cloudinary library: every photo
 * there is shown, except
 *
 *  - photos tagged `nla-hide` (set on the portal's Gallery page, or in the
 *    Cloudinary console);
 *  - the site's own files: Cloudinary's sample images, the crests and the
 *    placeholders, and the portal's upload folder (portraits, blog covers and
 *    social posts), unless a photo there was already in the gallery;
 *  - a second copy of the same file (an original and its resized copy share a
 *    name, e.g. _DSC7956 and dsc7956): the larger copy is kept.
 *
 * Order: photos uploaded since the switch, newest first, then the library as
 * it stood, in the order of library-meta.ts. Descriptions and labels come from
 * the photo's Cloudinary metadata ("alt", "caption") or else library-meta.ts.
 *
 * The listing is cached for five minutes (and expired at once by the portal),
 * so a photo added in the Cloudinary console appears within five minutes. If
 * Cloudinary is unreachable or not configured — and while the site is being
 * built, when the portal's credentials are not available — the gallery shows
 * the photos that shipped in code instead (photos.ts and cloudinary-photos.ts).
 */
import { cloudinaryGalleryPhotos } from "@/components/sections/gallery/cloudinary-photos";
import { LIBRARY_META, LIBRARY_ORDER } from "@/components/sections/gallery/library-meta";
import { galleryPhotos, type GalleryPhoto } from "@/components/sections/gallery/photos";

import { listLibrary, type LibraryAsset } from "./cloudinary-library";
import { isBuildPhase } from "./db";
import { UPLOAD_FOLDER } from "./media";

/** The Cloudinary tag that keeps a photo off the public gallery. */
export const HIDE_TAG = "nla-hide";

/** What the gallery shows when the library cannot be read. */
const FALLBACK: GalleryPhoto[] = [...galleryPhotos, ...cloudinaryGalleryPhotos];

/** Folders that hold the site's own files rather than photographs of school life. */
const SITE_FOLDERS = new Set(["new-light-academy", "new-light-academy/placeholder", "samples"]);

/**
 * One key per photograph, whatever copy it is: the file name, lower-cased,
 * without a leading underscore or an extension.
 */
export function libraryKey(publicId: string): string {
  return (publicId.split("/").pop() ?? publicId)
    .toLowerCase()
    .replace(/^_+/, "")
    .replace(/\.(jpe?g|png|webp)$/, "");
}

function isSiteFile(asset: LibraryAsset): boolean {
  if (asset.tags.includes("samples") || asset.publicId.startsWith("cld-sample")) return true;
  if (SITE_FOLDERS.has(asset.folder)) return true;
  if (asset.folder === UPLOAD_FOLDER) return !(libraryKey(asset.publicId) in LIBRARY_META);
  return false;
}

export interface LibraryPhoto extends GalleryPhoto {
  publicId: string;
  hidden: boolean;
}

const RANK = new Map(LIBRARY_ORDER.map((key, index) => [key, index]));

/** The library as the gallery sees it, hidden photos included, in display order. */
function arrange(assets: LibraryAsset[]): LibraryPhoto[] {
  const usable = assets.filter((asset) => !isSiteFile(asset));
  const hiddenKeys = new Set(
    usable.filter((asset) => asset.tags.includes(HIDE_TAG)).map((asset) => libraryKey(asset.publicId)),
  );
  const byKey = new Map<string, LibraryAsset>();
  for (const asset of usable) {
    const key = libraryKey(asset.publicId);
    const seen = byKey.get(key);
    if (!seen || asset.width * asset.height > seen.width * seen.height) byKey.set(key, asset);
  }

  const photos = [...byKey.entries()].map(([key, asset]) => {
    const meta = LIBRARY_META[key];
    return {
      key,
      createdAt: asset.createdAt,
      photo: {
        src: asset.url,
        width: asset.width,
        height: asset.height,
        ratio: asset.width / asset.height,
        alt: asset.alt ?? meta?.alt ?? "",
        label: asset.caption !== undefined ? asset.caption || undefined : meta?.label,
        publicId: asset.publicId,
        hidden: hiddenKeys.has(key),
      } satisfies LibraryPhoto,
    };
  });

  photos.sort((a, b) => {
    const ra = RANK.get(a.key);
    const rb = RANK.get(b.key);
    if (ra === undefined && rb === undefined) return b.createdAt.localeCompare(a.createdAt);
    if (ra === undefined) return -1;
    if (rb === undefined) return 1;
    return ra - rb;
  });
  return photos.map((entry) => entry.photo);
}

/** What the public gallery renders. */
export async function publicGallery(): Promise<GalleryPhoto[]> {
  if (isBuildPhase()) return FALLBACK;
  const assets = await listLibrary();
  if (!assets) return FALLBACK;
  return arrange(assets)
    .filter((photo) => !photo.hidden)
    .map((photo) => ({
      src: photo.src,
      width: photo.width,
      height: photo.height,
      ratio: photo.ratio,
      alt: photo.alt,
      label: photo.label,
    }));
}

/**
 * Every copy of a photo in the library (an original and its resized copy share
 * a key), so hiding or showing it from the portal applies to all of them.
 */
export async function copiesOf(publicId: string): Promise<string[]> {
  const assets = await listLibrary(true);
  const key = libraryKey(publicId);
  const copies = (assets ?? []).filter((asset) => libraryKey(asset.publicId) === key).map((asset) => asset.publicId);
  return copies.length > 0 ? copies : [publicId];
}

/** For the portal: the current library, hidden photos included, or null if Cloudinary cannot be read. */
export async function galleryLibrary(): Promise<LibraryPhoto[] | null> {
  const assets = await listLibrary(true);
  return assets ? arrange(assets) : null;
}

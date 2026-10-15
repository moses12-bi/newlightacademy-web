/**
 * The /gallery photographs. On first use the list is seeded from the photos
 * that shipped in code (`components/sections/gallery/photos.ts`, then the
 * Cloudinary selection in `cloudinary-photos.ts`), so staff start from what is
 * on the site today and can reorder, re-caption or remove them.
 */
import { cloudinaryGalleryPhotos } from "@/components/sections/gallery/cloudinary-photos";
import { galleryPhotos, type GalleryPhoto } from "@/components/sections/gallery/photos";

import { db, getContent, isBuildPhase, now, setContent } from "./db";

export interface GalleryRow {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  position: number;
}

/** Every photo the gallery ships with: the local files, then the Cloudinary selection. */
const defaultPhotos: GalleryPhoto[] = [...galleryPhotos, ...cloudinaryGalleryPhotos];

/**
 * Bump when the shipped photos change in a way a live site should pick up.
 *   1 — the twelve local photos (photos.ts)
 *   2 — plus the Cloudinary selection (cloudinary-photos.ts)
 */
const GALLERY_SEED_VERSION = 2;

/**
 * Seeds the gallery on first use, and brings a database seeded by an earlier
 * version up to date. A database seeded at version 1 keeps its rows exactly as
 * staff left them, removals included, and gains only the photos added since,
 * after its last photo. A photo already in the table is never added twice.
 */
function seed(): void {
  const recorded = getContent<number>("gallery_seed_version");
  const version = recorded ?? (getContent<boolean>("gallery_seeded") ? 1 : 0);
  if (version >= GALLERY_SEED_VERSION) return;

  const handle = db();
  const toAdd = version === 0 ? defaultPhotos : cloudinaryGalleryPhotos;
  const existing = new Set(
    (handle.prepare("SELECT src FROM gallery_photos").all() as unknown as { src: string }[]).map((row) => row.src),
  );
  const max = handle.prepare("SELECT MAX(position) AS hi FROM gallery_photos").get() as { hi: number | null };
  let position = (max.hi ?? -1) + 1;
  const insert = handle.prepare(
    "INSERT INTO gallery_photos (src, width, height, alt, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const photo of toAdd) {
    if (existing.has(photo.src)) continue;
    insert.run(photo.src, photo.width, photo.height, photo.alt ?? "", position, now());
    position += 1;
  }
  setContent("gallery_seeded", true);
  setContent("gallery_seed_version", GALLERY_SEED_VERSION);
}

export function listGallery(): GalleryRow[] {
  seed();
  return db().prepare("SELECT * FROM gallery_photos ORDER BY position, id").all() as unknown as GalleryRow[];
}

/** What the public gallery renders. Falls back to the code list if the database is unavailable. */
export function publicGallery(): GalleryPhoto[] {
  if (isBuildPhase()) return defaultPhotos;
  /* Short tile labels live in code, not in the gallery table, so the schema is
     untouched: match each stored row back to its seed photo by `src` and carry
     the label across. A staff-uploaded photo with no code match simply has no
     label, which the grid renders as a plain tile. */
  const labelBySrc = new Map(defaultPhotos.map((photo) => [photo.src, photo.label]));
  try {
    return listGallery().map((row) => ({
      src: row.src,
      width: row.width,
      height: row.height,
      ratio: row.width / row.height,
      alt: row.alt,
      label: labelBySrc.get(row.src),
    }));
  } catch (error) {
    console.warn("[gallery] portal database unavailable, using defaults:", error);
    return defaultPhotos;
  }
}

export function addGalleryPhotos(photos: { src: string; width: number; height: number; alt: string }[], atStart: boolean): void {
  seed();
  const handle = db();
  const bounds = handle.prepare("SELECT MIN(position) AS lo, MAX(position) AS hi FROM gallery_photos").get() as {
    lo: number | null;
    hi: number | null;
  };
  const insert = handle.prepare("INSERT INTO gallery_photos (src, width, height, alt, position, created_at) VALUES (?, ?, ?, ?, ?, ?)");
  photos.forEach((photo, index) => {
    const position = atStart ? (bounds.lo ?? 0) - photos.length + index : (bounds.hi ?? -1) + 1 + index;
    insert.run(photo.src, photo.width, photo.height, photo.alt, position, now());
  });
}

export function updateGalleryAlt(id: number, alt: string): void {
  db().prepare("UPDATE gallery_photos SET alt = ? WHERE id = ?").run(alt, id);
}

export function removeGalleryPhoto(id: number): void {
  db().prepare("DELETE FROM gallery_photos WHERE id = ?").run(id);
}

/** Swap a photo with its neighbour; positions are renumbered 0…n so gaps never build up. */
export function moveGalleryPhoto(id: number, direction: -1 | 1): void {
  const rows = listGallery();
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  const update = db().prepare("UPDATE gallery_photos SET position = ? WHERE id = ?");
  rows.forEach((row, position) => update.run(position, row.id));
}

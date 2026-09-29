/**
 * The /gallery photographs. On first use the list is seeded from the photos
 * that shipped in code (`components/sections/gallery/photos.ts`), so staff start
 * from what is on the site today and can reorder, re-caption or remove them.
 */
import { galleryPhotos as defaultPhotos, type GalleryPhoto } from "@/components/sections/gallery/photos";

import { db, getContent, isBuildPhase, now, setContent } from "./db";

export interface GalleryRow {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  position: number;
}

function seed(): void {
  if (getContent<boolean>("gallery_seeded")) return;
  const insert = db().prepare("INSERT INTO gallery_photos (src, width, height, alt, position, created_at) VALUES (?, ?, ?, ?, ?, ?)");
  defaultPhotos.forEach((photo, index) => insert.run(photo.src, photo.width, photo.height, photo.alt ?? "", index, now()));
  setContent("gallery_seeded", true);
}

export function listGallery(): GalleryRow[] {
  seed();
  return db().prepare("SELECT * FROM gallery_photos ORDER BY position, id").all() as unknown as GalleryRow[];
}

/** What the public gallery renders. Falls back to the code list if the database is unavailable. */
export function publicGallery(): GalleryPhoto[] {
  if (isBuildPhase()) return defaultPhotos;
  try {
    return listGallery().map((row) => ({
      src: row.src,
      width: row.width,
      height: row.height,
      ratio: row.width / row.height,
      alt: row.alt,
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

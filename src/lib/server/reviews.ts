/** Parent reviews: submitted on /reviews or entered by staff, shown once published. */
import { db, now } from "./db";

export type ReviewStatus = "pending" | "published" | "hidden";

export interface ReviewRow {
  id: number;
  author_name: string;
  relation: string;
  rating: number;
  body: string;
  email: string;
  source: "website" | "manual";
  status: ReviewStatus;
  created_at: string;
}

export function listReviews(status?: ReviewStatus): ReviewRow[] {
  if (status) {
    return db()
      .prepare("SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC")
      .all(status) as unknown as ReviewRow[];
  }
  return db().prepare("SELECT * FROM reviews ORDER BY created_at DESC").all() as unknown as ReviewRow[];
}

export function createReview(input: Omit<ReviewRow, "id" | "created_at">): number {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating) || 5));
  const result = db()
    .prepare(
      "INSERT INTO reviews (author_name, relation, rating, body, email, source, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(input.author_name, input.relation, rating, input.body, input.email, input.source, input.status, now());
  return Number(result.lastInsertRowid);
}

export function setReviewStatus(id: number, status: ReviewStatus): void {
  db().prepare("UPDATE reviews SET status = ? WHERE id = ?").run(status, id);
}

export function deleteReview(id: number): void {
  db().prepare("DELETE FROM reviews WHERE id = ?").run(id);
}

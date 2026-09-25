import ActionForm from "@/components/admin/ActionForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import Flash from "@/components/admin/Flash";
import { formatDate } from "@/lib/admin/format";
import { listReviews, type ReviewRow } from "@/lib/server/reviews";

import { addReviewAction, reviewStatusAction } from "../../actions";

export const metadata = { title: "Reviews" };

function StatusButton({ review, status, label }: { review: ReviewRow; status: string; label: string }) {
  return (
    <form action={reviewStatusAction}>
      <input type="hidden" name="id" value={review.id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
        {label}
      </button>
    </form>
  );
}

export default async function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  const params = await searchParams;
  const reviews = listReviews();
  const pending = reviews.filter((review) => review.status === "pending");
  const others = reviews.filter((review) => review.status !== "pending");

  const card = (review: ReviewRow) => (
    <article key={review.id} className="adm-card adm-stack">
      <div className="adm-actions" style={{ justifyContent: "space-between" }}>
        <div>
          <b>{review.author_name}</b>
          {review.relation ? <span className="adm-muted"> · {review.relation}</span> : null}
          <div className="adm-stars" aria-label={`${review.rating} out of 5`}>
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </div>
        </div>
        <div className="adm-actions">
          <span
            className={`adm-pill ${review.status === "published" ? "adm-pill--ok" : review.status === "pending" ? "adm-pill--new" : ""}`}
          >
            {review.status}
          </span>
          <span className="adm-muted adm-small">
            {formatDate(review.created_at)} · {review.source === "website" ? "via website" : "added by staff"}
          </span>
        </div>
      </div>
      <p style={{ whiteSpace: "pre-wrap" }}>{review.body}</p>
      {review.email ? <p className="adm-small adm-muted">{review.email}</p> : null}
      <div className="adm-actions">
        {review.status !== "published" ? <StatusButton review={review} status="published" label="Publish" /> : null}
        {review.status !== "hidden" ? <StatusButton review={review} status="hidden" label="Hide" /> : null}
        <form action={reviewStatusAction}>
          <input type="hidden" name="id" value={review.id} />
          <input type="hidden" name="status" value="delete" />
          <ConfirmSubmit message="Delete this review permanently?" className="adm-btn adm-btn--danger adm-btn--sm">
            Delete
          </ConfirmSubmit>
        </form>
      </div>
    </article>
  );

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Reviews</h1>
          <p>
            Parents leave reviews at <a href="/reviews" target="_blank" rel="noreferrer">/reviews</a>. Nothing appears on the website until
            it is published here.
          </p>
        </div>
      </div>
      <Flash ok={params.ok} error={params.error} />
      <div className="adm-grid-2">
        <div className="adm-stack">
          <h2>Waiting for approval ({pending.length})</h2>
          {pending.length ? pending.map(card) : <div className="adm-card adm-empty">No reviews waiting.</div>}
          <h2>Published &amp; hidden</h2>
          {others.length ? others.map(card) : <div className="adm-card adm-empty">None yet.</div>}
        </div>
        <section className="adm-card">
          <h2 style={{ marginBottom: 12 }}>Add a review</h2>
          <p className="adm-small adm-muted" style={{ marginBottom: 12 }}>
            For a review a parent sent by WhatsApp, email or on paper — with their permission to publish it.
          </p>
          <ActionForm action={addReviewAction} submitLabel="Add review">
            <label className="adm-field">
              <span>Name</span>
              <input type="text" name="author_name" required />
            </label>
            <label className="adm-field">
              <span>Relation</span>
              <input type="text" name="relation" placeholder="Parent of a Top Class pupil" />
            </label>
            <label className="adm-field">
              <span>Rating</span>
              <select name="rating" defaultValue="5">
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              <span>Review</span>
              <textarea name="body" rows={5} required />
            </label>
            <label className="adm-check">
              <input type="checkbox" name="publish" defaultChecked /> Publish straight away
            </label>
          </ActionForm>
        </section>
      </div>
    </>
  );
}

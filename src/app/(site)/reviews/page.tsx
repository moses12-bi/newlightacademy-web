import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import ReviewForm from "@/components/sections/reviews/ReviewForm";
import { listReviews, type ReviewRow } from "@/lib/server/reviews";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Parent reviews",
  description: `What parents say about ${site.name} in Kinyinya, Kigali — and a place to share your own experience.`,
};

/* Reviews are published from the staff portal, so the page is rendered per request. */
export const dynamic = "force-dynamic";

function publishedReviews(): ReviewRow[] {
  try {
    return listReviews("published");
  } catch (error) {
    console.warn("[reviews] portal database unavailable:", error);
    return [];
  }
}

/**
 * Only reviews a member of staff has approved in the portal appear here —
 * nothing is shown on submission, and nothing is ever written for the school.
 */
export default function ReviewsPage() {
  const reviews = publishedReviews();

  return (
    <>
      <PageHero title="Parent reviews" titleReveal="fadeIn" titleDelay="100" dividerFill={{ bottom: "var(--color-accent-8)" }} />
      <section className="reviews-band bg-accent-8">
        <Container>
          {reviews.length ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <figure key={review.id} className="review-card">
                  <div className="review-card__stars" aria-label={`${review.rating} out of 5 stars`}>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <blockquote>{review.body}</blockquote>
                  <figcaption>
                    {review.author_name}
                    {review.relation ? <span>{review.relation}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="reviews-empty">Be the first family to share your experience of {site.name}.</p>
          )}

          <div className="reviews-form">
            <h2>Share your experience</h2>
            <p>Reviews are read by the school before they appear on this page.</p>
            <ReviewForm />
          </div>
        </Container>
      </section>
    </>
  );
}

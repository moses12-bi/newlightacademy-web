import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import FlipBox from "@/components/ui/FlipBox";
import type { RevealDelay } from "@/components/ui/PageHero";

interface TeamMember {
  /** Portrait under public/images/staff/. */
  photo: string;
  /** Set once the school confirms who may be named, and as what. */
  name?: string;
  role?: string;
  /** `_animation_delay` on each flip box: 0, 200, 400, 600, 800, 1000. */
  delay?: RevealDelay;
}

/**
 * The school's teaching staff, as supplied.
 *
 * `name` and `role` are deliberately unset: the school sent the photographs but
 * not who is in them, and a card captioned with a guessed name or subject would
 * be worse than one with none. Fill them in as they are confirmed — the card
 * already renders both — and nothing else here needs to change.
 */
const TEAM: TeamMember[] = [
  { photo: "/images/staff/teacher-1.webp" },
  { photo: "/images/staff/teacher-2.webp", delay: "200" },
  { photo: "/images/staff/teacher-3.webp", delay: "400" },
  { photo: "/images/staff/teacher-4.webp", delay: "600" },
  { photo: "/images/staff/teacher-5.webp", delay: "800" },
  { photo: "/images/staff/teacher-6.webp", delay: "1000" },
];

/** Ported from post-1042: the back face is white, the name black, the role the deep teal. */
const CARD_STYLE: CSSProperties = {
  "--w-flipbox-back-bg": "var(--color-accent-5)",
  "--w-flipbox-front-bg": "var(--color-accent-8)",
} as CSSProperties;

/**
 * #25b79f4 + #f1b0259 — the introduction band and the flip boxes.
 *
 * The six front faces are `teacher-01.jpg` … `teacher-06.jpg` background
 * images in the save. None of them downloaded, so the fronts render as the
 * theme's cream panel and each card carries an accessible name instead.
 */
export default function TeachersTeam() {
  return (
    <>
      <section className="teachers-band">
        <Container>
          <div className="teachers-band__inner">
            {/* #15848fb — decorative display word, no reveal in the save. */}
            <p className="teachers-display">
              Our
            </p>
            <h2>teachers are patient and known to every child.</h2>
          </div>
        </Container>
      </section>

      {/* #f1b0259 is `elementor-section-full_width`, so it has no content well. */}
      {TEAM.length > 0 ? (
        <section className="teachers-team" aria-label="Our teaching team">
          {TEAM.map((member, index) => (
            <div key={member.photo} data-reveal="zoomIn" data-delay={member.delay}>
              <FlipBox
                effect="slide"
                direction="up"
                heights={{ desktop: 634, tablet: 600, mobile: 600 }}
                label={member.name ? `${member.name}${member.role ? `, ${member.role}` : ""}` : `Teaching staff, portrait ${index + 1} of ${TEAM.length}`}
                style={CARD_STYLE}
                /* The front face is the portrait, as in the source theme. */
                front={{
                  image: {
                    src: member.photo,
                    alt: member.name ?? "",
                    width: 700,
                    height: 875,
                    sizes: "(min-width: 1025px) 33vw, (min-width: 768px) 50vw, 100vw",
                  },
                }}
                back={{
                  title: member.name ?? "Our teaching team",
                  description: member.role ?? "Come and meet our teachers — arrange a visit to the school.",
                }}
              />
            </div>
          ))}
        </section>
      ) : null}
    </>
  );
}

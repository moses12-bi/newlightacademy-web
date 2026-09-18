import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import FlipBox from "@/components/ui/FlipBox";
import type { RevealDelay } from "@/components/ui/PageHero";

interface TeamMember {
  name: string;
  role: string;
  /** `_animation_delay` on each flip box: 0, 200, 400, 600, 800, 1000. */
  delay?: RevealDelay;
}

/**
 * Empty until the school supplies the staff it wants named and photographed.
 * The card markup below is kept intact so real teachers can be added here — one
 * entry per person, delays running 0, 200, 400, 600, 800, 1000 — without any
 * other change; while the array is empty the grid is not rendered at all.
 */
const TEAM: TeamMember[] = [];

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
          {TEAM.map((member) => (
            <div key={member.name} data-reveal="zoomIn" data-delay={member.delay}>
              <FlipBox
                effect="slide"
                direction="up"
                heights={{ desktop: 634, tablet: 600, mobile: 600 }}
                label={`${member.name}, ${member.role}`}
                style={CARD_STYLE}
                /* The saved front face is only the teacher's photo. That file is
                   not in the capture, so the name stands in for it rather than
                   leaving a 634px empty panel. */
                front={{ description: member.name }}
                back={{
                  title: member.name,
                  description: member.role,
                }}
              />
            </div>
          ))}
        </section>
      ) : null}
    </>
  );
}

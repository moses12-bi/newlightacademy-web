import type { CSSProperties } from "react";

import { CheckSquareIcon, HandsHelpingIcon } from "@/components/programs/icons";
import Container from "@/components/ui/Container";
import FlipBox from "@/components/ui/FlipBox";
import { site } from "@/lib/site";

/** The scroll scale on the oversized "The", desktop only (range 0-30 here). */
const SENSEI_FX = '{"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":30}}}';

/** The outer columns drift up as the page scrolls (post-46 #1e695fd / #ab5ba0d). */
const COLUMN_FX =
  '{"translateY":{"direction":"negative","speed":4,"affectedRange":{"start":49,"end":58}}}';

const CARD_BASE = {
  "--w-flipbox-back-bg": "var(--color-accent-5)",
  "--w-flipbox-icon-color": "var(--color-accent-1)",
} as const;

/**
 * post-46 #b4abadf and #38d4645: "The <school> difference" and the three flip
 * boxes that link on to /tuition, /our-teachers and /admissions.
 */
export default function ProgramsDifference() {
  return (
    <section aria-labelledby="programs-difference-title">
      <Container>
        <div className="programs-difference">
          <p className="program-sensei" data-fx={SENSEI_FX} data-fx-devices="desktop">
            The
          </p>
          <h2 id="programs-difference-title" className="programs-difference__heading">
            {site.name} difference
          </h2>
          <p className="programs-difference__text">
            We are a Christian day school in Kinyinya, accredited by NESA for pre-primary and
            primary education. What we offer is simple, and we try to do it well: careful teaching
            that follows the national curriculum, a school where children feel safe and known, and
            an open door to the families who trust us with their children.
          </p>
        </div>

        <div className="programs-cards">
          <div
            className="programs-cards__a"
            data-reveal="pulse"
            data-fx={COLUMN_FX}
            data-fx-devices="desktop"
          >
            <FlipBox
              effect="slide"
              direction="left"
              heights={{ desktop: 330, tablet: 408, mobile: 408 }}
              label="A Welcome for Every Family"
              style={{ ...CARD_BASE, "--w-flipbox-front-bg": "var(--color-accent-8)" } as CSSProperties}
              front={{
                icon: <HandsHelpingIcon />,
                title: "A Welcome for Every Family",
                description:
                  "An inclusive school, where questions about a child’s progress or settling in are always welcome.",
              }}
              back={{ button: { label: "Learn more", href: "/tuition" } }}
            />
          </div>

          <div className="programs-cards__b programs-cards__raised" data-reveal="headShake" data-delay="200">
            <FlipBox
              effect="fade"
              heights={{ desktop: 458, tablet: 490, mobile: 450 }}
              label="Teachers Who Know Your Child"
              style={
                {
                  ...CARD_BASE,
                  "--w-flipbox-front-bg": "var(--color-accent-5)",
                  "--w-flipbox-radius": "23px",
                } as CSSProperties
              }
              front={{
                image: { src: "/images/home/bird.svg", alt: "", width: 112, height: 86, unoptimized: true },
                title: "Teachers Who Know Your Child",
                description:
                  "Teachers who take time with every child, so that no pupil in the class is a stranger to them.",
              }}
              back={{ button: { label: "Learn more", href: "/our-teachers" } }}
            />
          </div>

          <div
            className="programs-cards__c"
            data-reveal="pulse"
            data-fx={COLUMN_FX}
            data-fx-devices="desktop"
          >
            <FlipBox
              effect="slide"
              direction="right"
              heights={{ desktop: 330, tablet: 408, mobile: 408 }}
              label="A Clear Path Through School"
              style={{ ...CARD_BASE, "--w-flipbox-front-bg": "var(--color-accent-8)" } as CSSProperties}
              front={{
                icon: <CheckSquareIcon />,
                title: "A Clear Path Through School",
                description:
                  "The Rwanda national curriculum from Baby Class to P6, taught so that children learn not only to remember, but to think for themselves.",
              }}
              back={{ button: { label: "Learn more", href: "/admissions" } }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

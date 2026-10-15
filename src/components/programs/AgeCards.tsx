import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import ImageBox from "@/components/ui/ImageBox";

interface AgeCard {
  /** Anchor target, so other pages can link straight to a class: /programs#baby-class. */
  id: string;
  title: string;
  image: { src: string; alt: string };
  description: string;
  /** Rendered with `white-space: pre-wrap`, so any padding spacing is preserved. */
  meta: string;
  background: string;
  titleColor: string;
  eyeColor: string;
  eyeAngle: string;
}

/**
 * The four classes, youngest first, with the colours and eye rotations of the
 * theme's cards (post-46 #202409e / #a812e9c / #be1e1a1 / #c6f8413). The
 * photographs are the school's own (scripts/process-programs.cjs).
 *
 * The cards are not links. Each class used to have a page of its own; those
 * pages were replaced by this one and only these one-line descriptions were
 * kept (the rest was the theme's placeholder copy; see program-data.ts in git
 * history). The old addresses redirect to these anchors (next.config.ts).
 * Without a link to follow, the cards keep their colour on hover rather than
 * inviting a click that goes nowhere.
 */
export const AGE_CARDS: AgeCard[] = [
  {
    id: "baby-class",
    title: "Baby Class",
    image: {
      src: "/images/programs/baby-class.webp",
      alt: "Young children on small coloured chairs in a classroom with picture charts on the walls, with two teachers in white coats",
    },
    description: "A gentle first year of school, where children learn to play, share and listen together.",
    meta: "Ages 3-4",
    background: "var(--color-tint-peach)",
    titleColor: "var(--color-brand-coral)",
    eyeColor: "var(--color-accent-1)",
    eyeAngle: "60deg",
  },
  {
    id: "middle-class",
    title: "Middle Class",
    image: {
      src: "/images/programs/middle-class.webp",
      alt: "Young children riding a playground roundabout in front of a slide",
    },
    description: "Children grow more independent, with early letters, numbers, song and story.",
    meta: "Ages 4-5",
    background: "var(--color-tint-ice)",
    titleColor: "var(--color-accent-2)",
    eyeColor: "var(--color-accent-2)",
    eyeAngle: "129deg",
  },
  {
    id: "top-class",
    title: "Top Class",
    image: {
      src: "/images/programs/top-class.webp",
      alt: "Children at wooden desks raising their hands while their teacher stands at the front of the class",
    },
    description: "The last nursery year, preparing children for the step up into P1.",
    meta: "Ages 5-6",
    background: "var(--color-tint-cream)",
    titleColor: "var(--color-brand-orange)",
    eyeColor: "var(--color-brand-orange)",
    eyeAngle: "8deg",
  },
  {
    id: "primary-school",
    title: "Primary School",
    image: {
      src: "/images/programs/primary-school.webp",
      alt: "Pupils working at laptops on wooden desks while two teachers in white coats look on",
    },
    description: "Six years following the Rwanda national curriculum, up to the Primary Leaving Examination.",
    meta: "P1 - P6",
    background: "var(--color-tint-mint)",
    titleColor: "var(--color-brand-green)",
    eyeColor: "var(--color-brand-green)",
    eyeAngle: "269deg",
  },
];

/** The scroll scale Elementor puts on the oversized "Ages" word, desktop only. */
const SENSEI_FX = '{"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":40}}}';

/** "Ages — we meet children where they are.": the four classes on /programs. */
export default function AgeCards() {
  return (
    <section className="program-ages" aria-labelledby="program-ages-title">
      <Container>
        <div className="program-ages__head">
          <p className="program-sensei" data-fx={SENSEI_FX} data-fx-devices="desktop">
            Ages
          </p>
          <h2 id="program-ages-title" className="program-ages__title">
            we meet children where they are.
          </h2>
        </div>

        <div className="program-ages__grid">
          {AGE_CARDS.map((card) => (
            <div key={card.id} id={card.id} className="program-ages__card">
              <ImageBox
                title={card.title}
                description={card.description}
                meta={card.meta}
                /* The save uses an h6 here; h4 keeps the document's heading
                   levels in order under the card's h3. The kit's h6 scale is
                   restored in programs.css. */
                metaTag="h4"
                eye
                image={{
                  src: card.image.src,
                  alt: card.image.alt,
                  width: 1300,
                  height: 800,
                  sizes: "(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 80vw",
                }}
                style={
                  {
                    "--w-imagebox-bg": card.background,
                    "--w-imagebox-title-color": card.titleColor,
                    "--w-imagebox-eye-color": card.eyeColor,
                    "--w-imagebox-eye-angle": card.eyeAngle,
                  } as CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

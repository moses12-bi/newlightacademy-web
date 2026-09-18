import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import ImageBox from "@/components/ui/ImageBox";

interface AgeCard {
  title: string;
  href: string;
  image: string;
  description: string;
  /** Rendered with `white-space: pre-wrap`, so any padding spacing is preserved. */
  meta: string;
  background: string;
  backgroundHover: string;
  titleColor: string;
  eyeColor: string;
  eyeAngle: string;
}

/**
 * The four cards are byte-identical on all seven pages in this group
 * (post-46 #202409e / #a812e9c / #be1e1a1 / #c6f8413 and the matching widgets
 * in post-1050..1062), including the colours and each eye's rotation.
 *
 * The fourth card links to /kindergarten/, which is the route that carries the
 * Primary School copy; that is the source's own wiring and it is kept.
 */
const AGE_CARDS: AgeCard[] = [
  {
    title: "Baby Class",
    href: "/infants",
    image: "/images/home/h-17.jpg",
    description: "A gentle first year of school, where children learn to play, share and listen together.",
    meta: "Ages 3-4",
    background: "var(--color-tint-peach)",
    backgroundHover: "var(--color-tint-peach-hover)",
    titleColor: "var(--color-brand-coral)",
    eyeColor: "var(--color-accent-1)",
    eyeAngle: "60deg",
  },
  {
    title: "Middle Class",
    href: "/toddlers",
    image: "/images/home/h-19.jpg",
    description: "Children grow more independent, with early letters, numbers, song and story.",
    meta: "Ages 4-5",
    background: "var(--color-tint-ice)",
    backgroundHover: "var(--color-tint-ice-hover)",
    titleColor: "var(--color-accent-2)",
    eyeColor: "var(--color-accent-2)",
    eyeAngle: "129deg",
  },
  {
    title: "Top Class",
    href: "/preschool",
    image: "/images/home/h-16.jpg",
    description: "The last nursery year, preparing children for the step up into P1.",
    meta: "Ages 5-6",
    background: "var(--color-tint-cream)",
    backgroundHover: "var(--color-tint-cream-hover)",
    titleColor: "var(--color-brand-orange)",
    eyeColor: "var(--color-brand-orange)",
    eyeAngle: "8deg",
  },
  {
    title: "Primary School",
    href: "/kindergarten",
    image: "/images/home/h-20.jpg",
    description: "Six years following the Rwanda national curriculum, up to the Primary Leaving Examination.",
    meta: "P1 - P6",
    background: "var(--color-tint-mint)",
    backgroundHover: "var(--color-tint-mint-hover)",
    titleColor: "var(--color-brand-green)",
    eyeColor: "var(--color-brand-green)",
    eyeAngle: "269deg",
  },
];

/** The scroll scale Elementor puts on the oversized "Ages" word, desktop only. */
const SENSEI_FX = '{"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":40}}}';

export interface AgeCardsProps {
  /**
   * /programs pads the band itself (130px top and bottom); the detail pages
   * let the section above it carry the top spacing.
   */
  variant: "index" | "detail";
}

/**
 * "Ages — we meet children where they are.": the four age cards that close
 * /programs and all six program detail pages.
 */
export default function AgeCards({ variant }: AgeCardsProps) {
  return (
    <section className={`program-ages program-ages--${variant}`} aria-labelledby="program-ages-title">
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
            <div key={card.title}>
              <ImageBox
                href={card.href}
                title={card.title}
                description={card.description}
                meta={card.meta}
                /* The save uses an h6 here; h4 keeps the document's heading
                   levels in order under the card's h3. The kit's h6 scale is
                   restored in programs.css. */
                metaTag="h4"
                eye
                image={{
                  src: card.image,
                  alt: "",
                  width: 1300,
                  height: 800,
                  sizes: "(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 80vw",
                }}
                style={
                  {
                    "--w-imagebox-bg": card.background,
                    "--w-imagebox-bg-hover": card.backgroundHover,
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

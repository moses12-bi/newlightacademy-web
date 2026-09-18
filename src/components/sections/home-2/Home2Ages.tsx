import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import ImageBox from "@/components/ui/ImageBox";

interface AgeCard {
  title: string;
  description: string;
  meta: string;
  href: string;
  image: string;
  bg: string;
  bgHover: string;
  titleColor: string;
  eyeColor: string;
  eyeAngle: string;
}

/* Colours, hover colours and eye rotations are ported one for one from
   post-1104 (#2fa6edf2, #69fbeb6c, #2b429873, #507a2bb3). */
const CARDS: AgeCard[] = [
  {
    title: "Baby Class",
    description: "The first year of nursery, where children settle in, make friends and learn through play, song and story.",
    meta: "Ages 3 - 4",
    href: "/infants",
    image: "/images/home/h-17.jpg",
    bg: "var(--color-tint-peach)",
    bgHover: "var(--color-tint-peach-hover)",
    titleColor: "var(--color-brand-coral)",
    eyeColor: "var(--color-accent-1)",
    eyeAngle: "60deg",
  },
  {
    title: "Middle Class",
    description: "Children build early language and numbers, with plenty of time to move, create and explore.",
    meta: "Ages 4 - 5",
    href: "/toddlers",
    image: "/images/home/h-19.jpg",
    bg: "var(--color-tint-ice)",
    bgHover: "var(--color-tint-ice-hover)",
    titleColor: "var(--color-accent-2)",
    eyeColor: "var(--color-accent-2)",
    eyeAngle: "129deg",
  },
  {
    title: "Top Class",
    description: "The year that gets children ready for P1: reading, writing, counting and the habits of a happy school day.",
    meta: "Ages 5 - 6",
    href: "/preschool",
    image: "/images/home/h-16.jpg",
    bg: "var(--color-tint-cream)",
    bgHover: "var(--color-tint-cream-hover)",
    titleColor: "var(--color-brand-orange)",
    eyeColor: "var(--color-brand-orange)",
    eyeAngle: "8deg",
  },
  {
    title: "Primary",
    description: "The Rwanda national curriculum from P1 to P6, leading to the Primary Leaving Examination at the end of P6.",
    meta: "P1 - P6",
    href: "/kindergarten",
    image: "/images/home/h-20.jpg",
    bg: "var(--color-tint-mint)",
    bgHover: "var(--color-tint-mint-hover)",
    titleColor: "var(--color-brand-green)",
    eyeColor: "var(--color-brand-green)",
    eyeAngle: "269deg",
  },
];

/**
 * "Ages — we meet kids where they are." (post-1104 #5462622): the four age-group
 * cards, each in its own pastel panel with the theme's little eye underneath.
 */
export default function Home2Ages() {
  return (
    <section className="home2-ages">
      <Container>
        <p className="home2-word" data-reveal="zoomInDown">
          Ages
        </p>
        <h2 className="home2-ages__title">we meet kids where they are.</h2>

        <ul className="home2-ages__grid">
          {CARDS.map((card) => {
            const style = {
              "--w-imagebox-bg": card.bg,
              "--w-imagebox-bg-hover": card.bgHover,
              "--w-imagebox-title-color": card.titleColor,
              "--w-imagebox-eye-color": card.eyeColor,
              "--w-imagebox-eye-angle": card.eyeAngle,
            } as CSSProperties;

            return (
              <li key={card.title}>
                <ImageBox
                  title={card.title}
                  description={card.description}
                  meta={card.meta}
                  /* The saved card marks the age/time line as an h6 under an h3,
                     which skips three levels; h4 keeps the order intact. */
                  metaTag="h4"
                  href={card.href}
                  eye
                  style={style}
                  image={{
                    src: card.image,
                    alt: "",
                    width: 1300,
                    height: 800,
                    sizes: "(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw",
                  }}
                />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

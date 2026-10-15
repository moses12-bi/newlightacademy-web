import type { CSSProperties, ReactNode } from "react";

import { AGE_CARDS } from "@/components/programs/AgeCards";
import Container from "@/components/ui/Container";
import ImageBox from "@/components/ui/ImageBox";

interface Benefit {
  /** The class's card on /programs: this card links to it and shares its photograph. */
  classId: string;
  title: ReactNode;
  description: string;
  /** Panel, hover panel, title colour, eye colour and eye angle, from post-1044. */
  bg: string;
  bgHover: string;
  titleColor: string;
  eyeColor: string;
  eyeAngle: string;
}

function ageCard(id: string) {
  const card = AGE_CARDS.find((candidate) => candidate.id === id);
  if (!card) throw new Error(`No class card on /programs with the id "${id}"`);
  return card;
}

/**
 * The four classes a teacher could join, in the order of the saved cards. Each
 * shows the school's photograph of that class and links to it on /programs.
 */
const BENEFITS: Benefit[] = [
  {
    classId: "baby-class",
    title: (
      <>
        Baby
        <br />
        Class
      </>
    ),
    description: "Our youngest children, settling into school life and learning through play.",
    bg: "var(--color-tint-peach)",
    bgHover: "var(--color-tint-peach-hover)",
    titleColor: "var(--color-brand-coral)",
    eyeColor: "var(--color-accent-1)",
    eyeAngle: "60deg",
  },
  {
    classId: "middle-class",
    title: (
      <>
        Middle
        <br />
        Class
      </>
    ),
    description: "Where children build language, curiosity and early number work.",
    bg: "var(--color-tint-ice)",
    bgHover: "var(--color-tint-ice-hover)",
    titleColor: "var(--color-accent-2)",
    eyeColor: "var(--color-accent-2)",
    eyeAngle: "129deg",
  },
  {
    classId: "top-class",
    title: (
      <>
        Top
        <br />
        Class
      </>
    ),
    description: "The last nursery year, preparing children for the step up into P1.",
    bg: "var(--color-tint-cream)",
    bgHover: "var(--color-tint-cream-hover)",
    titleColor: "var(--color-brand-orange)",
    eyeColor: "var(--color-brand-orange)",
    eyeAngle: "8deg",
  },
  {
    classId: "primary-school",
    title: (
      <>
        Primary
        <br />
        School
      </>
    ),
    description: "P1 to P6, following the Rwanda national curriculum towards the Primary Leaving Examination.",
    bg: "var(--color-tint-mint)",
    bgHover: "var(--color-tint-mint-hover)",
    titleColor: "var(--color-brand-green)",
    eyeColor: "var(--color-brand-green)",
    eyeAngle: "269deg",
  },
];

/** #bf6576c — the four cards. */
export default function CareersBenefits() {
  return (
    <section className="careers-benefits">
      <Container>
        <div className="careers-benefits__grid">
          {BENEFITS.map((benefit) => {
            const card = ageCard(benefit.classId);
            return (
              <ImageBox
                key={benefit.classId}
                href={`/programs#${card.id}`}
                title={benefit.title}
                description={benefit.description}
                eye
                image={{
                  src: card.image.src,
                  alt: card.image.alt,
                  width: 1300,
                  height: 800,
                  sizes: "(max-width: 767px) 85vw, (max-width: 1024px) 42vw, 270px",
                }}
                style={
                  {
                    "--w-imagebox-bg": benefit.bg,
                    "--w-imagebox-bg-hover": benefit.bgHover,
                    "--w-imagebox-title-color": benefit.titleColor,
                    "--w-imagebox-eye-color": benefit.eyeColor,
                    "--w-imagebox-eye-angle": benefit.eyeAngle,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}

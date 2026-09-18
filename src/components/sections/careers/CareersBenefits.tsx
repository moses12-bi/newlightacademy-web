import type { CSSProperties, ReactNode } from "react";

import Container from "@/components/ui/Container";
import ImageBox from "@/components/ui/ImageBox";

interface Benefit {
  title: ReactNode;
  description: string;
  href: string;
  image: { src: string; alt: string };
  /** Panel, hover panel, title colour, eye colour and eye angle, from post-1044. */
  bg: string;
  bgHover: string;
  titleColor: string;
  eyeColor: string;
  eyeAngle: string;
}

/**
 * The four classes a teacher could join, in the order of the saved cards.
 *
 * The photographs are still the template's stock images and do not match the
 * classes they sit beside; the alt text describes what each picture actually
 * shows rather than what the card claims, until the photos are replaced.
 */
const BENEFITS: Benefit[] = [
  {
    title: (
      <>
        Baby
        <br />
        Class
      </>
    ),
    description: "Our youngest children, settling into school life and learning through play.",
    href: "/infants",
    image: { src: "/images/home/h-30.jpg", alt: "Children sitting on gym mats in a hall with two adults" },
    bg: "var(--color-tint-peach)",
    bgHover: "var(--color-tint-peach-hover)",
    titleColor: "var(--color-brand-coral)",
    eyeColor: "var(--color-accent-1)",
    eyeAngle: "60deg",
  },
  {
    title: (
      <>
        Middle
        <br />
        Class
      </>
    ),
    description: "Where children build language, curiosity and early number work.",
    href: "/toddlers",
    image: { src: "/images/shared/h-04.jpg", alt: "A teacher sitting and talking with two young children" },
    bg: "var(--color-tint-ice)",
    bgHover: "var(--color-tint-ice-hover)",
    titleColor: "var(--color-accent-2)",
    eyeColor: "var(--color-accent-2)",
    eyeAngle: "129deg",
  },
  {
    title: (
      <>
        Top
        <br />
        Class
      </>
    ),
    description: "The last nursery year, preparing children for the step up into P1.",
    href: "/preschool",
    image: { src: "/images/shared/h-07.jpg", alt: "A child writing in a notebook beside shelves of books" },
    bg: "var(--color-tint-cream)",
    bgHover: "var(--color-tint-cream-hover)",
    titleColor: "var(--color-brand-orange)",
    eyeColor: "var(--color-brand-orange)",
    eyeAngle: "8deg",
  },
  {
    title: (
      <>
        Primary
        <br />
        School
      </>
    ),
    description: "P1 to P6, following the Rwanda national curriculum towards the Primary Leaving Examination.",
    href: "/kindergarten",
    image: { src: "/images/careers/h-06.jpg", alt: "An adult's hands and a child's hands holding a few coins" },
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
          {BENEFITS.map((benefit, index) => (
            <ImageBox
              key={index}
              href={benefit.href}
              title={benefit.title}
              description={benefit.description}
              eye
              image={{
                src: benefit.image.src,
                alt: benefit.image.alt,
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
          ))}
        </div>
      </Container>
    </section>
  );
}

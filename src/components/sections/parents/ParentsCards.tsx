import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import Container from "@/components/ui/Container";
import FlipBox from "@/components/ui/FlipBox";
import type { FlipBoxHeights, FlipBoxProps } from "@/components/ui/FlipBox";
import { site } from "@/lib/site";

interface FlipCard {
  /** Front-face padding variant, from each widget's overlay padding. */
  pad: string;
  title: string;
  description: ReactNode;
  /** The whole back face is a link in the save; the label is its button text. */
  action?: { label: string; href: string };
  /** Kept when the saved target is a file the capture does not contain. */
  actionText?: string;
  effect: NonNullable<FlipBoxProps["effect"]>;
  direction?: FlipBoxProps["direction"];
  /** `true` = cream front (accent-8); `false` = white (accent-5). */
  cream: boolean;
  heights: FlipBoxHeights;
}

const SHORT: FlipBoxHeights = { desktop: 320, tablet: 300, mobile: 285 };
const TALL: FlipBoxHeights = { desktop: 380, tablet: 300, mobile: 285 };

/* post-3216: every back face is white; the fronts alternate white and cream. */
function faceStyle(cream: boolean): CSSProperties {
  return {
    "--w-flipbox-front-bg": cream ? "var(--color-accent-8)" : "var(--color-accent-5)",
    "--w-flipbox-back-bg": "var(--color-accent-5)",
  } as CSSProperties;
}

const ROW_ONE: FlipCard[] = [
  {
    pad: "parents-flip",
    title: "School Payments",
    description: "Please contact the school office for the current fee payment details.",
    action: { label: "Read more", href: "/make-a-payment" },
    effect: "fade",
    cream: false,
    heights: SHORT,
  },
  {
    pad: "parents-flip parents-flip--soft",
    title: "School Readiness",
    description: "We help every child settle in gently and grow ready for the next step.",
    action: { label: "More", href: "/about" },
    effect: "slide",
    direction: "up",
    cream: true,
    heights: SHORT,
  },
  {
    pad: "parents-flip",
    title: "School Information",
    description: `Would you like to know more about ${site.name}? Get in touch and we will be glad to help.`,
    /* There is no prospectus file to link yet, so the back face carries a short
       instruction rather than a download that would not resolve. */
    actionText: "Ask the school office",
    effect: "fade",
    cream: false,
    heights: SHORT,
  },
];

const ROW_TWO_LEFT: FlipCard = {
  pad: "parents-flip parents-flip--plain parents-flip--map",
  title: "Finding Us",
  description: (
    <>
      Kinyinya, Gasabo, Kigali,
      <br />
      near the Kinyinya bus station.
    </>
  ),
  action: { label: "Directions", href: "/location" },
  effect: "slide",
  direction: "left",
  cream: true,
  heights: TALL,
};

const ROW_TWO_RIGHT: FlipCard = {
  pad: "parents-flip parents-flip--flat parents-flip--raise",
  title: "A Warm Welcome",
  description: "You want to know your child is safe, happy and well cared for.",
  action: { label: "Schedule a tour", href: "/schedule-a-tour" },
  effect: "slide",
  direction: "right",
  cream: true,
  heights: TALL,
};

const ROW_THREE: FlipCard[] = [
  {
    pad: "parents-flip parents-flip--flat",
    title: "The School Day",
    description: "See how a day with us is shaped around learning, play and care.",
    action: { label: "Read more", href: "/daily-schedule" },
    effect: "fade",
    cream: false,
    heights: SHORT,
  },
  {
    pad: "parents-flip parents-flip--low",
    title: "Our Classes",
    description: "Baby Class, Middle Class and Top Class, then P1 to P6.",
    action: { label: "Request info", href: "/location" },
    effect: "slide",
    direction: "down",
    cream: true,
    heights: { desktop: 320, tablet: 300 },
  },
  {
    pad: "parents-flip parents-flip--flat",
    title: "Reporting an Absence",
    description: "If your child cannot come to school, please let the school office know.",
    action: { label: "Tell us", href: "/location" },
    effect: "fade",
    cream: false,
    heights: SHORT,
  },
];

function Card({ card }: { card: FlipCard }) {
  return (
    <FlipBox
      className={card.pad}
      style={faceStyle(card.cream)}
      effect={card.effect}
      direction={card.direction}
      heights={card.heights}
      label={card.title}
      front={{ title: card.title, titleTag: "h2", description: card.description }}
      back={
        card.action
          ? { button: { label: card.action.label, href: card.action.href } }
          : { description: card.actionText }
      }
    />
  );
}

/**
 * post-3216 #3dafeb6 / #a674e76 / #891e7c8 — three rows of flip cards with the
 * fox illustration sitting in the middle column of the second row.
 */
export default function ParentsCards() {
  return (
    <section className="parents-cards" aria-label="Parent information">
      <Container>
        <div className="parents-row">
          {ROW_ONE.map((card) => (
            <div key={card.title}>
              <Card card={card} />
            </div>
          ))}
        </div>

        <div className="parents-row">
          <div>
            <Card card={ROW_TWO_LEFT} />
          </div>
          <div className="parents-fox">
            <Image src="/images/fox-color.svg" alt="" width={157} height={145} unoptimized />
          </div>
          <div>
            <Card card={ROW_TWO_RIGHT} />
          </div>
        </div>

        <div className="parents-row">
          {ROW_THREE.map((card) => (
            <div key={card.title}>
              <Card card={card} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

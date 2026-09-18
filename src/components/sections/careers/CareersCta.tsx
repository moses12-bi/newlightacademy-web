import type { CSSProperties, ReactNode } from "react";

import { CloudSunIcon, SlideshareIcon } from "@/components/sections/careers/CareersIcons";
import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";

interface Card {
  title: string;
  href: string;
  icon: ReactNode;
}

const CARDS: Card[] = [
  { title: "Common questions", href: "/faq", icon: <SlideshareIcon /> },
  { title: "Ask about visiting", href: "/schedule-a-tour", icon: <CloudSunIcon /> },
];

/** Ported from post-1044 #f3c2bfc / #d4cf1de. */
const CARD_STYLE: CSSProperties = {
  "--w-iconbox-icon-size": "55px",
  "--w-iconbox-icon-color": "var(--color-accent-3)",
  "--w-iconbox-description-color": "var(--color-accent-2)",
} as CSSProperties;

/** #e8a94a2 — two framed link cards in a 1000px well. */
export default function CareersCta() {
  return (
    <section>
      <Container>
        <div className="careers-cta">
          {CARDS.map((card) => (
            <IconBox
              key={card.title}
              boxed
              align="start"
              href={card.href}
              icon={card.icon}
              title={card.title}
              description="Learn More"
              style={CARD_STYLE}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

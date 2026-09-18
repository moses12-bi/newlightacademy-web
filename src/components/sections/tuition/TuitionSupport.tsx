import type { ReactNode } from "react";

import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";
import {
  CoinsGlyph,
  MoneyCheckGlyph,
  PiggyBankGlyph,
} from "@/components/sections/admissions/GroupIcons";

interface SupportCard {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

/**
 * The three framed money cards — post-1066 #e744fd0 / #f4f72f4 / #316ccb8,
 * inside a 1000px well. `/for-our-parents/` in the save is this app's
 * `/parents` route.
 *
 * Each card points parents at a person or a page rather than quoting a figure:
 * the school has not published a fee schedule here, and the office is the only
 * place the current one can come from.
 */
const CARDS: SupportCard[] = [
  {
    title: "Fees",
    description: "Fees are not listed on this site — please ask the school office.",
    href: "/make-a-payment",
    icon: <CoinsGlyph />,
  },
  {
    title: "Joining Us",
    description: "How to apply for a place, from Baby Class through to P6.",
    href: "/how-to-apply",
    icon: <MoneyCheckGlyph />,
  },
  {
    title: "For Parents",
    description: "Practical information for the families already learning with us.",
    href: "/parents",
    icon: <PiggyBankGlyph />,
  },
];

export default function TuitionSupport() {
  return (
    <section className="tui-support">
      <Container>
        <div className="tui-support__well adm-row adm-row--extended">
          {CARDS.map((card) => (
            <div className="tui-support__col" key={card.title}>
              <IconBox
                className="adm-download"
                icon={card.icon}
                title={card.title}
                titleTag="h3"
                description={card.description}
                href={card.href}
                align="start"
                boxed
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

import type { ReactNode } from "react";

import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";
import {
  CalendarCheckGlyph,
  FileDownloadGlyph,
  FormGlyph,
  HouseGlyph,
  ListAltGlyph,
} from "@/components/sections/admissions/GroupIcons";

interface FormCard {
  title: string;
  icon: ReactNode;
}

/**
 * Both of them are `elementor-view-default` framed icon boxes (post-2461
 * #be74d59 and its five twins): a 1px grey frame with an offset block shadow
 * that deepens to the dark teal on hover.
 *
 * The saved cards are downloads of another school's US admission forms, linking
 * to a `lorem-ipsum.pdf` upload on the original host. This school has published
 * no forms, so the cards name the things the office will talk a family through
 * instead, and their shared caption is an invitation to ask rather than a
 * "Download" that has nothing behind it. They remain plain (non-link) panels.
 */
const ASK_US = "Talk to us";

const FIRST_ROW: FormCard[] = [
  { title: "Asking about a place", icon: <FileDownloadGlyph /> },
  { title: "Nursery: Baby, Middle and Top Class", icon: <HouseGlyph /> },
  { title: "Primary: P1 to P6", icon: <ListAltGlyph /> },
];

const SECOND_ROW: FormCard[] = [
  { title: "Joining partway through the year", icon: <FormGlyph /> },
  { title: "Arranging a visit to the school", icon: <CalendarCheckGlyph /> },
  { title: "Anything else you would like to ask", icon: <FormGlyph /> },
];

function Row({ cards, second }: { cards: FormCard[]; second?: boolean }) {
  return (
    <section className={["adm-forms", second ? "adm-forms--second" : null].filter(Boolean).join(" ")}>
      <Container>
        <div className="adm-row adm-row--extended">
          {cards.map((card, index) => (
            <div className="adm-forms__col" key={`${card.title}-${index}`}>
              <IconBox
                className="adm-download"
                icon={card.icon}
                title={card.title}
                titleTag="h3"
                description={ASK_US}
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

export default function AdmissionsForms() {
  return (
    <>
      <Row cards={FIRST_ROW} />
      <Row cards={SECOND_ROW} second />
    </>
  );
}

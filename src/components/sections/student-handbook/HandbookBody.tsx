import type { ReactNode } from "react";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";

interface HandbookSection {
  heading: string;
  body: ReactNode;
}

/* post-1093 #beafbf7 carried another school's handbook in full — its admission
   and immunisation rules, its sign-out and drop-off procedures, its local
   helpline numbers. None of that describes this school, and a handbook we wrote
   ourselves would be a set of rules parents could act on. Until the school gives
   us its own document, the page keeps one holding block in the same structure,
   so the real sections can simply be added back here. Elementor renders each
   heading as an uppercase h4; they are h3 here so the level after the card's h2
   above is not skipped. */
const SECTIONS: HandbookSection[] = [
  {
    heading: "Ask us about the school day",
    body: (
      <>
        <p>
          {site.name} is a Christian nursery and primary day school in Kinyinya, Gasabo. We follow
          the Rwanda national curriculum, and we want every child in our care to feel safe, known and
          encouraged.
        </p>
        <p>
          A parent and pupil handbook gathers the practical things families ask about — how the
          school day works, what we ask of pupils, and how to reach us. We have not published a
          version of it here, because a handbook is something parents rely on and it should be the
          school&apos;s own words, not a stand-in.
        </p>
        <p>
          Please contact the school office with any question at all. We are always glad to hear from
          parents.
        </p>
      </>
    ),
  },
];

export default function HandbookBody() {
  return (
    <section className="handbook-body" id="read">
      <ShapeDivider position="top" className="w-wave--top" />

      <Container>
        {SECTIONS.map((section) => (
          <div className="handbook-body__block" key={section.heading}>
            <h3>{section.heading}</h3>
            {section.body}
          </div>
        ))}
      </Container>
    </section>
  );
}

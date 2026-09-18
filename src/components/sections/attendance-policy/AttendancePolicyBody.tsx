import type { ReactNode } from "react";

import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

interface PolicySection {
  heading: string;
  body: ReactNode;
}

/* post-1089 #02ff223 rendered another school's attendance rules — tardy counts,
   detentions, absence thresholds. None of it belongs to this school, and a
   policy we wrote ourselves would be a rule parents could act on. Until the
   school gives us its own policy, the page carries a short holding message in
   the same block structure, so the real sections can simply be added back. */
const SECTIONS: PolicySection[] = [
  {
    heading: "Ask us about attendance",
    body: (
      <>
        <p>
          Regular attendance is one of the simplest things that helps a child do well at school.
          Children who come in every day and arrive on time settle faster, follow their lessons more
          easily and keep up with their classmates.
        </p>
        <p>
          {site.name} has not published an attendance policy on this site. Please contact the school
          office with any question about attendance and we will be glad to talk it through with you.
        </p>
        <p>
          If your child cannot come to school, please let the school office know. You are welcome to
          get in touch with us at any time.
        </p>
      </>
    ),
  },
];

export default function AttendancePolicyBody() {
  return (
    <section className="attendance-body">
      <Container>
        {SECTIONS.map((section) => (
          <div className="attendance-body__block" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body}
          </div>
        ))}
      </Container>
    </section>
  );
}

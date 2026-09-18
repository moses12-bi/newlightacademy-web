import Accordion from "@/components/ui/Accordion";
import type { AccordionItem } from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";

const ITEMS: AccordionItem[] = [
  {
    id: "classes",
    title: `Which classes does ${site.name} offer?`,
    content: (
      <p>
        We are a day school for nursery and primary children. Our nursery classes are Baby Class,
        Middle Class and Top Class, and our primary classes run from P1 to P6, ending with the
        Primary Leaving Examination.
      </p>
    ),
  },
  {
    id: "start-date",
    title: `When can my child start at ${site.name}?`,
    content: (
      <p>
        The best first step is to talk to us. Give us a call or send us a message about the class
        your child would be joining, and the school office can tell you about places, term dates and
        what would happen next.
      </p>
    ),
  },
  {
    id: "nursery",
    title: `Does ${site.name} have a nursery programme?`,
    content: (
      <p>
        Yes. Our nursery classes welcome young children from around the age of three, in Baby Class,
        Middle Class and Top Class. They follow the Rwanda national pre-primary curriculum, with plenty
        of play, language, early numbers and time to make friends, so that children are settled and
        ready when they move up to P1.
      </p>
    ),
  },
  {
    id: "staff",
    title: `How does ${site.name} choose the people who work with children?`,
    content: (
      <p>
        Caring for other people’s children is a responsibility we take seriously. {site.name} is
        accredited by NESA and works to the standards expected of an accredited Rwandan school. If you
        would like to know more about the people who look after your child, please ask us — we are
        happy to talk it through.
      </p>
    ),
  },
  {
    id: "photos",
    title: "What is your policy regarding pictures and videos of my child?",
    content: (
      <p>
        Families feel differently about this, and we would rather hear from you than assume anything.
        Please ask the school office about pictures and videos of your child, and someone will go
        through it with you.
      </p>
    ),
  },
];

/**
 * The frequently-asked-questions band (post-1074 #69cb625): a cream section with
 * the mountain illustration in the bottom-left corner, wavy edges top and
 * bottom, the five-question accordion and the link through to the full FAQ.
 */
export default function LocationFaq() {
  return (
    <section className="location-faq">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />

      <Container>
        {/* The saved accordion opens with every panel closed (aria-expanded="false"
            on all five triggers), so no `defaultOpenId` is passed. */}
        <div className="location-faq__list">
          <Accordion items={ITEMS} headingLevel="h3" />
        </div>
        <Button href="/faq" variant="outline">
          View all
        </Button>
      </Container>
    </section>
  );
}

import Container from "@/components/ui/Container";
import FlipBox from "@/components/ui/FlipBox";
import { site } from "@/lib/site";
import {
  CalendarCheckGlyph,
  InfoCircleGlyph,
} from "@/components/sections/admissions/GroupIcons";

/**
 * The three flip boxes — post-1064 #49c9db0, #a6c4142 and #922d16f.
 *
 * Left slides in from the left, the middle one cross-fades, the right slides in
 * from the right; only the middle card carries an explicit height (398 / 348 /
 * 450px), the other two use Elementor's 280px default. The column animations
 * come from the saved column settings (pulse, headShake + 200ms, pulse).
 *
 * The saved titles are `h3` under the page `h1`; they are rendered one level up
 * with the original 26px scale pinned in src/styles/admissions.css.
 */
export default function ApplyChoices() {
  return (
    <section className="hta-choices">
      <Container>
        <div className="adm-row">
          <div className="hta-choices__col" data-reveal="pulse">
            <FlipBox
              className="hta-flip"
              effect="slide"
              direction="left"
              heights={{ desktop: 280 }}
              front={{
                icon: <InfoCircleGlyph />,
                title: "Request Info",
                titleTag: "h2",
                description:
                  `Ask us about the classes at ${site.name}, how we teach and how to apply.`,
              }}
              back={{ button: { label: "Request info", href: "/location" } }}
              label="Request Info"
            />
          </div>

          <div className="hta-choices__col hta-choices__col--middle" data-reveal="headShake" data-delay="200">
            <FlipBox
              className="hta-flip hta-flip--card"
              effect="fade"
              heights={{ desktop: 398, tablet: 348, mobile: 450 }}
              front={{
                image: {
                  src: "/images/fox-color.svg",
                  alt: "",
                  width: 157,
                  height: 145,
                  unoptimized: true,
                },
                title: "Apply Today",
                titleTag: "h2",
                description:
                  "Start your application and tell us about your child.",
              }}
              back={{ button: { label: "Apply now", href: "#form" } }}
              label="Apply Today"
            />
          </div>

          <div className="hta-choices__col" data-reveal="pulse">
            <FlipBox
              className="hta-flip hta-flip--last"
              effect="slide"
              direction="right"
              heights={{ desktop: 280 }}
              front={{
                icon: <CalendarCheckGlyph />,
                title: "Schedule a Tour",
                titleTag: "h2",
                description: "Come and see the school for yourself, and meet the people who will teach your child.",
              }}
              back={{ button: { label: "Schedule a tour", href: "/schedule-a-tour" } }}
              label="Schedule a Tour"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

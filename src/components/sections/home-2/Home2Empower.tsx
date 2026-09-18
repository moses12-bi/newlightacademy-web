import type { CSSProperties } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";
import type { RevealDelay } from "@/components/ui/PageHero";
import { site } from "@/lib/site";

interface Program {
  title: string;
  color: string;
  delay: RevealDelay;
}

/* post-1104 #b721f2b / #e7f57d7 / #a488ca5 / #8fb2add / #8174fd0 / #ecc8a6c —
   the colour and the zoomIn delay of each badge. */
const ROW_ONE: Program[] = [
  { title: "Reading", color: "var(--color-brand-orange)", delay: "1100" },
  { title: "Creative Arts", color: "var(--color-accent-1)", delay: "100" },
  { title: "Numeracy", color: "var(--color-brand-sky)", delay: "300" },
];

const ROW_TWO: Program[] = [
  { title: "Languages", color: "var(--color-brand-violet)", delay: "900" },
  { title: "Music & Movement", color: "var(--color-brand-lime)", delay: "700" },
  { title: "Writing", color: "var(--color-brand-teal-deep)", delay: "500" },
];

function ProgramBox({ title, color, delay }: Program) {
  const style = {
    "--w-iconbox-gap": "0px",
    "--home2-badge-color": color,
  } as CSSProperties;

  return (
    <IconBox
      title={title}
      titleTag="h3"
      href="/programs"
      className="home2-program"
      style={style}
      reveal="zoomIn"
      delay={delay}
      icon={<span className="home2-program__badge" aria-hidden="true" />}
    />
  );
}

/**
 * "Every day we work to empower your child." (post-1104 #998dec0 + #5cada6c):
 * six linked programme badges beside the copy column.
 *
 * Each badge is a Font Awesome / VamTam icon-font glyph in the original. Neither
 * font is part of the capture, so the badge keeps its ported colour and circular
 * shape but carries no glyph; it is decorative, and the programme name beside it
 * is the real link text.
 */
export default function Home2Empower() {
  return (
    <>
      <section className="home2-empower-word">
        <Container>
          <p className="home2-word home2-word--tall" data-reveal="zoomInDown">
            Every
          </p>
        </Container>
      </section>

      <section className="home2-empower">
        {/* The copy column is first in the DOM so the h2 precedes the programme
            headings; `row-reverse` puts the badges back on the left from 1025up,
            and the stacked layout matches Elementor's reverse-tablet/mobile. */}
        <Container className="home2-empower__row">
          <div className="home2-empower__copy card-copy">
            <h2>day we work to empower your child.</h2>
            <p>
              Learning at {site.name} follows the Rwanda national curriculum, and we take the time to
              notice how each child is getting on. Our teachers are patient and encouraging, so
              children feel safe enough to try, to ask and to try again.
            </p>
            <p>
              From Baby Class through to P6, children move forward one steady step at a time, with
              room to grow in character and in faith as well as in class.
            </p>
            <div className="home2-empower__cta">
              <Button href="/programs" variant="outline">
                Programs
              </Button>
            </div>
          </div>

          <div className="home2-empower__grid">
            <ul className="home2-empower__line home2-empower__line--one">
              {ROW_ONE.map((program) => (
                <li key={program.title}>
                  <ProgramBox {...program} />
                </li>
              ))}
            </ul>
            <ul className="home2-empower__line home2-empower__line--two">
              {ROW_TWO.map((program) => (
                <li key={program.title}>
                  <ProgramBox {...program} />
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}

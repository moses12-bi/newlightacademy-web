import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";
import ShapeDivider from "@/components/ui/ShapeDivider";

interface Subject {
  number: string;
  title: string;
  /** Per-box `motion_fx` scale, straight from the saved data-settings. */
  fx: string;
  /** Column placement inside the 430px band. */
  modifier: string;
}

const SUBJECTS: Subject[] = [
  {
    number: "01",
    title: "Languages",
    modifier: "home2-subject--a",
    fx: JSON.stringify({ scale: { speed: 4, direction: "out-in", range: { start: 30, end: 100 } } }),
  },
  {
    number: "02",
    title: "Mathematics",
    modifier: "home2-subject--b",
    fx: JSON.stringify({ scale: { speed: 3, direction: "in-out", range: { start: 1, end: 100 } } }),
  },
  {
    number: "03",
    title: "Science",
    modifier: "home2-subject--c",
    fx: JSON.stringify({ scale: { speed: 6, direction: "in-out", range: { start: 1, end: 100 } } }),
  },
  {
    number: "04",
    title: "Sport",
    modifier: "home2-subject--d",
    fx: JSON.stringify({ scale: { speed: 2, direction: "in-out", range: { start: 0, end: 96 } } }),
  },
];

const ICON_STYLE: CSSProperties = {
  "--w-iconbox-gap": "0px",
  "--w-iconbox-icon-size": "120px",
  "--w-iconbox-icon-color": "var(--color-accent-5)",
} as CSSProperties;

/**
 * "Our unique learning environment" (post-1104 #6b03187f): a pale blue band with
 * wavy edges and the four subject cards.
 *
 * Each card's watermark is `number-0X_white.svg` in the original. Those four
 * files are referenced only from CSS, so the capture never downloaded them; the
 * numeral is set as white type here instead.
 */
export default function Home2Learning() {
  return (
    <section className="home2-learning">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />

      <Container>
        <p className="home2-word" data-reveal="zoomInDown">
          Our
        </p>
        <div className="home2-learning__intro card-copy">
          <h2>learning environment</h2>
          <p>
            gives every child room to move, ask questions and discover. We follow the Rwanda
            national curriculum, and we want every child to feel encouraged as they learn.
          </p>
        </div>

        <ul className="home2-subjects">
          {SUBJECTS.map((subject) => (
            <li key={subject.title} className={`home2-subject ${subject.modifier}`} data-fx={subject.fx}>
              <IconBox
                title={subject.title}
                titleTag="h3"
                style={ICON_STYLE}
                icon={
                  <span className="home2-subject__number" aria-hidden="true">
                    {subject.number}
                  </span>
                }
                className="home2-subject__box"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

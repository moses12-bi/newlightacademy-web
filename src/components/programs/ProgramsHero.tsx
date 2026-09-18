import Image from "next/image";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

/**
 * post-46 #bdac0fe. A background slideshow of two photos behind a panel
 * carrying the page title, with a dotted arc and a small tree.
 *
 * The saved page has no `h1` at all — the big "Programs" word is a `div`
 * heading, and the lines above and below it are `h3`s. That would leave the
 * page without a top-level heading and with headings out of order, so the big
 * word is the `h1` here and the two lines around it are paragraphs. The copy
 * itself is unchanged.
 */
const PANEL_FX =
  '{"translateY":{"direction":"negative","speed":2,"affectedRange":{"start":0,"end":100}},' +
  '"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":94}}}';
const DOTS_FX =
  '{"translateY":{"direction":"negative","speed":11,"affectedRange":{"start":44,"end":100}}}';
const TREE_FX = '{"scale":{"direction":"in-out-in","speed":-3,"range":{"start":0,"end":80}}}';

export default function ProgramsHero() {
  return (
    <section className="programs-hero">
      {/* Elementor's background slideshow: two slides, fade, 5s apart, looping. */}
      <div className="programs-hero__slides" aria-hidden="true">
        <div className="programs-hero__slide">
          <Image src="/images/home/h-15.jpg" alt="" fill priority sizes="100vw" />
        </div>
        <div className="programs-hero__slide">
          <Image src="/images/home/h-16.jpg" alt="" fill sizes="100vw" />
        </div>
      </div>
      <div className="programs-hero__shade" aria-hidden="true" />
      <ShapeDivider position="bottom" />

      <Container className="programs-hero__container">
        {/* The saved left column is empty and hidden below 1025px. */}
        <div className="programs-hero__spacer" aria-hidden="true" />

        <div
          className="programs-hero__panel"
          data-reveal="pulse"
          data-fx={PANEL_FX}
          data-fx-devices="desktop,tablet"
        >
          <div
            className="programs-hero__dots"
            aria-hidden="true"
            data-reveal="bounceIn"
            data-delay="1200"
            data-fx={DOTS_FX}
            data-fx-devices="desktop"
          >
            <Image src="/images/home/dots.svg" alt="" width={771} height={445} unoptimized />
          </div>

          <div
            className="programs-hero__tree"
            data-reveal="zoomInDown"
            data-delay="800"
            data-fx={TREE_FX}
            data-fx-devices="desktop"
          >
            <Image
              src="/images/home/illustration-tree-2.svg"
              alt=""
              width={141}
              height={148}
              unoptimized
            />
          </div>

          <p className="programs-hero__kicker" data-reveal="fadeInUp" data-delay="1900">
            Choose from our
          </p>
          <h1 className="programs-hero__title" data-reveal="zoomInDown" data-delay="400">
            Programs
          </h1>
          <p className="programs-hero__kicker" data-reveal="fadeInDown" data-delay="1700">
            nursery to P6
          </p>
        </div>
      </Container>
    </section>
  );
}

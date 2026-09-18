import Image from "next/image";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

const PHOTO_FX = '{"translateY":{"speed":4,"affectedRange":{"start":0,"end":100}}}';

/**
 * post-46 #644c312. The band that pointed parents at a fee table now points
 * them at the school office: no figure is published until the school confirms
 * one.
 */
export default function ProgramsTuition() {
  return (
    <section className="programs-tuition" aria-labelledby="programs-tuition-title">
      <ShapeDivider position="top" />
      <Container>
        <div className="program-split">
          <div
            className="programs-tuition__photo"
            data-fx={PHOTO_FX}
            data-fx-range="page"
            data-fx-devices="desktop"
          >
            <Image
              src="/images/programs/h-05-pj0d6d2j57p4by7xz55fzmlzmnuuve8bzdr8pnro58.jpg"
              alt=""
              width={500}
              height={230}
              sizes="(min-width: 1025px) 50vw, 100vw"
              className="program-photo"
            />
          </div>

          <div>
            <div className="program-card">
              <h2 id="programs-tuition-title" data-reveal="fadeIn" data-delay="200">
                Investing in your child&apos;s future.
              </h2>
              <p>
                School fees are a real commitment for any family, and we would rather talk them
                through with you than print a figure here that may be out of date. Please contact
                the school office for current fees, what they cover and how to apply, and we will
                give you a clear and complete answer.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

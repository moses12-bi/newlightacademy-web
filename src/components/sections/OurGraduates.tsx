import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

export default function OurGraduates() {
  return (
    <section className="graduates-section relative overflow-hidden">
      <ShapeDivider position="top" />

      <Container className="section-layout">
        <div className="section-card">
          <h2 data-reveal="fadeIn" data-delay="200">Our graduates</h2>
          <div className="card-copy mt-5">
            <p>
              Children leave us curious, confident and ready for the next step in their learning,
              whether that step is moving up from Top Class into P1 or finishing P6 and going on to
              secondary school. We follow the Rwanda national curriculum and prepare every pupil for
              the Primary Leaving Examination at the end of P6.
            </p>
            <p>
              Alongside their lessons, children grow in character. We encourage active learning,
              curiosity and the development of strong foundational skills in reading, writing and
              numeracy, and we give the same attention to the habits that carry a child further:
              listening well, working with others, asking questions and finishing what they start.
            </p>
          </div>
          <div className="mt-6">
            <Button href="/careers" variant="outline">
              Learn more
            </Button>
          </div>
        </div>

        <div className="section-photo">
          {/* the negative margin lives on this block so the photo grows 40px
              wider to the left instead of just shifting and leaving a gap */}
          <div data-motion="photo" className="photo-motion">
            <Image
              src="/images/h-02.jpg"
              alt="A smiling girl in denim dungarees shading her eyes with one hand while playing outdoors"
              width={1000}
              height={650}
              sizes="(min-width: 1320px) 670px, (min-width: 1025px) 50vw, 100vw"
              className="h-auto w-full rounded-[7px]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

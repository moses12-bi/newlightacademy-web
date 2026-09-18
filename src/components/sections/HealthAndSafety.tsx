import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import IconList from "@/components/ui/IconList";
import ShapeDivider from "@/components/ui/ShapeDivider";

const SAFETY_FEATURES: string[] = [
  "Calm, well kept classrooms where children can settle and concentrate",
  "Attentive care, so that no child goes unnoticed",
  "An open door for parents with questions about their child’s wellbeing",
];

export default function HealthAndSafety() {
  return (
    <section className="safety-section relative overflow-hidden">
      <ShapeDivider position="bottom" />

      <Container className="section-layout">
        <div className="section-card">
          <h2 data-reveal="fadeIn" data-delay="200">Health &amp; Safety</h2>
          <div className="card-copy mt-5">
            <p>
              Your child’s health and safety come first. We want every child to feel settled and
              cared for while they are with us, in classrooms that are calm and well kept.
            </p>
            <p>
              We are accredited by NESA, Rwanda’s National Examination and School Inspection
              Authority, for pre-primary and primary education, and we work to the standards that
              accreditation asks of us. If you would like to know more about how we
              look after children during the school day, please speak to the school office.
            </p>
            <p>What that care means to us:</p>
          </div>
          <IconList items={SAFETY_FEATURES} className="mt-5 font-bold" />
          <div className="mt-6">
            <Button href="/programs" variant="outline">
              Learn more
            </Button>
          </div>
        </div>

        <div className="section-photo">
          {/* negative margin on the block, so the photo grows 40px wider to the
              left instead of just shifting and leaving a gap */}
          <div data-motion="photo" className="photo-motion">
            <Image
              src="/images/h-07.jpg"
              alt="A girl lying on the floor writing in a notebook, with shelves of books behind her"
              width={1000}
              height={800}
              sizes="(min-width: 1320px) 670px, (min-width: 1025px) 50vw, 100vw"
              className="h-auto w-full rounded-[7px]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

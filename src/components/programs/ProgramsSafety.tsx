import Image from "next/image";

import Container from "@/components/ui/Container";
import IconList from "@/components/ui/IconList";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";

const PHOTO_FX = '{"translateY":{"speed":4,"affectedRange":{"start":0,"end":100}}}';

const SAFETY_ITEMS = [
  "The wellbeing of every child put first, in the classroom and at play",
  "A calm and orderly school, where children know that they are cared for",
  "Kindness and respect expected of everyone, so that children feel safe with one another",
  "Families who can feel confident about the whole of their child’s day",
  "Questions about your child’s health, care or safety always welcome at the school office",
];

/** post-46 #0da0cbc, the band that closes /programs. */
export default function ProgramsSafety() {
  return (
    <section className="programs-safety" aria-labelledby="programs-safety-title">
      <ShapeDivider position="bottom" />
      <Container>
        <div className="program-split program-split--reverse">
          <div>
            <div className="program-card">
              <h2 id="programs-safety-title" data-reveal="fadeIn" data-delay="200">
                Health and safety
              </h2>
              <div className="card-copy">
                <p>
                  At {site.name}, your child&rsquo;s wellbeing comes before everything else. We are
                  accredited by NESA for pre-primary and primary education, and we take the
                  responsibility of caring for other people&rsquo;s children seriously.
                </p>
                <p>What matters to us:</p>
              </div>
              <IconList items={SAFETY_ITEMS} className="font-bold" />
            </div>
          </div>

          <div
            className="programs-safety__photo"
            data-fx={PHOTO_FX}
            data-fx-range="page"
            data-fx-devices="desktop"
          >
            <Image
              src="/images/programs/pic-30-pj0d1skrx7gwoec60zswvd1cbrqrmdgbfoxl69n0rk.jpg"
              alt=""
              width={500}
              height={400}
              sizes="(min-width: 1025px) 50vw, 100vw"
              className="program-photo"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

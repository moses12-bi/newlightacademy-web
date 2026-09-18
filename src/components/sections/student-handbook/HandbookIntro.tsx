import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/**
 * post-1093 #dcea93f — a cream band with the snail along its bottom edge. The
 * photo slides under the white card that holds the two actions.
 */
export default function HandbookIntro() {
  return (
    <section className="handbook-intro">
      <Container>
        <div className="handbook-split">
          <div className="handbook-photo">
            <Image
              src="/images/student-handbook/h-09-pj0d5ajbga5ic3cvht75v01vrmze3zhsws234zzz3w.jpg"
              alt="Six women of different ages sitting together on a sofa, smiling at the camera"
              width={1000}
              height={550}
              sizes="(max-width: 1024px) 100vw, 50vw"
              data-fx='{"translateY":{"speed":2,"affectedRange":{"start":0,"end":100}}}'
              data-fx-devices="desktop,tablet"
            />
          </div>

          <div className="handbook-card">
            <h2 data-reveal="fadeIn" data-delay="200">
              {site.name}&apos;s Parent and Pupil Handbook
            </h2>
            <p>
              A parent and pupil handbook gathers the practical things families ask about — how the
              school day works, what we ask of pupils and how to reach us when you need to.
              <br />
              We have not published one here. Please contact the school office with any question, or
              read the short note below.
            </p>
            <div className="handbook-actions">
              {/* There is no handbook file to link yet, so this stays plain text
                  rather than a download that would not resolve. */}
              <span className="handbook-unavailable">Ask the school office</span>
              <Button href="#read" variant="outline">
                Read
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/** #5d7977a — the closing band about the wider team. */
export default function TeachersClosing() {
  return (
    <section className="teachers-closing">
      <Container>
        <div className="teachers-closing__inner">
          {/* #7830c78 — decorative display word, no reveal in the save. */}
          <p className="teachers-display">
            {site.name}
          </p>

          <div className="teachers-closing__split">
            {/* #9aa4fec — hidden on phones. #7d74ecc drifts left on scroll. */}
            <div className="teachers-closing__art max-md:hidden">
              <Image
                src="/images/home/illustration-people-2.svg"
                alt=""
                width={227}
                height={400}
                unoptimized
                data-fx='{"translateX":{"direction":"negative","speed":1,"affectedRange":{"start":0,"end":54}}}'
                data-fx-devices="desktop"
              />
            </div>

            <div className="teachers-closing__copy">
              <h2>teachers know every child by name.</h2>
              <div className="card-copy">
                <p>
                  Our nursery and primary teachers teach the Rwanda national curriculum, and they take time
                  with the children in front of them.
                </p>
                <p>
                  Children learn best when they feel settled and known, and we are always glad to hear from
                  families at home. We are a Christian school and an inclusive one: every child is welcome
                  here, and every child is encouraged to grow in confidence, character and faith.
                </p>
              </div>
              <div>
                <Button href="/about">Learn more</Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

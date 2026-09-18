import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/**
 * post-1095 #3b6a1e2 — the oversized "Come" lettering over a 1000px well that
 * invites a tour. The inner section carries `elementor-reverse-mobile` and its
 * illustration column is `elementor-hidden-phone`.
 */
export default function CalendarVisit() {
  return (
    <section className="calendar-visit">
      <Container>
        <div
          className="calendar-come"
          data-fx='{"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":40}}}'
          data-fx-devices="desktop"
        >
          Come
        </div>

        <div className="calendar-visit__inner">
          <div className="calendar-visit__art">
            <Image
              src="/images/home/illustration-people-2.svg"
              alt=""
              width={227}
              height={400}
              unoptimized
              data-fx='{"translateX":{"direction":"negative","speed":1,"affectedRange":{"start":0,"end":54}}}'
              data-fx-devices="desktop,tablet,mobile"
            />
          </div>

          <div className="calendar-visit__copy">
            <h2>over and look around.</h2>
            <p>
              The dates above are the national school calendar set by the Ministry of Education and
              administered by NESA, which we follow. A school still sets its own opening day and any
              additional dates of its own, so please confirm those with the school office. You are
              also very welcome to come and see {site.name} for yourself — the contact details are
              below.
            </p>
            <div className="calendar-visit__actions">
              <Button href="/schedule-a-tour">Schedule a tour</Button>
              <p className="calendar-visit__or">or</p>
              <Button href="/how-to-apply" variant="outline">
                See how to apply
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

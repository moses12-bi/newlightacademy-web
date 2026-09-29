import type { Metadata } from "next";
import Image from "next/image";

import DailyScheduleList from "@/components/sections/daily-schedule/DailyScheduleList";
import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Daily Schedule",
  description: `How a school day is shaped at ${site.name}, and how families are given the timetable for their own child's class.`,
};

export default function DailySchedulePage() {
  return (
    /* #be4501c — one section, a sticky 40% column and the schedule beside it. */
    <section className="daily">
      <Container>
        <div className="daily__layout">
          <div className="daily__aside">
            {/* #75276b1c: `sticky: top`, 100px offset, desktop and tablet only. */}
            <div className="daily__sticky">
              {/* The nested template post-2265 supplies the title, lead and art. */}
              <h1 className="daily__title">Daily schedule</h1>
              <p className="daily__lead">
                Our days give children time to learn together with their teacher and time to explore, ask
                questions and play. The timetable for your child&rsquo;s class is shared with you when they join us.
              </p>
              <div className="daily__art">
                {/* #45fef99b: wobble on entry, then a slow counter-rotation on scroll. */}
                <Image
                  src="/images/home/illustration-people-2.svg"
                  alt=""
                  width={227}
                  height={400}
                  unoptimized
                  data-reveal="wobble"
                  data-fx='{"rotateZ":{"direction":"negative","speed":1.2,"affectedRange":{"start":0,"end":50}}}'
                  data-fx-devices="desktop"
                />
              </div>
            </div>
          </div>

          <DailyScheduleList />
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";

import Container from "@/components/ui/Container";
import Counter from "@/components/ui/Counter";
import { site } from "@/lib/site";

interface Stat {
  end: number;
  suffix?: string;
  label: string;
}

/**
 * #77ad163 — two counters in the narrow column, two in the wide one.
 *
 * Both arrays are empty on purpose: the school has not given us a figure for
 * anything countable, and a number on a school website reads as a fact. Add
 * confirmed figures here (two per column) and the block renders itself again.
 */
const STATS_LEFT: Stat[] = [];
const STATS_RIGHT: Stat[] = [];

function StatBlock({ stat }: { stat: Stat }) {
  return (
    <div className="teachers-stat">
      {/* #cced62e and friends: `_animation: zoomIn` on the counter... */}
      <div data-reveal="zoomIn">
        <Counter end={stat.end} suffix={stat.suffix} />
      </div>
      {/* ...and `slideInUp` on the label, which is its own widget. */}
      <div className="teachers-stat__label" data-reveal="slideInUp">
        {stat.label}
      </div>
    </div>
  );
}

/** #a26fb86 — the teaching team, in a 1000px well. */
export default function TeachersProfile() {
  return (
    <section className="teachers-profile">
      <Container>
        <div className="teachers-profile__inner">
          {/* #edea31b: the column itself reveals with fadeIn after 500ms. */}
          <div className="teachers-profile__photo" data-reveal="fadeIn" data-delay="500">
            {/* #a07e97c — desktop and tablet only. */}
            <div className="teachers-profile__portrait max-md:hidden">
              <Image
                src="/images/our-teachers/Woman_pic-406x1024.png"
                alt="A portrait of a woman standing with her arms folded"
                width={406}
                height={1024}
                sizes="(max-width: 1024px) 45vw, 480px"
              />
            </div>
            {/* #48c9651 — phones only. */}
            <div className="teachers-profile__mobile-photo md:hidden">
              <Image
                src="/images/home/parents-1.jpg"
                alt="A portrait of a smiling woman"
                width={680}
                height={380}
                sizes="100vw"
              />
            </div>
          </div>

          <div className="teachers-profile__copy">
            <h2>Our teachers</h2>
            {/* The save marks the role as an h4 directly under the h2; rendered as a
                paragraph so the page outline has no level skip. */}
            <p className="teachers-profile__role">Nursery and primary</p>
            <p className="teachers-profile__intro">
              Our teachers work across the nursery and primary classes, following the Rwanda national
              curriculum and keeping learning, care and character at the centre of the school day.
            </p>

            {STATS_LEFT.length > 0 || STATS_RIGHT.length > 0 ? (
              <div className="teachers-stats">
                <div className="teachers-stats__col">
                  {STATS_LEFT.map((stat) => (
                    <StatBlock key={stat.label} stat={stat} />
                  ))}
                </div>
                <div className="teachers-stats__col">
                  {STATS_RIGHT.map((stat) => (
                    <StatBlock key={stat.label} stat={stat} />
                  ))}
                </div>
              </div>
            ) : null}

            <p className="teachers-profile__story">
              From Baby Class through to P6, we want every classroom to be a place where a child is known by
              name, encouraged to try, and given the time to understand.
            </p>

            <div className="teachers-profile__sign-wrap">
              <Image
                src="/images/our-teachers/sign-orange.svg"
                alt=""
                width={110}
                height={69}
                unoptimized
                className="teachers-profile__sign"
              />
            </div>

            {/* #d5049bc — hidden on phones in the save. */}
            <p className="teachers-profile__since max-md:hidden">
              <em>The {site.name} teaching team</em>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

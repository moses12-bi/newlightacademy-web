import Link from "next/link";

import Container from "@/components/ui/Container";

/**
 * "Key dates" — post-2461 #aa3d687.
 *
 * A cream band holding four Elementor columns: the heading, then three blocks
 * whose widths are deliberately uneven on desktop (40 / 24 / 18.333 /
 * 17.607 %), even quarters on tablet and stacked on phones. The `<strong>`/
 * `<br>` structure, the column count and the link targets are the saved ones.
 *
 * The saved band printed two hard dates (an application deadline and a
 * financial-aid deadline) belonging to another school. We hold no term dates,
 * intake dates or fee arrangements for this school, so the dated lines are
 * replaced with the honest instruction to ask the office; nothing here is
 * invented and nothing goes stale.
 */
export default function AdmissionsKeyDates() {
  return (
    <section className="adm-band adm-band--cream adm-dates" aria-labelledby="admissions-key-dates">
      <Container>
        <div className="adm-row adm-row--wide">
          <div className="adm-dates__label">
            <h2 id="admissions-key-dates">Where to start</h2>
          </div>

          <div className="adm-dates__col adm-copy adm-stack">
            <p>
              <strong>Come and see us ( nursery &amp; primary )</strong>
              <br />
              <Link href="/schedule-a-tour">Ask about visiting</Link>
            </p>
          </div>

          <div className="adm-dates__col adm-dates__col--b adm-copy adm-stack">
            <p>Ask us which places are open.</p>
            <p>
              <strong>Applying for a place</strong>
              <br />
              <Link href="/how-to-apply">See how to apply</Link>
            </p>
          </div>

          <div className="adm-dates__col adm-dates__col--c adm-copy adm-stack">
            <p>Confirmed with the school office.</p>
            <p>
              <strong>Fees and arrangements</strong>{" "}
              <br />
              <Link href="/tuition">Ask about fees</Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

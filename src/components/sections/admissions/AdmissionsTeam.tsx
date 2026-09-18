import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/**
 * "Our school would love to learn about you and your family." — post-2461
 * #5b7598b.
 *
 * The word "Our" is a separate heading widget set in the theme's Sensei face at
 * 240px (131px tablet, 80px phone); the sentence it opens continues in the h2
 * beneath it, so the word is kept as real text and read in order rather than
 * hidden. Elementor scales it slightly on scroll, which `data-fx` reproduces.
 */
export default function AdmissionsTeam() {
  return (
    <section className="adm-team" aria-labelledby="admissions-team">
      <Container>
        <p
          className="adm-bigword"
          data-fx='{"scale":{"speed":2,"direction":"in-out","range":{"start":0,"end":30}}}'
          data-fx-devices="desktop"
        >
          Our
        </p>

        <div className="adm-team__heading">
          <h2 id="admissions-team">
            school would love to learn about you and your family.
          </h2>
        </div>

        <div className="adm-team__copy adm-copy">
          <p>
            {site.name} is a welcoming Christian school offering a continuous education from
            nursery through to P6. We are an inclusive school, and families from across our
            community are welcome here. Tell us about your child, and ask us anything you need to
            know before you choose a school.
          </p>
        </div>
      </Container>
    </section>
  );
}

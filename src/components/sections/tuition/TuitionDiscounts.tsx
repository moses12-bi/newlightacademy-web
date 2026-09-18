import Container from "@/components/ui/Container";
import { site } from "@/lib/site";

/**
 * "We are here to help you plan ahead" — post-1066 #0a9aad3.
 *
 * The sentence is split across two Elementor columns: the word "We" set in the
 * theme's Sensei face at 200px (150px tablet, 80px phone), then the h2 that
 * finishes it. The word stays real text so the sentence still reads in order.
 */
export default function TuitionDiscounts() {
  return (
    <section className="tui-discounts" aria-labelledby="tuition-discounts">
      <Container>
        <div className="tui-discounts__well adm-row">
          <div className="tui-discounts__word">
            <p
              className="adm-bigword"
              data-fx='{"scale":{"speed":2,"direction":"in-out","range":{"start":0,"end":40}}}'
              data-fx-devices="desktop,tablet"
            >
              We
            </p>
          </div>

          <div className="tui-discounts__copy adm-copy">
            <h2 id="tuition-discounts">are here to help you plan ahead</h2>
            <p className="mt-5">
              We know that fees are part of choosing a school, and we would rather talk about them
              with you than leave you guessing. {site.name} does not list its fees on this page —
              please ask the school office, and they will tell you what applies to your child.
              Get in touch before you apply, or at any point along the way — we are always happy
              to talk.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

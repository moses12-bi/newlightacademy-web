import Container from "@/components/ui/Container";

/**
 * post-3216 #1c8cb9a0. Unlike the other twenty saved pages, this title band is
 * plain white with no wavy edges and no illustration: the second column of the
 * saved section is empty and carries `elementor-hidden-phone`, so only the
 * heading column is rendered here.
 */
export default function ParentsHero() {
  return (
    <section className="parents-hero">
      <Container>
        <div className="parents-hero__copy">
          <h1 data-reveal="fadeIn">For Our Parents</h1>
        </div>
      </Container>
    </section>
  );
}

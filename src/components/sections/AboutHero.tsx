import Image from "next/image";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { site } from "@/lib/site";

export default function AboutHero() {
  return (
    <section className="about-hero relative overflow-hidden bg-accent-8">
      <ShapeDivider position="top" />
      <ShapeDivider position="bottom" />

      <Container className="hero-layout">
        <div className="hero-copy flex flex-col gap-[10px]">
          <h1 data-reveal="fadeIn">About</h1>
          <p data-reveal="fadeIn" data-delay="200" className="hero-subtitle">
            Get to know {site.name}: a Christian nursery and primary day school in Kinyinya,
            Kigali, where every child is known by name, cared for and encouraged to learn.
          </p>
        </div>

        <div className="hero-art" data-reveal="bounceInUp">
          <div data-motion="fox">
            <Image
              src="/images/fox-color.svg"
              alt=""
              width={157}
              height={145}
              priority
              unoptimized
              className="hero-fox"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

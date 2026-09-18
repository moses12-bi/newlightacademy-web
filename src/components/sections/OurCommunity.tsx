import Image from "next/image";

import Container from "@/components/ui/Container";
import FacebookShareLink from "@/components/sections/FacebookShareLink";
import { site } from "@/lib/site";

export default function OurCommunity() {
  return (
    <section className="community-section relative overflow-hidden">
      <div className="community-decoration" aria-hidden="true">
        <div data-motion="snail" className="community-snail" />
      </div>
      <Container className="section-layout">
        <div className="section-photo">
          {/* negative margin on the block, so the photo gains 40px of width to
              the right rather than shifting and leaving a gap on the left */}
          <div data-motion="photo" className="photo-motion">
            <Image
              src="/images/h-09.jpg"
              alt="Six women of different ages sitting close together on a sofa, laughing"
              width={1000}
              height={650}
              sizes="(min-width: 1320px) 670px, (min-width: 1025px) 50vw, 100vw"
              className="h-auto w-full rounded-[7px]"
            />
          </div>
        </div>

        <div className="section-card">
          <h2 data-reveal="fadeIn" data-delay="200">Our community</h2>
          <div className="card-copy mt-5">
            <p>
              {site.name} is in Kinyinya, a short walk from the Kinyinya bus station, so the school is
              easy to reach for drop-off, for pick-up or for a visit. Being close by is part of
              what makes a school feel like one community: parents, teachers and children who
              know one another.
            </p>
            <p>
              In the classroom we encourage active learning, curiosity and the development of strong
              foundational skills, with practical activities suited to the age of each class. Beside
              reading, writing and numeracy we give the same attention to how children treat one
              another, because kindness, respect and confidence are what make a classroom a good
              place to learn.
            </p>
          </div>
          <FacebookShareLink
            label="Facebook"
            className="theme-button mt-6 inline-flex items-center gap-3 rounded-[8px] bg-[var(--color-facebook)] px-5 py-3 text-base font-semibold text-accent-5 transition-opacity duration-300 hover:opacity-85"
          />
        </div>
      </Container>
    </section>
  );
}

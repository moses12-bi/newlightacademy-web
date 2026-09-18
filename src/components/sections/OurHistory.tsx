import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import IconList from "@/components/ui/IconList";
import VideoFrame from "@/components/ui/VideoFrame";
import { site } from "@/lib/site";

const STATS: string[] = [
  "Nursery and primary in one school, from Baby Class through to P6",
  `A Christian school, guided by the motto “${site.motto}”`,
  "One child, one family, one step at a time",
];

export default function OurHistory() {
  return (
    <section className="history-section relative overflow-hidden">
      <Container className="section-layout">
        <div className="history-tv">
          <Image
            src="/images/tv-top.svg"
            alt=""
            width={266}
            height={129}
            unoptimized
            className="mx-auto block h-auto w-[266px] max-w-full"
          />
          <div className="-my-px overflow-hidden rounded-[36px] border-[20px] border-solid border-accent-3">
            <VideoFrame videoId="67ouh2PgUfk" title="Introductory video" poster="/images/school/campus-courtyard.jpg" />
          </div>
          <Image
            src="/images/tv-bottom.svg"
            alt=""
            width={205}
            height={53}
            unoptimized
            className="mx-auto block h-auto w-[205px] max-w-full"
          />
        </div>

        <div className="history-copy">
          <h2 data-reveal="fadeIn" data-delay="200">What we stand for</h2>
          <p className="mt-5">
            {site.name} is a Christian nursery and primary day school in Kinyinya, Gasabo. Our
            motto is “{site.motto}”, and it shapes the way we teach: children
            are known by name, guided with patience and encouraged to be kind, honest and curious.
            We are an inclusive school, accredited by NESA, and we follow the Rwanda national
            curriculum from the nursery classes through to P6, so that every pupil is ready for the
            Primary Leaving Examination and for the years that come after it.
          </p>
          <IconList items={STATS} className="mt-5 font-bold" />
          <div className="pt-[10px]">
            <Button href="/our-teachers" variant="outline">
              Learn more
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

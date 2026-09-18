import Image from "next/image";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import VideoFrame from "@/components/ui/VideoFrame";
import { site } from "@/lib/site";

/* #0d723c8 — the illustration drifts left over the first half of its travel. */
const PEOPLE_FX = JSON.stringify({
  translateX: { speed: 1, direction: "negative", affectedRange: { start: 0, end: 49 } },
});

/**
 * "<school> believes learning begins with care…" (post-1104 #7473be5): the TV
 * with the video, the copy column and the standing illustration.
 */
export default function Home2Approach() {
  return (
    <section className="home2-approach">
      <Container>
        <p className="home2-word" data-reveal="zoomInDown">
          {site.name}
        </p>

        <div className="home2-approach__row">
          <div className="home2-approach__tv">
            <Image
              src="/images/tv-top.svg"
              alt=""
              width={266}
              height={129}
              unoptimized
              className="home2-tv-top"
              data-reveal="jello"
            />
            <div className="home2-tv-screen">
              <VideoFrame
                videoId="67ouh2PgUfk"
                title="Children learning and playing together"
                poster="/images/home/parents-1.jpg"
              />
            </div>
            <Image
              src="/images/tv-bottom.svg"
              alt=""
              width={205}
              height={53}
              unoptimized
              className="home2-tv-bottom"
            />
          </div>

          <div className="home2-approach__copy card-copy">
            <h2>believes learning begins with care.</h2>
            <p>
              We are a Christian nursery and primary day school in Kinyinya, Gasabo, following the
              Rwanda national curriculum. Our days hold guided lessons alongside time to play, talk
              and explore, so that learning feels natural to a child.
            </p>
            <p>We know that children grow at different rates, and we teach them as they are.</p>
            <div className="home2-approach__cta">
              <Button href="/about" variant="outline">
                Learn more
              </Button>
            </div>
          </div>

          <div className="home2-approach__people">
            <Image
              src="/images/home/illustration-people-3.svg"
              alt=""
              width={280}
              height={494}
              unoptimized
              data-fx={PEOPLE_FX}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

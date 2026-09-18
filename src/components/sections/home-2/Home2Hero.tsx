import Image from "next/image";

const mouse = (speed: number, negative = false): string =>
  JSON.stringify({ mouseTrack: { speed, direction: negative ? "negative" : "" } });

const JUMP_FX = JSON.stringify({
  mouseTrack: { speed: 0.1, direction: "negative" },
  tilt: { speed: 0.7 },
});

/**
 * The `/home-2` opening band (post-1104 #1e2d0f5 / #d9a5061): a pink stage with
 * the dot pattern behind it, three cut-out photographs and the five-line title,
 * closed off by the white wave head.
 *
 * The saved title is five separate h1 widgets; they become five lines of one h1
 * here so the page has a single top-level heading.
 */
export default function Home2Hero() {
  return (
    <section className="home2-hero">
      <div className="home2-hero__stage">
        <div className="home2-hero__col home2-hero__col--kid">
          <Image
            src="/images/home-2/image-kid-tifec.png"
            alt=""
            width={800}
            height={721}
            priority
            sizes="27vw"
            className="home2-hero__kid"
            data-reveal="slideInUp"
            data-delay="100"
            data-fx={mouse(0.1)}
            data-fx-devices="desktop,tablet,mobile"
          />
        </div>

        <div className="home2-hero__col home2-hero__col--title" data-reveal="zoomIn" data-delay="500">
          <h1
            className="home2-hero__title"
            data-fx={mouse(0.3)}
            data-fx-devices="desktop,tablet,mobile"
          >
            <span className="home2-hero__line home2-hero__line--1">Where</span>
            <span className="home2-hero__line home2-hero__line--2">children</span>
            <span className="home2-hero__line home2-hero__line--3">are happy to</span>
            <span className="home2-hero__line home2-hero__line--4">LEARN</span>
            <span className="home2-hero__line home2-hero__line--5">every day</span>
          </h1>
        </div>

        <div className="home2-hero__col home2-hero__col--jump">
          {/* #202d1da hangs its widget 260px into the title column, so the
              negative margin belongs to the wrapper, not the photograph. */}
          <div className="home2-hero__jump-wrap">
            <Image
              src="/images/home-2/image-jump-child.png"
              alt=""
              width={800}
              height={931}
              priority
              sizes="39vw"
              className="home2-hero__jump"
              data-reveal="zoomInDown"
              data-fx={JUMP_FX}
              data-fx-devices="desktop,tablet,mobile"
            />
          </div>
        </div>

        <div className="home2-hero__col home2-hero__col--kid2">
          <Image
            src="/images/home-2/kid-tifec-743x1024.png"
            alt=""
            width={743}
            height={1024}
            sizes="27vw"
            className="home2-hero__kid2"
            data-reveal="fadeInUp"
            data-delay="500"
            data-fx={mouse(0.4)}
            data-fx-devices="desktop,tablet,mobile"
          />
        </div>
      </div>

      {/* #358428e — the wave head is pulled up over the foot of the stage. */}
      <div className="home2-hero__wave">
        <Image
          src="/images/home-2/slider2-wave_head_small.svg"
          alt=""
          width={3168}
          height={486}
          unoptimized
          priority
        />
      </div>
    </section>
  );
}

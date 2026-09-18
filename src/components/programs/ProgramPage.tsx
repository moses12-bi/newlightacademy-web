import Image from "next/image";

import AgeCards from "@/components/programs/AgeCards";
import VideoLightbox from "@/components/programs/VideoLightbox";
import {
  ABOUT_INVITE,
  ABOUT_PARAGRAPHS,
  CARE_INTRO,
  CARE_ITEMS,
  HERO_VIDEO_ID,
  PROGRAM_LEAD,
  SIGNATURE_INTRO,
  SIGNATURE_ITEMS,
  type Program,
} from "@/components/programs/program-data";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import IconList from "@/components/ui/IconList";
import PageHero from "@/components/ui/PageHero";
import ShapeDivider from "@/components/ui/ShapeDivider";
import { hasPhone, site } from "@/lib/site";

/** Elementor's scroll effects, transcribed from each widget's data-settings. */
const SENSEI_FX = '{"scale":{"direction":"in-out","speed":2,"range":{"start":0,"end":40}}}';
const PEOPLE_FX =
  '{"translateX":{"direction":"negative","speed":1,"affectedRange":{"start":0,"end":54}}}';
const PHOTO_FX = '{"translateY":{"speed":4,"affectedRange":{"start":0,"end":100}}}';

const PHOTO_SIZES = "(min-width: 768px) 50vw, 100vw";

export interface ProgramPageProps {
  program: Program;
}

/**
 * The shared body of /infants, /toddlers, /preschool, /kindergarten,
 * /flex-care and /art-program. All six are the same Elementor template, so the
 * markup lives here once and each route file passes its data entry.
 *
 * Section order follows the save: video hero, "About", "Care for every child",
 * "<program> program", "How we teach", then the four age cards.
 */
export default function ProgramPage({ program }: ProgramPageProps) {
  return (
    <>
      {/*
        The saved hero plays a YouTube clip as its section background. Nothing
        external may load before a gesture, so the band keeps the theme's deep
        teal and the video stays behind the play button.
      */}
      <PageHero
        variant="media"
        title={program.title}
        lead={program.lead}
        dividers={{ top: false, bottom: true }}
      >
        <VideoLightbox videoId={HERO_VIDEO_ID} label="Play the video" />
      </PageHero>

      {/* ----------------------------------------------------------- About */}
      <section className="program-about" aria-labelledby={`${program.slug}-about`}>
        <Container>
          <p className="program-sensei" data-fx={SENSEI_FX} data-fx-devices="desktop">
            About
          </p>

          <div className="program-about__inner">
            <div className="program-about__art" data-fx={PEOPLE_FX} data-fx-devices="desktop">
              <Image
                src="/images/home/illustration-people-2.svg"
                alt=""
                width={227}
                height={400}
                unoptimized
              />
            </div>

            <div className="program-about__copy">
              <h2 id={`${program.slug}-about`}>{program.aboutHeading}</h2>
              <div className="card-copy">
                {ABOUT_PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p>{ABOUT_INVITE}</p>
              <div className="program-about__actions">
                {hasPhone() ? <Button href={site.phoneHref}>Call us</Button> : null}
                <Button href="/location" variant="outline">
                  Directions
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------- Care for every child */}
      <section className="program-care" aria-labelledby={`${program.slug}-care`}>
        <ShapeDivider position="top" />
        <Container>
          <div className="program-split program-split--reverse">
            <div>
              <div className="program-card">
                <h2 id={`${program.slug}-care`} data-reveal="fadeIn" data-delay="200">
                  Care for every child
                </h2>
                <p>{CARE_INTRO}</p>
                <IconList items={[...CARE_ITEMS]} className="font-bold" />
                <div>
                  <Button href="/about" variant="outline">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="program-care__photo"
              data-fx={PHOTO_FX}
              data-fx-range="page"
              data-fx-devices="desktop"
            >
              <Image
                src={program.carePhoto.src}
                alt=""
                width={program.carePhoto.width}
                height={program.carePhoto.height}
                sizes={PHOTO_SIZES}
                className="program-photo"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------- "<program> program" */}
      <section className="program-detail" aria-labelledby={`${program.slug}-program`}>
        <Container>
          <div className="program-split">
            <div
              className="program-detail__photo"
              data-fx={PHOTO_FX}
              data-fx-range="page"
              data-fx-devices="desktop"
            >
              <Image
                src={program.programPhoto.src}
                alt=""
                width={program.programPhoto.width}
                height={program.programPhoto.height}
                sizes={PHOTO_SIZES}
                className="program-photo"
              />
            </div>

            <div>
              <div className="program-card">
                <h2 id={`${program.slug}-program`} data-reveal="fadeIn" data-delay="200">
                  {program.programHeading}
                </h2>
                <p>{PROGRAM_LEAD}</p>
                <p>{program.programNote}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- How we teach */}
      <section className="program-signature" aria-labelledby={`${program.slug}-signature`}>
        <ShapeDivider position="bottom" />
        <Container>
          <div className="program-split program-split--reverse">
            <div>
              <div className="program-card">
                <h2 id={`${program.slug}-signature`} data-reveal="fadeIn" data-delay="200">
                  How we teach
                </h2>
                <p>{SIGNATURE_INTRO}</p>
                <IconList items={[...SIGNATURE_ITEMS]} className="font-bold" />
              </div>
            </div>

            <div
              className="program-signature__photo"
              data-fx={PHOTO_FX}
              data-fx-range="page"
              data-fx-devices="desktop"
            >
              <Image
                src={program.signaturePhoto.src}
                alt=""
                width={program.signaturePhoto.width}
                height={program.signaturePhoto.height}
                sizes={PHOTO_SIZES}
                className="program-photo"
              />
            </div>
          </div>
        </Container>
      </section>

      <AgeCards variant="detail" />
    </>
  );
}

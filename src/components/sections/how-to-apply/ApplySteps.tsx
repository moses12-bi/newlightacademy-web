import Image from "next/image";
import { Fragment } from "react";
import type { CSSProperties } from "react";

import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";
import type { RevealDelay } from "@/components/ui/PageHero";
import { StepNumeral, type StepNumber } from "@/components/sections/admissions/GroupIcons";
import { site } from "@/lib/site";

interface Step {
  number: StepNumber;
  title: string;
  description: string;
  href: string;
  disc: string;
  titleColor?: string;
  iconSize: string;
  delay?: RevealDelay;
}

/**
 * The four application steps — post-1064 #33fd8ac, in a 920px well.
 *
 * The saved captions named a US grade range and a sign-up the school does not
 * run. We hold no description of this school's admissions process, so the four
 * panels invite a family to get in touch rather than setting out steps we
 * cannot confirm.
 *
 * Seven columns on desktop (step, stroke, step, stroke, step, stroke, step);
 * the three stroke columns are hidden on tablet and phone, where the four steps
 * fall into a 2x2 grid. `/for-our-parents/` in the save is this app's
 * `/parents` route.
 *
 * The saved titles are `h4`; they are rendered as `h3` so the outline has no
 * gap, with the original 20/18/16px scale pinned in the page stylesheet.
 */
const STEPS: Step[] = [
  {
    number: 1,
    title: "Get in touch",
    description: "Contact the school office",
    href: "/daily-schedule",
    disc: "var(--color-accent-1)",
    iconSize: "58px",
  },
  {
    number: 2,
    title: "Application",
    description: "Tell us about your child",
    href: "/schedule-a-tour",
    disc: "var(--color-accent-2)",
    titleColor: "var(--color-accent-2)",
    iconSize: "60px",
    delay: "200",
  },
  {
    number: 3,
    title: "Your questions",
    description: "Ask us anything you need to know",
    href: "/parents",
    disc: "var(--color-brand-purple)",
    titleColor: "var(--color-brand-purple)",
    iconSize: "60px",
    delay: "400",
  },
  {
    number: 4,
    title: "Deciding together",
    description: `Whether ${site.name} is right for your child`,
    href: "/daily-schedule",
    disc: "var(--color-brand-gold)",
    titleColor: "var(--color-brand-amber)",
    iconSize: "60px",
    delay: "400",
  },
];

const BOX_CLASS = [
  "hta-steps__box",
  "hta-steps__box hta-steps__box--b",
  "hta-steps__box hta-steps__box--c",
  "hta-steps__box hta-steps__box--d",
];
const STROKE_CLASS = [
  "hta-steps__stroke adm-steps__stroke",
  "hta-steps__stroke hta-steps__stroke--b adm-steps__stroke",
  "hta-steps__stroke hta-steps__stroke--c adm-steps__stroke",
];
const STROKE_DELAY = ["0", "100", "100"];

export default function ApplySteps() {
  return (
    <section className="hta-steps">
      <Container>
        <div className="hta-steps__well adm-row hta-steps__row">
          {STEPS.map((step, index) => (
            <Fragment key={step.title}>
              <div className={BOX_CLASS[index]}>
                <IconBox
                  className="adm-step"
                  style={
                    {
                      "--adm-step-disc": step.disc,
                      ...(step.titleColor ? { "--adm-step-title": step.titleColor } : null),
                      "--w-iconbox-icon-size": step.iconSize,
                    } as CSSProperties
                  }
                  icon={
                    <span className="adm-step__disc">
                      <StepNumeral value={step.number} />
                    </span>
                  }
                  title={step.title}
                  titleTag="h3"
                  description={step.description}
                  href={step.href}
                  reveal="fadeIn"
                  delay={step.delay}
                />
              </div>

              {index < STEPS.length - 1 ? (
                <div
                  className={STROKE_CLASS[index]}
                  data-reveal="fadeInLeft"
                  data-delay={STROKE_DELAY[index]}
                  aria-hidden="true"
                >
                  <Image
                    src="/images/shared/just_stroke.svg"
                    alt=""
                    width={486}
                    height={115}
                    unoptimized
                  />
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
}

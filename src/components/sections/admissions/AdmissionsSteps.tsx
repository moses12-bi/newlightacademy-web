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
  /** The disc colour behind the numeral. */
  disc: string;
  titleColor?: string;
  iconSize: string;
  delay?: RevealDelay;
}

/**
 * The three enrolment steps — post-2461 #70325f8.
 *
 * Five columns on desktop: step, hand-drawn stroke, step, stroke, step. The two
 * stroke columns carry `elementor-hidden-tablet elementor-hidden-phone`, so
 * below 1025px the row becomes three equal columns and then a single stack.
 *
 * The saved titles are `h4`; they are rendered one level up so the document
 * outline stays h1 > h2 > h3 without a skipped level.
 */
const STEPS: Step[] = [
  {
    number: 1,
    title: "First step",
    description: `Ask us about coming to see ${site.name}.`,
    href: "/schedule-a-tour",
    disc: "var(--color-accent-1)",
    iconSize: "58px",
  },
  {
    number: 2,
    title: "Second step",
    description: "Send us an application and tell us about your child.",
    href: "/how-to-apply",
    disc: "var(--color-accent-2)",
    titleColor: "var(--color-accent-3)",
    iconSize: "60px",
    delay: "200",
  },
  {
    number: 3,
    title: "Third step",
    description: "Ask us anything you still want to know.",
    href: "/schedule-a-tour",
    disc: "var(--color-brand-purple)",
    titleColor: "var(--color-accent-3)",
    iconSize: "60px",
    delay: "400",
  },
];

const BOX_CLASS = ["adm-steps__box", "adm-steps__box adm-steps__box--b", "adm-steps__box adm-steps__box--c"];
const STROKE_CLASS = ["adm-steps__stroke", "adm-steps__stroke adm-steps__stroke--b"];
const STROKE_DELAY = ["0", "100"];

export default function AdmissionsSteps() {
  return (
    <section className="adm-steps adm-steps--three">
      <Container>
        <div className="adm-row adm-steps__row">
          {STEPS.map((step, index) => (
            <Fragment key={step.title}>
              <div className={BOX_CLASS[index]}>
                <IconBox
                  className="adm-step adm-step--panel"
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

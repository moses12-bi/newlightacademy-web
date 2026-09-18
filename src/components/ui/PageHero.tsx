import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

/** Entrance animation names PageMotion can play (globals.css + styles/widgets.css). */
export type RevealName =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "bounceIn"
  | "bounceInUp"
  | "bounceInDown"
  | "zoomIn"
  | "zoomInDown"
  | "zoomInLeft"
  | "rotateInUpLeft"
  | "rotateInUpRight"
  | "rotateInDownLeft"
  | "rotateInDownRight"
  | "slideInUp"
  | "headShake"
  | "swing"
  | "wobble"
  | "rubberBand"
  | "jello";

/** Delays that have a matching `[data-delay]` rule. */
export type RevealDelay =
  | "100"
  | "150"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "1000"
  | "1100"
  | "1200"
  | "1700"
  | "1900";

/**
 * Every captured `theme-page-title` hero puts the same saved motion_fx on its
 * illustration — `scale`, in-out, 50-100%, speed 6, desktop only — so it is the
 * default here rather than being retyped in a dozen page files. A hero whose
 * saved settings carry no motion_fx passes `fx: null`.
 */
export const HERO_ART_FX =
  '{"scale":{"direction":"in-out","range":{"start":50,"end":100},"speed":6}}';

export interface PageHeroImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** SVG sources need this: next.config.ts does not enable SVG optimisation. */
  unoptimized?: boolean;
  reveal?: RevealName;
  delay?: RevealDelay;
  /** Scroll motion_fx JSON; defaults to `HERO_ART_FX`, `null` switches it off. */
  fx?: string | null;
  /** Device list for `fx`; the saved heroes are desktop-only. */
  fxDevices?: string;
}

export interface PageHeroProps {
  title: string;
  lead?: ReactNode;
  image?: PageHeroImage;
  /** Wavy edges. The saved heroes carry both unless the page CSS says otherwise. */
  dividers?: { top?: boolean; bottom?: boolean };
  /**
   * Divider colours, from each section's `.elementor-shape-fill`. Defaults to
   * white, which is what every captured hero uses on top.
   */
  dividerFill?: { top?: string; bottom?: string };
  titleReveal?: RevealName;
  titleDelay?: RevealDelay;
  leadReveal?: RevealName;
  leadDelay?: RevealDelay;
  /** The saved art columns carry `elementor-hidden-phone`. */
  imageHiddenOnPhone?: boolean;
  /** `media` is the video-background hero used by the six age/program pages. */
  variant?: "cream" | "media";
  /** Local poster for the media variant. Nothing external is requested. */
  backdrop?: ReactNode;
  overlayColor?: string;
  overlayOpacity?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * The `theme-page-title` band that opens 21 of the 25 saved pages: a cream
 * section that slides under the header, the page h1, an optional lead
 * paragraph, and an optional decorative illustration hanging off the bottom
 * right. Measurements are ported in src/styles/widgets.css.
 */
export default function PageHero({
  title,
  lead,
  image,
  dividers,
  dividerFill,
  titleReveal = "fadeIn",
  titleDelay,
  leadReveal = "fadeIn",
  leadDelay = "200",
  imageHiddenOnPhone = true,
  variant = "cream",
  backdrop,
  overlayColor,
  overlayOpacity,
  className,
  style,
  children,
}: PageHeroProps) {
  const showTop = dividers?.top ?? true;
  const showBottom = dividers?.bottom ?? true;

  const cssVars: Record<string, string> = {};
  if (dividerFill?.top) cssVars["--w-wave-top"] = dividerFill.top;
  if (dividerFill?.bottom) cssVars["--w-wave-bottom"] = dividerFill.bottom;
  if (overlayColor) cssVars["--w-hero-overlay"] = overlayColor;
  if (overlayOpacity !== undefined) cssVars["--w-hero-overlay-opacity"] = String(overlayOpacity);
  const sectionStyle = { ...style, ...cssVars } as CSSProperties;

  const classes = ["w-hero", variant === "media" ? "w-hero--media" : null, className]
    .filter(Boolean)
    .join(" ");

  const artClasses = ["w-hero__art", imageHiddenOnPhone ? "max-md:hidden" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} style={sectionStyle}>
      {backdrop ? <div className="w-hero__backdrop">{backdrop}</div> : null}
      {backdrop ? <div className="w-hero__overlay" /> : null}

      {showTop ? <ShapeDivider position="top" className="w-wave--top" /> : null}
      {showBottom ? <ShapeDivider position="bottom" className="w-wave--bottom" /> : null}

      <Container className="w-hero__container">
        <div className="w-hero__layout">
          <div className="w-hero__copy">
            <h1 data-reveal={titleReveal} data-delay={titleDelay}>
              {title}
            </h1>
            {lead ? (
              <div className="w-hero__lead" data-reveal={leadReveal} data-delay={leadDelay}>
                {lead}
              </div>
            ) : null}
            {children}
          </div>

          {image ? (
            <div className={artClasses}>
              <div
                className="w-hero__art-inner"
                data-reveal={image.reveal ?? "bounceInUp"}
                data-delay={image.delay}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  priority
                  unoptimized={image.unoptimized}
                  className="w-hero__image"
                  data-fx={image.fx === null ? undefined : (image.fx ?? HERO_ART_FX)}
                  data-fx-devices={image.fx === null ? undefined : (image.fxDevices ?? "desktop")}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

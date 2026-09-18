import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { RevealDelay, RevealName } from "@/components/ui/PageHero";

export type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

export interface ImageBoxImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  /** SVG sources need this: next.config.ts does not enable SVG optimisation. */
  unoptimized?: boolean;
}

export interface ImageBoxProps {
  image: ImageBoxImage;
  title: ReactNode;
  titleTag?: HeadingTag;
  /**
   * The theme's cards put the heading above the photo; Elementor's stock layout
   * puts it below.
   */
  titlePosition?: "above" | "below";
  description?: ReactNode;
  /** The small second heading under the description ("Baby Class · ages 3-4"). */
  meta?: ReactNode;
  metaTag?: HeadingTag;
  /** Wraps the whole card in one link, as the saved markup does. */
  href?: string;
  /** Image position relative to the text (Elementor's Image Position control). */
  position?: "top" | "left" | "right";
  /** Elementor's alignment control. */
  align?: "start" | "center" | "end";
  /** The theme's small eye decoration (`vamtam-eye`). */
  eye?: boolean;
  reveal?: RevealName;
  delay?: RevealDelay;
  className?: string;
  style?: CSSProperties;
}

const ALIGN_VALUE: Record<NonNullable<ImageBoxProps["align"]>, string> = {
  start: "start",
  center: "center",
  end: "end",
};

/** `http(s)://`, `tel:` and `mailto:` targets leave the app, so they get a plain anchor. */
function isExternal(href: string): boolean {
  return /^(https?:|tel:|mailto:)/i.test(href);
}

/**
 * Elementor `image-box`. Presentational only: the panel colour, hover colour,
 * title colour and eye colour arrive as the `--w-imagebox-*` custom properties
 * so each page can reproduce its own palette.
 */
export default function ImageBox({
  image,
  title,
  titleTag = "h3",
  titlePosition = "above",
  description,
  meta,
  metaTag = "h6",
  href,
  position = "top",
  align,
  eye = false,
  reveal,
  delay,
  className,
  style,
}: ImageBoxProps) {
  const TitleTag = titleTag;
  const MetaTag = metaTag;

  const classes = [
    "w-imagebox",
    position === "left" ? "w-imagebox--left" : null,
    position === "right" ? "w-imagebox--right" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const boxStyle = align
    ? ({ ...style, "--w-imagebox-align": ALIGN_VALUE[align] } as CSSProperties)
    : style;

  const figure = (
    <figure className="w-imagebox__figure">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={image.sizes}
        unoptimized={image.unoptimized}
      />
    </figure>
  );

  const titleBlock = (
    <div className="w-imagebox__content">
      <TitleTag className="w-imagebox__title">{title}</TitleTag>
    </div>
  );

  const bodyBlock =
    description || meta ? (
      <div className="w-imagebox__content">
        {description ? <p className="w-imagebox__description">{description}</p> : null}
        {meta ? <MetaTag className="w-imagebox__meta">{meta}</MetaTag> : null}
      </div>
    ) : null;

  const inner = (
    <>
      {titlePosition === "above" ? titleBlock : null}
      {figure}
      {titlePosition === "below" ? titleBlock : null}
      {bodyBlock}
      {eye ? (
        <div className="w-imagebox__eye" aria-hidden="true">
          <span className="w-imagebox__eye-outer">
            <span className="w-imagebox__eye-inner">
              <span className="w-imagebox__eye-pupil" />
            </span>
          </span>
        </div>
      ) : null}
    </>
  );

  return (
    <div className={classes} style={boxStyle} data-reveal={reveal} data-delay={delay}>
      {href && isExternal(href) ? (
        <a href={href} className="w-imagebox__wrapper">
          {inner}
        </a>
      ) : href ? (
        <Link href={href} className="w-imagebox__wrapper">
          {inner}
        </Link>
      ) : (
        <div className="w-imagebox__wrapper">{inner}</div>
      )}
    </div>
  );
}

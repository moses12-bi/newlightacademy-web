import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { HeadingTag, ImageBoxImage } from "@/components/ui/ImageBox";
import type { RevealDelay, RevealName } from "@/components/ui/PageHero";

export interface IconBoxProps {
  /** An inline SVG (or any node). Sized by `--w-iconbox-icon-size`. */
  icon?: ReactNode;
  /** ...or an illustration. Pass one of `icon` / `image`. */
  image?: ImageBoxImage;
  title: ReactNode;
  titleTag?: HeadingTag;
  description?: ReactNode;
  /** Wraps the whole box in one link, as the saved download cards do. */
  href?: string;
  /** The saved download cards open the PDF in a new tab. */
  newTab?: boolean;
  /** Icon position relative to the text (Elementor's Icon Position control). */
  position?: "top" | "left" | "right";
  /** Elementor's alignment control. */
  align?: "start" | "center" | "end";
  /** The framed card with the offset block shadow (post-2461 #be74d59). */
  boxed?: boolean;
  reveal?: RevealName;
  delay?: RevealDelay;
  className?: string;
  style?: CSSProperties;
}

/** `http(s)://`, `tel:` and `mailto:` targets leave the app, so they get a plain anchor. */
function isExternal(href: string): boolean {
  return /^(https?:|tel:|mailto:)/i.test(href);
}

/**
 * Elementor `icon-box`: an icon or illustration above (or beside) a heading and
 * a short description, optionally wrapped in a link. Colours and the icon size
 * come from the `--w-iconbox-*` custom properties.
 */
export default function IconBox({
  icon,
  image,
  title,
  titleTag = "h3",
  description,
  href,
  newTab = false,
  position = "top",
  align,
  boxed = false,
  reveal,
  delay,
  className,
  style,
}: IconBoxProps) {
  const TitleTag = titleTag;

  const classes = [
    "w-iconbox",
    boxed ? "w-iconbox--boxed" : null,
    position === "left" ? "w-iconbox--left" : null,
    position === "right" ? "w-iconbox--right" : null,
    align === "start" ? "w-iconbox--align-start" : null,
    align === "end" ? "w-iconbox--align-end" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {icon || image ? (
        <div className="w-iconbox__icon">
          {icon}
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={image.sizes}
              unoptimized={image.unoptimized}
            />
          ) : null}
        </div>
      ) : null}
      <div className="w-iconbox__content">
        <TitleTag className="w-iconbox__title">{title}</TitleTag>
        {description ? <p className="w-iconbox__description">{description}</p> : null}
      </div>
    </>
  );

  const wrapperClass = "w-iconbox__wrapper";

  return (
    <div className={classes} style={style} data-reveal={reveal} data-delay={delay}>
      {href && isExternal(href) ? (
        <a
          href={href}
          className={wrapperClass}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noreferrer" : undefined}
        >
          {inner}
        </a>
      ) : href ? (
        <Link
          href={href}
          className={wrapperClass}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noreferrer" : undefined}
        >
          {inner}
        </Link>
      ) : (
        <div className={wrapperClass}>{inner}</div>
      )}
    </div>
  );
}

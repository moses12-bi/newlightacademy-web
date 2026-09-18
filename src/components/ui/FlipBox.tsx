"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactElement, ReactNode } from "react";

import type { HeadingTag, ImageBoxImage } from "@/components/ui/ImageBox";

export interface FlipBoxFace {
  icon?: ReactNode;
  image?: ImageBoxImage;
  title?: ReactNode;
  titleTag?: HeadingTag;
  description?: ReactNode;
}

export interface FlipBoxButton {
  label: string;
  href: string;
}

export interface FlipBoxHeights {
  /** >= 1025px */
  desktop?: number;
  /** <= 1024px */
  tablet?: number;
  /** <= 767px */
  mobile?: number;
}

export interface FlipBoxProps {
  front: FlipBoxFace;
  back: FlipBoxFace & { button?: FlipBoxButton };
  /** The saved boxes use `slide` (with a direction) and `fade`. */
  effect?: "flip" | "fade" | "slide";
  direction?: "left" | "right" | "up" | "down";
  heights?: FlipBoxHeights;
  /** Accessible name for the card when the back face is only a button. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** `http(s)://`, `tel:` and `mailto:` targets leave the app, so they get a plain anchor. */
function isExternal(href: string): boolean {
  return /^(https?:|tel:|mailto:)/i.test(href);
}

function Face({ face, children }: { face: FlipBoxFace; children?: ReactNode }): ReactElement {
  const TitleTag = face.titleTag ?? "h3";
  return (
    <div className="w-flipbox__overlay">
      {face.icon ? <div className="w-flipbox__icon">{face.icon}</div> : null}
      {face.image ? (
        <div className="w-flipbox__image">
          <Image
            src={face.image.src}
            alt={face.image.alt}
            width={face.image.width}
            height={face.image.height}
            sizes={face.image.sizes}
            unoptimized={face.image.unoptimized}
          />
        </div>
      ) : null}
      {face.title ? <TitleTag className="w-flipbox__title">{face.title}</TitleTag> : null}
      {face.description ? <div className="w-flipbox__description">{face.description}</div> : null}
      {children}
    </div>
  );
}

/**
 * Elementor `flip-box`. The card is focusable and flips on hover *and* on focus,
 * so it is fully operable from the keyboard; Escape flips it back. The hidden
 * face carries `inert`, which keeps it out of both the tab order and the
 * accessibility tree, and `prefers-reduced-motion` swaps the rotation for a
 * cross-fade (see src/styles/widgets.css).
 */
export default function FlipBox({
  front,
  back,
  effect = "flip",
  direction = "right",
  heights,
  label,
  className,
  style,
}: FlipBoxProps) {
  const [flipped, setFlipped] = useState(false);
  /* Before hydration neither face is inert, so the back face's link is reachable
     with JavaScript off — the CSS :hover / :focus-within rules still flip the
     card in that case. */
  const [hydrated, setHydrated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  /* Escape hands focus back to the card, which would otherwise re-flip it. */
  const skipNextFocusRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setFlipped(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (skipNextFocusRef.current) {
      skipNextFocusRef.current = false;
      return;
    }
    setFlipped(true);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    setFlipped(false);
    if (document.activeElement !== rootRef.current) {
      skipNextFocusRef.current = true;
      rootRef.current?.focus();
    }
  }, []);

  const classes = [
    "w-flipbox",
    `w-flipbox--${effect}`,
    effect === "slide" ? `w-flipbox--slide-${direction}` : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cssVars: Record<string, string> = {};
  if (heights?.desktop !== undefined) cssVars["--w-flipbox-height"] = `${heights.desktop}px`;
  if (heights?.tablet !== undefined) cssVars["--w-flipbox-height-md"] = `${heights.tablet}px`;
  if (heights?.mobile !== undefined) cssVars["--w-flipbox-height-sm"] = `${heights.mobile}px`;
  const rootStyle = { ...style, ...cssVars } as CSSProperties;

  const button = back.button;
  const buttonClass = "theme-button inline-flex items-center justify-center rounded-[4px] bg-accent-1 px-6 py-3 text-[15px] leading-tight text-accent-5 transition-colors duration-300 hover:bg-accent-3 focus-visible:bg-accent-3";

  return (
    <div
      ref={rootRef}
      className={classes}
      style={rootStyle}
      data-flipped={flipped}
      data-hydrated={hydrated ? "true" : undefined}
      tabIndex={0}
      role={label ? "group" : undefined}
      aria-label={label}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div className="w-flipbox__layer w-flipbox__front" inert={hydrated && flipped}>
        <Face face={front} />
      </div>

      <div className="w-flipbox__layer w-flipbox__back" inert={hydrated && !flipped}>
        <Face face={back}>
          {button ? (
            isExternal(button.href) ? (
              <a href={button.href} className={buttonClass}>
                {button.label}
              </a>
            ) : (
              <Link href={button.href} className={buttonClass}>
                {button.label}
              </Link>
            )
          ) : null}
        </Face>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

import { CloseIcon } from "@/components/ui/icons";
import type { GalleryPhoto } from "@/components/sections/gallery/photos";

export interface GalleryJustifiedProps {
  photos: GalleryPhoto[];
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? <polyline points="15 5 8 12 15 19" /> : <polyline points="9 5 16 12 9 19" />}
    </svg>
  );
}

/**
 * The justified photo grid of #5f571d4 plus an accessible lightbox.
 *
 * With JavaScript off every thumbnail is still a plain link to its full-size
 * image, which is what Elementor's `link_to: file` falls back to; the lightbox
 * only takes over once this component has hydrated.
 */
export default function GalleryJustified({ photos }: GalleryJustifiedProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggersRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnIndexRef = useRef<number | null>(null);
  const titleId = useId();

  const total = photos.length;
  const isOpen = openIndex !== null;

  const open = useCallback((index: number) => {
    returnIndexRef.current = index;
    setOpenIndex(index);
  }, []);

  const close = useCallback(() => {
    setOpenIndex(null);
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => (current === null ? current : (current + delta + total) % total));
    },
    [total],
  );

  /* Move focus into the dialog when it opens and back to the thumbnail that
     opened it when it closes. */
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
      return;
    }
    const index = returnIndexRef.current;
    if (index === null) return;
    returnIndexRef.current = null;
    triggersRef.current[index]?.focus();
  }, [isOpen]);

  /* The page behind the dialog must not scroll. */
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const handleThumbClick = (event: ReactMouseEvent<HTMLAnchorElement>, index: number) => {
    /* Let modified clicks open the file in a new tab, as the link promises. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    open(index);
  };

  const handleThumbKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>, index: number) => {
    /* Enter already activates a link; Space does not. */
    if (event.key !== " " && event.key !== "Spacebar") return;
    event.preventDefault();
    open(index);
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
      return;
    }
    if (event.key !== "Tab") return;

    /* Focus trap: the dialog's three buttons are its only focusable content. */
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* Anything that is not the photo itself or one of the three controls counts
     as the backdrop. */
  const handleBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "IMG" || target.closest("button")) return;
    close();
  };

  const current = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <a
            key={`${photo.src}-${index}`}
            ref={(node) => {
              triggersRef.current[index] = node;
            }}
            href={photo.src}
            className="gallery-item"
            style={{ "--gallery-ar": photo.ratio } as CSSProperties}
            onClick={(event) => handleThumbClick(event, index)}
            onKeyDown={(event) => handleThumbKeyDown(event, index)}
          >
            <Image
              src={photo.src}
              alt={photo.alt ?? `Gallery photo ${index + 1} of ${total}`}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 620px"
            />
          </a>
        ))}
      </div>

      {current && openIndex !== null ? (
        <div
          ref={dialogRef}
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleDialogKeyDown}
          onMouseDown={handleBackdrop}
        >
          <div className="gallery-lightbox__bar">
            <p id={titleId} className="gallery-lightbox__count">
              {`Gallery photo ${openIndex + 1} of ${total}`}
            </p>
            <button ref={closeRef} type="button" className="gallery-lightbox__button" onClick={close}>
              <CloseIcon />
              <span className="sr-only">Close the gallery viewer</span>
            </button>
          </div>

          <div className="gallery-lightbox__stage">
            <div className="gallery-lightbox__figure">
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt ?? `Gallery photo ${openIndex + 1} of ${total}`}
                width={current.width}
                height={current.height}
                priority
                sizes="(max-width: 1140px) 100vw, 1100px"
              />
            </div>
          </div>

          <div className="gallery-lightbox__nav">
            <button type="button" className="gallery-lightbox__button" onClick={() => step(-1)}>
              <ArrowIcon direction="left" />
              <span className="sr-only">Previous photo</span>
            </button>
            <button type="button" className="gallery-lightbox__button" onClick={() => step(1)}>
              <ArrowIcon direction="right" />
              <span className="sr-only">Next photo</span>
            </button>
          </div>

          <p aria-live="polite" className="sr-only">
            {`Gallery photo ${openIndex + 1} of ${total}`}
          </p>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PlayCircleIcon } from "@/components/programs/icons";
import { CloseIcon } from "@/components/ui/icons";

export interface VideoLightboxProps {
  /** The YouTube id the saved Elementor lightbox action points at. */
  videoId: string;
  /** Accessible name for the trigger, e.g. "Play the video". */
  label: string;
  className?: string;
}

/** Everything the embedded player is allowed to reach for. */
const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

/**
 * The saved pages open a YouTube video in an Elementor lightbox. This is the
 * same interaction without the Elementor runtime: until the visitor presses the
 * button nothing from youtube.com is requested, and the player is only mounted
 * once the overlay is open. Escape closes it, the close button is the first
 * focus stop, focus is trapped inside while it is open, and focus returns to
 * the trigger afterwards.
 */
export default function VideoLightbox({ videoId, label, className }: VideoLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    /* The page behind must not scroll while the overlay covers it. */
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /* Closing unmounts the dialog, so hand focus back to what opened it. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) triggerRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={["program-play", className].filter(Boolean).join(" ")}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <PlayCircleIcon />
      </button>

      {isOpen ? (
        <div
          className="program-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          /* Clicking the backdrop is a pointer shortcut only; the keyboard path
             is the close button and Escape, so this needs no key handler. */
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          {/* Focus trap. The dialog holds exactly two focusable nodes — the
              close button and the player — but the player is a cross-origin
              iframe, so a keydown handler never sees the Tab that leaves it.
              These sentinels catch the focus instead and bounce it back, the
              same containment GalleryJustified does with a keydown trap. */}
          <div tabIndex={0} aria-hidden="true" onFocus={() => frameRef.current?.focus()} />
          <div className="program-lightbox__frame">
            <button
              ref={closeRef}
              type="button"
              className="program-lightbox__close"
              aria-label="Close the video"
              onClick={close}
            >
              <CloseIcon />
            </button>
            <iframe
              ref={frameRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={label}
              allow={IFRAME_ALLOW}
              allowFullScreen
            />
          </div>
          <div tabIndex={0} aria-hidden="true" onFocus={() => closeRef.current?.focus()} />
        </div>
      ) : null}
    </>
  );
}

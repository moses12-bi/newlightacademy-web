"use client";

import { useEffect, useRef, useState } from "react";

import { PlayIcon } from "@/components/ui/icons";

export interface VideoFrameProps {
  videoId: string;
  title: string;
  poster?: string;
}

/** Everything the embedded player is allowed to reach for. */
const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

/**
 * Lazy YouTube facade: nothing from youtube.com is requested until the visitor
 * asks for it. Until then this is just a poster image plus a play button; the
 * click swaps in the real iframe with `autoplay=1` so the video starts straight
 * away instead of needing a second click.
 */
export default function VideoFrame({ videoId, title, poster }: VideoFrameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const posterSrc = poster ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  /* Starting playback unmounts the focused play button, which would otherwise drop
     focus back to <body>. Hand it to the player that replaced it instead. */
  useEffect(() => {
    if (!isPlaying) return;
    iframeRef.current?.focus();
  }, [isPlaying]);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-accent-3">
      {isPlaying ? (
        <iframe
          ref={iframeRef}
          className="absolute inset-0 block h-full w-full border-0"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow={IFRAME_ALLOW}
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center"
        >
          {/*
            Plain <img>: the YouTube thumbnail host is remote, and wiring it into
            next/image would mean editing next.config.ts for one decorative poster.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="relative flex h-[100px] w-[100px] items-center justify-center rounded-full border-[4px] border-white bg-transparent text-white drop-shadow-md transition-transform duration-300 group-hover:scale-110">
            {/* the glyph's optical centre sits left of its box, so nudge it right */}
            <PlayIcon className="ml-[4px] h-10 w-10" />
          </span>
        </button>
      )}
    </div>
  );
}

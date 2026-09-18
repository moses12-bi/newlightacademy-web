import type * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

/**
 * Three glyphs the saved pages use that are not in `@/components/ui/icons`.
 * The originals are Font Awesome (`far fa-play-circle`, `fas fa-hands-helping`,
 * `fas fa-check-square`), which is not part of the capture and is not installed
 * anywhere in this project, so these are hand-drawn stand-ins at the same
 * weight and silhouette. They inherit their colour from `currentColor`.
 */

/** `far fa-play-circle` - the hero and video-band play button. */
export function PlayCircleIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.5" />
      <path d="M20 16.6a1 1 0 0 1 1.5-.87l11 7.4a1 1 0 0 1 0 1.74l-11 7.4A1 1 0 0 1 20 31.4Z" fill="currentColor" />
    </svg>
  );
}

/** `fas fa-hands-helping` - two hands supporting a third. */
export function HandsHelpingIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.1 9.6a2 2 0 0 1 2.7 0l4.6 4.2h6.3a2 2 0 0 1 1.5.7l4.4 5.2a2 2 0 0 1-.1 2.7l-8 8a2 2 0 0 1-2.9 0l-1.7-1.8-3.4 2.7a4.6 4.6 0 0 1-5.7 0l-5.7-4.5a2 2 0 0 1 2.5-3.1l5.7 4.4c.2.2.5.2.7 0l7.8-6.2H24a2 2 0 0 1-1.3-.5l-2.5-2.2-6.4 5.7-3.7-3.5 8.8-7.9Z" />
      <path d="M8.1 24.3a2 2 0 0 1 2.8 0l9.5 9.3a2 2 0 0 1-2.8 2.9l-9.5-9.4a2 2 0 0 1 0-2.8Z" opacity=".55" />
    </svg>
  );
}

/** `fas fa-check-square` - a filled square with a tick. */
export function CheckSquareIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 10a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Zm25.6 7.4a2 2 0 0 0-2.9-2.8l-9.3 9.6-4-4.2a2 2 0 1 0-2.9 2.8l5.5 5.6a2 2 0 0 0 2.9 0Z" />
    </svg>
  );
}

import type * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

/**
 * Hand-written 24x24 inline icons — no icon package anywhere in this project.
 * Each icon inherits its colour from `currentColor` and its size from the
 * caller's `className`, and spreads `...props` last so a caller can override
 * the default `aria-hidden` with a real label.
 */

export function ChevronDownIcon(props: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8.09 3a1.6 1.6 0 0 1 1.48 1l1.19 2.86a1.6 1.6 0 0 1-.38 1.79L9.2 9.72a12.4 12.4 0 0 0 5.08 5.08l1.07-1.18a1.6 1.6 0 0 1 1.79-.38l2.86 1.19a1.6 1.6 0 0 1 1 1.48v2.79A2.3 2.3 0 0 1 18.6 21 15.9 15.9 0 0 1 3 5.4 2.3 2.3 0 0 1 5.3 3Z" />
    </svg>
  );
}

/** Ring with a filled centre dot — the orange bullet used by IconList. */
export function DotCircleIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.6" />
    </svg>
  );
}

export function PlayIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 4.79a1 1 0 0 1 1.5-.87l9.2 5.32a1 1 0 0 1 0 1.73l-9.2 5.32A1 1 0 0 1 8 15.42Z" />
    </svg>
  );
}

export function MenuIcon(props: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.1 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

/** Hand-drawn: the theme's icon font was not part of the capture. */
export function TwitterIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.5 5.9a7.6 7.6 0 0 1-2.2.6 3.9 3.9 0 0 0 1.7-2.1 7.7 7.7 0 0 1-2.4.9 3.8 3.8 0 0 0-6.6 2.6c0 .3 0 .6.1.9A10.9 10.9 0 0 1 4 4.8a3.8 3.8 0 0 0 1.2 5.1 3.8 3.8 0 0 1-1.7-.5v.1a3.8 3.8 0 0 0 3 3.7 3.9 3.9 0 0 1-1.7.1 3.8 3.8 0 0 0 3.5 2.6A7.6 7.6 0 0 1 2.5 17a10.8 10.8 0 0 0 5.9 1.7c7 0 10.9-5.9 10.9-11v-.5a7.8 7.8 0 0 0 2.2-2.3Z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M21.58 7.19a2.51 2.51 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77A26.1 26.1 0 0 0 2 12a26.1 26.1 0 0 0 .42 4.81 2.51 2.51 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77A26.1 26.1 0 0 0 22 12a26.1 26.1 0 0 0-.42-4.81Zm-11.38 7.83V8.98L15.5 12Z"
      />
    </svg>
  );
}

export function InstagramIcon(props: IconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true" {...props}>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.8" r="1.3" />
    </svg>
  );
}

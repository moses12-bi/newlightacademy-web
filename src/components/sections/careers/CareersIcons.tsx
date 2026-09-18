import type * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

/**
 * The six careers icons.
 *
 * The save names four Font Awesome glyphs (`fas fa-praying-hands`,
 * `fab fa-slideshare`, `fas fa-cloud-sun`) and three of the VamTam theme's own
 * icon-font glyphs (`vamtam-theme-new-language`, `-handwriting`, `-movement`).
 * Neither font is part of the capture and this project ships no icon package,
 * so these are hand-drawn stand-ins that keep the same subject.
 */
function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      /* widgets.css sets `fill: currentColor` on icon-box SVGs; these are
         stroke drawings, so the inline style has to win. */
      style={{ fill: "none" }}
      {...props}
    >
      {children}
    </svg>
  );
}

/** `vamtam-theme-new-language` — a globe. */
export function LanguageIcon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.3 2.4 3.4 5.3 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.3-3.4-8.5S9.7 5.9 12 3.5Z" />
    </Icon>
  );
}

/** `vamtam-theme-handwriting` — a pen on a ruled line. */
export function HandwritingIcon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 16.5 15.1 5.4a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L7.5 20H4v-3.5Z" />
      <path d="M13.4 7.1 16.9 10.6" />
      <path d="M3.5 22h17" />
    </Icon>
  );
}

/** `vamtam-theme-movement` — a figure in motion. */
export function MovementIcon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="14.5" cy="4.8" r="2.2" />
      <path d="M8.2 21.5 11 15.6l-2.4-2.6 1.3-4.6 3.6-1.1 2.6 3.2 3.2 1" />
      <path d="M11 15.6l3.4 1.6 1.1 4.3" />
      <path d="M3.5 10.5h3.2M2.5 14.2h3.4" />
    </Icon>
  );
}

/** `fas fa-praying-hands` — two hands pressed together. */
export function PrayingHandsIcon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 3.2 8.4 8.9a4 4 0 0 0-.6 2.1v4.4l-3.3 2a1.4 1.4 0 0 0-.3 2.1l1.6 1.7h6.2V3.2Z" />
      <path d="M12 3.2l3.6 5.7a4 4 0 0 1 .6 2.1v4.4l3.3 2a1.4 1.4 0 0 1 .3 2.1l-1.6 1.7H12V3.2Z" />
    </Icon>
  );
}

/** `fab fa-slideshare` — a presentation board. */
export function SlideshareIcon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <rect x="2.8" y="4" width="18.4" height="12.5" rx="1.6" />
      <path d="M12 16.5V20" />
      <path d="M8.2 20h7.6" />
      <path d="M6.8 12.8V9.6M10.2 12.8V7.5M13.8 12.8v-2.1M17.2 12.8V8.6" />
    </Icon>
  );
}

/** `fas fa-cloud-sun` — sun behind a cloud. */
export function CloudSunIcon(props: IconProps): React.JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="8.2" cy="8" r="3.1" />
      <path d="M8.2 2.1v1.2M8.2 12.7v1.2M2.3 8h1.2M12.9 8h1.2M4 3.8l.9.9M11.5 11.3l.9.9M12.4 3.8l-.9.9M4.9 11.3l-.9.9" />
      <path d="M11.4 20.4h6.9a3.3 3.3 0 0 0 .3-6.6 4.7 4.7 0 0 0-9-.8 3.7 3.7 0 0 0 .5 7.4h1.3Z" />
    </Icon>
  );
}

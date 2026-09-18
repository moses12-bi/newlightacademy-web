/**
 * Icons for the admissions group (/admissions, /tuition, /how-to-apply).
 *
 * Two kinds live here:
 *
 * 1. `StepNumeral` — the big outlined numerals inside the coloured discs on
 *    /admissions and /how-to-apply. These paths are copied verbatim from the
 *    saved markup (post-2461 #818462b / #39eec59 / #a7d9cf0 and post-1064
 *    #4d8f19e / #804dbe1 / #fde03e4 / #8a08c00), including the 240x160 viewBox.
 *
 * 2. The small glyphs beside the download cards and the money cards. The saved
 *    pages reference Font Awesome 5 classes (`fas fa-file-download`,
 *    `far fa-list-alt`, `fab fa-wpforms`, `far fa-calendar-check`,
 *    `fas fa-coins`, `fas fa-money-check-alt`, `fas fa-piggy-bank`,
 *    `fas fa-info-circle`) plus the theme's own `vamtam-theme-house`. Neither
 *    font is part of the capture and this project ships no icon package, so
 *    these nine are hand-drawn stand-ins at the same sizes. They are filled
 *    (not stroked) because the shared `.w-iconbox__icon svg` rule sets
 *    `fill: currentColor`, which would override a `fill="none"` attribute.
 */

export interface GlyphProps {
  className?: string;
}

export type StepNumber = 1 | 2 | 3 | 4;

const NUMERAL_PATHS: Record<StepNumber, string> = {
  1: "M79.84 136.52c11.04 0 20.94-2.31 29.7-6.93 8.76-4.62 15.6-11.04 20.52-19.26 4.92-8.22 7.38-17.49 7.38-27.81 0-10.08-2.46-19.14-7.38-27.18s-11.76-14.31-20.52-18.81c-8.76-4.5-18.6-6.75-29.52-6.75-10.92 0-20.76 2.28-29.52 6.84-8.76 4.56-15.6 10.89-20.52 18.99-4.92 8.1-7.38 17.19-7.38 27.27 0 10.2 2.46 19.38 7.38 27.54s11.73 14.55 20.43 19.17c8.7 4.62 18.51 6.93 29.43 6.93zm.18-26.64c-6.84 0-12.48-2.58-16.92-7.74-4.44-5.16-6.66-11.76-6.66-19.8 0-7.56 2.22-13.77 6.66-18.63 4.44-4.86 10.02-7.29 16.74-7.29 6.96 0 12.66 2.49 17.1 7.47 4.44 4.98 6.66 11.37 6.66 19.17 0 7.8-2.22 14.22-6.66 19.26-4.44 5.04-10.08 7.56-16.92 7.56zM209.26 134V32.12h-21.78l-44.64 19.26 12.78 26.28 20.88-9V134h32.76z",
  2: "M74.84 136.52c11.04 0 20.94-2.31 29.7-6.93 8.76-4.62 15.6-11.04 20.52-19.26 4.92-8.22 7.38-17.49 7.38-27.81 0-10.08-2.46-19.14-7.38-27.18s-11.76-14.31-20.52-18.81c-8.76-4.5-18.6-6.75-29.52-6.75-10.92 0-20.76 2.28-29.52 6.84-8.76 4.56-15.6 10.89-20.52 18.99-4.92 8.1-7.38 17.19-7.38 27.27 0 10.2 2.46 19.38 7.38 27.54s11.73 14.55 20.43 19.17c8.7 4.62 18.51 6.93 29.43 6.93zm.18-26.64c-6.84 0-12.48-2.58-16.92-7.74-4.44-5.16-6.66-11.76-6.66-19.8 0-7.56 2.22-13.77 6.66-18.63 4.44-4.86 10.02-7.29 16.74-7.29 6.96 0 12.66 2.49 17.1 7.47 4.44 4.98 6.66 11.37 6.66 19.17 0 7.8-2.22 14.22-6.66 19.26-4.44 5.04-10.08 7.56-16.92 7.56zM221.9 134l-2.16-25.74h-32.76l7.38-6.3c9-7.56 15.63-14.43 19.89-20.61s6.39-12.81 6.39-19.89c0-10.92-3.81-18.93-11.43-24.03-7.62-5.1-18.15-7.65-31.59-7.65-12.72 0-24.3 3.12-34.74 9.36l4.14 26.64c4.08-2.28 8.82-4.38 14.22-6.3s10.5-2.88 15.3-2.88c4.68 0 8.34.72 10.98 2.16 2.64 1.44 3.96 3.6 3.96 6.48 0 2.52-1.05 5.01-3.15 7.47-2.1 2.46-5.31 5.55-9.63 9.27-1.92 1.44-3.3 2.58-4.14 3.42l-34.02 29.52V134h81.36z",
  3: "M71.84 136.52c11.04 0 20.94-2.31 29.7-6.93 8.76-4.62 15.6-11.04 20.52-19.26 4.92-8.22 7.38-17.49 7.38-27.81 0-10.08-2.46-19.14-7.38-27.18s-11.76-14.31-20.52-18.81c-8.76-4.5-18.6-6.75-29.52-6.75-10.92 0-20.76 2.28-29.52 6.84-8.76 4.56-15.6 10.89-20.52 18.99-4.92 8.1-7.38 17.19-7.38 27.27 0 10.2 2.46 19.38 7.38 27.54s11.73 14.55 20.43 19.17c8.7 4.62 18.51 6.93 29.43 6.93zm.18-26.64c-6.84 0-12.48-2.58-16.92-7.74-4.44-5.16-6.66-11.76-6.66-19.8 0-7.56 2.22-13.77 6.66-18.63 4.44-4.86 10.02-7.29 16.74-7.29 6.96 0 12.66 2.49 17.1 7.47 4.44 4.98 6.66 11.37 6.66 19.17 0 7.8-2.22 14.22-6.66 19.26-4.44 5.04-10.08 7.56-16.92 7.56zm104.76 38.16c9.48 0 17.88-1.53 25.2-4.59 7.32-3.06 12.99-7.29 17.01-12.69 4.02-5.4 6.03-11.58 6.03-18.54 0-5.16-1.5-10.35-4.5-15.57-3-5.22-6.66-9.09-10.98-11.61 3.36-1.8 6.45-5.1 9.27-9.9 2.82-4.8 4.23-9.3 4.23-13.5 0-6.24-1.83-11.76-5.49-16.56-3.66-4.8-8.82-8.55-15.48-11.25-6.66-2.7-14.37-4.05-23.13-4.05-16.8 0-30.84 4.44-42.12 13.32l15.66 22.14c8.64-5.88 16.38-8.82 23.22-8.82 4.44 0 7.8.75 10.08 2.25 2.28 1.5 3.42 3.45 3.42 5.85 0 3-1.56 5.43-4.68 7.29-3.12 1.86-7.2 2.79-12.24 2.79h-14.76l2.7 25.74h18.54c3.72 0 6.72.96 9 2.88 2.28 1.92 3.42 4.62 3.42 8.1 0 3.12-1.35 5.61-4.05 7.47-2.7 1.86-6.09 2.79-10.17 2.79-4.32 0-8.55-.69-12.69-2.07-4.14-1.38-8.73-3.69-13.77-6.93l-17.46 21.78c6.72 4.32 14.01 7.68 21.87 10.08 7.86 2.4 15.15 3.6 21.87 3.6z",
  4: "M64.84 136.52c11.04 0 20.94-2.31 29.7-6.93 8.76-4.62 15.6-11.04 20.52-19.26 4.92-8.22 7.38-17.49 7.38-27.81 0-10.08-2.46-19.14-7.38-27.18S103.3 41.03 94.54 36.53c-8.76-4.5-18.6-6.75-29.52-6.75-10.92 0-20.76 2.28-29.52 6.84-8.76 4.56-15.6 10.89-20.52 18.99-4.92 8.1-7.38 17.19-7.38 27.27 0 10.2 2.46 19.38 7.38 27.54s11.73 14.55 20.43 19.17c8.7 4.62 18.51 6.93 29.43 6.93zm.18-26.64c-6.84 0-12.48-2.58-16.92-7.74-4.44-5.16-6.66-11.76-6.66-19.8 0-7.56 2.22-13.77 6.66-18.63 4.44-4.86 10.02-7.29 16.74-7.29 6.96 0 12.66 2.49 17.1 7.47 4.44 4.98 6.66 11.37 6.66 19.17 0 7.8-2.22 14.22-6.66 19.26-4.44 5.04-10.08 7.56-16.92 7.56zm149.4 35.46v-21.06h16.38l1.62-25.74h-18V31.22h-24.48l-62.1 69.12 3.78 23.94h50.04v21.06h32.76zm-32.76-46.8h-15.3l15.3-18v18z",
};

/** The outlined numeral that sits inside a step's coloured disc. */
export function StepNumeral({ value }: { value: StepNumber }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" aria-hidden="true">
      <path d={NUMERAL_PATHS[value]} fillRule="nonzero" />
    </svg>
  );
}

/** Stand-in for `fas fa-file-download`. */
export function FileDownloadGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5 1h14v22H5V1zm7 5h-2v6H7l4 5 4-5h-3V6z" />
    </svg>
  );
}

/** Stand-in for the theme's own `vamtam-theme-house`. */
export function HouseGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M12 2.5 1.5 12H5v9.5h5.25v-6h3.5v6H19V12h3.5L12 2.5z" />
    </svg>
  );
}

/** Stand-in for `far fa-list-alt`. */
export function ListAltGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M2.5 3.5h19v17h-19v-17zM5 6.5v2.5h2.5V6.5H5zm5 0V9h9V6.5h-9zM5 10.75v2.5h2.5v-2.5H5zm5 0v2.5h9v-2.5h-9zM5 15v2.5h2.5V15H5zm5 0v2.5h9V15h-9z"
      />
    </svg>
  );
}

/** Stand-in for `fab fa-wpforms`. */
export function FormGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4 1.5h16v21H4v-21zM6.5 5v3.5h4.25V5H6.5zm6.25 0v1.75h4.75V5h-4.75zm0 3v1.75h4.75V8h-4.75zM6.5 12v1.75h11V12h-11zm0 4v1.75h11V16h-11z"
      />
    </svg>
  );
}

/** Stand-in for `far fa-calendar-check`. */
export function CalendarCheckGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6 1h2v2h8V1h2v2h4v20H2V3h4V1zM4 8v13h16V8H4zm12.3 2.3-4.6 4.6-2.3-2.3-1.4 1.4 3.7 3.7 6-6-1.4-1.4z"
      />
    </svg>
  );
}

/** Stand-in for `fas fa-coins`. */
export function CoinsGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.5c4.42 0 8 1.34 8 3s-3.58 3-8 3-8-1.34-8-3 3.58-3 8-3zM4 9.2c1.65 1.3 4.63 2.05 8 2.05s6.35-.75 8-2.05v2.55c0 1.66-3.58 3-8 3s-8-1.34-8-3V9.2zm0 5.7c1.65 1.3 4.63 2.05 8 2.05s6.35-.75 8-2.05v2.6c0 1.66-3.58 3-8 3s-8-1.34-8-3v-2.6z" />
    </svg>
  );
}

/** Stand-in for `fas fa-money-check-alt`. */
export function MoneyCheckGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M1.5 4.5h21v15h-21v-15zM4 7v4.5h6.5V7H4zm8.5 0v1.75h7.5V7h-7.5zm0 3.25V12h7.5v-1.75h-7.5zM4 14v1.75h16V14H4z"
      />
    </svg>
  );
}

/** Stand-in for `fas fa-piggy-bank`. */
export function PiggyBankGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M15 3v2.35c1.06.4 2 .99 2.75 1.73H20l2 3.42v3.1h-2.4a6.7 6.7 0 0 1-1.85 2.27V19h-3.1v-1.28c-.53.12-1.08.18-1.65.18h-2c-.57 0-1.12-.06-1.65-.18V19H5.25v-3.13C3.2 14.55 2 12.65 2 10.55 2 6.93 5.6 4 10 4h2.1L15 3zM7.9 8.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"
      />
    </svg>
  );
}

/** Stand-in for `fas fa-info-circle`. */
export function InfoCircleGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.1 4.2h2.2v2.4h-2.2V6.2zm0 4h2.2v7.6h-2.2v-7.6z" />
    </svg>
  );
}

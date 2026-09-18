# New Light Academy

The website for **New Light Academy** — a private nursery and primary day school in Kinyinya sector, Gasabo
district, Kigali, Rwanda. NESA school code **121031**, accredited for pre-primary and primary.

Built on a Next.js port of the VamTam *Skole* theme. The theme's visual design is treated as approved and frozen;
this repository carries New Light Academy's identity, colours and content on top of it.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build, 31 static routes
npm run start        # serve the build
```

## Checks

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run verify       # browser checks across all 25 routes (needs the site running)
```

`npm run verify` drives Playwright against the system Edge (`channel: "msedge"` — no browser is bundled) and
writes screenshots to `artifacts/`, which is git-ignored. Point it at another port with `BASE_URL`, and narrow a
run with `ONLY=/faq,/gallery`.

Two helper scripts check for regressions:

```bash
node scripts/final-search.cjs                          # scans src/ for demo/foreign text
node scripts/compare-shots.cjs artifacts/a artifacts/b # per-page geometry diff
```

`final-search.cjs` is expected to report exactly two in-code hits — the VamTam and Freepik credits in the footer,
kept until the theme licence is checked.

## Where things live

| | |
|---|---|
| `src/lib/site.ts` | **School identity.** Name, tagline, motto, contacts, address, coordinates, social accounts. Nothing school-editable belongs in a component — it belongs here. |
| `src/lib/navigation.ts` | Header and footer menus. Labels may change; `href`s may not. |
| `src/app/globals.css` | Design tokens in `@theme static`. Change colours here, not in components. |
| `brand/` | Source artwork: crest, badge variants, tab icon, fox. The asset scripts read from here. |
| `scripts/make-brand-assets.cjs` | Regenerates the header logo and the favicon/apple-icon from `brand/`. |
| `scripts/make-fox.cjs` | Regenerates the fox mascot. **Keeps the intrinsic box at 157×145** — several slots size it with `w-auto`, which resolves against intrinsic size, so any other dimensions resize the mascot site-wide. |

## Colour

The approved palette is ten colours; the theme needs about thirty slots (a seven-colour nav rainbow, eight card
accents, four tint pairs). The surplus is filled with tints and shades **derived from the brand green and gold**,
each marked `derived` in `globals.css`. No new hues.

Gold `#FCC501` is a decorative fill only. It fails WCAG AA as text — 1.60:1 on white — so tokens that render as
text use darkened gold at 4.6–5.7:1. Do not assign `--color-brand-gold` to text.

## Content rules

The school has supplied its address, phone, email and the fact that it follows the Rwanda national calendar.
Much else is still outstanding, and several pages are deliberately empty-and-guarded rather than filled with
invented copy: the teaching team, the blog, tuition prices, payment details and the daily schedule all render
nothing until real data is added, and the markup is preserved so it comes back automatically.

**Never fill a gap with plausible-sounding detail.** The site must not state a founding year, a founder or any
person's name, pupil or staff numbers, class sizes, fees, exam results, facilities, transport, meals, uniform,
bell times or testimonials until the school provides them.

Still assumed and awaiting confirmation:

- The class names **Baby Class / Middle Class / Top Class** and the age bands 3–4, 4–5, 5–6, which follow the
  Rwandan convention rather than anything the school has stated. They appear in seven page titles and six meta
  descriptions.
- Route slugs still read `/infants`, `/toddlers`, `/preschool`, `/kindergarten` while the pages are labelled
  Baby Class … Primary School, so the address bar contradicts the page.
- Every photograph and both YouTube videos are still the theme's stock material. No copy claims otherwise.
"# newlightacademy-web" 

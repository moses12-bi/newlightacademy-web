# Skole — conversion notes

A Next.js 16 / React 19 / TypeScript / Tailwind v4 port of the VamTam **Skole**
WordPress + Elementor theme. No WordPress, Elementor, jQuery or Swiper code
ships; every page is a React route with its own transcribed copy, local assets
and a small shared widget layer.

## Routes

28 route files under `src/app`, all statically prerendered by `next build`.

| Group | Routes |
| --- | --- |
| Home / about | `/` (Home 1), `/home-2`, `/about` |
| Programs | `/programs`, `/infants`, `/toddlers`, `/preschool`, `/kindergarten`, `/flex-care`, `/art-program` |
| Admissions | `/admissions`, `/how-to-apply`, `/tuition`, `/make-a-payment`, `/schedule-a-tour` |
| Parents | `/parents`, `/daily-schedule`, `/school-calendar`, `/student-handbook`, `/attendance-policy` |
| School | `/our-teachers`, `/careers`, `/faq`, `/location`, `/gallery` |
| Content | `/blog`, `/blog/[slug]` (7 posts), `/coming-soon` |
| Chrome | `not-found.tsx` (404) |

Source of truth for each route is the saved Elementor region of the matching
page on `https://skole.vamtam.com/<route>/`, with one exception: **`/parents` is
sourced from `https://skole.vamtam.com/for-our-parents/`** — the route was
renamed, the content is the original page's.

`/` was recovered from the original theme source and `/about` from the supplied
`VamTam themes _ Skole.html` save (its iframe `saved_resource.html` holds the
About page). The other 25 routes were converted from the page capture.

Copy, headings, links, form fields and image choices are transcribed from the
capture, including its own typos (for example "Is there anything we shoud know
about your family?" in the visit form) and its curly apostrophes and en dashes.

## Shared components

`src/components/ui`

| Component | What it is |
| --- | --- |
| `Container` | the content well — `max-w-[1320px] px-[30px]` |
| `Button` | `theme-button`, `solid` / `outline` |
| `PageHero` | the `theme-page-title` band that opens 21 pages: h1, optional lead, optional illustration, wavy edges, cream or media variant. Carries the hero illustration's saved scroll `scale` effect by default (`HERO_ART_FX`); pass `image.fx = null` to switch it off |
| `ShapeDivider` | the wavy section edge, recolourable through `--w-wave-*` |
| `Accordion` | disclosure group — rendered open on the server, collapsed on hydration, `hidden="until-found"` so Ctrl+F still finds closed panels |
| `ContactForm` | every form on the site (field set, widths and labels come from each saved Elementor form) |
| `visit-form-fields.ts` | the one "come and visit us" field set shared by `/home-2` and `/parents` |
| `IconBox`, `ImageBox`, `IconList`, `Counter`, `FlipBox`, `VideoFrame` | the remaining reused Elementor widgets |
| `icons.tsx` | the hand-drawn glyph set (chevron, phone, dot, play, menu, close, Facebook, YouTube, Instagram, Twitter) |
| `PageMotion` | the motion runtime (below) |

`src/components/layout` holds `Header`, `MobileNav` and `Footer`, rendered by the
root layout together with `PageMotion`; pages render only their own content.
`src/components/programs` holds the six-in-one program template
(`ProgramPage` + `program-data.ts`) and the YouTube `VideoLightbox`.
`src/components/sections/<route>` holds the per-page sections.
`src/lib` holds `navigation.ts`, `site.ts`, `blog-posts.ts` and `motion-fx.ts`.

### Styles

`src/app/globals.css` holds the design tokens ported from the Elementor kit, the
base type scale, Home 1 and About, and the shared reveal keyframes. It imports
one stylesheet per conversion group from `src/styles/`: `motion.css` (runtime
support), `widgets.css` (the `w-` widget layer and the remaining keyframes),
`programs.css`, `about-family.css`, `admissions.css`, `parents.css`, `misc.css`.
Every page class is prefixed with its route so the groups cannot collide.

Breakpoints follow the theme, not Tailwind's defaults: mobile ≤ 767, tablet
768–1024, desktop ≥ 1025. Desktop rules use `min-[1025px]:`, because Tailwind's
`lg:` is 1024px and would fire one pixel early.

## Assets

Everything is local under `public/`; nothing is requested from
`skole.vamtam.com` at runtime.

- `public/images/<route>/…` — that page's photography and illustrations.
- `public/images/shared/…` and the loose files at `public/images/` — marks used
  by more than one page (fox, trees, snail, waves, logo, footer background).
- `public/fonts/Sensei-Medium.woff` — the theme's handwritten display face,
  exposed as `--font-handwritten`. Body type is Catamaran via `next/font`.

## Motion

`src/components/ui/PageMotion.tsx` reproduces Elementor's entrance animations
and scroll/pointer effects with one `requestAnimationFrame` loop and two
`IntersectionObserver`s. The maths lives in `src/lib/motion-fx.ts`. Markup opts
in declaratively — there is no per-page effect code:

```
data-reveal="fadeInUp"            entrance animation (CSS keyframes)
data-reveal-tablet / -mobile      per-device override; "none" disables it
data-delay="200"  data-duration="1250"
data-fx='{"scale":{…}}'           element scroll effect, from the saved motion_fx
data-fx-range="page"  data-fx-devices="desktop"
data-fx-bg='{…}'                  transforms an element's [data-fx-layer] child
data-motion="tilt|photo|fox|…"    shorthand kept for Home 1 and About
```

Names, delays and effect JSON are taken from each widget's saved
`data-settings`. Content is server-rendered visible; the hidden pre-reveal state
is only added once the controller runs, so JavaScript-off and pre-hydration both
show everything. `prefers-reduced-motion: reduce` clears reveals and inline
transforms, and the header and footer are not re-revealed on client-side
navigation.

Scroll trajectories are recreated from the saved effect settings; no
pixel-for-pixel comparison against a live Elementor runtime is claimed.

## Checks

```
npm run typecheck                 # tsc --noEmit
npm run build                     # next build
node scripts/verify-motion-math.cjs

npm run dev -- -p 4010            # then, against that port:
BASE_URL=http://localhost:4010 npm run verify      # home + ui + pages
BASE_URL=http://localhost:4010 node scripts/verify-motion.cjs
```

Playwright drives the system Edge (`channel: "msedge"`); there is no bundled
browser. Set `PLAYWRIGHT_MODULE` to an absolute Playwright path when using a
shared runtime. Screenshots land in `artifacts/`.

- `scripts/verify-home.cjs` — Home 1 at 320/390/768/1024/1025/1440: overflow,
  broken images, the mobile menu, the experience tabs.
- `scripts/verify-ui.cjs` — About and the shared chrome at 320–1440: layout,
  menu and submenu keyboard operation, image loading, mobile ordering, scroll
  motion, pointer tilt, reduced motion, breakpoint resizing, video activation
  and client-side navigation.
- `scripts/verify-pages.cjs` — the 25 converted routes: h1 and heading order,
  horizontal overflow at 320/390/768/1024/1025/1280/1440, broken images and
  console errors, then the interactive widgets (gallery lightbox, FAQ and
  location accordions, the FAQ table of contents, counters, flip boxes, blog
  search, seven forms), reduced motion, JavaScript-disabled rendering and that
  every internal link resolves.
- `scripts/verify-motion-math.cjs` — 13,852 assertions comparing
  `src/lib/motion-fx.ts` with Elementor's own formulas, transcribed
  independently.
- `scripts/verify-motion.cjs` — checks the runtime wires that maths up in a real
  browser.

As of the last run: `typecheck`, `build`, `verify-motion-math` and all three
browser suites pass. `npm run lint` does **not** run — ESLint is not installed
and there is no `eslint.config.*`; the TypeScript and browser checks were used
instead.

## Limitations — read this before demoing

These are deliberate, and none of them is hidden from the visitor.

- **The forms have no backend.** Every form validates in the browser, shows a
  loading state and then a success panel. Nothing is sent, stored, emailed or
  charged, and the success copy says so. `/make-a-payment` takes no payment
  details and processes no payment.
- **Facebook is a link-out, not the SDK.** The saved `/blog` sidebar embeds
  Facebook's page plugin; this port renders a plain card that links to the page
  instead, so no Facebook script or cookie is loaded.
- **YouTube and Google Maps load only after a gesture.** The program video
  lightbox and the `/location` map are local facades: nothing is requested from
  youtube.com or google.com until the visitor presses play or "Show the map",
  and those need network access to work at all. The automated video check mocks
  the external iframe and verifies activation, not playback.
- **`/parents` comes from `/for-our-parents/`** on the original site.
- **The blog archive's pagination is dropped.** The saved page ends with
  "« Previous / Page 1 / Page 2 / Next »"; page 2's posts are not in the
  capture, so a "Page 2" link could only 404. `/blog` lists the six posts the
  saved archive shows, with the sidebar search filtering them client-side; a
  seventh post exists because the `/home-2` news row links it.
- **Some source assets are not in the capture** because the original references
  them only from CSS, which the scrape did not resolve: `teacher-01..06.jpg`
  (the `/our-teachers` flip-box portraits), `number-01..04_white.svg` (the big
  white numerals on `/careers` and `/home-2`, redrawn as white type),
  `slider-bg.svg` (the backdrop shape behind the `/programs` hero title — a
  translucent scrim stands in so the title keeps its contrast),
  `approuach-bg-left/right.svg` and `slider2-bg-text/splash.svg` (decorative
  layers, omitted).
- **No icon font.** The VamTam icon font and Font Awesome were not captured and
  no icon package is installed, so roughly 25 glyphs across `/programs`,
  `/admissions`, `/careers`, `/home-2` and `/coming-soon` are hand-drawn inline
  SVGs on the same subject. The `01`–`04` step numerals on `/admissions` are the
  verbatim inline SVG paths from the save.
- **`lorem-ipsum.pdf` is missing.** The original links one placeholder PDF from
  nine places (the six `/admissions` download cards, the `/parents` brochure,
  `/student-handbook`, `/make-a-payment`). The wording is kept but the links are
  not, so those render as panels and plain text rather than dead links.
- **Two motion features are not ported.** Section-level
  `background_motion_fx` (the background-layer parallax on ~12 bands) is not
  wired, because it needs an extra layer element that would distort the cut-out
  illustrations. The six program heroes use an Elementor *video* background
  (YouTube `3Y4lgKnmWSk`, and `t2JslAspaYY` on the `/programs` band); no poster
  frame was captured and nothing external may load before a gesture, so they
  render as the theme's deep-teal band with a local play facade. Element-level
  `motion_fx` is ported throughout.
- **Known accessibility gap.** Home 1 (`/`) has a heading-level skip: the four
  contact details in the "Come over and look around" band are `h4`s directly
  after an `h2`. Every other prerendered page has a clean heading outline.
- This is a faithful conversion of the captured pages, not a verified
  pixel-for-pixel reproduction of the live theme, and it is not a claim of
  parity for anything outside the routes listed above.

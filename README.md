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

`final-search.cjs` should report zero in-code hits. One comment in `CareersIcons.tsx` still names the theme as
provenance for an icon set, which is a code comment rather than anything a visitor sees.

## Where things live

| | |
|---|---|
| `src/lib/site.ts` | **School identity.** Name, tagline, motto, contacts, address, coordinates, social accounts. Nothing school-editable belongs in a component — it belongs here. |
| `src/lib/server/` | Portal back end: SQLite (`node:sqlite`), auth, settings, mail, social connectors. |
| `src/app/admin/` | Portal pages and Server Actions (`actions.ts`). Public site pages are in `src/app/(site)/`. |
| `src/lib/navigation.ts` | Header and footer menus. Labels may change; `href`s may not. |
| `src/app/globals.css` | Design tokens in `@theme static`. Change colours here, not in components. |
| `brand/` | Source artwork: crest, badge variants, tab icon, fox. The asset scripts read from here. |
| `scripts/make-brand-assets.cjs` | Regenerates the header logo and the favicon/apple-icon from `brand/`. |
| `scripts/make-fox.cjs` | Regenerates the fox mascot. **Keeps the intrinsic box at 157×145** — several slots size it with `w-auto`, which resolves against intrinsic size, so any other dimensions resize the mascot site-wide. |

## Staff portal (`/admin`)

An internal portal for the school office, served by the same app at `newlight-academy.rw/admin`:

| Section | What it does |
|---|---|
| **Blog** | Write, schedule (future date) and publish posts with a cover photo and full article. `/blog` reads them live. "Save & share" hands the post to the social composer. |
| **Social media** | One composer for Facebook Page, Instagram, YouTube and TikTok — publish now or schedule (Kigali time). Per-network result, error and link; retry failed networks. |
| **Reviews** | Parents submit at `/reviews`; nothing shows until staff publish it. Staff can also add reviews received elsewhere. |
| **Inbox** | Every website form (tour, application, payment question, visit, newsletter, review) is stored here and emailed to the office. Reply by email from the message. |
| **Email** | Send email from the school address; log of everything sent, with failures. |
| **Settings** | SMTP, Cloudinary and social app credentials (secrets encrypted at rest), test email, staff accounts, password change. |

### First deploy

1. Add to the server's `.env`: `SESSION_SECRET` (`openssl rand -hex 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (10+ chars), `SITE_URL`.
2. **Mount a volume at `/app/data`** in the compose file, e.g. `volumes: ["./data:/app/data"]` on the `app` service.
   Without it, posts, the inbox and connected accounts are wiped on every deploy.
3. Sign in at `/admin`, then fill in Settings → Integrations and connect accounts under Social media → Accounts.

### Connecting the networks

- **Email** — Gmail: `smtp.gmail.com`, port 465, a Google App Password (needs 2-step verification on the account).
- **Facebook & Instagram** — a Meta app (Business type) with Facebook Login; register the redirect URI shown on the Accounts page,
  then "Connect". The Instagram account must be a Business/Creator account linked to the Page. Publishing to Pages you
  don't admin, or for other users, needs Meta App Review.
- **YouTube** — Google Cloud OAuth client (Web), YouTube Data API v3 enabled. Only videos can be posted (no API for
  community posts). Unverified apps' uploads may be locked to private until Google's audit.
- **TikTok** — app with Login Kit + Content Posting API. Posts are private (`SELF_ONLY`) until TikTok audits the app.
  Photo posts need `newlight-academy.rw` verified as a URL prefix in the TikTok portal (photos are served from
  `/social-media/…` for that reason); videos don't.
- **Uploads** go browser → Cloudinary directly, so large videos never pass through this server.

Scheduled social posts are published by a one-minute timer inside the server process (`src/instrumentation.ts`).

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

Still to come from the school:

- **Staff names.** The six teacher portraits and the Head Teacher slot in `TeachersTeam.tsx` carry no names,
  because the photographs arrived without any indication of who is in them. `name` and `role` already render —
  fill them in and nothing else changes.
- **The Founder's name.** Her photograph and title are published; her name is not.
- **The Head Teacher.** Confirmed to be a separate person from the Founder; `HEAD_TEACHER` is `null` until a
  name and photograph arrive, at which point the card renders first in the grid.
- Both YouTube videos embedded on the site are still the theme's demo footage. No copy claims they show the
  school, but the school has its own channel and should supply its own. 

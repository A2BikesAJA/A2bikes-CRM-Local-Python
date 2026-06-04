# Handoff: "Compare the SP" Landing Page (`/pages/sp-compare`)

## Overview
A single-page, mobile-first **decision aid** for athletes who already know A2 makes
triathlon bikes and are choosing between the four SP groupset builds (Shimano 105, SRAM
Rival AXS, Force AXS, Red AXS). It collapses a four-PDP comparison into one page with a
one-click path to the right PDP. Mid-funnel audience (retargeting, SP ad sets, "Considered
SP" email segment, branded search). **Primary goal:** click through to the chosen build's
PDP. Secondary: engage the sizing tool / financing. Tertiary: it is *not* an email-capture
page (that's `/pages/why-a2`).

Target URL: `a2bikes.com/pages/sp-compare` (Shopify page using a custom `page.sp-compare`
template).

## About the design files
The files in `reference/` are a **design reference built in HTML/CSS/JS** — a working
prototype showing the intended look, copy, and behavior. They are **not** meant to be
shipped verbatim. The task is to **implement this design inside the live Shopify theme**
using its established conventions (Liquid sections, theme assets, product metafields,
GA4/dataLayer). The prototype deliberately reuses the brand system already established by
the "Why A2" page (`why-a2.css` tokens, `.btn--primary`, header/footer, `.reveal`), so most
of the base styling already exists in the theme.

### Prototype-only — DO NOT ship
- **`image-slot.js`** + every `<image-slot>` element — drag-and-drop photo placeholders for
  the prototype. In the theme, replace each with a real `<img>` from an `image_picker`
  setting (or `product.featured_image`). See **Assets** for which slot maps to what.
- **React + Babel + `tweaks-panel.jsx` + `sp-compare-tweaks.jsx`** — a live "Tweaks" panel
  for design exploration. Not for production. The page logic itself is plain vanilla JS in
  `sp-compare.js` and has no framework dependency.
- **The Google Fonts `<link>`** — the live theme already loads Instrument Sans; don't load
  it twice.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are all
intended as shown. Recreate it faithfully. Brand language is pulled from the live a2bikes.com
theme (Instrument Sans, dark dramatic hero, uppercase accent labels, `btn--primary`, Lava
Red accent) and is identical to the "Why A2" handoff.

---

## Page structure (single scrolling page)

Order: **Header → Hero → Trust strip → 1 Decision filter → 2 Comparison table → 3 Every SP →
4 Financing → 5 Sizing → 6 Reviews/athlete proof → 7 FAQ → 8 Final CTA → Footer.**
Sections use the `.section.section--tight` scaffold (`padding-block: clamp(60px,8vw,104px)`),
alternating `--paper` (#FFFFFF) and `--paper-2` (#F4F3EF) backgrounds.

### Header (sticky)
Reuse the live theme's global header. Prototype copy: logo left; nav (Triathlon / Road &
Gravel / About / Athletes); `btn--primary` "See all builds" → `/collections/sp`. Transparent
over the hero, gains `rgba(14,15,17,.86)` + 14px blur + bottom hairline once `scrollY > 40`
(class `.scrolled`). Nav hidden < 860px.

### Hero (`.sp-hero`)
- **Purpose:** state the question, no CTA — the page itself is the CTA.
- **Layout:** `min-height: min(86svh, 760px)`, dark (`--ink`), content bottom-left, max-width
  820px. Background image fills the section behind a two-axis dark scrim (`.sp-hero__scrim`)
  for legibility.
- **Components:**
  - Eyebrow `.accent-label`: "Choose your build." (uppercase, 600, `.22em`, white; the "."
    is Lava Red via `.dot`).
  - H1 `.display`: "Which SP is right for you?" — `clamp(2.5rem,6.4vw,5.4rem)`, 700, line-height
    .98, letter-spacing -.03em, white. (Line break before "for you?".)
  - Subhead `.sp-hero__sub`: "Same race-tested carbon frame. Same **SAGS** adjustability.
    Four ways to ride it." — `clamp(1.08rem,1.8vw,1.5rem)`, `rgba(255,255,255,.86)`, max-width
    660px; "SAGS" is bold/white.
- **Image:** the premium SP shot (Force or Red AXS, athlete-in-action preferred). This is the
  LCP candidate — serve `loading="eager" fetchpriority="high"`, responsive `srcset`,
  WebP, ≤ 200KB. Preload via `<link rel="preload" as="image">`.

### Trust strip (`.trust-strip`)
A credibility ribbon directly below the hero. Dark band (`#0a0b0d`), 4-column grid
(`repeat(4,1fr)`, → 2-col < 900px → 1-col < 520px). Each item: a 19px Lava-Red line icon +
small text (`.9rem`, `rgba(255,255,255,.72)`, key phrase in white). Items:
1. **5× winner** — Triathlete Magazine "Best Beginner Tri Bike" (star icon)
2. Designed by **Kevin Quan**, former Cervélo P-Series engineer (clock icon)
3. **Lifetime frame warranty** + free crash replacement (shield-check icon)
4. **7-day home demo** — pay only if you keep it (home icon)

### 1 · Decision filter (`.filter`, white)
- **Heading:** "What matters most to you?" + lede ("a nudge, not a quiz").
- **Layout:** 3 `.filter-pill` buttons in a centered flex row (→ stacked < 720px). Each pill:
  white, 1.5px `--line` border, 12px radius, 20×26px padding; a small uppercase kicker, a
  bold 1.18rem label, and a muted "Points to the …" sub-line; a Lava-Red circular check badge
  (top-right) that scales in when selected.
- **Pills** (`data-filter` / `data-target` column index):
  - "Best price" → `price` / target 0 (SP 105)
  - "Performance for the money" → `performance` / target 2 (SP Force AXS)
  - "Best of everything" → `premium` / target 3 (SP Red AXS)
- **Selected state** (`aria-pressed="true"`): accent border + `0 0 0 1px accent` ring + soft
  red shadow; kicker turns Lava Red; check badge visible.
- **Behavior:** single-select, click-again to deselect. On select: smooth-scroll to the table,
  add `.is-rec` to the matching column, show the cue line, persist to `sessionStorage`
  (`sp_compare_filter`). **All 4 builds stay fully visible** — this is a soft guide.

### 2 · Comparison table (`.compare`, `--paper-2`)
- **Heading:** "Compare the builds". A cue paragraph `#compareCue` (hidden until a filter is
  chosen): "Based on your priority, we recommend **[build]**. Compare for yourself below."
- **Desktop layout — CSS subgrid.** `.compare-grid` is `display:grid` with
  `grid-template-columns: 172px repeat(4, minmax(0,1fr))` and
  `grid-template-rows: auto repeat(7,auto) auto auto` (10 tracks = header + 7 spec rows +
  Affirm + CTA). The leftmost `.compare-labels` column and each `.compare-col` are themselves
  `display:grid; grid-row: 1 / -1; grid-template-rows: subgrid` so **every cell aligns to the
  same row track across all columns regardless of content height.** Card has 1px `--line`
  border, 14px radius, `--shadow-card`. *(If you must support a browser without subgrid,
  fall back to equal `grid-auto-rows` or a fixed row-height scale.)*
- **Mobile layout (< 880px) — scroll-snap carousel.** `.compare-grid` switches to
  `display:flex; overflow-x:auto; scroll-snap-type:x mandatory`; `.compare-labels` is hidden;
  each `.compare-col` becomes a `flex:0 0 84%` (max 360px) snap card with the row label shown
  inline via `.cell-label` (hidden on desktop). A "← Swipe to compare →" hint shows. **Do not
  just stack the desktop columns vertically.**
- **Column header (`.bhead`):** 4:3 build image (`image_picker` / `product.featured_image`),
  then build name (1.12rem/700) + one-line positioning (`.bhead__pos`, muted).
- **Rows, top→bottom:** Price (most prominent — `.bprice` `clamp(1.5rem,1.9vw,1.85rem)`/700),
  Groupset, Shifting (icon + word — lightning for Electronic, gear for Mechanical), Drivetrain,
  Wheels, Brakes, Best for, Affirm monthly ("From **$X/mo** at 0% APR"), and a CTA row:
  full-width `btn--primary` "Shop the SP [build]" + a muted "See full specs →" link below.
- **Recommended column** (`.compare-col.is-rec`): subtle `rgba(229,50,43,.045)` tint, a 2px
  Lava-Red inset border (`::after`), and a "Recommended" pill badge (`.rec-badge`) centered on
  the top edge. Other columns stay fully legible — **no graying out.**
- **Data — read from product metafields** so prices/specs never go stale. Build the columns
  from `all_products['<handle>']`. See **Build data table** below for exact current values and
  the metafields to create.

### 3 · Every SP comes with… (`.same`, white)
4 icon cards (`repeat(4,1fr)` → 2-col < 900px → 1-col < 520px). Each: 48px rounded icon tile
(`rgba(229,50,43,.08)` bg, Lava-Red 25px line icon), 1.14rem/700 heading, muted body with key
phrase in `--ink` via `.hl`.
1. **1,250g T700 carbon frame** (bike icon) — hand-laid Toray T700; designed by Kevin Quan.
2. **SAGS adjustable cockpit** (sliders icon) — 140mm fore/aft range; free size exchanges.
3. **Lifetime frame warranty** (shield-check) — honored directly by A2; free crash replacement.
4. **Ships 92% assembled** (box) — **honest copy:** "the real work is the seatpost, cockpit,
   and brake dial-in"; under an hour with the video guide; or a shop finishes for $50–150.

### 4 · Financing (`.pay`, `--paper-2`)
3 equal-weight cards (`repeat(3,1fr)` → 1-col < 860px). Each: a wordmark, a heading with the
key figure in Lava Red, muted body, and a Lava-Red "→" link. **No "preferred" option.**
1. **Affirm** — "From **$260/mo** at 0% APR" (cheapest build $3,115 / 12). Link "Calculate my
   monthly payment →". **Do NOT load Affirm's "as low as" widget** — static display only.
2. **Truemed** — "Save up to 30% with **HSA/FSA**". Link "See if I qualify →".
3. **GovX** — "**10% off** for service & educators". Link "Verify and save →".
Replace the prototype text wordmarks with the partners' real brand logos (Affirm/Truemed/GovX
provide retailer logo assets).

### 5 · Sizing (`.sizing`, white)
Two cards side-by-side (→ stacked < 820px).
- **Left — Quick sizing tool** (`.sizing-card--calc`, white): height (ft + in) and inseam (in)
  number inputs + "Calculate size" `btn--ghost-dark`. Output is a dashed result box showing
  "Recommended size: **[XS–XL]**" + "free size exchanges" note. Prototype uses a height-band
  heuristic; **in production embed the theme's existing inline size calculator (the Custom
  Liquid block already on the SP PDPs).**
- **Right — Quiz** (`.sizing-card--quiz`, dark with Lava-Red radial glow): "Take the 90-second
  quiz" + body + `btn--primary` "Start the quiz →" → Octane AI quiz (`/pages/bike-selector`).

### 6 · Reviews + athlete proof (`.reviews`, `--paper-2`)
- **Heading:** "What SP owners say".
- **Aggregate rating bar** (`.rating-bar`): 3 centered stat blocks — 4.9★ avg / 312 verified
  reviews / 98% would recommend. **Wire to the real Fera.ai aggregate, filtered to SP.**
- **Review cards** (`repeat(3,1fr)` → 1-col < 860px): stars, quote, name + build, "Verified"
  badge. **Prototype reviews are illustrative — replace with real Fera SP reviews (deferred
  load).**
- **Athlete proof** (`.proof-cards`, 3 cards): 4:3 photo + quote (Lava-Red rule above) + name +
  race/result. **Card 1 (Kinley Bollinger — 1st Overall, Ironman 70.3 Puerto Rico, Mar 2026,
  4:40:39) is REAL.** Cards 2 & 3 are explicit `[placeholders]` — replace with real,
  permission-cleared A2 Racing athletes before launch. Do not fabricate.

### 7 · FAQ (`.faq`, white)
Accordion, collapsed by default, max-width 860px. `.faq-q` button (1.05–1.22rem/600) with a
Lava-Red +/− icon that animates (the vertical bar of the "+" collapses). `.faq-a` animates via
`max-height` (set to `scrollHeight` on open). 7 questions, exact copy in the prototype:
P-Series comparison (links to `/pages/a2-vs-competitors`), fit/exchange, self-assembly (honest),
7-day demo, wheel upgrades, shipping ($99, 3–5 business days), crash replacement.

### 8 · Final CTA (`.final`, `--paper-2`)
One large rounded card (`min-height 460px`, 20px radius) with a lifestyle image + bottom scrim.
Overlay: H2 "Ready to choose your build?"; `btn--primary` "Shop the SP — all builds →"
(`/collections/sp`) + `btn--ghost-light` "Or take the 90-second quiz" (`/pages/bike-selector`);
small contact line ("support@a2bikes.com or chat during business hours"). **Different image
from the hero** — a race finish / podium / training shot.

### Footer
Reuse the live theme's global footer. (Prototype reproduces the dark 4-column A2 footer for
realism.)

---

## Build data table (current as of May 2026 — verify against live PDPs at publish)

| Build | Handle | Price | Shifting | Drivetrain | Wheels | Brakes | Affirm /mo (÷12) |
|---|---|---|---|---|---|---|---|
| SP — Shimano 105 | `sp-shimano-105` | **$3,115** | Mechanical | 12-speed · 11–34 | Vision Team 30 alloy | Mechanical disc | $260 |
| SP — SRAM Rival AXS | `sp-sram-rival-1` | **$5,795** | Electronic | 12-speed · 10–36 | Vision Team 30 alloy, tubeless | Hydraulic disc | $483 |
| SP — SRAM Force AXS | `sp-sram-force` | **$7,273** | Electronic | 12-speed · 10–36 | Zipp 404 carbon (free upgrade) | Hydraulic disc | $606 |
| SP — SRAM Red AXS | `sp-sram-red-axs` | **$8,971** | Electronic | 12-speed · 10–36 | Zipp 808 carbon | Hydraulic disc · Paceline rotors | $748 |

Positioning lines: 105 "For your first carbon tri bike" · Rival "For value-minded racers" ·
Force "For competitive racing" · Red "For the podium".
"Best for" copy: see the prototype (verbatim from the brief).

**Metafields to create on each SP product** (so the table auto-updates from PDP edits):
`a2.best_for`, `a2.shifting_type`, `a2.drivetrain_summary`, `a2.wheelset_included`,
`a2.brake_type`, `a2.recommended_filter` (list: "price"|"performance"|"premium"). Price, title,
and featured image come from native product fields.

---

## Interactions & behavior (all in `reference/sp-compare.js`, vanilla, ~5KB)
- **Decision filter:** click → `applyFilter()` adds `.is-rec` to the target column, sets
  `aria-pressed`, shows the cue, smooth-scrolls to `#compare` (and on mobile recenters the
  carousel on the recommended card). Selection persists in `sessionStorage` and is restored on
  load. Click an active pill to clear.
- **FAQ:** single-item toggle; `max-height` transition (0 ↔ `scrollHeight`); recalculated on
  resize for open items.
- **Size calculator:** total height in inches → band (XS <64, S <67, M <70, L <73.5, else XL),
  with an inseam nudge at band edges. Shows the result box.
- **Header / scroll reveal:** identical to "Why A2" — `.scrolled` at `scrollY>40`; `.reveal`
  elements fade up 26px→0 over .7s `cubic-bezier(.16,.84,.44,1)` (`.d1/.d2/.d3` stagger
  80/160/240ms) via a scroll/resize/load position check. Respects `prefers-reduced-motion`
  and `body.no-motion`.
- **Hover:** buttons lift 2px + darken; cards lift + shadow; link arrows nudge 4px.
- **Responsive collapse breakpoints:** trust 900/520 · filter 720 · table 880 (→ carousel) ·
  same 900/520 · financing 860 · sizing 820 · reviews/athletes 860 · final CTA 540.

## State management
Minimal, no framework needed:
- `sessionStorage['sp_compare_filter']` = `{ filter, target }` — the active decision-filter
  selection (persists across scroll/back).
- FAQ open/closed = `.open` class per item.
- Size-calc result = transient component state.
Recreate as local component state if implementing in React/Vue.

## Conversion tracking (GA4 — stubbed via `dataLayer.push` + `track()` in `sp-compare.js`)
Wire these to the real GA4/GTM: `view_sp_compare` (load), `select_sp_filter` {filter},
`view_build_column` {build} (IntersectionObserver, >0.6 visible, once each), `select_sp_build`
{build} (PDP CTA), `select_financing` {provider}, `engage_size_tool`, `start_size_quiz`
{source}, `view_aov_proof` (reviews into view), `expand_faq` {question}, `click_final_cta`
{target}, and `engagement_time_to_decision` {seconds} (load → first `select_sp_build`).

## Design tokens (from `why-a2.css` `:root` — already in theme)
| Token | Value | Use |
|---|---|---|
| `--ink` | `#0E0F11` | dark sections (hero, quiz card, final card) |
| `--paper` | `#FFFFFF` | base / cards |
| `--paper-2` | `#F4F3EF` | warm off-white section bg |
| `--line` | `#E2DFD8` | borders / hairlines |
| `--muted` | `#6A6F75` | secondary text on light |
| `--muted-dk` | `#A7ABB0` | secondary text on dark |
| `--accent` | `#E5322B` | **Lava Red** — CTAs, highlights, numbers, icons |
| `--accent-deep` | `#C32219` | CTA hover |
| Font | **Instrument Sans** (400/500/600/700) | already in theme |
| Radius | card `14px`, final card `20px`, button `4px`, pill `12px`, badge `100px` | — |
| Shadow | `0 1px 2px rgba(16,17,19,.05), 0 18px 40px -24px rgba(16,17,19,.28)` | card hover |
| Max width | `1240px` (`.wrap`); gutter `clamp(20px,5vw,64px)` | — |
| Section pad | `clamp(60px,8vw,104px)` (`.section--tight`) | — |

Icons are inline SVG (Lucide-style, `stroke: var(--accent)`). Swap for the theme's icon set if
preferred. Tweaks panel exposed alt accents (Carbon `#1A1B1D`, Electric Blue `#1E6BFF`) — Lava
Red is the chosen default; alts not required.

## Performance requirements (from brief)
- Mobile **LCP < 2.5s** (the table is the target element) — table renders with HTML/CSS only,
  no JS blocking. Hero image `eager`/`fetchpriority=high`/preloaded; everything else
  lazy-loaded. **Total page < 2.5MB.** All third-party widgets (Fera, Klaviyo, Octane chat,
  Affirm) deferred until main content renders; **no Affirm display widget, no Octane chat above
  the fold, no auto-play video, no exit-intent / pop-up modals, no urgency countdowns.**
- Filter logic is ~5KB vanilla JS — keep it framework-free.

## Assets (replace every `<image-slot>` with a real image)
| Slot id | Maps to | Notes |
|---|---|---|
| `sp-hero` | Hero background | Force/Red AXS, action shot preferred. Prototype pre-fills the real Lava Red SP photo `https://a2bikes.com/cdn/shop/files/DSCF9443-Edit-Edit.jpg`. |
| `thumb-105` / `thumb-rival` / `thumb-force` / `thumb-red` | Build column images | Use each PDP's `featured_image` (~400×300, displayed 4:3). |
| `proof-1` | Kinley Bollinger photo | Real athlete (permission cleared). |
| `proof-2` / `proof-3` | Athlete photos | **Placeholder** — real A2 Racing athletes only. |
| `final-media` | Final CTA background | Race finish / podium; different from hero. |
Other real assets: logo `https://a2bikes.com/cdn/shop/files/A2_-_Primary_Logo_PMS_7899b785-9d3b-42af-828b-bf41c4d92e12.png`; alt SP (black) `https://a2bikes.com/cdn/shop/files/P1000484-Edit.jpg`. Convert all to WebP w/ JPEG fallback; hero ≤200KB, thumbnails ≤50KB.

## Files in this bundle
```
design_handoff_sp_compare/
├─ README.md                  ← you are here
└─ reference/
   ├─ SP Compare.html         ← full markup of all 8 sections + header/footer
   ├─ sp-compare.css          ← page-specific styles (table subgrid, filter, financing, …)
   ├─ why-a2.css              ← shared base: tokens, buttons, header, footer, .reveal
   ├─ sp-compare.js           ← vanilla behavior: filter, FAQ, size calc, GA4 stubs
   ├─ sp-compare-tweaks.jsx   ← prototype-only Tweaks panel (do not ship)
   ├─ image-slot.js           ← prototype-only image placeholders (do not ship)
   └─ tweaks-panel.jsx        ← prototype-only Tweaks shell (do not ship)
```
The HTML links `why-a2.css` then `sp-compare.css`; behavior is `sp-compare.js`. `image-slot.js`
and the React/Babel/tweaks scripts are included only so the reference opens and runs
standalone — strip them when implementing in the theme.

## Quality bar
"If a triathlete who'd never been to A2's site landed here from a Google ad, could they decide
which SP build to buy within 2 minutes?" If yes, it works. The page should read like an honest,
expert guide — calm hierarchy, present-but-not-pushy CTAs — not a sales pitch.

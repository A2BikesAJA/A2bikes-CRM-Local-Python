# A2 Bikes — Landing Page sections (install & handoff)

Four conversion landing pages built as Shopify **Online Store 2.0** sections.
Lightweight Liquid + vanilla JS (no frameworks, nothing render-blocking in the
critical path) to respect the documented mobile-speed constraint.

| # | Page | Section | Page template | Email dataLayer event |
|---|------|---------|---------------|-----------------------|
| 1 | SP Performance | `a2-line-lp` (line = sp) | `page.sp-performance.json` | `sp_lp_email_capture` |
| 2 | SP vs Quintana Roo | `a2-vs-competitor-lp` | `page.sp-vs-qr.json` | `sp_qr_lp_email_capture` |
| 3 | Financing / HSA-FSA | `a2-financing-lp` | `page.financing.json` | `financing_lp_email_capture` |
| 4 | Rogue (road/gravel) | `a2-line-lp` (line = rogue) | `page.rogue.json` | `rogue_lp_email_capture` |
| 5 | Rogue 4th of July Sale | `a2-rogue-july4` | `page.rogue-july4.json` | — (no email capture) |

> Pages 1 and 4 are the **same section** (`a2-line-lp`), parameterised by the
> `line` setting. Maintain one section, not two.

> Page 5 is a **standalone campaign section** (`a2-rogue-july4`) recreated from
> the Claude Design "RogueSaleB" reference. It has no email capture (so no
> Klaviyo wiring), reuses `a2-lp.js` for CTA attribution + GTM events, and adds
> a small countdown/copy-code asset (`a2-rogue-july4.js`). Pricing cards bind to
> the live Rogue products and **compute** the sale price + SAVE from the
> `Discount %` setting — there are no hardcoded prices. Adjust the discount,
> promo code, and `Sale end` date in the section settings per the real promo.

## File map (repo → Shopify theme)

```
shopify/assets/a2-lp.css            → assets/a2-lp.css        (shared styles, themed per page)
shopify/assets/a2-lp.js             → assets/a2-lp.js         (UTM, dataLayer, Klaviyo, Octane, Affirm)
shopify/assets/a2-cost-example.js   → assets/a2-cost-example.js (Page 3 cost widget, illustrative)
shopify/assets/a2-rogue-july4.js    → assets/a2-rogue-july4.js (Page 5 countdown + copy-code)
shopify/snippets/a2-cta.liquid              → snippets/a2-cta.liquid
shopify/snippets/a2-financing-band.liquid   → snippets/a2-financing-band.liquid
shopify/snippets/a2-email-capture.liquid    → snippets/a2-email-capture.liquid
shopify/snippets/a2-build-overview.liquid   → snippets/a2-build-overview.liquid
shopify/snippets/a2-fit-calculator.liquid   → snippets/a2-fit-calculator.liquid
shopify/sections/a2-line-lp.liquid          → sections/a2-line-lp.liquid
shopify/sections/a2-vs-competitor-lp.liquid → sections/a2-vs-competitor-lp.liquid
shopify/sections/a2-financing-lp.liquid     → sections/a2-financing-lp.liquid
shopify/templates/page.sp-performance.json  → templates/page.sp-performance.json
shopify/templates/page.sp-vs-qr.json        → templates/page.sp-vs-qr.json
shopify/templates/page.financing.json       → templates/page.financing.json
shopify/templates/page.rogue.json           → templates/page.rogue.json
shopify/sections/a2-rogue-july4.liquid       → sections/a2-rogue-july4.liquid
shopify/templates/page.rogue-july4.json      → templates/page.rogue-july4.json
```

These files have been deployed into the **"Why A2 — DRAFT (preview, do not
publish yet)"** theme (unpublished). They were **not** added to the live theme,
and the draft theme was **not** published.

## Create the pages (after deploy)

1. **Online Store → Themes →** the *Why A2 — DRAFT* theme → **Customize** to
   preview, or **Pages** in admin to attach templates.
2. **Online Store → Pages → Add page** for each (e.g. "SP Performance"). Under
   **Theme template**, pick `page.sp-performance` / `page.sp-vs-qr` /
   `page.financing` / `page.rogue`.
3. Preview via the draft theme's share/preview link. Publish the pages (and the
   theme) only when you're ready.

## Required settings before going live (per section, in the theme editor)

| Setting | Where | Notes |
|---|---|---|
| **Klaviyo public API key (company id)** | every section → *Email capture* | replaces `KLAVIYO_COMPANY_ID`; without it the form shows success but **creates no profile** |
| **Klaviyo list id** | every section → *Email capture* | the list each guide/flow listens on (`KLAVIYO_LIST_ID`) |
| **Truemed flow URL** | financing band / Truemed card | your Truemed eligibility link |
| **Octane AI quiz URL** | Pages 1 & 4 → *Sizing* | or wire Octane's on-site API (see JS) |
| **Hero image (+ mobile)** | Pages 1 & 4, *Hero* | add alt text in the same panel |
| **Build-selector URL** | *Routing* | leave blank to use the fallback (below) |
| **Fonts** | *Fonts* | optional — toggle "Use custom fonts" to apply a Shopify font; off uses the built-in technical display stack (recommend Archivo / Saira / Oswald for display) |

### Fit Finder calculator (SP sizing block)
The SP Performance page's "Find my size" block embeds A2's existing **Fit Finder**
(`snippets/a2-fit-calculator.liquid`), enabled via the section setting
**Show the A2 Fit Finder calculator**. The fit math is unchanged from A2's
original calculator; only the styling was made responsive/scoped and Chart.js is
lazy-loaded on first result.

> ⚠️ The `fit_coords` (frame XS/S/M/L + stem) in the snippet are the **Speed
> Phreak (2021)** numbers carried over from the original calculator. Confirm they
> match the current SP geometry and size lineup before publishing — update only
> the `fit_coords` object; the rest of the algorithm is geometry-agnostic.

Rogue (and any other line) leaves this off and can use the Octane quiz instead.

### Affirm
The band/cards render Affirm's on-page messaging element
(`.affirm-as-low-as`, amount in cents). It relies on Affirm's store-wide
`affirm.js` (already used at checkout) and is refreshed by `a2-lp.js` — async,
never blocking. The visible fallback text shows until Affirm paints.

## Build-selector routing & fallback

Primary CTAs resolve in this order (configurable, no code):

1. `build_selector_url` section setting (use this once the dedicated
   build-selector section/page is live).
2. else the **first Build block's product** PDP.
3. else the line **collection** — `/collections/sp` or `/collections/rogue`
   (both verified live and already listing the four groupset builds).

The four Build blocks always render as a grid of secondary links, so all four
groupset builds are reachable regardless of the primary route.

Real handles wired in the templates:

- **SP** → `sp-shimano-105n` · `sp-sram-rival-1` · `sp-sram-force` · `sp-sram-red-axs`
- **Rogue** → `rogue-shimano-105` · `rogue-rival-axs` · `rogue-sram-force-etap-axs` · `rogue-sram-red-axs`

## Measurement / analytics

- **GTM dataLayer only** — no GA4/Meta pixels are hardcoded. GTM owns those.
- **Events pushed:** `sp_lp_cta_click`, `rogue_lp_cta_click`, `sp_qr_lp_cta_click`,
  `financing_lp_cta_click`, `*_email_capture` (per table above),
  `truemed_learn_more`, `octane_quiz_open`, `financing_cost_example_change`.
  Every CTA event includes `cta_id`, `cta_text`, `destination`, plus any stored
  UTM/click-id params.
- **UTM survival:** on load, `a2-lp.js` captures `utm_*`, `gclid`, `gbraid`,
  `wbraid`, `fbclid`, `ttclid`, `msclkid`, `_kx` into `sessionStorage`
  (first-touch within the session) and re-appends them to every internal CTA —
  so attribution survives the click into the PDP/checkout. This is the clean
  Google + Klaviyo path; Meta params are captured too for when Meta is added.
- **Convert Insights (Page 2):** stable hooks — `#a2-vs-hero`, `#a2-vs-table`,
  `#a2-vs-cta-hero`, `#a2-vs-cta-final`, `.a2-vs-row`, `.a2-cta`.

## Compliance notes

- All monthly/pre-tax figures are **illustrative estimates**, not a credit offer
  or tax advice. The Page 3 widget keeps every rate/assumption in section
  settings (APR, term, pre-tax rate) — none are hardcoded in markup, and the
  widget makes **no external calls**. Keep these accurate and defensible.
- Page 2 competitor-column defaults say "verify on manufacturer site" on
  purpose — **fill in only verified, factual values** before publishing. No
  unverified competitor knocks.

## Accessibility & performance

- Semantic headings, table `<caption>`/`scope`, form labels, `aria-live` status,
  visible `:focus-visible` rings, `prefers-reduced-motion` honored.
- Hero image `fetchpriority="high"` + explicit dimensions; all other images
  `loading="lazy"`. JS is `defer`-loaded and idempotent (safe if two A2 sections
  share a page). Affirm/Klaviyo load async.

## Still gating measurement (not the build)

1. **Build-selector** — confirm the dedicated section is live, or the collection
   fallback ships. Set `build_selector_url` when ready.
2. **UTM/attribution fix** — these pages emit clean UTM-aware tracking, but the
   store-wide "(not set)"/direct attribution issue still needs its own fix for
   end-to-end measurement. Google + Klaviyo are wired first, as planned.

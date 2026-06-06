# A2 Bikes — Landing Pages · Export & Handoff

Self-contained export of the A2 Bikes conversion landing-page system for
a2bikes.com. Everything needed to understand, edit, and re-deploy the work is in
this bundle. Built as Shopify **Online Store 2.0** sections (Liquid + framework-
free vanilla JS, mobile-first, nothing render-blocking in the critical path).

_Exported 2026-06-06._

## The four pages
| # | Page | Section | Template | Email dataLayer event |
|---|------|---------|----------|-----------------------|
| 1 | SP Performance | `a2-line-lp` (line=sp) | `page.sp-performance.json` | `sp_lp_email_capture` |
| 2 | SP vs Quintana Roo | `a2-vs-competitor-lp` | `page.sp-vs-qr.json` | `sp_qr_lp_email_capture` |
| 3 | Financing / HSA-FSA | `a2-financing-lp` | `page.financing.json` | `financing_lp_email_capture` |
| 4 | Rogue (road/gravel) | `a2-line-lp` (line=rogue) | `page.rogue.json` | `rogue_lp_email_capture` |

Pages 1 & 4 are the **same reusable section**, parameterized by the `line` setting.

## Deployment state (live store)
- **Draft theme:** "Why A2 — DRAFT (preview, do not publish yet)" =
  `gid://shopify/OnlineStoreTheme/176492183716` (**UNPUBLISHED**). All 15 files
  below were deployed here and byte-verified (theme `checksumMd5` == local md5).
  The live/MAIN theme ("May_26_Stilletto_Theme_Update") was **not** touched.
- **Pages** (created, currently **visible**; not linked in nav):
  | Page | Handle / URL | Page ID | templateSuffix |
  |------|--------------|---------|----------------|
  | SP Performance | `/pages/sp-performance` | 152875139236 | `sp-performance` |
  | SP vs Quintana Roo | `/pages/sp-vs-quintana-roo` | 152875172004 | `sp-vs-qr` |
  | Financing & HSA/FSA | `/pages/financing-hsa-fsa` | 152875204772 | `financing` |
  | Rogue All-Road | `/pages/rogue-road-gravel` | 152875237540 | `rogue` |
- **Designed preview:** `https://a2bikes.com/pages/<handle>?preview_theme_id=176492183716`
  (the plain URLs render via the live theme, which lacks these templates, so they
  look empty until the draft theme is published).
- **Git:** GitHub `A2BikesAJA/A2bikes-CRM-Local-Python`, branch
  `claude/magical-bardeen-Dmp93`, draft PR **#10**.

## Real catalog data baked into the templates
- **SP** (`/collections/sp`): `sp-shimano-105n` $3,115 · `sp-sram-rival-1` $4,999 ·
  `sp-sram-force` $7,199 · `sp-sram-red-axs` $8,999
- **Rogue** (`/collections/rogue`): `rogue-shimano-105` $2,699 · `rogue-rival-axs`
  $3,999 · `rogue-sram-force-etap-axs` $5,000 · `rogue-sram-red-axs` $9,900

## Behavior wired in (shared `assets/a2-lp.js`)
- **UTM survival:** captures `utm_*`/`gclid`/`fbclid`/`_kx` etc. to sessionStorage
  and re-appends to internal CTAs so attribution survives into PDP/checkout.
- **GTM dataLayer only** — no hardcoded GA4/Meta pixels.
- **Klaviyo** client-side email capture (configurable company id + list id).
- **Affirm** async on-page messaging refresh + **Truemed** HSA/FSA callouts.
- **Octane AI** sizing-quiz trigger; **Convert Insights** stable IDs on Page 2.
- **Fit Finder** size calculator on SP (`snippets/a2-fit-calculator.liquid`).
- dataLayer events: `sp_lp_cta_click`, `rogue_lp_cta_click`, `sp_qr_lp_cta_click`,
  `financing_lp_cta_click`, `*_email_capture`, `truemed_learn_more`,
  `octane_quiz_open`, `financing_cost_example_change`, `fit_calculator_result`.

## Before publishing — fill these (theme editor, no code)
- Klaviyo public API key (company id) + list ids (placeholders `KLAVIYO_COMPANY_ID` / `KLAVIYO_LIST_ID`)
- Truemed flow URL · Octane quiz URL · hero images (+ alt) · `build_selector_url`
- **Fit Finder `fit_coords`** in `snippets/a2-fit-calculator.liquid` are the
  **Speed Phreak (2021)** frame/stem numbers — confirm against current SP geometry
  and that the size labels (XS/S/M/L) match the SP lineup.
- Page 2 competitor-column values default to "verify on manufacturer site" — fill
  only verified facts before publishing.

## How to re-deploy to a theme
The deploy method used here (works from an API client without theme file access):
1. `stagedUploadsCreate(resource: FILE, httpMethod: PUT)` per file → signed URL.
2. `PUT` the file bytes to the signed URL.
3. `themeFilesUpsert(themeId, files:[{filename, body:{type: URL, value: resourceUrl}}])`
   against the **unpublished** theme (live-theme writes are blocked).
4. Verify each `checksumMd5`. Note: Shopify normalizes `.json` templates and drops
   section settings it can't validate — upsert the **section before** the template,
   or re-upsert the template once the section schema is in place.

Or simply use **Shopify CLI**: `shopify theme push --theme 176492183716` (or pull
into a theme of your choice) from a copy of the `shopify/` folder.

## File map (this bundle → Shopify theme path)
```
shopify/assets/a2-lp.css            → assets/a2-lp.css
shopify/assets/a2-lp.js             → assets/a2-lp.js
shopify/assets/a2-cost-example.js   → assets/a2-cost-example.js
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
```

See `shopify/docs/INSTALL.md` for the full per-page install/settings reference.

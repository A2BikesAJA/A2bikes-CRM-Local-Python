# A2 Bikes × Claude — Project Memory & Team-Account Prompt

This is the complete memory of the A2 Bikes eCommerce work to date, written so a
fresh Claude (Claude Code or a Claude Project on the A2 Bikes Team account) can
continue without any prior conversation. Section 1 is a paste-ready prompt;
everything after it is the durable memory it refers to.

_Last updated: 2026-06-09. Author: Claude Code session with AJ (ajalley@a2bikes.com)._

---

## 1. PASTE-READY PROJECT INSTRUCTIONS (for the Team account)

> Copy this block into Claude Project custom instructions, or rely on the repo's
> root `CLAUDE.md` (same content, condensed) when using Claude Code.

```
You are the eCommerce engineering + growth assistant for A2 Bikes
(a2bikes.com, Shopify). DTC carbon bikes: SP (triathlon, $3,115–$8,999) and
Rogue (road/gravel, $2,699–$9,900), each sold as 4 groupset builds
(Shimano 105 / SRAM Rival AXS / Force AXS / Red AXS). AOV ≈ $4,100.
Funnel reality: PDP loses ~95% of entrants; Begin-Checkout loses ~83% on
price objection; attribution is partially broken ("(not set)").
Strategy: reframe price as monthly (Affirm) + pre-tax HSA/FSA (Truemed),
make fit confidence trivial (Fit Finder), surface the ownership promise
(lifetime warranty, crash replacement, free size exchange, 92% built).

WORKSPACE
- Repo A2BikesAJA/A2bikes-CRM-Local-Python is source of truth; the Shopify
  draft theme is the build target. Docs: docs/CLAUDE-TEAM-MEMORY.md (state
  registry + history), docs/ECOM-AUDIT-AND-ROADMAP.md (findings + phases),
  shopify/docs/INSTALL.md (LP settings reference).
- Draft theme (develop here): gid://shopify/OnlineStoreTheme/176492183716
  "Why A2 — DRAFT (preview, do not publish yet)" — UNPUBLISHED.
- Live theme (read-only without explicit sign-off):
  gid://shopify/OnlineStoreTheme/176478617764.

HARD RULES
1. Never publish a theme; never write to the live theme. The owner publishes.
2. Deploy = staged uploads only: stagedUploadsCreate → PUT bytes from disk →
   themeFilesUpsert(body.type=URL) → verify checksumMd5 against local md5.
   Never hand-paste file bodies into GraphQL. Upsert sections before the
   JSON templates that reference their settings; re-upsert templates if a
   setting is dropped.
3. Edit shopify/ sources first, commit, then deploy.
4. Competitor claims: schema-editable, verified-only ("verify" defaults stay
   until sourced). Financing figures: illustrative, settings-driven, never
   hardcoded; never present estimates as quotes or tax advice.
5. Analytics: GTM dataLayer events only (no hardcoded pixels); preserve UTM
   capture/persist/re-append (assets/a2-lp.js).
6. Storefront fetches are bot-blocked; scriptTags is scope-denied. Inspect
   via Admin API theme-file reads.
BLOCKERS before public launch: Fit Finder fit_coords are 2021 Speed Phreak
data (sizes XS/S/M/L vs current Small–XL) — needs current SP geometry;
Klaviyo company/list IDs + Truemed + Octane URLs are placeholders; the four
LP pages are published but only render on the draft theme; Why A2 page has
placeholder athlete quotes and an empty klaviyo_form_id.
```

---

## 2. Business context

- **Brand:** A2 Bikes, Oregon. Engineering pedigree: geometry by Kevin Quan,
  former Cervélo P-Series engineer. Raced at Kona; Triathlete Magazine "Best
  Beginner Triathlon Bike" multi-year winner (verify count/years before use).
- **Catalog model:** each line = 4 separate Shopify products by groupset.
- **Funnel audit (given):** homepage LP conv 0.3%; all other LPs 0.03–0.07%;
  PDP drop-off ~95% (leak #1); Begin-Checkout abandonment ~83% on price
  objection (leak #2); Google CPC+organic 0.31–0.36% vs Meta 0.02–0.07%;
  UTM/attribution partially broken — lots of "(not set)"/direct.
- **Stack:** Klaviyo (email + reviews app on PDP), Affirm, Truemed (HSA/FSA),
  Octane AI (quiz), Convert Insights (A/B), GovX (military), GTM. Brief
  mentioned Fera.ai for reviews but the live PDP actually embeds **Klaviyo
  Reviews** — owner to confirm canonical platform (recommend Klaviyo Reviews).

## 3. State registry (as of 2026-06-09)

### Themes
| Theme | GID | Role |
|---|---|---|
| Why A2 — DRAFT (preview, do not publish yet) | `gid://shopify/OnlineStoreTheme/176492183716` | UNPUBLISHED — all new work lives here |
| May_26_Stilletto_Theme_Update | `gid://shopify/OnlineStoreTheme/176478617764` | LIVE/MAIN — untouched by this project |

The draft is a **clone of the live theme (May 29, 2026)** — `templates/index.json`
and `layout/theme.liquid` are byte-identical to live; `templates/product.json`
**was** identical until the Phase 0 fixes landed on it June 9 (see §5.10; repo
copy: `shopify/templates/product.json`) — plus:
1. **Why A2 page system** (built with Claude June 1–3): sections `wa-hero`,
   `wa-credibility`, `wa-promise`, `wa-products`, `wa-athletes`, `wa-capture`
   (2–3 KB each) + `assets/why-a2.css` (11 KB) + `templates/page.why-a2.json`.
   `sections/why-a2.liquid` (31.5 KB) is a superseded all-in-one version — dead
   code, safe to delete.
2. **The 4-LP system** (this project, June 4): 16 files under `shopify/` in the
   repo, deployed and checksum-verified (list in §4).

### Pages created by this project (all currently **visible/published**)
| Page | Handle | Page ID | templateSuffix |
|---|---|---|---|
| SP Performance | `/pages/sp-performance` | 152875139236 | `sp-performance` |
| SP vs Quintana Roo | `/pages/sp-vs-quintana-roo` | 152875172004 | `sp-vs-qr` |
| Financing & HSA/FSA | `/pages/financing-hsa-fsa` | 152875204772 | `financing` |
| Rogue All-Road | `/pages/rogue-road-gravel` | 152875237540 | `rogue` |

⚠️ Their templates exist **only in the draft theme**, so the public URLs render
mostly empty via the live theme. Designed preview:
`https://a2bikes.com/pages/<handle>?preview_theme_id=176492183716` (admin login
required). Resolve by publishing the theme or reverting pages to hidden.
(`rogue-all-road` handle was taken; hence `rogue-road-gravel`.)

### Catalog (verified live)
| Line | Collection | Builds (handle → price) |
|---|---|---|
| SP | `/collections/sp` (ID 506024755364) | `sp-shimano-105n` $3,115 · `sp-sram-rival-1` $4,999 · `sp-sram-force` $7,199 · `sp-sram-red-axs` $8,999 |
| Rogue | `/collections/rogue` (ID 500121338020) | `rogue-shimano-105` $2,699 · `rogue-rival-axs` $3,999 · `rogue-sram-force-etap-axs` $5,000 · `rogue-sram-red-axs` $9,900 |

SP/Rogue PDPs: 25 media each; options Color × Size (**Small/Medium/Large/XL**);
12 variants. Rich spec metafields exist (`sc_attributes.*` — crank, cassette,
brakes, etc.) — use them for Phase 1 spec tables. Note a second SP collection
reference `sp-25` appears in the live PDP template — reconcile with `/collections/sp`.

### Git
Repo `A2BikesAJA/A2bikes-CRM-Local-Python` · branch `claude/magical-bardeen-Dmp93`
· draft **PR #10**. Repo layout: `shopify/` (LP system source), `docs/` (this file,
audit), `CLAUDE.md` (Claude Code prompt), `export/` (gitignored bundles).

## 4. The LP system (built, deployed, verified)

| Layer | Files |
|---|---|
| Sections | `a2-line-lp.liquid` (ONE section for SP **and** Rogue via `line` setting — palette, events, fallbacks switch), `a2-vs-competitor-lp.liquid` (schema-editable comparison rows, Convert hooks `#a2-vs-*`), `a2-financing-lp.liquid` (Affirm/Truemed explainers + illustrative cost widget) |
| Snippets | `a2-cta` (dataLayer + UTM-aware links), `a2-financing-band` (Affirm `affirm-as-low-as` + Truemed), `a2-email-capture` (Klaviyo client API + honeypot), `a2-build-overview` (4 product-driven build cards = on-page build-selector fallback), `a2-fit-calculator` (the real 2021 pad-X/Y Fit Finder, presentation modernized, Chart.js lazy-loaded; **fit_coords stale — blocker**) |
| Assets | `a2-lp.css` (token-themed: `--a2-*`; per-page palettes sp/rogue/financing/vs), `a2-lp.js` (UTM capture→sessionStorage→re-append; dataLayer pusher `window.a2dl`; Klaviyo subscribe; Octane trigger; Affirm refresh; idempotent), `a2-cost-example.js` (illustrative amortization + pre-tax math, settings-driven, no network) |
| Templates | `page.sp-performance.json` (incl. `show_fit_calculator: true`), `page.sp-vs-qr.json`, `page.financing.json`, `page.rogue.json` — wired to the real product handles |

Routing contract: primary CTA → `build_selector_url` setting → first build's PDP
→ line collection. Events: `sp_lp_*`, `rogue_lp_*`, `sp_qr_lp_*`,
`financing_lp_*` (+ `_email_capture` variants), `truemed_learn_more`,
`octane_quiz_open`, `financing_cost_example_change`, `fit_calculator_result` —
all carry stored UTM/click IDs.

## 5. Session history (what happened, in order)

1. **Grounded against the live store** via Shopify MCP: confirmed store, the 4 SP
   + 5 Rogue products and collections, the draft theme's existence and
   UNPUBLISHED role; pulled real handles/prices.
2. **Built the 4-LP system** (16 files) per the campaign brief: mobile-first,
   framework-free, UTM-clean, GTM-only, Klaviyo/Affirm/Truemed/Octane/Convert
   integrated, all copy and claims schema-editable. Fixed Liquid `where`-on-
   nested-settings bug; removed non-standard top-level JSON keys.
3. **Pushed branch + opened draft PR #10**; subscribed to PR activity (no CI
   configured in the repo; no review comments to date).
4. **Deployed to the draft theme.** First attempt hand-transcribed a base64 body
   into GraphQL and corrupted 3 chars ("Content contains invalid characters").
   Switched to **staged uploads** (see §6) — all files byte-verified via
   `checksumMd5`. Discovered Shopify **normalizes JSON templates** and silently
   **drops settings not in the section schema** if the template lands before the
   section — fixed by re-upserting the template after the section.
5. **Created the 4 pages** (IDs in §3) as hidden drafts; later **flipped visible**
   on AJ's request (with the caveat they render empty on the live theme).
6. **Ported the Fit Finder** into the SP LP on AJ's request ("the bike size
   calculator that we've coded together"): found the canonical algorithm on
   `/pages/speed-phreak-fit-calculator` (2021) + the Speed Phreak PDP; preserved
   the math verbatim, modernized presentation, lazy-loaded Chart.js, added
   `show_fit_calculator` setting + enabled on SP template. Flagged stale coords.
7. **Built the Team-account export**: `export/a2-bikes-landing-pages.zip` +
   single-file `export/A2-Bikes-Landing-Pages-EXPORT.md`; added
   `shopify/docs/HANDOFF.md`.
8. **Ran the eCommerce audit** (`docs/ECOM-AUDIT-AND-ROADMAP.md`): read the LIVE
   theme's `templates/product.json` via Admin API (storefront curl = 403 bot
   protection; `scriptTags` = scope denied; Canyon/Peloton fetches also blocked
   → benchmark patterns stated from knowledge). Headline findings in §7.
9. **Evaluated the draft theme** (this doc, §8): confirmed it's a live-theme
   clone + the Why A2 page system + the LP system; read `page.why-a2.json`.
10. **Executed punch-list items A + C (June 9, branch `claude/upbeat-meitner-cve145`).**
   Adopted the whole Why A2 system into the repo (`wa-*` sections, `wa-assets`
   snippet, `why-a2.css/.js`, `page.why-a2.json`) and added
   `shopify/templates/product.json` — both now repo-tracked source of truth.
   Changes deployed to the draft theme and checksum-verified:
   - **Why A2:** hero CTA 2 now links to the SP Fit Finder
     (`/pages/sp-performance#a2-fit-calc`, label "Find your size in 60
     seconds"); SP card → `/pages/sp-performance`, Rogue card →
     `/pages/rogue-road-gravel`; product cards bind to `sp-shimano-105n` /
     `rogue-shimano-105` for live "from" prices (hardcoded text is fallback
     only) plus an illustrative settings-driven "or ~$X/mo with financing ·
     HSA/FSA eligible" line; athletes section `disabled: true` until real
     quotes arrive. Verified `pages/warranty` EXISTS (published) — link OK.
   - **Phase 0 on the draft PDP template:** removed the 4 Force-AXS
     cross-product sections, both broken size calculators, the
     `verify.plaid.com` callout, the mid-page exit banner (+ its in-body
     Google Fonts), the two demo callouts and the "Always Chic." leftover;
     enabled description, trust callouts and star rating; disabled the
     untracked-inventory scarcity bar; fixed `collections/sp-25` (confirmed
     dead) → `/collections/sp`; genericized warranty/crash copy SP → A2.
   - **Not done (blocked):** `sections/why-a2.liquid` deletion + 5 leftover
     `sections/a2-test-*.liquid` debug stubs — `themeFilesDelete` is blocked
     by tooling; owner deletes them in the theme code editor. Klaviyo/Truemed
     IDs, athlete quotes, Fit Finder coords still open (§9).
11. **Fixed per-color PDP galleries (June 9, store data — affects live).**
   How the theme's variant media works (`main-product--default.liquid` +
   `theme.js` `Product._refreshOverviewWithVariant`): with the
   `enable_multiple_variant_media` setting ON (it already is, live and
   draft), Liquid slices the product's media list into groups using the
   **positions of the variants' assigned images as delimiters** — alt text
   is ignored. On variant change the JS re-renders the gallery via the
   Section Rendering API. Contract per product: media ordered in contiguous
   color blocks (same order as the Color option), every variant assigned its
   color block's **first** image, sizes of a color sharing that image.
   Audit of all 8 bikes: 6 already compliant; fixed the 2 violations via
   Admin API: **rogue-rival-axs** (stray Matte-Black/Silver photo at
   position 10 inside the Cascade Blue block → moved into the black/silver
   block via `productReorderMedia`) and **rogue-sram-red-axs** (8 Cascade
   Blue variants pointed at the 2nd CB image, orphaning image #1 →
   reassigned via `productVariantDetachMedia`/`AppendMedia`). Re-queried and
   verified. Cosmetic leftovers for the owner: two "Matte Black and Glossy
   Gold" photos group under Matte-Black/Silver on `rogue-shimano-105` and
   `rogue-sram-force-etap-axs`; multi-color group shots sit inside one
   color's block on the SPs; `sp-sram-rival-1` has only ONE Lava Red photo.
12. **Affirm messaging on collection pages (June 9, draft theme).** Adopted
   `snippets/product-item.liquid` into the repo (md5-verified) and added
   Affirm's `affirm-as-low-as` element (`data-page-type="category"`) under
   each card price for in-stock products ≥ $500 — "As low as $X/mo" beside
   every bike price, no-op if the Affirm app script is absent. New
   settings-driven `sections/a2-collection-financing-band.liquid` (Affirm +
   Truemed copy, button → `/pages/financing-hsa-fsa`, dataLayer event
   `collection_financing_click`) inserted before the grid in
   `templates/collection.json` (now repo-tracked; transcription
   agent-verified against the theme before modifying — NOTE: JSON template
   `body` from the API is re-formatted relative to stored bytes, so
   pre-edit byte-checksums don't match for files we didn't write; compare
   parsed content instead). Known issue noted: the DEFAULT collection
   template is SP-specific (hero/video/size guide) and renders on Rogue +
   accessory collections — Phase 1 item.
13. **Affirm messaging root cause + compliant band rework (June 9).**
   Why "As low as $X/mo" wasn't rendering: **affirm.js is not loaded
   anywhere** — on BOTH themes the only Affirm presence is the app's
   cart-drawer embed (enabled but `public_api_key_drawer: ""`); no
   site-messaging embed, no script in `theme.liquid`, no key stored
   anywhere in either theme (verified by full settings_data.json scans).
   Reworked `a2-collection-financing-band` to Affirm compliance: approved
   default phrasing ("Buy now, pay later with Affirm."), image_picker slot
   for the OFFICIAL logo (upload from Affirm Business Hub brand kit — never
   recreate it), Affirm-rendered as-low-as line for the collection's
   cheapest eligible bike, required lender disclosure (+ affirm.com/lenders
   link), and an optional `affirm_public_key` setting that bootstraps
   affirm.js as a fallback (no-ops if the app embed is active). Hardcoding
   Affirm's promo language is prohibited per their guides; placements use
   their components. **OWNER ACTION (new blocker): activate Affirm
   messaging** — in the draft theme editor → Theme settings → App embeds,
   enable the Affirm site/promotional messaging embed (and fill the public
   API key on the cart-drawer block), or paste the public key into the
   band's setting. Until then every `.affirm-as-low-as` placeholder
   (collection cards + band) stays empty by design.
   Live-theme `layout/theme.liquid` issues spotted during the read-only
   scan (for a future cleanup pass, NOT touched): unclosed
   `gtag('event','view_item')` script referencing `product` on every page
   type, malformed `querySelectorAll` string, duplicated `a2IdentifyVisitor`
   definitions, duplicate Zoho SalesIQ loader, orphan `{%- endif -%}` after
   `</html>`.
   **Resolution (same day):** owner activated Affirm by adding the Affirm
   app's COLLECTION app block (an `apps` section, loads affirm.js) to both
   collection templates in the theme editor and uploading the official logo
   (`shopify://shop_images/986051c-affirm-logo.png`) to the band — Affirm
   messaging confirmed working. Owner edits synced back into the repo
   (`templates/collection.json`), and the band + verbatim app block were
   added to the Rogue template `templates/collection.collection-landing.json`
   (Rogue collection templateSuffix = `collection-landing`; SP uses the
   default template). Both deployed + checksum-verified. The cart-drawer
   embed's `public_api_key_drawer` is still empty — cart messaging still
   dead until the owner fills it.
14. **Compact Affirm band + homepage rebuild (June 9, draft theme).**
   (a) CRO: the full band pushed collection grids below the fold; added a
   `compact` single-row mode (logo · heading · as-low-as · button, small
   disclosure) and enabled it on both collection templates. The verbose
   layout remains a toggle.
   (b) **Rebuilt `templates/index.json`** (now repo-tracked) on the brand
   system, per the high-AOV playbook (§2 of the audit + fresh research:
   proof high on page, financing beside prices, fit-first CTA, authentic
   athlete content). New order: wa-hero (dual CTA: Shop the SP / Find your
   size in 60 seconds → Fit Finder) → trust ticker (kept, every claim now
   LINKS to its page: warranty, crash-replacement, a2-promise, fit calc) →
   wa-credibility → wa-products (live prices + financing line) → Affirm
   band (full mode) → press quotes (kept: Esquire/Triathlete/PBJ) →
   "Adjustability = Speed" image hero (kept, now clickable →
   /pages/sp-performance) → wa-promise → A2 Support (kept) → blog posts
   (kept) → wa-capture. DROPPED: 3 dead hero variants, expired BFCM
   slideshow + countdown (impossible "Nov 31" date), Melbourne demo-theme
   copy, duplicate SP/Rogue split, stale "AXS back in stock" closer, dead
   `sp-25` link, hardcoded-URL rich-texts, off collection_list_slider and
   accessory hotspot (both worth revisiting in Phase 1/3). Old homepage
   remains intact on the LIVE theme. Note: homepage as-low-as in the band
   won't render until the Affirm app block (or key) is present on the index
   template — owner can add the same app embed block there via the editor.
15. **Parallel-session drift discovered + LP/PDP fixes (June 10).** A second
   session (Team account, June 9 ~19:00) modified theme files directly:
   restyled the LP system (new "Brand & color" schema group on
   `a2-line-lp`, light brand palette + dark hero) and built an entire
   per-build PDP system in the theme only — `sppdp-*` sections + 13
   product templates (`product.sp-shimano/sp-rival/sp-force/sp-red`,
   `product.rogue-*`, `product.sppdp-live*`, `page.sp-pdp`). Adopted into
   the repo (md5-verified): `a2-lp.css`, `a2-line-lp.liquid`,
   `page.sp-performance.json` (semantic — Shopify's stored serialization
   of this template never byte-matches the API body), `sppdp-specs.liquid`.
   Fixes deployed on top: (1) raw-JSON "Complete weight" tile — the section
   rendered `{{ mf.weight }}` (the drop) instead of
   `{{ mf.weight.value.value }} {{ mf.weight.value.unit }}`; fixes all 12
   build PDPs; (2) black-on-black hero financing line — the dark-hero
   override recolored h1/eyebrow/lead but not `.a2-hero__price` (which sat
   on the near-black brand accent #242526); (3) proof cards now support a
   card photo + built-in inline-SVG icons (wind/feather/sliders/shield/
   dollar) — icons set on both LP templates, photos owner-fillable.
   **ADOPTION BACKLOG (theme newer than repo, not yet adopted):**
   `sections/a2-vs-competitor-lp.liquid`, `sections/a2-financing-lp.liquid`,
   `templates/page.financing.json`, `templates/page.sp-vs-qr.json`, plus
   all other `sppdp-*` sections/snippets/assets and the 13 sppdp product
   templates. Until adopted, do NOT deploy those repo files — they would
   overwrite newer theme work.
16. **Full adoption pass DONE (June 10).** The backlog above is cleared —
   the repo again mirrors every project file in the draft theme (all
   adoptions checksum-verified): the 4 drifted LP files; the complete
   `spc-*` compare-page system (10 sections + 3 snippets +
   `sp-compare.css/js`); the complete `sppdp-*` per-build PDP system
   (5 sections + 2 snippets + `sp-pdp.css/js`); and 15 templates — 4 SP
   build PDPs, 5 Rogue PDPs, 3 `sppdp-live*` test templates,
   `page.sp-pdp`, `page.sp-compare`, and `page.sp-performance` re-synced
   (Shopify dropped its unrecognized `use_theme_fonts` setting). NOT
   adopted on purpose: the ~50 live-theme-clone baseline templates
   (page.about/faq, collection.accessories, product.gift-card etc.) — the
   repo tracks project systems, not the whole theme.
   **Pre-publish content flags found during adoption (add to §9):**
   - All four SP build templates say "What SP-105 riders actually say"
     (wrong on Rival/Force/Red) and hardcode "Shimano 105" in a compare
     row; Rogue compare notes reference "—" cells that don't exist.
   - Identical illustrative reviews ("Marcus T. / Dana R. / Priya S.",
     `verified: true`, 4.8★/96 reviews/97% recommend) ship on ALL build
     PDPs — claims-discipline violation if published as-is; replace with
     Klaviyo Reviews or strip `verified` flags and ratings.
   - Competitor prices in compare tables ($5,099/$4,599/$5,499…) need
     verification per the claims rule.
   - Empty settings across PDP templates: Affirm app-block key,
     `affirm_url`, `consult_url`, `size_help_url`, `rating_count`;
     `show_affirm_line: false` everywhere; Klaviyo IDs still placeholders.
   - Cleanup candidates for the owner (with the a2-test stubs):
     `product.sppdp-live/live2/live4` (empty test templates),
     `page.sp-pdp` (page mirror of the 105 PDP), the 4 `spcv3`/staging
     clones of page.sp-compare, `snippets/spc-deploy-check.liquid`, and
     `product.rogue-apex.json` (Stiletto-default outlier; no Apex build
     in the registry).
17. **Size Calculator v2 rolled out (June 10).** The owner supplied a new
   self-contained size calculator (height/inseam → S–XL with cm labels,
   SP "aero" size-down option, out-of-range Klaviyo lead capture with
   consent check, per-build CTAs). Adopted as
   `snippets/a2-size-calc.liquid` (verbatim except: build URLs made
   relative so preview-theme visitors aren't bounced to the live site,
   and a per-container bind guard so double-rendering can't double-bind).
   Wrapped in `sections/a2-size-calculator.liquid` (theme-editor preset)
   and inserted after the specs section on all 9 bike PDP templates; the
   homepage hero pop-up now renders THIS calculator instead of the 2021
   pad-X/Y Fit Finder. **This supersedes the fit_coords blocker for
   PDP/homepage sizing** — the old Fit Finder remains only on the SP LP
   (`show_fit_calculator`) until the owner provides current geometry or
   chooses to swap it there too. Size charts live in the snippet's
   SP_CHART/ROGUE_CHART/BIKE_BUILDS constants — update there when the
   lineup or sizing changes.
18. **Batch A of the prioritized backlog DONE (June 10).** Working through
   `docs/PRIORITIZED-EDITS.md` in batches: A (items 1,2,3,11) complete.
   (1) NAV (live, store-wide): header "Menu 3.0 (Northwrd) (copy)" gained
   a Support dropdown (Warranty, Crash Replacement, Financing & HSA/FSA →
   `/pages/pay-with-truemed` until the canonical financing page ships in
   Batch C, Size Guide, Bike Setup, Bike Selector Quiz) + quiz under Shop;
   footer Support menu: dead "Chat Our Team" removed, Warranty/Crash/
   Financing added. (2) PDP financing line ON across the 8 build PDPs —
   the DIY "affirm" text-logo + hardcoded as-low-as was replaced with
   Affirm's official component first (compliance). (3) Fabricated reviews
   sections disabled on all 8 build PDPs; Klaviyo Reviews app block added
   in their place; headings de-105'd, fake verified badges/summary off.
   (11) FAQ page rebuilt (live): 10 current Q&As, every answer linking its
   canonical page, stale handles/claims removed. NAV CLARIFICATION: menus
   are STORE-LEVEL (not theme files) — theme-file discipline is unaffected.
   The DRAFT theme's header uses menu handle `menu-4-0-6-26` ("Menu 4.0
   (6/26)"); the live header uses `menu-3-0-northwrd-copy`. Both now carry
   the Support dropdown (draft's financing link → /pages/financing-hsa-fsa;
   live's → /pages/pay-with-truemed until the LP works on live). Draft
   footer renders link lists `footer` (the updated Support menu) and
   `the-company` (Financing Options fixed → pay-with-truemed). Batches:
      NAV UPDATE (June 10, owner direction): live nav must stay UNTOUCHED
   until publish — the three live-shared menus (`menu-3-0-northwrd-copy`
   header incl. its "Why Choose A2?" item, footer `Support` list incl. its
   original dead "Chat Our Team" link, `the-company`) were reverted to
   their exact pre-session state. All nav improvements live ONLY in the
   draft theme's menu `menu-4-0-6-26` ("Menu 4.0 (6/26)"), restructured
   against nav best practice (5 top-level; <=7 per dropdown; grouped by
   intent): Bikes (Tri/Road/Demo/Quiz — setup links moved out), Compare
   Bikes, Gear, Support (Warranty/Crash/Financing LP/Size Guide/Setup/
   Owner's Manual/FAQs), About (7 items; Press folded into News; FAQs +
   Owner's Manual moved to Support). AT PUBLISH: re-apply the Support
   structure to whichever menu the published theme's header references,
   and fix the footer dead link + the-company financing link then.
   BATCH B PROGRESS (June 10): (a) DONE — warranty + crash-replacement
   pages rewritten LIVE with owner-supplied facts (limited lifetime
   warranty on carbon frames, original owner, 130kg limit kept; flat 30%
   crash replacement discount replacing the tiered table AND the unsourced
   competitor table; placeholders gone; one contact email info@a2bikes.com;
   Oregon governing law; CTAs added; registration gate REMOVED so the
   missing registration form is no longer a dead-end — backlog #5 now
   optional). Recommend owner has counsel skim both pages. (e) DONE —
   Truemed qualification URL https://www.truemed.com/shop/partners/a2-bikes
   wired into page.financing.json, page.sp-performance.json,
   page.rogue.json (deployed + verified). (b) DONE June 10 — Klaviyo company ID YejYTH + list ID Riv6B2 wired
   into all four LP templates (email capture live on draft); Why A2
   `klaviyo_form_id` still empty (owner has no published sign-up form yet;
   capture uses the built-in fallback). STILL PENDING from owner: (c)
   Affirm cart-drawer public key (editor toggle), (d) current SP+Rogue
   geometry.
   B = owner-input
   pass (legal text, Klaviyo IDs, Affirm key, geometry, Truemed URL);
   C = consolidation (canonical financing/sizing pages, 301s, zombie purge
   — needs owner sign-off on the kill list); D = video/UGC/blog.

BATCH C EXECUTED (June 10, partial — the safe half): CONSTRUCTIVE — (1)
   `/pages/a2-shipping` rewritten with current terms + published; (2) A2
   Promise page (`page.our-promise.json`, draft) productized with a
   5-pillar row; (3) NEW canonical `/pages/size-guide` (id 152884904100,
   templateSuffix `sizing`) with HTML SP+Rogue geometry tables in the body
   (renders on any theme) + the v2 calculator on the draft template.
   DESTRUCTIVE — bulk URL-redirect import (job done) of 30 paths: 12 sizing
   handles → /pages/size-guide, pay-with-truemed-1 → /pages/pay-with-truemed,
   17 zombie/legacy → nearest live equivalent; then unpublished the 7
   still-published sources (sp-sizing, sp-size-guide, sp-geometry-chart,
   sp-geometry-chart-1, copy-of-sp-geometry,
   copy-of-rogue-all-road-geometry-guide, pay-with-truemed-1) so the
   redirects fire; retitled `sp-comparison-page-draft` → "Compare Bikes"
   (handle unchanged). DEFERRED TO PUBLISH (would alter live nav or send
   live traffic to a draft-only page): financing consolidation (finance,
   finance-your-bike, financing-your-bike, ride-now-pay-later,
   financing-and-installments → /pages/financing-hsa-fsa — target only
   renders on draft, and finance-your-bike/financing-your-bike are in live
   menus), about → about-new, and the buying-process vs buying-process-2-0
   dedup (both in live menus; owner to pick canonical at publish).

BATCH D RECON DONE (June 10): Drive UGC/social-proof sweep complete —
   full inventory in `docs/UGC-ASSET-INVENTORY.md`. Highlights: the Fera
   reviews were recovered (Darren's xlsx export in the Written UGC folder;
   cleaned to `docs/data/fera-reviews-clean.csv` — 96 genuine reviews,
   4.53★, 81×5★; 6 flagged-fake 1★ "Ben"/"Lars" reviews EXCLUDED — ask
   Fera support to strike them; text is truncated ~150 chars, full text
   needs the Fera dashboard). Verified press quote in hand (Jon Dorn,
   Triathlete, SP Force review). Video for backlog #19 confirmed: SP
   Website Header_4.mp4 + finished SP UGC edits + creator race-day/pro-
   tips footage (Brennen/Carolyn/Kaitlin/Markus; Kinley & Travis UGC '26
   folders look empty — ask Darren). Athlete-quote candidates for #17:
   Kinley (has 5★ review + 1x1 video) + the other five creators.
   OWNER CONSTRAINT (June 10): Fera can't run on live + draft templates
   simultaneously — owner will update/re-enable Fera AT PUBLISH-SWAP, not
   before. Interim for #3: static genuine quotes (settings-driven, dated
   attribution) in the draft review sections; Fera widget + fake-review
   removal + full-text pull go on the publish checklist.

BATCH D STEP 1 DEPLOYED (June 10/11): new `sections/sppdp-media.liquid`
   (hero video slot + rider UGC strip) wired into all four SP build
   templates after `main`, deployed to the draft theme, checksums
   verified. Hero accepts a theme-editor video pick OR a CDN URL; strip
   blocks likewise. Seeded with the first REAL rider clip uploaded to
   Shopify Files via staged upload (Video gid://shopify/Video/42726498173092,
   CDN 63b15b92bf494804ba199693fd7c14d0.SD-480p…mp4 + poster
   `shop_images/a2-sp-rider-ugc-poster.jpg`); also uploaded
   `vivek-testimonial-facebook.png` (MediaImage 42726498107556).
   TRANSFER CONSTRAINTS LEARNED: env egress blocks google hosts (Drive
   direct download impossible), Drive MCP caps file transfer at <~10 MB,
   and Shopify fileCreate rejects extensionless source URLs — so the BIG
   Drive masters (SP Website Header_4.mp4 106 MB, creator videos
   176–434 MB) must be drag-dropped into admin → Content → Files by the
   owner (or picked straight into the section's video setting in the
   theme editor). NEW GOTCHA for §6: silent section rejection also
   triggers on Liquid syntax errors (an unclosed `{% if %}` here) — not
   just long labels; t1/t3 test stubs were overwritten during bisection
   (still junk, still on the owner's delete list).
   PUBLISH PLAN (June 11): full owner punch list + publish-day sequence
   now lives in `docs/PUBLISH-CHECKLIST.md` — read it before publish work.
   STILETTO v6 ADVISORY (June 11, Fluorescent emails): v6 ships ~mid-June,
   free; settings partially RESET (colors/spacing/typography) and custom
   code files do NOT transfer. Decision: publish current draft first; v6
   migration is a separate post-publish project (install v6 unpublished,
   re-deploy custom layer from repo, restyle, second swap). Never update
   the theme in place.
   DRIFT EVENT (June 11 ~00:14 UTC): a stale theme-editor save overwrote
   templates/product.sp-shimano.json ~3 min after the media deploy,
   removing BOTH the new media section AND the earlier Affirm product
   block (the tab predated that change too). Re-deployed from repo and
   checksum-verified. Lesson: after any template deploy, anyone with an
   already-open editor tab will clobber it on save — have the owner
   refresh/close editor tabs before saving, and re-verify checksums if a
   template's updatedAt moves without a matching session action.

## 6. Deploy pipeline (the reliable way) + gotchas

```
1. stagedUploadsCreate(input:[{filename, mimeType:"text/plain",
   resource: FILE, httpMethod: PUT}]) → signed url + resourceUrl
2. curl -X PUT -H "Content-Type: text/plain" --upload-file <local> "<signed url>"
   (bytes go straight from disk — never retype content)
3. themeFilesUpsert(themeId: <draft>, files:[{filename:"sections/x.liquid",
   body:{type: URL, value: <resourceUrl>}}])
4. Verify: theme.files(filenames:[...]) → checksumMd5 == local `md5sum`
```
Gotchas learned the hard way:
- Hand-pasting big bodies (BASE64 or TEXT) into GraphQL **will** corrupt —
  "Content contains invalid characters". Always staged uploads.
- `upsertedThemeFiles` comes back empty for URL-type bodies (async fetch) —
  verify via the files read-back, not the mutation response.
- JSON templates are re-serialized server-side (size/checksum change is normal —
  diff the parsed content, not bytes) and **unknown settings are dropped**:
  upsert sections first, templates second.
- Theme writes are only allowed on UNPUBLISHED themes (API enforces).
- Storefront HTML is bot-protected (403) — evaluate via Admin API file reads.
- **Section files are validated async and rejected SILENTLY** (June 9): the
  upsert job returns `done: true` with empty `userErrors`, but the file never
  changes. Trigger found: schema setting **labels that are too long** (a
  ~96-char label failed; ~60–66-char labels also failed; short labels with
  detail moved to `info` passed — `info` can be long). Always read back
  `checksumMd5` after EVERY upsert; if stale, bisect the file (body vs schema)
  via a throwaway `sections/a2-test-*.liquid` filename.
- `themeFilesDelete` is blocked by the MCP safety layer — file deletions must
  be done by the owner in the theme code editor.

## 7. Audit headline (full detail: docs/ECOM-AUDIT-AND-ROADMAP.md)

**"A2 doesn't have a content problem — it has an assembly problem."**
Live PDP (one template for ALL products): SP-Force-AXS content renders on every
product (wrong specs on SP 105 and Rogues); **three conflicting size calculators**
(buy-box one string-matches height text, ignores inseam, defaults "Medium";
none is the real Fit Finder); **no Affirm/monthly framing anywhere**; a disabled
0%-APR callout links to a leaked `verify.plaid.com` URL (delete); trust assets
(description, returns/shipping callouts, wind-tunnel section) disabled; star
rating off while Klaviyo Reviews sits at page bottom; warranty + **crash
replacement** + free size exchange buried in tabs; mid-page banner exits the
PDP and loads Google Fonts in-body; untracked-inventory scarcity bar; broken/
suspect links (`collections/sp-25`, `pages/warranty`); ~100 store pages incl.
dozens of zombie Shogun LPs.
**Path:** Phase 0 stop-the-bleeding (theme-editor toggles) → Phase 1 product-
aware PDP rebuild ($/mo + pre-tax price stack, inline Fit Finder, "A2 Promise"
row, metafield spec tables) → Phase 2 checkout-objection layer → Phase 3
differentiation (fit-first front door, pre-tax pricing as brand position,
productized A2 Promise, human fit consults, proof engine) → Phase 4 operating
system (Convert experiments, page consolidation, speed budget). Illustrative
math: repairing the two leaks ≈ 0.3% → ~0.7% CVR (~$123k → ~$287k per 10k
sessions at $4,100 AOV).

## 8. Draft-theme evaluation & change plan (NEW — June 9)

### What the draft theme is
Live-theme clone (inherits every §7 PDP problem byte-for-byte) + Why A2 page
system + the LP system. It is the right vehicle for Phases 0–1: fix everything
here, QA, then publish-swap.

### Why A2 page — evaluation
**Strong:** positioning is exactly right ("Pro-level triathlon bikes. Without
the pro-level price."), Kevin Quan/Cervélo pedigree leads, Kona + Triathlete
Magazine proof, "What you don't pay for" anti-markup framing, clean lean
sections (2–3 KB each), Klaviyo capture section present.
**Gaps:**
1. Athlete section is placeholders ("[Add Kinley's quote here]", 2 × "[Athlete
   quote]") — fill or hide before any traffic.
2. `klaviyo_form_id` empty — the capture form is dead.
3. **No financing/pre-tax framing anywhere** — prices shown raw ($3,115/$2,699).
   The page argues value brilliantly, then never lands the affordability blow.
4. Hero CTA 2 ("Get our sizing guide") has no destination; SP card links to
   legacy `/pages/sp` while Rogue links to `/collections/rogue` — inconsistent
   funnel, neither uses the new LPs.
5. Prices are hardcoded text (will drift; LP build-overview pattern pulls live
   prices from products).
6. Claims need citations before launch ("five-time winner" — verify years).
7. Dead code: `sections/why-a2.liquid` (31.5 KB, superseded by wa-*).

### Proposed changes — draft theme punch list
> Status June 9: **A and C are DONE** (except owner-blocked bits: Klaviyo form
> ID, claim citations, athlete quotes, and the `why-a2.liquid` /
> `a2-test-*.liquid` deletions). B and D remain. Details in §5.10.

**A. Finish Why A2 (content, ~1 day)**
   fill/hide athletes · set `klaviyo_form_id` · hero CTA2 → Fit Finder/sizing ·
   route SP card → `/pages/sp-performance` (or `/collections/sp`) consistently ·
   add a financing line to product cards ("or ~$X/mo · HSA/FSA eligible") or
   render `a2-financing-band` between *promise* and *products* · verify claims ·
   delete `why-a2.liquid`.
**B. Activate the LP system (~½ day once IDs provided)**
   fill Klaviyo company/list IDs, Truemed URL, Octane URL in section settings ·
   wire Klaviyo Reviews embed into LP review sections (replace manual quotes) ·
   hero images · update Fit Finder `fit_coords` + size labels (**blocker**).
**C. Phase 0 fixes applied to the draft's cloned PDP/template (~1 day)**
   the §7 punch list executed in the DRAFT first (zero production risk):
   remove cross-product Force content, delete both bad calculators + Plaid link,
   enable description/callouts/rating, remove exit banner + in-body font load,
   fix `sp-25`/`warranty` links, disable fake scarcity.
**D. Phase 1 in the draft (~1–2 weeks)**
   `templates/product.sp.json` + `product.rogue.json` built on the LP design
   system: price stack ($ · ~$X/mo Affirm · pre-tax Truemed), inline Fit Finder
   pre-selecting size variant, "A2 Promise" row, metafield-driven spec/geometry
   tables, line-correct comparison + hotspots, JSON-LD. Bypass the 188 KB
   `main-product--default.liquid` rather than refactor it. Homepage: evolve the
   cloned `index.json` hero toward the Why A2 positioning + $/mo framing (or
   promote Why A2 to homepage — owner's call). Add LPs + Why A2 to navigation.
**E. Publish checklist**
   QA mobile · Lighthouse before/after · menus · settings filled · blockers
   cleared → owner publishes theme → pages already visible become real →
   then Phase 4 page consolidation/301s.

## 9. Open decisions / blockers (owner input needed)
1. Current SP + Rogue geometry/stem data → Fit Finder update (**blocker**).
2. Klaviyo company ID + list IDs; Truemed flow URL; Octane quiz URL/status;
   Why A2 `klaviyo_form_id`.
3. Canonical reviews platform (recommend Klaviyo Reviews — already on PDP).
4. Why A2 athlete quotes (Kinley Bollinger + 2 more) and claim citations.
5. Publish-swap timing; until then, keep or revert the pages' visibility.
6. Verify `pages/warranty` target, `sp-25` vs `sp` collection, shipping promise
   ($99 / 3–5 days) accuracy.
7. Phase 0 changes to the LIVE theme (vs draft-only): needs explicit sign-off.

## 10. Working agreements (carried from the sessions)
- Repo = source of truth; theme = build target; commit before deploy.
- Never publish themes; never write to live; verify checksums after deploys.
- Verified-claims-only on anything competitor-facing (the Canyon service-
  reputation wedge stays OUT until sourced — deliberate decision from the brief).
- Financing numbers: illustrative, settings-driven, labeled as estimates.
- GTM dataLayer only; UTM preservation is sacred (attribution is being repaired).
- Keep pages/sections schema-editable so marketing iterates without deploys.

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

# A2 Bikes — Visitor-Identification Build ("The Plays")

Working doc for the visitor-ID capture build-out. Goal: raise the
identification rate from ~4% of new visitors to 15% (30 days) / 25%+ (90 days)
by adding **first-party email-capture mechanisms** across a2bikes.com. The CRM
plumbing (OrygunTri) is already live; the only thing we wire is the identify
call. See the mission brief for the full play list.

> This repo was found effectively empty at the start of this build (only
> `README.md`). The live Shopify theme is the de-facto source of truth. New
> work is authored here in `shopify/` first, then staged to a **draft** theme.

---

## Verified environment (checked via Admin API 2026-07-20 — supersedes the brief)

The brief's theme IDs were stale. Verified live state:

| Theme | ID | Role | Notes |
|---|---|---|---|
| **Live Theme 7_15 Duplicate before** | `176596517028` | **MAIN (LIVE)** | Current published theme (updated 07‑18). This is the real live theme — **never write to it.** |
| Live 7/13 | `176591470756` | unpublished | Old live snapshot. The brief called this the "restock-alert draft" — it is **not**; it's just an old live copy. |
| Why A2 — SP Collection LP (current…) | `176582197412` | unpublished | draft |
| SP drop v4 — bike+size | `176596058276` | unpublished | draft |
| Live + Rogue Collection LP (ready to publish) | `176596189348` | unpublished | draft |
| Size Guide redesign — preview | `176591601828` | unpublished | draft |
| (…10 more unpublished themes) | | | see `themes` query |

- The brief said the "Why A2" theme became LIVE around 2026‑07‑06. As of 07‑18
  the MAIN theme is **"Live Theme 7_15 Duplicate before"** (`176596517028`).
  Always re-verify before writing:
  `query { themes(first:25){ nodes{ id name role updatedAt } } }`

### Hard rule: never publish, never write to MAIN
All work goes into a **duplicate draft** theme. The owner publishes.

---

## CRM integration contract (already live — we only call it)

The CRM silent-shopper tracker is loaded on every page from `layout/theme.liquid`:

```html
<!-- A2 CRM Silent Shopper Tracker -->
<script src="https://oryguntri.com/api/tracker/a2_tracker.js" defer></script>
```

That script defines the global we must call whenever we capture an email:

```js
window.a2_identify(email, source);   // e.g. ("rider@x.com", "exit_intent")
```

Server-side alternative: `POST https://oryguntri.com/api/identify`
`{ "email": "...", "source": "...", "ga4_client_id": "...", "klaviyo_id": "..." }`
→ always 204, no auth, idempotent per (person, source).

**Exact source strings** (drive the per-source scoreboard at
oryguntri.com/analytics): `exit_intent`, `fit_calculator`, `quiz`,
`save_build`, `restock_alert`, `newsletter`, `chat`, `checkout`,
`klaviyo_form` — or a new short snake_case name for a new mechanism.

### Important: theme already has a *separate* helper — do not confuse them
`layout/theme.liquid` also defines `window.a2IdentifyVisitor(email)`. That
helper pushes to **Klaviyo / GA4 / Lucky Orange** but does **not** pass a
`source` and does **not** hit the CRM's source-tagged identify. It also
auto-identifies logged-in customers and re-fires from `sessionStorage`.

**Every new capture must call BOTH:**
1. `window.a2_identify(email, "<source>")` — CRM scoreboard (mandatory).
2. `window.a2IdentifyVisitor(email)` — existing Klaviyo/GA4 identify (if present).

---

## Existing reusable patterns (in the live theme)

- `assets/a2-lp.js` — shared LP behaviour. **Owns UTM/click-id capture**
  (`sessionStorage["a2_attribution"]`, first-touch wins) and re-decorates
  internal CTAs so attribution survives the click. Also a delegated Klaviyo
  email-capture handler for `form[data-a2-klaviyo-form]`, a GTM `dataLayer`
  helper exposed as `window.a2dl(event, extra)`, Octane quiz opener, Affirm
  refresh. **Loaded per-LP-section, NOT globally** — a site-wide overlay can't
  rely on it being present. **Never break the UTM capture behaviour.**
- `snippets/a2-email-capture.liquid` — reusable Klaviyo capture form
  (params: heading/text/cta/company_id/list_id/event/source/uid). Posts via
  a2-lp.js. Reuse for newsletter/gate plays (play 4).
- Klaviyo client subscription pattern (from a2-lp.js):
  `POST https://a.klaviyo.com/client/subscriptions/?company_id=<id>`
  header `revision: 2024-10-15`, body `{data:{type:"subscription",
  attributes:{custom_source, profile:{data:{type:"profile",
  attributes:{email, properties}}}}, relationships:{list:{data:{type:"list",
  id:<list_id>}}}}}`.
- Klaviyo company id: **`YejYTH`**. Per-flow list IDs are an owner decision —
  set them in each section's settings.
- Site-wide overlays render from `layout/theme.liquid` via
  `{% sections 'overlay-group' %}` → `sections/overlay-group.json`. Add
  global popups/modals there.
- GTM owns GA4/Meta. Never hardcode pixels. Use `dataLayer` / `window.a2dl`.

---

## Deploy pipeline (hard rules)

1. Edit source in this repo (`shopify/`) first; commit.
2. Duplicate the current MAIN theme → a new **draft** (`themeDuplicate`).
3. Upsert sections **before** the JSON templates/section-groups that use them.
4. Verify `checksumMd5` on each upserted file against the local `md5`.
5. Never publish; hand the preview link to the owner.

---

## Play tracker

| # | Play | Source string | Status | Owner decisions blocking launch |
|---|---|---|---|---|
| 1 | Exit-intent capture (+ $X off) | `exit_intent` | **built + staged (disabled)** | discount **amount + code**, Klaviyo list id, final copy |
| 2 | Email-gate Fit Calculator | `fit_calculator` | **built + staged** | none — owner confirmed geometry current; soft gate chosen |
| 3 | Save-your-build on PDPs | `save_build` | **built + staged** | needs a Klaviyo "Saved Build" flow + list to actually send the quote email |
| 4 | Email flows as identity machines | `newsletter`/`klaviyo_form` | not started | Klaviyo flow coordination |
| 5 | Push the Octane quiz | `quiz` | **built + staged** | Octane app embed has a BLANK quiz id — confirm the quiz destination (page vs on-site) |
| 6 | Back-in-stock (restock) | `restock_alert` | **built + staged** | set `custom.restock_alert` metafield on the SP product(s) to show it; price-drop is a separate follow-up |
| 7 | Sign in with Shop | `checkout` | not started | — |
| 8 | Zoho chat asks email early | `chat` | not started | — |
| 9 | Financing prequal step | `save_build`/new | not started | — |

### Shared staged draft theme
- **Draft theme `176605397156`** — "A2 Visitor-ID — Plays 1–2 (draft, do not
  publish)" (duplicate of the 07‑18 live theme) now holds **both** Play 1 and
  Play 2. Preview: `https://a2bikes.com/?preview_theme_id=176605397156`
  New plays stage into this same theme so the owner can preview/publish one theme.

### Play 2 — email-gate the Fit Calculator (this build)
- Finished the existing redesign `shopify/snippets/a2-fit-engine.liquid`
  (rendered on SP/Rogue PDPs by `sections/sppdp-product.liquid`, `#find-your-fit`
  drawer). Two surgical changes, verbatim copy verified byte-identical to live
  before editing:
  1. **CRM wiring:** `sendFit()` now calls `window.a2_identify(email,
     "fit_calculator")` before the existing Klaviyo "Requested Fit Results" +
     `a2dl` calls. This is what makes fit captures show on the scoreboard.
  2. **Soft gate (owner-approved):** verdict (recommended size) stays visible;
     the full breakdown (pad/bar coords, drop, setup) + chart blur-lock behind
     the email submit, revealed on success. Blur-lock (no DOM removal). Toggle
     `A2FE_GATE` (`"soft"`/`"off"`) at the top of the IIFE. Covers both inline
     and drawer mounts.
- Staged to draft `176605397156` via the staged-upload pipeline
  (`stagedUploadsCreate` → `curl PUT` → `themeFilesUpsert` URL body); checksum
  verified `c33d603a7dc866e9368395a36e96e564` == local md5.
- **Notes / follow-ups:** the older inline Pad X/Y `a2-fit-calculator.liquid`
  (on line LPs via `a2-line-lp.liquid`) still has NO email capture — separate
  follow-up if we want to gate that surface too. The `a2-size-calc.liquid`
  out-of-range lead form also does not yet call `a2_identify` (only Klaviyo) —
  small follow-up to tag it `fit_calculator`.

### Play 3 — Save your build / email me the quote (this build)
- New snippet `shopify/snippets/a2-save-build.liquid` (self-contained; a2-lp.js
  is NOT on PDPs). Rendered on bike PDPs by `sections/sppdp-product.liquid`
  right after the Add-to-Cart form, gated by section setting `enable_save_build`
  (default on), with `sb_klaviyo_company` (default `YejYTH`) + `sb_klaviyo_list`.
- Reads the live build from `window.A2_FIT_CTX` (model/build/productTitle/url) +
  the buy-box DOM: `[data-price]` (live price), the active `.build-pill`
  (groupset), and selected options `[data-opt][aria-pressed="true"]`.
- On submit: `a2_identify(email,"save_build")` + `a2IdentifyVisitor` + Klaviyo
  subscription (custom_source `save_build`) with the build in profile properties
  + a "Saved Build" Klaviyo event + `dataLayer` `save_build_email_capture`.
- Staged to draft `176605397156` via staged-upload pipeline; checksums verified:
  snippet `5103078a7ada602d61dacf4388ff078d`, `sppdp-product.liquid`
  `c3256c31c03eb7255baf776fee82c2bc`. Verbatim copy of the section verified
  byte-identical to live before the 2-line edit.
- **Owner to-do (not a code blocker):** build a Klaviyo flow triggered by the
  `save_build` list (or the "Saved Build" event) that emails the spec + price,
  so the "check your inbox" promise is fulfilled. Set `sb_klaviyo_list` to that
  list. Note `A2_FIT_CTX.price` is the base product price; the emailed quote uses
  the live `[data-price]` DOM value scraped at submit.

### Play 6 — back-in-stock / restock alert (this build)
- Refreshed the existing SP "new colorway drop / notify me" card
  `shopify/snippets/a2-restock-alert.liquid` (rendered on SP PDPs by
  `sections/sppdp-product.liquid` only when `product.metafields.custom.restock_alert`
  is true; that branch also loads `a2-lp.js`). Klaviyo company `YejYTH`, list
  `TpVuRM` ("SP Drop — Notify Me").
- **The gap fixed:** the card captured to Klaviyo (via a2-lp.js) + dataLayer but
  never called the CRM. Added a scoped inline script: on submit it calls
  `window.a2_identify(email, "restock_alert")` + `a2IdentifyVisitor` and persists
  the email. a2-lp.js still owns the Klaviyo POST. Verbatim copy verified
  byte-identical to live before the single append.
- Staged to draft `176605397156`; checksum verified
  `0d5848a1850eeec51b0e25637253c124`.
- **Owner to-do:** set the `custom.restock_alert` boolean metafield on the SP
  product(s) you want the card to appear on (it's per-product, owner-controlled).
- **Follow-up (separate mechanism):** price-drop alerts. Not in this card; best
  done via Klaviyo's native price-drop / a parallel "price drop" capture card
  wired to a new `price_drop` source. Flagged, not built.

### Play 5 — push the Octane quiz (this build)
- New section `shopify/sections/a2-quiz-cta.liquid` (self-contained; no a2-lp.js
  dependency, so it works on homepage AND PDPs). Opens the quiz (prefers the
  Octane on-site JS API, falls back to the quiz page URL, default
  `/pages/a2-bikes-selector-quiz`) and pushes the `octane_quiz_open` dataLayer
  event. In-page band/strip (owner-selectable prominence), NOT a popup. Has
  presets so the owner can drop it on PDPs (or anywhere) via the theme editor.
- Added to the homepage: `shopify/templates/index.json` now includes a
  `quiz_band` (type `a2-quiz-cta`, style band) right after the `lineup` section.
- **Measurement fix (the key part):** `layout/theme.liquid`'s
  `octane-quiz-completed` message listener previously called only
  `a2IdentifyVisitor`. Added a guarded `window.a2_identify(email, "quiz")` in
  both branches so quiz completions are tagged `quiz` on the CRM scoreboard.
- Staged to draft `176605397156`; checksums verified — section
  `55368c717714dedc68eaa4ed2bb1091f`, `layout/theme.liquid`
  `c0dd3041741b9d40bebf858f17510532`, `templates/index.json`
  `b806a5ba0e15909f523a1a5f201e6641`. (Section schema initially rejected a blank
  text default on `foot`; fixed.) Both live files verified byte-identical before
  the surgical edits.
- **Owner notes:** the Octane app embed is enabled but has a **blank quiz id**,
  so the reliable destination is the quiz page — confirm `/pages/a2-bikes-selector-quiz`
  is the intended quiz (or set the section's Quiz URL). Homepage prominence is
  the `band` style; switch to `strip` or restyle in the editor. To push on PDPs,
  drop the "A2 Quiz CTA" section onto the product template at the prominence you
  want.

### Play 1 — exit-intent
- Preview (same theme): `https://a2bikes.com/?preview_theme_id=176605397156`
  Both files verified byte-identical via `checksumMd5`:
  `sections/a2-exit-intent.liquid` = `e1a8b60b3d8cdb422a1b90a205b4b374`,
  `sections/overlay-group.json` = `af383db96059a53f81cd50fdbada1f55`.
- To preview the popup: theme editor → this draft → set **Offer amount** +
  **Discount code**, tick **Enable**, save, then trigger exit intent (move the
  cursor out the top of the window on desktop).
- `shopify/sections/a2-exit-intent.liquid` — self-contained global overlay
  (own CSS+JS, does not depend on a2-lp.js). Added to `overlay-group.json`.
- Ships **disabled by default** (`enable` setting off) and with a **blank
  offer amount / code** so it cannot launch until the owner sets the figures
  and flips it on — per the "figures live in settings, never hardcoded" rule.
- On submit: `a2_identify(email,"exit_intent")` + `a2IdentifyVisitor(email)` +
  Klaviyo subscription (custom_source `exit_intent`) + `dataLayer` event
  `exit_intent_email_capture`, then reveals the discount code.

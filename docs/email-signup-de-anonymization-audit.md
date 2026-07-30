# A2 Bikes — Early Email Capture & Visitor De-Anonymization Audit

**Prepared:** 2026-07-29
**Scope:** Live Shopify theme (`Size calc — remember email`, theme id `176618471588`) + Klaviyo account (`YejYTH`) + notes on the custom CRM (OrygunTri) and Shopify.
**Goal:** Get visitors identified (email known) **as early as possible** in the funnel so their journey can be tracked — **without hard gates** that block browsing, calculator results, or content.
**Deliverable:** Research + prioritized plan. **No theme changes have been made.** Nothing ships until you approve.

---

## TL;DR

A2 already has an unusually strong de-anonymization **backbone** — but the **front door is leaking**. The plumbing to track a visitor the instant an email is known is largely built (`window.a2IdentifyVisitor`, Klaviyo onsite embed, an A2 CRM tracker, and live Klaviyo flows that listen for calculator events). The problem is that **too few visitors ever hand over an email**, and **several of the surfaces meant to collect it are broken or cosmetic**:

- The **homepage's only email capture points at a *draft* Klaviyo form** → it doesn't render. Effectively zero homepage capture.
- The landing-page capture forms (`.wa-form`) are **cosmetic**: they fake a "success" message and **silently discard the email**.
- The capable Klaviyo subscribe handler that *would* work (`assets/a2-lp.js`) is **dead code** — no section emits the attribute that activates it, and **no Klaviyo list id is configured anywhere**.
- The **bike size calculator that ships on every product page never captures identity for the ~99% of visitors who get an in-range size** — email is only requested when the bike *can't* fit them (the lowest-value lead).
- The **fit-engine calculator** captures email only via an optional post-result form, doesn't persist it, doesn't bridge to the site-wide identify system, and doesn't recognize returning visitors.

None of this requires new gates to fix. The highest-leverage move is to **capture (optionally) at the moment of peak intent — when a real size/fit result is shown — and to repair the capture surfaces that currently fail silently.**

---

## How a visitor gets de-anonymized today

`layout/theme.liquid` defines a solid global identify function, `window.a2IdentifyVisitor(email)`, which on any known email:
- pushes **Klaviyo** `identify` (`_learnq`),
- sets **GA4** user properties + a `user_identified` event *(currently dead — see below)*,
- calls **Lucky Orange** identify,
- persists the email to **`sessionStorage` (`a2_visitor_email`)** so identity follows the visitor across pages within the session,
- **auto-identifies** logged-in Shopify customers and any email already stored from a prior page.

It also listens for: **Klaviyo form submits** (`klaviyoForms` event), generic **newsletter/contact form submits**, and **Octane AI quiz completions** — calling `a2IdentifyVisitor` for each. The **A2 CRM "Silent Shopper Tracker"** (`oryguntri.com/a2_tracker.js`) is live at the bottom of `<body>`. The **Klaviyo onsite embed is enabled** as a Shopify app embed, so `klaviyo.js` (`_learnq` / `window.klaviyo`) loads site-wide.

**Current earliest-to-latest de-anonymization moments:**

| Moment | Fires identify? | Status |
|---|---|---|
| Klaviyo onsite popup submit | Yes (via `klaviyoForms` → `a2IdentifyVisitor`) | Depends on Klaviyo popup config (theme popup is disabled) — **timing unverified** |
| "Find your bike" Octane quiz (homepage hero CTA) | Yes (quiz-complete listener) | Working; requires clicking into quiz |
| Newsletter form (footer) | Yes (form-submit hook) | Working, but footer = late in visit |
| Fit-engine "Send me my results" | Yes (`klaviyo.identify` on submit) | Working, but only post-result & optional; no persistence/bridge |
| PDP size calculator — **in-range result** | **No** | **Gap: high-intent, never identified** |
| PDP size calculator — out-of-range | Yes (`identify` on lead form) | Working, but lowest-value segment |
| Rogue fit calculator | **No** | Anonymous dataLayer only |
| Login / account | Yes (auto-identify) | Working |

**Backend is ready to receive.** Live Klaviyo flows already listen for these signals — notably **"Bike Fit Calculator"** (`Y6DcWx`), **"First-Timer — New Athlete (Octane · Bike Finder)"** (`WnwAjE`), the **"NEW 111 Welcome Series"** (`RFEDQZ`), and **"7_1_Browse Abandon"** (`VNzAn3`). Events currently emitted by the calculators include the Klaviyo metrics `Size Calculator`, `Size Calculator OOR Lead`, and `Requested Fit Results`, plus dataLayer events `fit_calculator_result`, `fit_prev_bike_selected`, `rogue_fit_result`, `fit_results_email`, `fit_calculator_open`, `octane_quiz_open`.

---

## Findings (evidence)

### F1 — Homepage email capture points at a *draft* Klaviyo form (broken)
`templates/index.json` → `wa-capture` section (the **last** of 11 homepage sections) sets `klaviyo_form_id: "WDFJLq"`. In Klaviyo, `WDFJLq` = **"Why-A2 Landing", status `draft`**. Draft forms don't render on the live site, so the homepage's single dedicated capture band shows nothing / captures nothing.

### F2 — Landing-page capture forms are cosmetic (email discarded)
`sections/wa-capture.liquid` and `sections/why-a2.liquid` render a `.wa-form` placeholder when no live Klaviyo embed loads. Its only handler (`assets/why-a2.js` / inline) does `e.preventDefault()` then reveals a success message — **no network call, no event, the email is thrown away.** A visitor who types their email and clicks submit is told "success" while nothing is saved.

### F3 — The working subscribe handler is dead code + no list id exists
`assets/a2-lp.js` contains a robust Klaviyo client-side subscribe (`/client/subscriptions/`, honeypot, UTM attribution, dataLayer push). It binds to `form[data-a2-klaviyo-form]` — but **no section emits that attribute**, so it never runs. It also requires a Klaviyo `list_id`, and **no list id is configured anywhere in the theme**.

### F4 — The PDP size calculator never identifies the in-range majority
`snippets/a2-size-calc.liquid` ships on every bike product page. For an in-range height it shows a recommended size + "Shop [build]" links and fires only an **anonymous** `Size Calculator` track event — **no `identify`, no email ask.** Email is requested **only on the out-of-range branch** ("we can't fit you"), i.e. the lowest-purchase-intent visitors. Results are never gated.

### F5 — "Remember email" is per-tab only and doesn't bridge to the site identify
The size calc stores leads in **`sessionStorage`** (`a2_visitor_email` / `a2_visitor_name`), which is **cleared when the tab closes** — so returning visitors aren't recognized across visits. It **does not call `window.a2IdentifyVisitor`**, and it does **not pre-fill** the email field for a known visitor (it recalls only to *skip* the OOR form).

### F6 — The fit-engine captures late, doesn't persist, doesn't recognize returns
`snippets/a2-fit-engine.liquid` (the live shared Rogue+SP engine) shows the full result unconditionally, then offers an optional "Send me my results" form. On submit it fires `klaviyo.identify` + `Requested Fit Results` (rich payload) — good — but it **never writes to storage, never calls `a2IdentifyVisitor`, never pre-fills for logged-in/returning visitors, and fires no event at result-render time** (so already-known visitors generate no "completed a fit" signal unless they re-submit an email). The older `snippets/a2-fit-calculator.liquid` and `snippets/a2-rogue-fit-calc.liquid` capture **no email at all**.

### F7 — Theme-native popup is disabled and isn't an email capture
`sections/overlay-group.json`: the `popup` section is `"disabled": true` and its single block is a **promo** popup ("Announce your promotion / Get a free bike"), not a signup block. So **all real popup capture depends on the Klaviyo onsite embed** — whose live form/timing should be verified (candidates: live forms `RqpJPj` "Multi-step email & SMS", `Txn9Mi` "Demo Bike Pop Up", the "Email & SMS Embed" set).

### F8 — GA4 is commented out (dead identify branch) + stub analytics
In `layout/theme.liquid` the GA4 `gtag` snippet is fully commented out, so the GA4 branch inside `a2IdentifyVisitor` is a no-op (a `gtmanager` GTM app embed is enabled, so GA4 may run via GTM — needs confirming to avoid a broken/duplicate funnel). `assets/custom-events.js` is `console.log` stubs only — cart/browse events fire nothing.

### F9 — No email invitation above the fold / persistently
The header has only an account icon — no capture, no CTA. The homepage's only capture is the (broken) bottom band. There's no always-visible, non-blocking capture (e.g. a slide-in tab — which the theme already has markup for — or a slim header/footer inline form).

---

## Prioritized recommendations

Every item below is **non-gating**: browsing, content, and calculator results stay fully accessible whether or not the visitor gives an email.

### P0 — Repair capture that fails silently (do first; these are bugs, not features)

| # | Change | Where | Why |
|---|---|---|---|
| P0-1 | Point homepage capture at a **live** Klaviyo form (publish `WDFJLq`, or swap to a live form id), **or** wire the `.wa-form` to the real `a2-lp.js` handler | `templates/index.json` `wa-capture` / `sections/wa-capture.liquid` | F1 — restores the homepage front door |
| P0-2 | Make `.wa-form` actually subscribe: add `data-a2-klaviyo-form`, `data-a2-company="YejYTH"`, `data-a2-list="<LIVE_LIST_ID>"`, `data-a2-source`, `data-a2-event`, and a `[data-a2-msg]` node; ensure the cosmetic handler no longer swallows the submit | `sections/wa-capture.liquid`, `sections/why-a2.liquid`, `assets/why-a2.js` | F2/F3 — stop discarding emails |
| P0-3 | **Choose and configure a Klaviyo list id** for onsite subscribes (e.g. `Leads` = `Rwbtf7`) | theme setting / the data attributes above | F3 — nothing can subscribe without it |

### P1 — Capture at peak intent + recognize returning visitors (biggest net-new identification)

| # | Change | Where | Why |
|---|---|---|---|
| P1-1 | Add an **optional** "Email me my size + free fit guide" field to the **in-range success path** of the size calc | `snippets/a2-size-calc.liquid` (~result render, near line 1099) | F4 — turns the highest-volume, highest-intent moment into named leads; size still shows to everyone |
| P1-2 | Bridge every calculator to the site identify + **persist across visits**: call `window.a2IdentifyVisitor(email)` and store to **`localStorage`** (fallback `sessionStorage`); **pre-fill** the email field from stored value & logged-in `customer.email` | `a2-size-calc.liquid` (`storeLead`), `a2-fit-engine.liquid` (`sendFit`, `emailHtml`, fit CTX) | F5/F6 — one-click for returning visitors; zero-friction for logged-in |
| P1-3 | Fire an **anonymous-but-attributable** Klaviyo event at **result-render** time (e.g. `Bike Fit Calculated`) — no email required — so already-cookied profiles get the "completed a fit" signal | `a2-fit-engine.liquid` (`finish`), `a2-size-calc.liquid` (in-range success) | F6 — feeds flows/segments for known visitors with no ask |
| P1-4 | Add an optional "email me this setup" to the Rogue fit calc | `snippets/a2-rogue-fit-calc.liquid` | F6 — most detailed fit interaction currently captures nothing |

### P1 — Earlier & more persistent invitation (timing)

| # | Change | Where | Why |
|---|---|---|---|
| P1-5 | **Verify & optimize the Klaviyo onsite popup**: confirm a live form targets the site with a sensible trigger (~5s delay or scroll 25% + exit-intent) and a re-invite cadence; its submit already reaches `a2IdentifyVisitor` | Klaviyo (forms), not theme | F7 — this is the main early popup mechanism now |
| P1-6 | Add a **persistent, always-visible** non-blocking capture (the theme's slide-in tab markup already exists) and/or a slim header/footer inline "free sizing guide" form | `sections/popup.liquid` tab, `sections/header.liquid`/`footer.liquid` | F9 — an early, low-friction touch that never gates |
| P1-7 | Surface a capture **higher on the homepage** (mid-page), not only the bottom band | `templates/index.json` | F1/F9 — most visitors never scroll to section 11 |

### P2 — Enrichment, activation & measurement

| # | Change | Where | Why |
|---|---|---|---|
| P2-1 | Re-enable GA4 (or confirm GA4-via-GTM) so the identify GA4 branch works and the funnel is complete; avoid double-fire | `layout/theme.liquid`, GTM | F8 |
| P2-2 | Activate `custom-events.js` to fire real `Added to Cart` / browse events tied to identify (feeds browse/cart-abandon flows) | `assets/custom-events.js` | F8 |
| P2-3 | Fire a `fit_calculator_started` event on first meaningful input to measure start→result→email drop-off | calculator snippets | measurement |
| P2-4 | Enroll calculator leads into an actual Klaviyo **list** (not just identify/track) so the "Bike Fit Calculator" & welcome flows reliably trigger | subscribe calls | activation |

---

## Measurement / how we'll know it worked
- **% of sessions identified** (email known) and **time-to-identify** — via Klaviyo "Active on Site" + `identify`, and the CRM tracker.
- **Calculator funnel**: `fit_calculator_started` → `fit_calculator_result` / `Size Calculator` → email submit (`Requested Fit Results` / new in-range lead event). Target: raise the result→identify rate off the current near-zero for in-range size-calc users.
- **Capture-surface conversion**: submissions on homepage/LP forms (should rise from ~0 once P0 lands).
- Watch the live flows (`Bike Fit Calculator`, `First-Timer — New Athlete`, `NEW 111 Welcome Series`) for increased entries.

## Guardrails
- **No hard gates.** Results, content, and browsing remain fully accessible without an email.
- **Consent.** The size calc already checks `Shopify.customerPrivacy.userCanBeTracked()`; keep that pattern for any new identify calls, and keep the honeypot on subscribe forms.
- **Don't double-prompt.** Consolidate Klaviyo onsite popups vs. any theme popup so earlier timing doesn't create two prompts.

## Open decisions (need your call before building)
1. **Which Klaviyo list** should new onsite/calculator emails land on? (`Leads` `Rwbtf7`, `Consumers` `QTaqCu`, single-opt-in `A2 Bikes` `SFAi8X`, or a new "Site Captures" list.) Single vs. double opt-in matters for how fast they enter flows.
2. **Homepage capture:** publish the existing `WDFJLq` Klaviyo form, or replace with a theme-native form wired to `a2-lp.js`?
3. **GA4:** re-enable directly in the theme, or is GA4 already handled via GTM (so we should not)?
4. **Incentive:** is a discount/free-shipping or the "free sizing guide" the offer for the earliest captures?
5. **Scope of first build:** I recommend P0 (repairs) + P1-1/P1-2/P1-3 (in-range size-calc capture, identify bridge + persistence, result-time event) as the first shippable increment.

## Recommended next step (not yet done)
Two unpublished themes — **"A2 Visitor-ID — Plays 1–2"** and **"Fit finder — email memory + skip (PREVIEW)"** — suggest this exact work is already being prototyped. Before building, I recommend diffing those against the live theme so we extend/adopt in-progress work rather than duplicate it. I can produce that diff on request.

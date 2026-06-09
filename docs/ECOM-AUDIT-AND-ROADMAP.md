# A2 Bikes — eCommerce Audit & Roadmap
### Evaluation of live PDPs + new landing-page system against bike-industry and high-AOV DTC best practice, and the path to beating them

_Prepared June 2026. Evidence: live theme `May_26_Stilletto_Theme_Update` product template (read via Admin API), live product catalog data, the four-LP system in this repo, and the prior funnel audit (homepage conv 0.3%; other LPs 0.03–0.07%; PDP drop-off ~95%; Begin-Checkout abandonment ~83%; AOV ≈ $4,100). Storefront HTML fetch and script-tag inventory were blocked (bot protection / API scope), so page-speed claims below are flagged for measurement rather than asserted._

---

## 1. Executive summary

**A2 does not have a content problem — it has an assembly problem.** The trust arsenal that Canyon, Trek, and Peloton spend millions building already exists in this store: lifetime frame warranty, a crash-replacement policy (genuinely rare in the industry), free size exchanges, "arrives 92% built," a military discount, Truemed HSA/FSA (~30% effective savings), an engineering pedigree story (ex-Cervélo engineer), 25-image galleries, and a real engineering-grade fit calculator. Almost all of it is **disabled, buried at the bottom of the page, fragmented across ~100 orphan pages, or contradicted by lower-quality duplicates**.

The 95% PDP drop-off is not mysterious. The PDP currently shows **wrong-product content on every product** (SP Force AXS specs on the SP 105 and on Rogues), **three conflicting size calculators** (none of them the real one), **no monthly-price framing anywhere** despite Affirm being installed, and its strongest trust content (warranty, crash replacement, returns) hidden in tabs below ~8 screens of content while the star rating is switched off at the top.

The path to "better than Canyon/Peloton" is therefore not imitation. Phase 0–2 below is repair: assemble what exists into one coherent, product-aware PDP and price-framing system (this is where the 3x is). Phase 3 is differentiation: lead with the two structural advantages none of the benchmarks can copy — **fit-first commerce** and **pre-tax (HSA/FSA) pricing** — wrapped in an ownership-risk-elimination promise that is already, on paper, stronger than what Canyon or Trek offer.

---

## 2. How the benchmarks win (pattern reference)

Patterns are stated at the level that is publicly well-established; verify any specific number before quoting it in marketing.

| Benchmark | What they do that converts | Their structural weakness (A2's opening) |
|---|---|---|
| **Canyon** | Monthly financing shown beside every price; integrated size calculator (PPS) on PDPs; spec + geometry as structured data tables; delivery estimator; model-comparison tools | No human touch at scale; service/support reputation; can't do white-glove |
| **Trek / Specialized** | Dealer-network trust; deep PDP media incl. video; financing; huge review volumes; strong post-purchase ecosystem | Dealer-margin pricing — they cannot win a value argument |
| **Ventum** | DTC triathlon specialist; race-proof storytelling; custom builds; high-touch buying experience | Scale and price point; thinner content system |
| **Peloton** | Price framed as **$/mo first**; trial period; delivery + setup included; showrooms/human consult; referral engine | Hardware locked to subscription; not a bike-performance brand |
| **Wahoo (high-AOV fitness)** | Spec clarity; ecosystem cross-sell; crisp PDPs | Narrow category |

**The high-AOV playbook all of them share:** (1) reframe price as monthly, (2) remove ownership risk loudly, (3) make fit/size confidence trivial, (4) put social proof at the decision point, (5) one coherent template system, fast pages, clean data.

---

## 3. Live PDP teardown (the 95% leak)

Source: `templates/product.json` on the published theme. One template serves **every** product (SP, Rogue, wheels, accessories) — there are no `product.sp.json` / `product.rogue.json` alternates.

### 3.1 Critical — wrong or conflicting content at the decision point

| # | Finding | Evidence | Why it kills conversion |
|---|---|---|---|
| 1 | **SP Force AXS content renders on every product.** Heading "Click the Icons to Learn the SP Force AXS Specs", a Force-AXS hotspot image (using a *Rogue* photo, `Buy_a_Rogue_5.png`), a hardcoded "SP Force AXS Spec Guide" page section, and Force-specific stats (1,250 g frame / 15% drag / 2,650 g groupset) | `rich_text_YVC88G`, `17562492962da02acc`, `page_section_pDMjKc`, `multi_column_hmfmVz` | A shopper on the $3,115 SP 105 (your volume product) reads specs for a $7,199 build; a Rogue shopper reads triathlon specs. For a considered $4k purchase this is a direct credibility hit |
| 2 | **Three different size calculators, all weak, none the real one.** (a) Buy-box accordion, expanded by default: matches height as a *text string* (`height.includes("5'9")`) — returns "Medium" for any unmatched input (cm, "69", 6'6"), and **ignores the inseam it asks for**; still contains placeholder copy ("Add your collapsible row content here"). (b) "Size & Fit" tab: a full nested `<!DOCTYPE html>` document inside the page (invalid HTML), feet/inches ranges with boundary gaps (5'10"–5'11" both map oddly; 6'1" appears in two sizes), also ignores inseam. (c) A "Size guide" popup page on the variant picker | `accordion_wFGQpe`, `one_column_UfpW9X`, `variant_picker` | Fit anxiety is the #1 purchase blocker for a tri bike bought online. Three contradictory answers = zero confidence. Meanwhile the real pad-X/Y Fit Finder (engineering-grade, 300-combination search) sits unused on a 2021 page |
| 3 | **No monthly price framing anywhere on the PDP.** No Affirm on-page messaging block exists in the template at all. Truemed is one plain-text line. The "0% APR financing" callout is **disabled** — and links to a `verify.plaid.com/verify/idv_…?key=…` identity-verification URL (wrong destination; a leaked verification link that should be removed regardless) | `text_9D7jHb`, disabled `product_callouts` | The audit's #2 leak is Begin-Checkout abandonment (83%) on price objection. The objection is never pre-empted: the shopper meets "$3,115" cold, and "$X/mo" never appears |
| 4 | **A mid-page banner sends shoppers off the PDP.** Red promo banner ("More Options. More Savings. More Riding.") links out to a financing page mid-funnel; it also injects a Google Fonts stylesheet in the page body (layout shift + render cost) | `custom_liquid_pByVXk` | Every click off the PDP at the consideration moment is a leak; financing context should live *on* the page |

### 3.2 High — trust assets built, then hidden

- **Disabled blocks** containing exactly what high-AOV best practice puts beside the buy button: product description, "Free Returns / Secure Payment / Fast 3-Day Shipping / Need help?" callouts, and the "Wind Tunnel Tested — saved 5 watts" section. All `"disabled": true`.
- **Star rating off** (`show_product_rating: false`) while the Klaviyo Reviews widget sits at the **very bottom** of an extremely long page. Social proof exists but is invisible where the decision happens.
- **Killer policies buried in tabs**: Lifetime Warranty, **Crash Replacement Policy** (free frame replacement after a crash — almost no competitor offers this), free size exchanges, $99 3–5-day shipping. This is Peloton-grade risk removal presented as fine print.
- **"Arrives 92% Built"** section — excellent objection handler for DTC bike anxiety — placed ~10 sections down.

### 3.3 Medium — hygiene

- **Inventory counter** shows untracked quantities with a hardcoded max of 40 → can render a perpetual/false scarcity bar (`inventory-counter`).
- **Link integrity:** builds carousel links to `collections/sp-25` while the canonical collection is `/collections/sp`; the Lifetime Warranty button links to `pages/warranty`, which does not appear in the store's page list. Verify both (likely broken or duplicated destinations).
- **Leftover demo content**: "Always Chic." hero (disabled), default Shogun-era copy in settings.
- Good bones to keep: sticky ATC on desktop **and** mobile, 25-image gallery with lightbox + per-variant media, GovX block, Truemed mention, the builds-comparison carousel concept, the tabs framework itself.

### 3.4 Site-wide

- **~100 pages**, dozens of them zombie Shogun landing pages (`shogun.default`) — the 0.03–0.07% converters from the audit. Fragmented duplicates exist for sizing (≥6 sizing/geometry pages), financing (≥3), and Rogue info (≥5).
- **Attribution is broken** ("(not set)"/direct) — already flagged in the brief; nothing built on top of it can be measured until fixed.
- **Reviews stack ambiguity:** the brief says Fera.ai; the live PDP uses a **Klaviyo Reviews** app block. Pick one canonical system (Klaviyo Reviews is already on the page and feeds Klaviyo profiles — recommended) and wire it everywhere.
- **Speed:** unmeasured here (storefront fetch blocked). The template alone shows mid-body font loading and ~13 sections rendered on every PDP. Run PageSpeed/Lighthouse on PDP + home before/after Phase 1 and set a budget (see Phase 4).

---

## 4. The new landing-page system (this repo) — self-assessment

**Where it already matches or beats the benchmarks:**
- Price reframing built-in: Affirm async messaging + Truemed callout + interactive cost widget (Financing LP) — the double frame ($/mo + pre-tax) none of the bike brands run.
- Performance discipline: no frameworks, deferred JS, lazy images, system-font default, Chart.js lazy-loaded only on Fit Finder use.
- Measurement spine: UTM/click-ID capture → sessionStorage → re-appended to internal CTAs; GTM-dataLayer-only events with stable `cta_id`s; Convert-ready hooks on the comparison page.
- Fallback-safe routing to real catalog handles; everything schema-editable (incl. the comparison table — no hardcoded competitor claims); honest-by-default competitor cells ("verify").
- The **real** Fit Finder embedded on the SP LP (original algorithm preserved).

**Gaps to close (ranked):**
1. **Fit Finder data is stale**: coords are 2021 Speed Phreak (XS/S/M/L + 110×14 stem); current SP sells **Small/Medium/Large/XL**. Update `fit_coords` + labels before anything public. *(Blocker for publishing.)*
2. **Reviews are manual placeholders** until an embed is pasted — wire **Klaviyo Reviews** (matching the PDP) instead of hand-typed quotes.
3. **No JSON-LD** — add `Product` (builds), `FAQPage` (financing FAQ), `BreadcrumbList`. Cheap SEO/rich-result win the benchmarks all have.
4. **No sticky mobile CTA bar** on the LPs (the live PDP already has one — keep parity).
5. Hero `From $X/mo` is hand-maintained copy — compute from a settings price or bind to Affirm so it can't drift from reality.
6. No hero **video** option (benchmarks lead with motion); add an optional `video_url`/MP4 setting.
7. No exit-intent / scroll-depth email trigger and no SMS capture option (store has SMS programs).
8. Pages are currently **visible but render empty on the live theme** (templates only exist in the draft theme). Either revert to hidden until the theme ships, or publish the theme first. *(Operational, decided outside this doc.)*

---

## 5. A2's unfair advantages (the "beat them" raw material)

| Asset | Status today | Benchmark comparison |
|---|---|---|
| Lifetime frame warranty | Tab text, buried; button link likely broken | At/above Canyon & Trek terms — invisible |
| **Crash Replacement Policy** | Tab text, buried | **Nearly unique in the industry** — should be a headline |
| Free size exchanges (30 days) | Tab text | Direct answer to the #1 online-bike objection |
| "Arrives 92% Built" + tools incl. torque wrench | Section, low on page | Peloton-grade delivery reassurance |
| **Truemed HSA/FSA (~30% pre-tax savings)** | One text line | **No bike brand markets pre-tax buying.** This is A2's Peloton-"$/mo" moment |
| Affirm financing | Installed, absent from PDP | Canyon shows monthly beside every price |
| Real Fit Finder (pad-X/Y engine) | Unused since 2021 | Better methodology than the height-table calculators competitors use |
| Engineering pedigree (ex-Cervélo P-Series engineer), adjustability story | Buried in description copy | Ventum-style credibility, unexploited |
| GovX military discount | PDP block (good) | Differentiator for the tri demographic |
| Demo program, trade-in program, Component Replacement (CRP) upgrade program, racing team/ambassadors, owner's manual content | Orphan pages | A complete ownership ecosystem nobody sees |
| DTC pricing ($3,115 entry vs $5k+ dealer-brand entry tri bikes) | Implicit | The wedge the whole funnel should hammer |

---

## 6. The path

### Phase 0 — Stop the bleeding (week 1, theme-editor only, no code)
1. Remove/replace wrong-product content on the PDP template: the Force-AXS heading/hotspot/spec-guide/stats sections (make them SP-Force-only via a dedicated template in Phase 1; until then, genericize).
2. **Delete the buy-box string-matching calculator** (accordion) and the nested-HTML "Size & Fit" calculator; point the variant-picker "Size guide" at one canonical sizing page until the real Fit Finder ships on PDPs.
3. Remove the disabled 0% APR callout containing the `verify.plaid.com` link entirely.
4. Re-enable the trust callouts (returns/secure/shipping/help) and the description block; turn **star rating on** if review count ≥ ~10, and add a "read reviews" anchor to the bottom widget.
5. Remove the mid-page red banner (or rebuild it as an on-page band without the outbound link / body font load).
6. Fix `collections/sp-25` → `/collections/sp`; fix/verify the `pages/warranty` link; turn off the untracked-inventory scarcity bar.
7. Decide LP page visibility (revert to hidden, or publish the draft theme).
8. **Fix attribution** (the brief's gating item): GA4/GTM audit so UTMs stop landing as "(not set)" — everything in Phases 1–3 is measured through this.

### Phase 1 — PDP rebuild: one system, product-aware (weeks 2–4) ⇒ targets the 95% leak
Build `product.sp.json` + `product.rogue.json` (reusing the LP design system) with a buy box ordered like the best of the benchmarks:

1. Gallery (keep: variant media, lightbox) + **one product video slot**
2. Title + **star rating (Klaviyo Reviews) linked to reviews**
3. **Price stack:** price · **"or ~$X/mo with Affirm"** (on-page messaging component, async) · **"or ~30% less with pre-tax HSA/FSA via Truemed"** — the double frame on every PDP and every price display site-wide (collection cards included)
4. Variant picker + **"Not sure? 60-second Fit Finder"** inline trigger (the real calculator, updated coords/labels, pre-selects the recommended size variant on completion — and writes the fit profile to Klaviyo)
5. ATC + sticky bar (keep) + GovX
6. **"The A2 Promise" row** (icons): Lifetime warranty · Crash replacement · Free size exchange · Arrives 92% built · Human support — each opening a short drawer, not a page exit
7. Below fold, driven by **metafields** so every build is correct automatically: spec table (the `sc_attributes` metafields already exist!), geometry table, line-specific builds comparison, hotspot image per line, "92% built" section, reviews widget, FAQ (+ `Product`/`FAQPage` JSON-LD)

Acceptance: no cross-product content possible; Lighthouse mobile ≥ live baseline +20 points; every module schema-editable.

### Phase 2 — Checkout-objection layer (weeks 4–6) ⇒ targets the 83% leak
- Affirm messaging in cart + at Begin Checkout; Truemed touchpoint in cart drawer ("eligible riders save ~30% — check in 2 min").
- Klaviyo abandoned-browse/cart flows → the **Financing LP** (built, waiting) with UTM-clean links; back-in-stock and price-drop flows.
- Returns/size-exchange reassurance line directly under the ATC ("Wrong size? Free exchange.").
- Seed reviews: post-purchase Klaviyo Reviews flow with photo incentive (review volume is the engine of Phase 3 proof).

### Phase 3 — Differentiation: the "beat them" wedges (weeks 6–10)
1. **Fit-first front door.** Make "Find your fit" the primary site-wide CTA (header + hero + PDP). Quiz/Fit Finder → recommended line + build + size → personalized PDP (variant pre-selected) → fit profile in Klaviyo for the ~95% who don't buy that day. Canyon buries its calculator inside PDPs; nobody makes fit the funnel spine. A2's adjustability engineering makes this honest.
2. **Pre-tax pricing as brand position.** "The only tri bike you can buy with pre-tax dollars" — Truemed framing beside every price, a dedicated explainer (built: Financing LP), and ad creative on the knowledge gap. This is a ~30% effective price cut Canyon/Trek/QR simply do not market.
3. **Productize "The A2 Promise."** One named bundle: lifetime warranty + crash replacement + free size exchange + 92% built + CRP upgrade path + trade-in. On every PDP, its own page, in ads. On paper this already beats the benchmarks' ownership terms — it has never been packaged.
4. **Human layer.** "Talk to a real fitter" — bookable 15-min video consult (calendar embed), surfaced on PDP + exit-intent for cart abandoners ≥ $4k. Demo program pulled out of the orphan pages onto PDPs. Peloton's showroom advantage at DTC cost.
5. **Proof engine.** Race-results/athlete feed (A-Team content exists), UGC gallery, review photos — Ventum-style storytelling, systematized on PDPs and LPs.

### Phase 4 — Operating system (ongoing)
- **Experimentation** via Convert (hooks already shipped): cadence of 1–2 tests/sprint. Starting backlog:
  | Hypothesis | Where | Primary metric |
  |---|---|---|
  | $/mo + pre-tax price stack ↑ PDP→ATC | PDP buy box | ATC rate |
  | Fit Finder inline (vs size-guide link) ↑ variant selection + ATC | PDP | size-selected sessions |
  | "A2 Promise" row ↑ checkout completion | PDP/cart | Begin Checkout→Purchase |
  | Financing LP as abandoned-cart destination (vs cart link) | Klaviyo flow | recovered revenue |
  | Hero video vs static | SP LP | LP→PDP CTR |
  | Truemed line in cart ↑ checkout start | Cart drawer | Begin Checkout rate |
- **Content consolidation:** kill/301 the zombie Shogun LPs and duplicate sizing/financing pages into the 4-LP system + canonical sizing page (~100 pages → ~40).
- **Speed budget:** Lighthouse CI on PDP/home/LPs; JS budget; app audit (each app script must justify its weight); fonts preloaded once in `theme.liquid`, never in body.
- **KPIs (weekly):** sessions→PDP rate, PDP→ATC, ATC→Begin Checkout, Begin Checkout→Purchase, overall CVR, AOV, email/SMS capture rate, fit-profile capture rate, LCP/CLS mobile.

---

## 7. Funnel math (illustrative, using the audit's figures)

Per 10,000 sessions at AOV $4,100, modeling only the two repaired leaks:

| Stage | Today | Phase 1–2 target | Stretch (Phase 3) |
|---|---|---|---|
| PDP continue rate | ~5% | 8% | 10% |
| Begin Checkout→Purchase | ~17% | 25% | 30% |
| Overall CVR (homepage-path baseline 0.3%) | 0.30% | ~0.70% | ~1.05% |
| Revenue / 10k sessions | ~$123k | ~$287k | ~$430k |

A 0.7–1.0% sitewide CVR puts A2 at or above typical specialty-DTC bike conversion — with email/SMS + fit-profile capture compounding the ~99% who don't purchase on first visit. These are directional models, not forecasts; the experiment program in Phase 4 is what validates each step.

---

## 8. What this needs from A2 (decision list)

1. Current **SP and Rogue geometry/stem data** → update Fit Finder `fit_coords` + size labels (blocker).
2. Canonical **reviews platform** (recommend Klaviyo Reviews — already on PDP) and Octane AI status.
3. Klaviyo company ID + list IDs; Truemed flow URL (to replace placeholders in the LPs).
4. Verify/confirm: `pages/warranty` destination, `collections/sp-25` vs `/collections/sp`, shipping promise ($99 / 3–5 days) accuracy.
5. Decide: publish the draft theme (or fold the LP/PDP system into the live theme), and the LP pages' visibility until then.
6. Approve Phase 0 list for the live theme (all reversible theme-editor changes, but it's the production storefront — needs sign-off).

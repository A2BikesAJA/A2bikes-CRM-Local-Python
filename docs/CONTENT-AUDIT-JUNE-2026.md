# A2 Bikes — Content & CTA Audit vs. Competitors and 2026 High-AOV Standards

_Prepared June 10, 2026. Evidence: full store page inventory (136 pages via Admin
API), the draft-theme experience as of this date (rebuilt homepage, LP system,
sppdp build PDPs, collection pages), navigation menus and blogs, competitor
research (Quintana Roo, Canyon, Trek/Specialized, Ventum, Peloton patterns), and
2026 ecommerce content-trend research. Companion to
`docs/ECOM-AUDIT-AND-ROADMAP.md` (June 9), which covered template assembly; this
audit covers **what the content says, where it lives, and what it asks the
shopper to do.**_

---

## 1. Verdict

The June rebuild fixed the **experience layer**: the draft theme's homepage,
PDPs, LPs and collection pages now match or beat bike-industry CTA patterns
(guided quiz front door, monthly+pre-tax price framing, inline size calculator,
press proof, education tiles). A2's problem has moved down a level: the
**content library underneath is unfinished, fragmented, and in places broken** —
policies with placeholder legal text, a warranty registration that cannot be
completed, eight competing financing pages, ~13 overlapping sizing pages, a
stale FAQ with dead CTAs, and no navigation path to any of the trust content
that justifies a $3k–$9k purchase.

Meanwhile the competitive bar moved: **Quintana Roo now markets a lifetime
warranty and monthly payments and became the Official Bike Supplier of IRONMAN
(Feb 2025)** with roughly 20% triathlete share. A2's warranty is no longer a
differentiator by itself — **crash replacement, free size exchange, the
adjustability story, and pre-tax HSA/FSA buying are**, and none of them is
currently findable from the site's menus.

**One sentence:** the storefront now sells well; the library behind it would
lose a diligence check by any careful $4,000 shopper — and careful is exactly
what high-AOV shoppers are.

---

## 2. Scorecard — A2 vs. industry-leading high-AOV standards

| Dimension | Benchmark standard (Canyon/QR/Trek/Peloton + 2026 trends) | A2 today (draft theme) | Grade |
|---|---|---|---|
| Guided discovery | Quiz/selector as primary journey; AI assistants emerging | Octane quiz on homepage hero + dedicated page (top email tool) | **A−** (quiz not in nav; no AI assistant) |
| Fit & sizing | Integrated size finder on PDP; structured size data | Size calc collapsible on every bike PDP + homepage path | **B+** experience / **D** library (13 overlapping pages, PNG-only chart, 2021 Fit Finder coords) |
| Price & financing framing | $/mo beside every price (Canyon, QR); transparent terms | Affirm as-low-as on collection cards + bands; Truemed framing; PDP `show_affirm_line` still off | **B** experience / **F** library (8 fragmented pages, 2 empty, no nav entry, Truemed page shows sold-out products, no qualification CTA) |
| Trust & ownership promise | Lifetime warranty now table stakes (QR matched it); clear policy pages linked sitewide | Crash replacement + free size exchange are genuinely rare — but policy pages have `[Jurisdiction]`/`[Partner Name]` placeholders, conflicting emails, no registration form, no nav links | **A− assets / F presentation** |
| Social proof | High review volume, UGC on PDPs, athlete content; QR leverages IRONMAN officialdom | Press quotes (Esquire/Triathlete/PBJ) good; PDP reviews are fabricated placeholders marked "verified"; athlete quotes empty; USAT partnership buried in one quote | **C** (and a claims-compliance risk) |
| Product education | Demo/360 video (3× PDP conversion), spec/geometry structured data, comparison tools | Metafield spec tables, hotspots, edu tiles, build comparisons — strong; no PDP video, geometry as PNG | **B+** |
| Editorial/SEO content | Active education hub feeding organic | Good 2025–26 guides exist but as *pages*; blog dormant since 2024, press since 2021 | **C−** |
| Navigation & findability | Every trust/financing/sizing asset 1 click from anywhere | Nothing in current menus links warranty, crash replacement, financing, Truemed, sizing, shipping, or the quiz; footer "Chat Our Team" → `#`; main-menu links an unpublished demo page | **F** |
| Post-purchase & programs | Trade-in, demo, upgrade paths surfaced pre-purchase (Peloton-style risk removal) | CRP/demo/trade-in/ambassador content exists but mostly unpublished or orphaned | **D** |
| 2026 trends (video, UGC, AI) | Shoppable video, UGC on PDPs, AI shopping assistants driving measurable lifts | Assembly videos exist (buried); no PDP video, no UGC, no AI layer | **D** |

---

## 3. Where A2 is genuinely competitive or ahead (protect these)

1. **Quiz-first homepage** — guided selling as the secondary hero CTA, proven
   internally as the top email/engagement tool. Canyon buries its equivalent.
2. **Double price frame** (Affirm $/mo + Truemed pre-tax) across collections,
   bands and LPs — no bike competitor markets pre-tax buying. This is A2's
   "Peloton $/mo moment" and it's live in the draft.
3. **Per-build product-aware PDPs** with metafield specs, education tiles,
   hotspots, inline size calculator with lead capture — structurally ahead of
   QR's PDPs and competitive with Canyon's.
4. **Crash replacement + free size exchange** — still nearly unique. With QR
   matching lifetime warranty, these are now THE ownership wedge and deserve
   headline treatment, not tab text.
5. **Real press proof** (Esquire, Triathlete, Portland Business Journal/USAT).

---

## 4. Critical content failures (would not survive shopper diligence)

1. **Unfinished legal documents in production.** Warranty and crash-replacement
   pages contain literal `[Jurisdiction]`, `[Partner Name 1/2]`, `[Date]`,
   `[8/25/25]` placeholders.
2. **Warranty registration dead-end.** Coverage doubles if you "register at
   www.a2bikes.com/warranty within 60 days" — no registration form exists
   anywhere on the site.
3. **Hardcoded, unsourced competitor table** (Trek/Specialized/Canyon/Giant/
   Cervélo/Scott crash-discount comparison) inside the crash-replacement page
   body — violates the project's claims-discipline rule and is unmaintainable.
4. **Fabricated PDP reviews marked "verified"** (identical "Marcus T. / Dana R.
   / Priya S." across all builds, 4.8★/96 reviews/97% recommend) — must be
   replaced with Klaviyo Reviews or stripped before anything goes public.
5. **FAQ with dead CTAs** — unlinked "HERE" for the return policy, links to a
   retired product handle and wrong collection, 2023-era facts; it's in the live
   footer.
6. **Empty keystone pages**: About (×2), Our Promise, Racing Team, both Affirm
   pages, Truemed duplicate — zero CMS content.
7. **Findability collapse**: no current menu links to warranty, crash
   replacement, financing, Truemed, shipping, sizing, assembly, dealers, or the
   quiz. The only shipping-terms page is unpublished.
8. **Duplication sprawl**: 8 financing pages, ~13 sizing/geometry pages
   (including exact duplicates and published "copy-of-" handles), 2 Buying
   Process pages, 2 Abouts, duplicate CRP sets, ~18 zombie/legacy pages
   (BFCM 2025, Shogun imports, a published page titled "DRAFT").
9. **Contradictions**: two crash-replacement contact emails; "lifetime =
   minimum 10 years"; policy pages citing canonical URLs that don't match real
   handles; spec-guide title/handle swap (105 ↔ Ultegra).
10. **Stale credibility surfaces**: "A2 In the News" frozen at 2021, blog at
    2024 — adjacent to a homepage section called "A2 Bikes in the News."

---

## 5. CTA audit

**What's now right (draft theme):** consistent hierarchy (primary red CTA per
view), quiz → bike → size → build chain, financing CTAs at decision points,
size-calc result buttons deep-linking to build PDPs, out-of-range lead capture.

**What's broken (library):**
- Policy pages have **zero links** — no "register your bike," no "shop," no
  "contact" buttons; emails as plain text.
- Truemed page: no qualification CTA at all; six sold-out product cards as its
  only commerce element.
- FAQ/footer/menus: dead `#` link, unpublished destinations, retired handles.
- Trade-in: mailto-only; Demo: linked in nav but unpublished.
- PDP settings: `show_affirm_line: false` everywhere, `affirm_url`,
  `consult_url`, `size_help_url` empty — built-in CTAs switched off.

**Rule worth adopting:** every content page ends in exactly one primary CTA
(shop/quiz/register/check eligibility) plus a contact fallback. Today most end
in nothing.

---

## 6. 2026-trend alignment (the next frontier, after the basics)

| Trend | Evidence | A2 status | Cheapest credible move |
|---|---|---|---|
| Product/demo video on PDP | Shoppable-video PDPs convert ~3× static; demo + 360 formats lead for high-AOV | None on PDPs (assembly videos buried on a guide page) | Add a video slot to sppdp gallery; reuse existing build/assembly footage |
| UGC on PDPs | Authentic customer content out-converts studio polish | None | Pull race-day customer photos into a PDP UGC strip; seed via post-purchase Klaviyo flow |
| AI shopping assistant | Early adopters attribute ~10%+ revenue; "generative commerce" rising | None (Octane quiz is the structured cousin) | Not urgent — quiz covers guided selling; revisit post-publish |
| Education-led PDPs | Spec + "why it matters" tiles, comparison tools | Already strong (edu tiles, hotspots, compare) | Add geometry as HTML table (also SEO/accessibility) |
| Financing transparency | $/mo beside every price + clear terms page | Experience yes; canonical terms page no | One canonical financing page (see plan) |

---

## 7. Prioritized plan

**Tier 0 — before the theme publishes (blocking, days):**
1. Fix warranty + crash-replacement pages: fill placeholders (owner/legal),
   remove the hardcoded competitor table, one contact email, add CTAs; create
   the **warranty registration form** (Shopify form/Klaviyo) the policy promises.
2. Replace or strip fabricated PDP reviews; wire Klaviyo Reviews into
   sppdp-reviews; fix "SP-105" headings on Rival/Force/Red.
3. Rebuild the FAQ (one page, current links, add warranty/financing/sizing/
   crash-replacement Q&As).
4. **Navigation pass**: header + footer links to Warranty, Crash Replacement,
   Financing & HSA/FSA, Sizing, Quiz, Contact; remove dead/unpublished targets.
5. Publish shipping terms (the page exists, unpublished).

**Tier 1 — consolidation (2–3 weeks):**
6. One canonical **Financing & HSA/FSA** destination (the built LP) — 301 the
   other seven; add Truemed qualification CTA; fill the empty Affirm pages or
   kill them.
7. One canonical **Sizing & Geometry** page (HTML tables, current geometry,
   embeds the v2 calculator) — 301 the ~12 others; this is also the SEO play
   for "A2 size chart / triathlon bike sizing" queries.
8. Zombie purge: ~18 legacy pages unpublished/301'd (list in inventory).
9. Productize **"The A2 Promise"** page (crash replacement + size exchange +
   92% built + CRP + support) — the anti-QR positioning now that lifetime
   warranty is matched; link it from every PDP trust row.
10. Publish demo + trade-in pages with real CTAs (forms, not mailto).

**Tier 2 — content engine (quarter):**
11. Move SEO guides into the blog; resume 1–2 articles/month; refresh "In the
    News" with 2025–26 coverage (answer QR's IRONMAN officialdom with the USAT
    high-performance partnership story, properly told).
12. PDP video slot + first UGC strip; geometry tables as structured data.
13. Counter-positioning content: "QR vs A2" honesty page using the
    schema-editable comparison section (sourced claims only).

---

## 8. Sources

- Internal: Admin API page/menu/blog inventory (June 10, 2026); draft theme
  176492183716 templates; `docs/ECOM-AUDIT-AND-ROADMAP.md` §2 benchmark table.
- Competitor: [Quintana Roo](https://quintanarootri.com/) (lifetime warranty,
  monthly payments, IRONMAN official supplier Feb 2025);
  [Triathlete — Best Triathlon Bikes 2025](https://www.triathlete.com/gear/bike/best-triathlon-bikes/);
  [Canyon US](https://www.canyon.com/en-us/) (financing, size finder, comparison
  patterns per June 9 audit).
- Trends: [Videowise — Product Videos for eCommerce 2026](https://videowise.com/blog/product-videos-for-ecommerce-guide);
  [Search Engine Land — Top Ecommerce Trends 2026](https://searchengineland.com/guide/top-ecommerce-trends-2026);
  [Whatmore — Shoppable Video Guide 2026](https://www.whatmore.ai/blog/the-ultimate-guide-to-shoppable-video-for-2026/);
  [Alhena — AI in Ecommerce](https://alhena.ai/blog/artificial-intelligence-in-ecommerce/);
  [Insider One — AI Shopping Assistants 2026](https://insiderone.com/ai-shopping-assistants/).

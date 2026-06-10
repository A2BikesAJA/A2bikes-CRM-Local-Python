# A2 Bikes — Prioritized Edit Backlog (June 10, 2026)

Single ranked list of every recommended edit, most impactful first. Sources:
`docs/CONTENT-AUDIT-JUNE-2026.md`, `docs/ECOM-AUDIT-AND-ROADMAP.md`,
`docs/CLAUDE-TEAM-MEMORY.md` §9. Tags: **[Me]** executable directly,
**[AJ]** needs owner input/assets, **[Both]** mixed. Effort S/M/L.

| # | Edit | Why it's this high | Who | Effort |
|---|---|---|---|---|
| 1 | **Navigation pass** — header + footer links to Warranty, Crash Replacement, Financing & HSA/FSA, Sizing, Bike Quiz, Contact; remove dead targets (`#` chat link, unpublished demo page, retired handles) | Affects 100% of sessions; the entire trust arsenal is currently unfindable; near-zero effort for the largest reach | [Me] | S |
| 2 | **Turn on the built-in PDP financing CTAs** — `show_affirm_line: true`, fill `affirm_url`/`consult_url`/`size_help_url` on all build PDPs | $/mo framing at the exact decision point (the audit's #2 leak); the code exists, it's switched off | [Me] (urls from AJ) | S |
| 3 | **Replace fabricated PDP reviews** with the Klaviyo Reviews embed (or strip ratings/"verified" flags until volume exists); fix "What SP-105 riders say" headings + hardcoded "Shimano 105" compare cell on Rival/Force/Red | Legal/compliance risk + social proof at the decision point; QR/Trek win partly on review volume — fake-looking reviews are worse than none | [Me] | S |
| 4 | **Fix warranty + crash-replacement pages**: fill `[Jurisdiction]`/`[Partner Name]`/`[Date]` placeholders, remove the unsourced competitor discount table, one contact email, add CTAs (register / shop / contact) | Unfinished legal documents are live; these two pages ARE the A2 Promise — currently they undermine it | [Both] (legal text AJ) | M |
| 5 | **Build the warranty registration form** the policy promises (Shopify form or Klaviyo form → tag profile; page at /pages/warranty-registration, linked from warranty + post-purchase email) | Converts a dead-end promise into an owned-data capture loop; doubles-coverage offer becomes real | [Both] | M |
| 6 | **Fill Klaviyo company/list IDs + Why A2 form ID** (placeholders since June 4) | Every LP and homepage email capture is dead; email is the recovery channel for the ~99% who don't buy | [AJ] (IDs) → [Me] wires | S |
| 7 | **Fill the Affirm cart-drawer embed key** | The pay-over-time message nearest the 83% Begin-Checkout abandonment is dark | [AJ] (10 sec in editor) | S |
| 8 | **Fix attribution** (GA4/GTM audit so UTMs stop landing "(not set)"); also remove the hardcoded Google remarketing tag on the Contact page | Gating item: nothing above can be measured until this works | [Both] | M |
| 9 | **One canonical Financing & HSA/FSA page** — the built LP becomes the destination; 301 the other 7; add a real Truemed qualification CTA; remove sold-out product strip from the Truemed page | Fragmentation kills the strongest differentiator (pre-tax buying); 8 pages → 1 | [Me] (301s + Truemed URL from AJ) | M |
| 10 | **One canonical Sizing & Geometry page** — HTML geometry tables (current numbers from AJ), embedded v2 calculator; 301 the ~12 duplicates; retire/replace the 2021 Fit Finder on the SP LP | Fit is the #1 objection; ~13 contradictory pages + PNG-only chart today; also the "size chart" SEO play | [Both] (geometry data AJ) | M |
| 11 | **FAQ rebuild** — current links, current handles, add warranty/crash/financing/sizing/shipping Q&As | In the live footer with dead CTAs and 2023 facts; cheap trust repair | [Me] | S |
| 12 | **Publish shipping terms** (page exists unpublished); verify the $99 / 3–5 day promise | A $4k purchase with no findable shipping terms | [AJ] verify → [Me] publish/link | S |
| 13 | **Productize "The A2 Promise"** — one page: crash replacement + free size exchange + 92% built + CRP + human support; linked from every PDP trust row | The anti-QR position now that they match lifetime warranty; assets exist, packaging doesn't | [Me] | M |
| 14 | **Zombie purge** — unpublish/301 ~18 legacy pages (BFCM 2025, Shogun imports, published "DRAFT"/"copy-of" pages, 2 duplicate Buying Process/About pages); plus theme cleanup (a2-test stubs, why-a2.liquid, sppdp-live test templates, spc staging clones) | Index hygiene, crawl budget, and the embarrassment factor of shoppers landing on 2021 content | [Both] (deletes are owner-only in editor) | M |
| 15 | **Default collection template is SP-specific** (SP video hero, SP size guide) and renders on accessory/other collections — make it generic or assign templates | Wrong-product content, same class of bug as the old PDP | [Me] | M |
| 16 | **Demo + trade-in pages published with real CTAs** (forms, not mailto); surfaced on PDPs | Peloton-grade risk removal already written, just unpublished | [Both] | M |
| 17 | **Athlete quotes + unhide Why A2 athletes; verify "five-time winner" claim** | Social proof + claims discipline; section ships hidden until then | [AJ] | S |
| 18 | **Verify competitor prices in PDP compare tables** ($5,099/$4,599/$5,499 etc.) or mark "verify on manufacturer site" | Claims rule; comparison content is high-trust surface | [AJ] verify → [Me] update | S |
| 19 | **PDP video slot + first UGC strip** (reuse existing build/assembly footage; seed UGC via post-purchase Klaviyo flow) | 2026's biggest proven PDP lever (~3× vs static); A2 has footage already | [Both] | L |
| 20 | **Content engine restart** — move SEO guides into the blog, 1–2 articles/month, refresh "In the News" with 2025–26 coverage incl. the USAT high-performance partnership story (answer QR's IRONMAN officialdom) | Organic + credibility; press frozen at 2021 next to a homepage "In the News" section | [Both] | L |
| 21 | **Homepage Affirm app block** so the band's as-low-as line renders on the homepage too | Minor polish; band is static-but-compliant today | [AJ] (editor toggle) | S |
| 22 | **Live-theme `theme.liquid` script cleanup** (unclosed gtag block, malformed selector, duplicate Zoho/identify scripts) — fold into the publish-swap QA | Performance + data quality; moot if draft publishes soon since draft inherits a clean pass then | [Me] at publish time | M |

## Suggested batching

- **This week (mostly me):** 1, 2, 3, 11 — plus 6/7 the moment you paste the
  Klaviyo IDs and Affirm key. That set alone puts financing at every decision
  point, makes trust content findable, and removes the compliance landmines.
- **You-dependent unblocks to queue now:** legal text for 4, geometry for 10,
  Truemed URL for 9, athlete quotes for 17, claim/price verifications for 18.
- **Pre-publish gate:** 1–12 done = the theme is publishable; 13–18 make it
  excellent; 19–22 are the post-publish growth engine.

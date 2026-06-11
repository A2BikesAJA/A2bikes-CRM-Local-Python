# Publish Checklist — taking the draft theme live

_Prepared June 11, 2026. Owners: **AJ** (decisions, claims, publish button) and
**Darren** (assets, Fera, quotes). Claude executes everything marked ⚙ once the
inputs land. Theme: "Why A2 — DRAFT" `176492183716` replaces live
`176478617764`. Rule 1 stands: only AJ publishes._

---

## Phase 1 — Inputs (this week, parallel; nothing else is blocked on these except where noted)

### AJ
- [x] **Fit Finder geometry — DONE June 11.** AJ supplied both V0.01 fit
      sheets (Metron Alloy = 105/Rival; Si013 = Force/Red). Geometry extracted
      from the sheet charts, wired into the Fit Finder with a build toggle
      (sizes S–XL, 78/93/108mm stems, 0–70mm risers), deployed + verified.
      Remaining nuance: Rogue uses the height-based Size Calculator v2 (no pad
      sheet needed).
- [ ] **Claim citations.** Confirm before they face traffic:
      - "Best Beginner Triathlon Bike — Triathlete Magazine" → exactly which years?
      - "Five-time winner" (Why A2) → verify or cut.
      - "4.8★ / 96 reviews / 97% would recommend" on PDPs → 4.53★/96 is what the
        recovered Fera data supports store-wide; approve softer copy or give a
        defensible per-product number.
- [ ] **Affirm cart-drawer public key** (theme-editor toggle) so $/mo follows
      shoppers into the cart.
- [ ] **Approve the consolidation kill-list** (executed at publish, step 4.6):
      - finance, finance-your-bike, financing-your-bike, ride-now-pay-later,
        financing-and-installments → 301 → `/pages/financing-hsa-fsa`
      - about → about-new (pick canonical)
      - buying-process vs buying-process-2-0 (pick canonical)
- [ ] **Verify the shipping promise** ($99 / 3–5 days) used in PDP copy.
- [ ] **Klaviyo sign-up form ID** for Why A2 capture (or approve the built-in
      fallback that's live now).

### Darren
- [ ] **Upload the big videos** (admin → Content → Files — they exceed what
      Claude's pipe can move): `SP Website Header_4.mp4` (hero loop),
      `A2 SP UGC No Music.mov`, Brennen captioned cut, Carolyn/Kaitlin clips,
      `All Road Bike Reel.mp4` (Rogue). Then in the theme editor, open an SP
      product → "SP PDP · Video & UGC" → pick the hero file. (Or just upload —
      ⚙ Claude wires CDN URLs once files exist.)
- [ ] **Athlete quotes** (#17): Kinley Bollinger + 1–2 creators (Carolyn /
      Kaitlin / Brennen), with permission to publish name + photo. ⚙ unhides
      the Why A2 athletes section same day.
- [ ] **Fera prep** (app re-enables only at publish, per AJ): open a ticket to
      strike the 12 flagged fake reviews ("Ben"/"Lars", Apr–May 2025 — list in
      `docs/UGC-ASSET-INVENTORY.md`), and confirm dashboard access for full
      review text.

### Either of you (theme code editor — API can't delete files)
- [ ] Delete `sections/why-a2.liquid` and the five `sections/a2-test-*.liquid`
      stubs from the DRAFT theme.
- [ ] **Close any open theme-editor tabs when you're done each day.** A stale
      tab's Save silently reverts deployed work (it erased the media section
      once already).

## Phase 2 — Claude's prep (⚙ as inputs land)
- [ ] Wire Fit Finder coords + size labels; verify on every PDP + homepage modal.
- [ ] Insert athlete quotes; unhide `wa-athletes`; set `klaviyo_form_id`.
- [ ] Apply approved claim copy everywhere (PDP rating line, Why A2, compare).
- [ ] Wire uploaded videos into SP hero slots; add media band to Rogue
      templates once the Rogue reel is up.
- [ ] Full checksum audit: every repo file matches the draft theme byte-for-byte.
- [ ] Mobile walkthrough (home → collection → PDP → cart, both lines, all four
      LPs, Why A2, size guide) + Lighthouse before/after capture.
- [ ] Menus: confirm header/footer point at the draft nav (Menu 4.0) and every
      trust/financing/sizing page is reachable in one click.

## Phase 3 — Publish day (~2 hours, sequenced)
1. [ ] **Freeze**: no editor edits, all editor tabs closed.
2. [ ] ⚙ Final checksum sweep + last QA pass on the preview URL.
3. [ ] **AJ clicks Publish** on "Why A2 — DRAFT". (The old theme stays as the
       instant rollback — do not delete it.)
4. [ ] Immediately after, in order:
   1. ⚙ Smoke test the public site: home, one SP PDP, one Rogue PDP, all four
      LPs (now rendering for real for the first time), size guide, cart.
   2. **Re-enable Fera** (Darren) — your constraint: it can only run on the
      live template. Verify reviews render; ⚙ then turn off the static quote
      cards so there's exactly one review source.
   3. ⚙ Verify Affirm as-low-as + Truemed lines render logged-out.
   4. ⚙ Analytics smoke test: GTM preview shows `a2_*` dataLayer events,
      UTM persistence works, GA4 receives.
   5. ⚙ Confirm the June 10 redirect batch still resolves (size guide, Truemed).
   6. ⚙ Execute the approved consolidation kill-list (301s + unpublish dupes).
   7. [ ] Cancel/park anything pointing ads at old LP URLs; update link-in-bio.
5. [ ] **48-hour watch**: 404 report, conversion events, page speed, Search
       Console coverage. Rollback = republish old theme (one click) — redirects
       and pages are theme-independent and survive.

## Phase 4 — The flywheel (first 2 weeks live)
- [ ] Klaviyo post-purchase review-request flow (build volume; 96 → hundreds).
- [ ] Abandoned-checkout flow leading with $/mo + HSA/FSA (aimed at the 83%
      begin-checkout loss).
- [ ] First Convert A/B: monthly-price-first vs total-price-first on SP PDPs.
- [ ] GA4 funnel dashboard: PDP → ATC → begin-checkout → purchase, segmented
      by source, so the next bets are data-picked.

## Standing advisory — Stiletto v6 (Fluorescent emails, June 11)
v6 ships "next week," free. **Do not update in place and do not wait for it to
publish.** Settings partially reset (colors/spacing/typography) and custom code
files don't transfer. Plan: after our publish, install v6 as an *unpublished*
copy, ⚙ re-deploy the entire custom layer from this repo onto it (it's all in
git + scripted), restyle base settings per Fluorescent's checklist, QA
side-by-side, then do a second swap. Their *shoppable hero* section becomes an
A/B candidate against our quiz-first hero at that point.

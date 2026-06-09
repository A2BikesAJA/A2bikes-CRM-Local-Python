# CLAUDE.md — A2 Bikes eCommerce workspace

You are working on **a2bikes.com** (Shopify store "A2 Bikes"), a DTC brand selling
carbon triathlon bikes (**SP** line) and road/gravel bikes (**Rogue** line),
AOV ≈ $4,100. Each line sells as 4 products by groupset (Shimano 105 → SRAM
Rival AXS → Force AXS → Red AXS).

**Read `docs/CLAUDE-TEAM-MEMORY.md` before significant work** — it is the full
project memory: state registry (theme/page/product IDs), session history, the
deploy pipeline with its gotchas, audit findings, and the roadmap. Other docs:
`docs/ECOM-AUDIT-AND-ROADMAP.md` (PDP teardown + phased plan),
`shopify/docs/INSTALL.md` (LP install/settings), `shopify/docs/HANDOFF.md`.

## Key registry (verify before relying — details in CLAUDE-TEAM-MEMORY.md)
- **Draft theme** (all new work goes here): "Why A2 — DRAFT (preview, do not
  publish yet)" = `gid://shopify/OnlineStoreTheme/176492183716`, UNPUBLISHED.
- **Live theme** (do not modify without explicit sign-off):
  "May_26_Stilletto_Theme_Update" = `gid://shopify/OnlineStoreTheme/176478617764`.
- **LP source of truth:** `shopify/` in this repo (sections, snippets, assets,
  templates). Repo: `A2BikesAJA/A2bikes-CRM-Local-Python`, PR #10.
- SP builds: `sp-shimano-105n` $3,115 · `sp-sram-rival-1` $4,999 ·
  `sp-sram-force` $7,199 · `sp-sram-red-axs` $8,999 (collection `/collections/sp`).
- Rogue builds: `rogue-shimano-105` $2,699 · `rogue-rival-axs` $3,999 ·
  `rogue-sram-force-etap-axs` $5,000 · `rogue-sram-red-axs` $9,900
  (collection `/collections/rogue`).

## Hard rules
1. **Never publish a theme** and never write files to the live/MAIN theme.
   Develop in the draft theme; the owner publishes.
2. **Deploy via staged uploads, then verify checksums.** Do not paste file
   bodies into GraphQL by hand (it corrupts). Pipeline:
   `stagedUploadsCreate` → `curl PUT` the bytes from disk → `themeFilesUpsert`
   with `body:{type: URL}` → read back `checksumMd5` and compare to local md5.
   Upsert **sections before** the JSON templates that use their settings;
   re-upsert the template if Shopify drops an unrecognized setting.
3. **Edit source in `shopify/` first, commit, then deploy** — the repo is the
   source of truth, the theme is a build target.
4. **Claims discipline:** competitor claims only schema-editable and verified
   ("verify on manufacturer site" defaults stay until replaced with sourced
   facts). All financing/savings figures are illustrative, kept in section
   settings, never hardcoded.
5. **GTM dataLayer only** — never hardcode GA4/Meta pixels. Preserve the UTM
   capture/re-append behavior in `assets/a2-lp.js`.
6. Storefront HTML fetches are bot-blocked and `scriptTags` is scope-denied —
   inspect via Admin API theme-file reads instead.

## Known blockers before anything goes public
- Fit Finder `fit_coords` in `shopify/snippets/a2-fit-calculator.liquid` are
  2021 Speed Phreak numbers (XS/S/M/L); current SP sells Small/Medium/Large/XL.
  Get current geometry from the owner and update.
- Klaviyo company ID + list IDs are placeholders (`KLAVIYO_COMPANY_ID` /
  `KLAVIYO_LIST_ID`); Truemed and Octane URLs unset.
- The four LP pages are published but render empty on the live theme (their
  templates exist only in the draft theme).
- Why A2 page: athlete quotes are placeholders (section hidden June 9 until
  real quotes arrive); `klaviyo_form_id` empty.
- Owner to delete in the theme code editor (API deletes are blocked):
  `sections/why-a2.liquid` (dead code) and the 5 `sections/a2-test-*.liquid`
  debug stubs from the June 9 deploy.

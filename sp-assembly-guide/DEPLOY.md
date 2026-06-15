# DEPLOY — enterprise hosting + data capture

Goal: host the guide on your own subdomain (e.g. `guide.a2bikes.com`), turn on
analytics, and capture registrations/feedback into Shopify + Klaviyo + a sheet.
The app is static; the data capture runs on a serverless function that ships in
the same deploy (Cloudflare Pages Functions). Secrets live on the host, never in
the browser bundle.

## 1. Host on Cloudflare Pages (free, custom domain, auto-deploy)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick this repo; set:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `sp-assembly-guide`
3. Deploy. You get `https://<project>.pages.dev`.
4. **Custom domain:** Pages → Custom domains → add `guide.a2bikes.com` (Cloudflare
   walks you through the DNS CNAME). Done — professional HTTPS URL.

The `functions/api/capture.ts` endpoint deploys automatically and is served at
`https://guide.a2bikes.com/api/capture` (same origin as the app).

## 2. Environment variables

Set these in Pages → Settings → Environment variables (Production). Each data
destination activates only if its vars are present, so enable them as you go.

**Build-time (client):**
- `VITE_GA4_ID` — your GA4 measurement id, e.g. `G-XXXXXXXXXX` (behavioral analytics).
- `VITE_CAPTURE_URL` — `/api/capture` (relative is fine; same origin).

**Runtime (server / secrets — never exposed to the browser):**
- `SHOPIFY_STORE` — `a2bikes.myshopify.com`
- `SHOPIFY_ADMIN_TOKEN` — Admin API token with `write_customers`, `write_metaobjects`
  (Shopify admin → Settings → Apps → Develop apps → create app → Admin API).
- `KLAVIYO_PRIVATE_KEY` — `pk_live_…` (Klaviyo → Settings → API keys).
- `KLAVIYO_LIST_ID` — the list registrants subscribe to (warranty/owners list).
- `SHEET_WEBHOOK_URL` — a Google Apps Script / Zapier / Make webhook (see §4).
- `AIRTABLE_TOKEN` / `AIRTABLE_BASE` / `AIRTABLE_TABLE` — if using Airtable instead.

## 3. Shopify data model — already created

The `sp_registration` metaobject definition is created in your store
(fields: name, email, order, serial, build, registered_at). On each
registration the function upserts the **Customer** (tagged `sp-assembly-registered`)
and creates one **SP Registration** metaobject — viewable under
Shopify admin → Content → Metaobjects → SP Registration.

## 4. Google Sheet capture (simplest "sheet" option)

Create a Google Sheet → Extensions → Apps Script → paste:

```js
function doPost(e) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var d = JSON.parse(e.postData.contents);
  sh.appendRow([new Date(), d.type, d.email, d.name, d.order, d.serial, d.build, d.step, JSON.stringify(d)]);
  return ContentService.createTextOutput("ok");
}
```

Deploy → New deployment → **Web app** → Execute as *me*, Access *Anyone* → copy
the URL into `SHEET_WEBHOOK_URL`.

## 5. What gets captured

| Event | When | Goes to |
|---|---|---|
| `guide_start` | build selected, Start pressed | GA4, Klaviyo, sheet |
| `registration` | start with an email filled in | GA4, **Shopify (customer+metaobject)**, Klaviyo (+list), sheet |
| `step_view` | each step opened | GA4, Klaviyo, sheet |
| `step_feedback` | 👍/👎 on a step | GA4, Klaviyo, sheet |
| `help_request` | "Stuck? Contact A2" clicked | GA4, Klaviyo, sheet |
| `completed` | "Mark assembly complete" | GA4, Klaviyo, sheet |

GA4 gives the behavioral funnel (drop-off per step, build mix, completion rate,
AR usage). Shopify/Klaviyo/sheet give the owner + warranty records.

## 6. Put it on the site

- **Dedicated page:** Shopify admin → Online Store → Pages → add "SP Assembly
  Guide" with a full-width `<iframe src="https://guide.a2bikes.com">`.
- **Product page:** add an "Assembly Guide" button/link to the same URL on the SP product.
- **Order confirmation email & packing slip:** link the URL + a QR code to it.

## Local

`npm run dev` for local work. `VITE_CAPTURE_URL` unset locally → events log to
console only, nothing is sent. Build a one-file shareable copy with
`SINGLE=1 npm run build` (note: the single-file build can't reach `/api`, so it's
for visual review, not data capture).

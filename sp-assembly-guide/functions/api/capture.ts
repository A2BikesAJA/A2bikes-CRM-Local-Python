// Cloudflare Pages Function — receives capture events from the guide and fans
// them out to Shopify, Klaviyo, and a Sheet/Airtable webhook. Each destination
// activates ONLY if its secrets are present, so you can enable them one at a
// time. Secrets live in the Pages project (never in the client bundle).
//
// Route: POST /api/capture   (same origin as the app → no CORS needed, but we
// send permissive CORS headers so the guide also works when iframed.)
//
// Env vars (set in Cloudflare Pages → Settings → Environment variables):
//   SHOPIFY_STORE            e.g. a2bikes.myshopify.com
//   SHOPIFY_ADMIN_TOKEN      Admin API access token (write_customers, write_metaobjects)
//   KLAVIYO_PRIVATE_KEY      pk_live_...  (optional)
//   KLAVIYO_LIST_ID          list to subscribe registrants to (optional)
//   SHEET_WEBHOOK_URL        Google Apps Script / Zapier / Make webhook (optional)
//   AIRTABLE_TOKEN / AIRTABLE_BASE / AIRTABLE_TABLE  (optional)

interface Env {
  SHOPIFY_STORE?: string;
  SHOPIFY_ADMIN_TOKEN?: string;
  KLAVIYO_PRIVATE_KEY?: string;
  KLAVIYO_LIST_ID?: string;
  SHEET_WEBHOOK_URL?: string;
  AIRTABLE_TOKEN?: string;
  AIRTABLE_BASE?: string;
  AIRTABLE_TABLE?: string;
}

interface Body {
  type: string;
  payload: Record<string, unknown>;
  sid?: string;
  ts?: string;
  href?: string;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { headers: CORS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad json" }, 400);
  }
  const { type, payload = {} } = body;

  // run all destinations in parallel; one failing never blocks the others
  const results = await Promise.allSettled([
    toShopify(env, type, payload),
    toKlaviyo(env, type, payload),
    toSheet(env, body),
    toAirtable(env, body),
  ]);

  const status = ["shopify", "klaviyo", "sheet", "airtable"].reduce(
    (acc, name, i) => {
      const r = results[i];
      acc[name] = r.status === "fulfilled" ? r.value : `error: ${r.reason}`;
      return acc;
    },
    {} as Record<string, unknown>
  );
  return json({ ok: true, status });
};

function json(obj: unknown, statusCode = 200) {
  return new Response(JSON.stringify(obj), {
    status: statusCode,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// ── Shopify: only on registration → upsert customer + create a registration
//    metaobject (type "sp_registration"; see DEPLOY.md for the definition). ──
async function toShopify(env: Env, type: string, p: Record<string, unknown>) {
  if (type !== "registration") return "skipped";
  if (!env.SHOPIFY_STORE || !env.SHOPIFY_ADMIN_TOKEN) return "not configured";
  const email = String(p.email || "");
  if (!email) return "no email";

  const api = `https://${env.SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN,
  };

  // 1) upsert customer by email
  const [first, ...rest] = String(p.name || "").trim().split(" ");
  const custRes = await fetch(api, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `mutation($input: CustomerInput!){ customerCreate(input:$input){ customer{ id } userErrors{ field message } } }`,
      variables: {
        input: {
          email,
          firstName: first || undefined,
          lastName: rest.join(" ") || undefined,
          tags: ["sp-assembly-registered"],
        },
      },
    }),
  }).then((r) => r.json());
  // customerCreate fails if the email already exists — that's fine, ignore.

  // 2) create a registration metaobject (the warranty/assembly record)
  await fetch(api, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `mutation($mo: MetaobjectCreateInput!){ metaobjectCreate(metaobject:$mo){ metaobject{ id } userErrors{ field message } } }`,
      variables: {
        mo: {
          type: "sp_registration",
          fields: [
            { key: "name", value: String(p.name || "") },
            { key: "email", value: email },
            { key: "order", value: String(p.order || "") },
            { key: "serial", value: String(p.serial || "") },
            { key: "build", value: String(p.build || "") },
            { key: "registered_at", value: new Date().toISOString() },
          ],
        },
      },
    }),
  }).then((r) => r.json());

  return custRes?.data ? "ok" : "ok (customer existed)";
}

// ── Klaviyo: profile + event for every capture type ──────────────────────
async function toKlaviyo(env: Env, type: string, p: Record<string, unknown>) {
  if (!env.KLAVIYO_PRIVATE_KEY) return "not configured";
  const email = String(p.email || "");
  const headers = {
    Authorization: `Klaviyo-API-Key ${env.KLAVIYO_PRIVATE_KEY}`,
    "Content-Type": "application/json",
    revision: "2024-10-15",
  };

  // event (only meaningful with an email/profile identifier)
  if (email) {
    await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: p,
            metric: { data: { type: "metric", attributes: { name: `SP Guide: ${type}` } } },
            profile: { data: { type: "profile", attributes: { email } } },
          },
        },
      }),
    });
    if (type === "registration" && env.KLAVIYO_LIST_ID) {
      // subscribe registrant to the warranty list
      await fetch(`https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              profiles: { data: [{ type: "profile", attributes: { email } }] },
            },
            relationships: { list: { data: { type: "list", id: env.KLAVIYO_LIST_ID } } },
          },
        }),
      });
    }
    return "ok";
  }
  return "no email";
}

// ── Sheet webhook (Google Apps Script / Zapier / Make): append everything ──
async function toSheet(env: Env, body: Body) {
  if (!env.SHEET_WEBHOOK_URL) return "not configured";
  await fetch(env.SHEET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: body.type,
      sid: body.sid,
      ts: body.ts,
      href: body.href,
      ...body.payload,
    }),
  });
  return "ok";
}

// ── Airtable: append a row to a table ─────────────────────────────────────
async function toAirtable(env: Env, body: Body) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE || !env.AIRTABLE_TABLE) return "not configured";
  await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE}/${encodeURIComponent(env.AIRTABLE_TABLE)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Type: body.type,
          Session: body.sid || "",
          Timestamp: body.ts || "",
          Name: String(body.payload.name || ""),
          Email: String(body.payload.email || ""),
          Order: String(body.payload.order || ""),
          Serial: String(body.payload.serial || ""),
          Build: String(body.payload.build || ""),
          Step: String(body.payload.step || ""),
          Details: JSON.stringify(body.payload),
        },
        typecast: true,
      }),
    }
  );
  return "ok";
}

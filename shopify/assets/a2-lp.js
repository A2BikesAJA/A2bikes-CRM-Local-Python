/* ============================================================================
   A2 Bikes — Landing Page core behaviour (shared, framework-free)
   ----------------------------------------------------------------------------
   Loaded once with `defer` by each A2 landing section. Re-execution is a no-op
   (guarded below), so it is safe if multiple A2 sections appear on one page.

   Responsibilities:
     1. Capture + persist UTM / click-id attribution to sessionStorage and
        re-append it to every internal CTA so attribution survives the click
        into the PDP / checkout. (Attribution is currently broken on this store;
        this keeps Google + Klaviyo traffic clean.)
     2. Push GTM dataLayer events for every CTA click (GTM owns GA4 / Meta — we
        never hardcode pixels here).
     3. Handle email-capture forms -> Klaviyo client-side subscription API.
     4. Open the Octane AI sizing quiz from a configurable trigger.
     5. Refresh Affirm on-page messaging once it is available (non-blocking).

   No third-party libraries. Nothing here is render-blocking.
   ========================================================================== */
(function () {
  "use strict";

  // Idempotency guard: if a second A2 section also injected this file, bail.
  if (window.__a2lpInit) return;
  window.__a2lpInit = true;

  /* --- Attribution params we care about ----------------------------------- */
  var TRACK_KEYS = [
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "utm_id", "gclid", "gbraid", "wbraid", "fbclid", "ttclid", "msclkid",
    "_kx" // Klaviyo click identifier
  ];
  var STORE_KEY = "a2_attribution";

  function readStore() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeStore(obj) {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  /* Capture params from the current URL, merging (not clobbering) what we have.
     First-touch wins for a given key within the session. */
  function captureAttribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = readStore();
    var changed = false;
    TRACK_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v && !stored[k]) { stored[k] = v; changed = true; }
    });
    if (changed) writeStore(stored);
    return stored;
  }

  /* Is this link internal (same origin / relative / Shopify route)? */
  function isInternal(href) {
    if (!href) return false;
    if (href.charAt(0) === "/" || href.charAt(0) === "#") return true;
    try { return new URL(href, window.location.origin).origin === window.location.origin; }
    catch (e) { return false; }
  }

  /* Append stored attribution to an internal href without clobbering existing
     query params already on the link. */
  function decorate(href, attribution) {
    if (!isInternal(href) || href.charAt(0) === "#") return href;
    try {
      var url = new URL(href, window.location.origin);
      Object.keys(attribution).forEach(function (k) {
        if (!url.searchParams.has(k)) url.searchParams.set(k, attribution[k]);
      });
      // Preserve relative form if the author wrote a relative link.
      return /^https?:/i.test(href) ? url.toString() : url.pathname + url.search + url.hash;
    } catch (e) { return href; }
  }

  /* --- GTM dataLayer helper ----------------------------------------------- */
  function pushDL(event, extra) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event };
    var attribution = readStore();
    Object.keys(attribution).forEach(function (k) { payload[k] = attribution[k]; });
    if (extra) Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });
    window.dataLayer.push(payload);
  }
  // Expose for inline/section use if ever needed.
  window.a2dl = pushDL;

  /* --- Wire CTA links ------------------------------------------------------ */
  function decorateAllCtas(attribution) {
    document.querySelectorAll("a[data-a2-cta]").forEach(function (a) {
      var href = a.getAttribute("href");
      a.setAttribute("href", decorate(href, attribution));
    });
  }

  /* Delegated click handler: (re)decorate at click-time (covers async DOM and
     params captured after initial paint) and fire the dataLayer event. */
  function onClick(e) {
    var el = e.target.closest("[data-a2-event], a[data-a2-cta]");
    if (!el) return;

    // Re-decorate the actual link being clicked, just before navigation.
    if (el.matches("a[data-a2-cta]")) {
      var href = el.getAttribute("href");
      var dec = decorate(href, readStore());
      if (dec !== href) el.setAttribute("href", dec);
    }
    var event = el.getAttribute("data-a2-event");
    if (event) {
      pushDL(event, {
        cta_id: el.getAttribute("data-a2-cta-id") || null,
        cta_text: (el.textContent || "").trim().slice(0, 80),
        destination: el.getAttribute("href") || null
      });
    }
  }

  /* --- Octane AI sizing quiz ---------------------------------------------- */
  function onOctane(e) {
    var trigger = e.target.closest("[data-a2-octane]");
    if (!trigger) return;
    e.preventDefault();
    var url = trigger.getAttribute("data-a2-octane-url");
    pushDL("octane_quiz_open", { source: trigger.getAttribute("data-a2-source") || null });
    // Prefer Octane's on-site JS API if present; otherwise open the quiz URL.
    if (window.octaneai && typeof window.octaneai.open === "function") {
      window.octaneai.open();
    } else if (window.__octane && typeof window.__octane.openQuiz === "function") {
      window.__octane.openQuiz();
    } else if (url) {
      window.open(decorate(url, readStore()), trigger.getAttribute("data-a2-target") || "_self");
    } else {
      console.warn("[a2-lp] Octane quiz trigger has no data-a2-octane-url and no Octane API present.");
    }
  }

  /* --- Klaviyo email capture ---------------------------------------------- */
  function emailMsg(form, state, text) {
    var box = form.querySelector("[data-a2-msg]");
    if (!box) return;
    box.setAttribute("data-state", state);
    box.textContent = text;
  }

  function onSubmit(e) {
    var form = e.target.closest("form[data-a2-klaviyo-form]");
    if (!form) return;
    e.preventDefault();

    // Honeypot: silently succeed for bots.
    var hp = form.querySelector("[data-a2-hp]");
    if (hp && hp.value) { emailMsg(form, "ok", form.getAttribute("data-a2-success") || "Thanks!"); return; }

    var input = form.querySelector('input[type="email"]');
    var email = (input && input.value || "").trim();
    if (!email || email.indexOf("@") === -1) {
      emailMsg(form, "error", "Please enter a valid email address.");
      return;
    }

    var company = form.getAttribute("data-a2-company");
    var list = form.getAttribute("data-a2-list");
    var source = form.getAttribute("data-a2-source") || "A2 Landing Page";
    var event = form.getAttribute("data-a2-event") || "lp_email_capture";
    var success = form.getAttribute("data-a2-success") || "You're in — check your inbox.";

    // Always record intent for analytics, even before Klaviyo is configured.
    pushDL(event, { email_domain: email.split("@")[1] || null, source: source });
    emailMsg(form, "ok", "Sending…");

    // If Klaviyo keys are not yet configured (draft/preview), show success UI
    // but warn — no profile is actually created until keys are set.
    if (!company || !list || /COMPANY_ID|LIST_ID/.test(company + list)) {
      console.warn("[a2-lp] Klaviyo company_id/list_id not configured — email not sent to Klaviyo.");
      emailMsg(form, "ok", success);
      form.reset();
      return;
    }

    var body = {
      data: {
        type: "subscription",
        attributes: {
          custom_source: source,
          profile: { data: { type: "profile", attributes: { email: email } } }
        },
        relationships: { list: { data: { type: "list", id: list } } }
      }
    };

    fetch("https://a.klaviyo.com/client/subscriptions/?company_id=" + encodeURIComponent(company), {
      method: "POST",
      headers: { "Content-Type": "application/json", revision: "2024-10-15" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (res.status === 202 || res.ok) {
          emailMsg(form, "ok", success);
          form.reset();
        } else {
          emailMsg(form, "error", "Something went wrong — please try again.");
        }
      })
      .catch(function () { emailMsg(form, "error", "Network error — please try again."); });
  }

  /* --- Affirm on-page messaging (non-blocking) ----------------------------- */
  function refreshAffirm(tries) {
    tries = tries || 0;
    if (window.affirm && window.affirm.ui && typeof window.affirm.ui.refresh === "function") {
      window.affirm.ui.refresh();
    } else if (tries < 20) {
      // Affirm.js may still be loading (it is async / store-wide). Poll briefly.
      setTimeout(function () { refreshAffirm(tries + 1); }, 400);
    }
  }

  /* --- Init ---------------------------------------------------------------- */
  function init() {
    var attribution = captureAttribution();
    decorateAllCtas(attribution);
    document.addEventListener("click", onClick, false);     // dataLayer + re-decorate
    document.addEventListener("click", onOctane, false);    // sizing quiz
    document.addEventListener("submit", onSubmit, false);   // email capture
    refreshAffirm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

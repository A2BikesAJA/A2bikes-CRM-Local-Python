/* ============================================================================
   A2 Bikes — Rogue 4th of July Sale: countdown + copy-code
   ----------------------------------------------------------------------------
   Lightweight, dependency-free, idempotent. Powers two interactions in the
   section a2-rogue-july4:

     1. Countdown — ticks every 1s to the sale end-date, zero-padded, clamped at
        0 when the sale ends. The target is read from a data-* attribute (set
        from the section's "Sale end" setting), so nothing is hardcoded here.

          <div data-a2-countdown="2026-07-05T23:59:59">  <!-- local time -->
            <span data-cd="days"></span> <span data-cd="hours"></span>
            <span data-cd="mins"></span> <span data-cd="secs"></span>
          </div>

     2. Copy-code — copies the promo code to the clipboard and flips a status
        label to "Copied!" for ~1.8s. Fires a GTM dataLayer event via the shared
        a2-lp.js helper (window.a2dl) if present. No pixels, no network calls.

          <button data-a2-copy="ROGUE4THSALE">
            <span data-a2-copy-status data-label-idle="Tap to copy">Tap to copy</span>
          </button>

   prefers-reduced-motion is handled in CSS (marquee + pulse only). The 1s tick
   is functional, not decorative, so it always runs.
   ========================================================================== */
(function () {
  "use strict";

  // Idempotency guard — safe if the section appears more than once / re-injects.
  if (window.__a2RogueJuly4) return;
  window.__a2RogueJuly4 = true;

  function pad(n) { return String(n).padStart(2, "0"); }

  /* --- Countdown ----------------------------------------------------------- */
  function initCountdown(root) {
    var raw = root.getAttribute("data-a2-countdown");
    // "YYYY-MM-DDTHH:MM:SS" (no zone) parses as LOCAL time in modern browsers.
    var target = new Date(raw).getTime();
    if (isNaN(target)) {
      console.warn("[a2-rogue-july4] invalid countdown target:", raw);
      return;
    }

    var cells = {
      days: root.querySelector('[data-cd="days"]'),
      hours: root.querySelector('[data-cd="hours"]'),
      mins: root.querySelector('[data-cd="mins"]'),
      secs: root.querySelector('[data-cd="secs"]')
    };

    var timer = null;

    function render() {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;

      var d = Math.floor(diff / 86400000); diff -= d * 86400000;
      var h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      var m = Math.floor(diff / 60000);    diff -= m * 60000;
      var s = Math.floor(diff / 1000);

      if (cells.days)  cells.days.textContent  = pad(d);
      if (cells.hours) cells.hours.textContent = pad(h);
      if (cells.mins)  cells.mins.textContent  = pad(m);
      if (cells.secs)  cells.secs.textContent  = pad(s);

      if (target - Date.now() <= 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    render();
    if (target - Date.now() > 0) timer = setInterval(render, 1000);
  }

  /* --- Copy-code ----------------------------------------------------------- */
  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) { /* no-op */ }
  }

  function initCopy(btn) {
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-a2-copy") || "";
      var status = btn.querySelector("[data-a2-copy-status]");
      var idle = (status && status.getAttribute("data-label-idle")) || "Tap to copy";

      function confirmCopied() {
        if (status) status.textContent = "Copied!";
        if (window.a2dl) window.a2dl("rogue_july4_copy_code", { code: code });
        clearTimeout(btn.__a2copyTimer);
        btn.__a2copyTimer = setTimeout(function () {
          if (status) status.textContent = idle;
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(confirmCopied, function () {
          fallbackCopy(code);
          confirmCopied();
        });
      } else {
        fallbackCopy(code);
        confirmCopied();
      }
    });
  }

  /* --- Init ---------------------------------------------------------------- */
  function init() {
    document.querySelectorAll("[data-a2-countdown]").forEach(initCountdown);
    document.querySelectorAll("[data-a2-copy]").forEach(initCopy);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* A2 Bikes — SP-105 PDP behaviour (vanilla, no deps).
   Gallery swap, swatch + size select, specs accordion, mobile sticky
   add-to-cart reveal. Add-to-cart is an inert demo unless a real product
   form is wired in. Guarded so it only initialises once per page even though
   every sppdp-* section includes this asset. */
(function () {
  'use strict';
  if (window.__sppdpInit) return;
  window.__sppdpInit = true;

  function init() {
    var root = document;

    /* ---------- desktop gallery: thumbnail swap (active + caption + stage src) ---------- */
    var stageImg = root.querySelector('[data-stage-img]');
    var stageCap = root.querySelector('[data-stage-cap]');
    root.querySelectorAll('[data-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        root.querySelectorAll('[data-thumb]').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        var cap = thumb.getAttribute('data-cap');
        if (stageCap && cap) stageCap.textContent = cap;
        var src = thumb.getAttribute('data-img');
        if (stageImg && src) { stageImg.setAttribute('src', src); }
      });
    });

    /* ---------- mobile gallery: snap dots ---------- */
    var track = root.querySelector('[data-gallery-track]');
    if (track) {
      var dots = root.querySelectorAll('[data-gallery-dot]');
      track.addEventListener('scroll', function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach(function (d, di) { d.classList.toggle('on', di === i); });
      }, { passive: true });
    }

    /* ---------- color swatches ---------- */
    var swatchNames = root.querySelectorAll('[data-swatch-name]');
    root.querySelectorAll('[data-swatch]').forEach(function (sw) {
      sw.addEventListener('click', function () {
        root.querySelectorAll('[data-swatch]').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
        sw.setAttribute('aria-pressed', 'true');
        var name = sw.getAttribute('data-swatch');
        swatchNames.forEach(function (el) { el.textContent = name; });
      });
    });

    /* ---------- size pills ---------- */
    var sizeVal = root.querySelector('[data-size-val]');
    root.querySelectorAll('[data-size]').forEach(function (pill) {
      if (pill.hasAttribute('disabled')) return;
      pill.addEventListener('click', function () {
        root.querySelectorAll('[data-size]').forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
        pill.setAttribute('aria-pressed', 'true');
        if (sizeVal) {
          var fits = pill.getAttribute('data-fits');
          sizeVal.innerHTML = 'Selected: <b>' + pill.getAttribute('data-size') + '</b>' + (fits ? ' · ' + fits : '');
        }
      });
    });

    /* ---------- add to cart (inert demo) ---------- */
    root.querySelectorAll('[data-addcart]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.querySelector('.btn-label') || btn;
        var prev = label.textContent;
        label.textContent = 'Added to cart ✓';
        btn.style.pointerEvents = 'none';
        var counts = root.querySelectorAll('[data-cart-count]');
        counts.forEach(function (c) { c.textContent = (parseInt(c.textContent, 10) || 0) + 1; });
        setTimeout(function () { label.textContent = prev; btn.style.pointerEvents = ''; }, 1800);
      });
    });

    /* ---------- specs accordion ---------- */
    root.querySelectorAll('.acc-item').forEach(function (item) {
      var btn = item.querySelector('.acc-q');
      var panel = item.querySelector('.acc-a');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
      });
    });
    window.addEventListener('resize', function () {
      root.querySelectorAll('.acc-item.open .acc-a').forEach(function (p) { p.style.maxHeight = p.scrollHeight + 'px'; });
    });
    var first = root.querySelector('.acc-item');
    if (first) {
      first.classList.add('open');
      var fb = first.querySelector('.acc-q'); var fp = first.querySelector('.acc-a');
      if (fb) fb.setAttribute('aria-expanded', 'true');
      if (fp) requestAnimationFrame(function () { fp.style.maxHeight = fp.scrollHeight + 'px'; });
    }

    /* ---------- mobile sticky buy bar: reveal after buy box scrolls past ---------- */
    var sticky = root.querySelector('[data-sticky-buy]');
    var anchor = root.querySelector('[data-buybox-end]');
    if (sticky && anchor && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          sticky.style.display = e.isIntersecting ? 'none' : 'flex';
        });
      }, { rootMargin: '0px 0px -40% 0px' });
      io.observe(anchor);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

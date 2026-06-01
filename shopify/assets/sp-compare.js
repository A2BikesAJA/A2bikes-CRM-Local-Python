/* A2 Bikes — "Compare the SP" landing page behaviour.
   Shared by all spc-* sections. Runs once (guarded) and works no matter how
   many spc sections are on the page or what order they're in — it queries the
   whole document, so the decision filter (one section) can still drive the
   comparison table (another section). Vanilla, no dependencies. */
(function () {
  'use strict';
  if (window.__spcInit) return;
  window.__spcInit = true;

  function init() {
    var roots = [].slice.call(document.querySelectorAll('.spc'));
    if (!roots.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) roots.forEach(function (r) { r.classList.add('spc-anim'); });

    /* ---- GA4 / dataLayer ---- */
    window.dataLayer = window.dataLayer || [];
    var pageLoad = (window.performance && performance.now) ? performance.now() : Date.now();
    var decisionFired = false;
    function track(name, params) { window.dataLayer.push(Object.assign({ event: name }, params || {})); }
    track('view_sp_compare');

    /* ---- scroll reveal ---- */
    var reveals = [].slice.call(document.querySelectorAll('.spc-reveal'));
    function checkReveals() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = reveals.length - 1; i >= 0; i--) {
        var r = reveals[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { reveals[i].classList.add('is-in'); reveals.splice(i, 1); }
      }
    }
    checkReveals();
    window.addEventListener('scroll', checkReveals, { passive: true });
    window.addEventListener('resize', checkReveals);
    window.addEventListener('load', checkReveals);
    setTimeout(checkReveals, 300);

    /* ---- decision filter <-> comparison table (matched by build key) ---- */
    var pills = [].slice.call(document.querySelectorAll('.spc-pill'));
    var cols = [].slice.call(document.querySelectorAll('.spc-col'));
    var cue = document.querySelector('.spc-cue');
    var grid = document.querySelector('.spc-grid');
    var compare = document.getElementById('spc-compare');
    var STORE_KEY = 'sp_compare_filter';

    function colByKey(key) {
      for (var i = 0; i < cols.length; i++) { if (cols[i].getAttribute('data-key') === key) return cols[i]; }
      return null;
    }
    function applyFilter(key, filterName, opts) {
      opts = opts || {};
      cols.forEach(function (c) { c.classList.remove('is-rec'); });
      pills.forEach(function (p) { p.setAttribute('aria-pressed', (key && p.getAttribute('data-recommends') === key) ? 'true' : 'false'); });
      var col = key ? colByKey(key) : null;
      if (!col) { if (cue) { cue.classList.remove('show'); cue.innerHTML = ''; } return; }
      col.classList.add('is-rec');
      if (cue) {
        var name = col.getAttribute('data-name') || 'this build';
        cue.innerHTML = 'Based on your priority, we recommend <b>' + name + '</b>. Compare for yourself below.';
        cue.classList.add('show');
      }
      if (opts.scroll && compare) {
        var top = compare.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
        if (window.matchMedia('(max-width: 880px)').matches && grid) {
          setTimeout(function () {
            grid.scrollTo({ left: col.offsetLeft - (grid.clientWidth - col.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
          }, 450);
        }
      }
    }
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var key = pill.getAttribute('data-recommends');
        var filterName = pill.getAttribute('data-filter');
        if (pill.getAttribute('aria-pressed') === 'true') {
          try { sessionStorage.removeItem(STORE_KEY); } catch (e) {}
          applyFilter(null, null);
          return;
        }
        try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ key: key, filter: filterName })); } catch (e) {}
        applyFilter(key, filterName, { scroll: true });
        track('select_sp_filter', { filter: filterName });
      });
    });
    try {
      var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
      if (saved && saved.key) applyFilter(saved.key, saved.filter);
    } catch (e) {}

    /* ---- build CTA + view tracking ---- */
    document.querySelectorAll('[data-build-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('select_sp_build', { build: a.getAttribute('data-build-cta') });
        if (!decisionFired) {
          decisionFired = true;
          var now = (window.performance && performance.now) ? performance.now() : Date.now();
          track('engagement_time_to_decision', { seconds: Math.round((now - pageLoad) / 1000) });
        }
      });
    });
    if ('IntersectionObserver' in window) {
      var seen = {};
      var colObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var name = en.target.getAttribute('data-build');
          if (en.isIntersecting && en.intersectionRatio > 0.6 && !seen[name]) { seen[name] = true; track('view_build_column', { build: name }); }
        });
      }, { threshold: [0.6] });
      cols.forEach(function (c) { colObs.observe(c); });
      var reviews = document.getElementById('spc-reviews');
      if (reviews) {
        var aovObs = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (en) { if (en.isIntersecting) { track('view_aov_proof'); obs.disconnect(); } });
        }, { threshold: 0.25 });
        aovObs.observe(reviews);
      }
    }

    /* ---- financing / quiz / final links ---- */
    document.querySelectorAll('[data-financing]').forEach(function (a) {
      a.addEventListener('click', function () { track('select_financing', { provider: a.getAttribute('data-financing') }); });
    });
    document.querySelectorAll('[data-quiz]').forEach(function (a) {
      a.addEventListener('click', function () { track('start_size_quiz', { source: a.getAttribute('data-quiz') }); });
    });
    document.querySelectorAll('[data-final]').forEach(function (a) {
      a.addEventListener('click', function () { track('click_final_cta', { target: a.getAttribute('data-final') }); });
    });

    /* ---- size calculator ---- */
    var calc = document.querySelector('.spc-calc');
    if (calc) {
      var engaged = false;
      var result = document.querySelector('.spc-calc-result');
      var sizeOut = document.querySelector('[data-calc-size]');
      calc.addEventListener('input', function () { if (!engaged) { engaged = true; track('engage_size_tool'); } });
      calc.addEventListener('submit', function (e) {
        e.preventDefault();
        var ft = parseFloat((document.querySelector('[data-calc="ft"]') || {}).value) || 0;
        var inch = parseFloat((document.querySelector('[data-calc="in"]') || {}).value) || 0;
        var inseam = parseFloat((document.querySelector('[data-calc="inseam"]') || {}).value) || 0;
        var totalIn = ft * 12 + inch;
        if (totalIn < 48 || totalIn > 90) { var f = document.querySelector('[data-calc="ft"]'); if (f) f.focus(); return; }
        var size;
        if (totalIn < 64) size = 'XS';
        else if (totalIn < 67) size = 'S';
        else if (totalIn < 70) size = 'M';
        else if (totalIn < 73.5) size = 'L';
        else size = 'XL';
        if (inseam && size === 'M' && inseam < 30) size = 'S';
        if (inseam && size === 'L' && inseam > 35) size = 'XL';
        if (sizeOut) sizeOut.textContent = size;
        if (result) result.classList.add('show');
      });
    }

    /* ---- FAQ accordion ---- */
    [].slice.call(document.querySelectorAll('.spc-faq-item')).forEach(function (item, idx) {
      var btn = item.querySelector('.spc-faq-q');
      var panel = item.querySelector('.spc-faq-a');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        if (item.classList.contains('open')) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = '0px';
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          track('expand_faq', { question: idx + 1 });
        }
      });
    });
    window.addEventListener('resize', function () {
      [].slice.call(document.querySelectorAll('.spc-faq-item.open')).forEach(function (item) {
        var p = item.querySelector('.spc-faq-a');
        if (p) p.style.maxHeight = p.scrollHeight + 'px';
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

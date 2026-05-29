/* ============================================================
   A2 — "Compare the SP" page behaviour (vanilla, no deps)
   Header scroll · scroll reveal · decision filter (persisted) ·
   FAQ accordion · size calculator · GA4 event stubs.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- GA4 event helper (stub: pushes to dataLayer + logs) ---------- */
  window.dataLayer = window.dataLayer || [];
  var pageLoad = performance.now();
  var decisionFired = false;
  function track(name, params) {
    var payload = Object.assign({ event: name }, params || {});
    window.dataLayer.push(payload);
    if (window.console && console.debug) console.debug('[GA4]', name, params || {});
  }
  track('view_sp_compare');

  /* ---------- header solid-on-scroll ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal (position check, robust in iframes) ---------- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function checkReveals() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var r = reveals[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        reveals[i].classList.add('in');
        reveals.splice(i, 1);
      }
    }
  }
  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals);
  checkReveals();
  setTimeout(checkReveals, 300);
  window.addEventListener('load', checkReveals);

  /* ---------- decision filter ---------- */
  var pills = [].slice.call(document.querySelectorAll('.filter-pill'));
  var cols = [].slice.call(document.querySelectorAll('.compare-col'));
  var cue = document.getElementById('compareCue');
  var grid = document.getElementById('compareGrid');
  var STORE_KEY = 'sp_compare_filter';

  var FILTER_COPY = {
    price: 'the SP 105',
    performance: 'the SP Force AXS',
    premium: 'the SP Red AXS'
  };

  function applyFilter(filter, target, opts) {
    opts = opts || {};
    cols.forEach(function (c) { c.classList.remove('is-rec'); });
    pills.forEach(function (p) { p.setAttribute('aria-pressed', p.dataset.filter === filter ? 'true' : 'false'); });

    if (target == null || !FILTER_COPY[filter]) {
      cue.classList.remove('show');
      cue.innerHTML = '';
      return;
    }
    var col = cols[target];
    if (col) col.classList.add('is-rec');
    cue.innerHTML = 'Based on your priority, we recommend <b>' + FILTER_COPY[filter] +
      '</b>. Compare for yourself below.';
    cue.classList.add('show');

    if (opts.scroll) {
      var top = document.getElementById('compare').getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
      // on mobile, also bring the recommended card into the carousel view
      if (col && window.matchMedia('(max-width: 880px)').matches) {
        setTimeout(function () {
          var left = col.offsetLeft - (grid.clientWidth - col.clientWidth) / 2;
          grid.scrollTo({ left: left, behavior: 'smooth' });
        }, 450);
      }
    }
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var filter = pill.dataset.filter;
      var target = parseInt(pill.dataset.target, 10);
      var already = pill.getAttribute('aria-pressed') === 'true';
      if (already) {                       // toggle off
        sessionStorage.removeItem(STORE_KEY);
        applyFilter(null, null);
        return;
      }
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ filter: filter, target: target }));
      applyFilter(filter, target, { scroll: true });
      track('select_sp_filter', { filter: filter });
    });
  });

  // expose for the Tweaks panel (default-recommendation control)
  window.__spApplyFilter = function (filter) {
    var map = { price: 0, performance: 2, premium: 3, rival: 1 };
    if (!filter || !(filter in map)) { applyFilter(null, null); return; }
    applyFilter(filter, map[filter]);
  };

  // restore persisted selection on load
  try {
    var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    if (saved && FILTER_COPY[saved.filter]) applyFilter(saved.filter, saved.target);
  } catch (e) { /* ignore */ }

  /* ---------- build CTA + view tracking ---------- */
  document.querySelectorAll('[data-build-cta]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('select_sp_build', { build: a.dataset.buildCta });
      if (!decisionFired) {
        decisionFired = true;
        track('engagement_time_to_decision', {
          seconds: Math.round((performance.now() - pageLoad) / 1000)
        });
      }
    });
  });

  // view_build_column — fires once per build when its column is prominently visible
  if ('IntersectionObserver' in window) {
    var seen = {};
    var colObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var name = en.target.dataset.build;
        if (en.isIntersecting && en.intersectionRatio > 0.6 && !seen[name]) {
          seen[name] = true;
          track('view_build_column', { build: name });
        }
      });
    }, { threshold: [0.6] });
    cols.forEach(function (c) { colObs.observe(c); });

    // view_aov_proof — reviews/testimonials into view
    var reviews = document.getElementById('reviews');
    if (reviews) {
      var aovObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { track('view_aov_proof'); obs.disconnect(); }
        });
      }, { threshold: 0.25 });
      aovObs.observe(reviews);
    }
  }

  /* ---------- financing links ---------- */
  document.querySelectorAll('[data-financing]').forEach(function (a) {
    a.addEventListener('click', function () { track('select_financing', { provider: a.dataset.financing }); });
  });
  document.querySelectorAll('[data-quiz]').forEach(function (a) {
    a.addEventListener('click', function () { track('start_size_quiz', { source: a.dataset.quiz }); });
  });
  document.querySelectorAll('[data-final]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_final_cta', { target: a.dataset.final }); });
  });

  /* ---------- size calculator ---------- */
  var calc = document.getElementById('sizeCalc');
  if (calc) {
    var engaged = false;
    calc.addEventListener('input', function () {
      if (!engaged) { engaged = true; track('engage_size_tool'); }
    });
    calc.addEventListener('submit', function (e) {
      e.preventDefault();
      var ft = parseFloat(document.getElementById('calcFt').value) || 0;
      var inch = parseFloat(document.getElementById('calcIn').value) || 0;
      var inseam = parseFloat(document.getElementById('calcInseam').value) || 0;
      var totalIn = ft * 12 + inch;
      if (totalIn < 48 || totalIn > 90) {
        document.getElementById('calcFt').focus();
        return;
      }
      var size;
      if (totalIn < 64) size = 'XS';
      else if (totalIn < 67) size = 'S';
      else if (totalIn < 70) size = 'M';
      else if (totalIn < 73.5) size = 'L';
      else size = 'XL';
      // inseam nudge at band edges
      if (inseam && size === 'M' && inseam < 30) size = 'S';
      if (inseam && size === 'L' && inseam > 35) size = 'XL';
      document.getElementById('calcSize').textContent = size;
      document.getElementById('calcResult').classList.add('show');
    });
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = [].slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item, idx) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      if (isOpen) {
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
  // keep open panels sized correctly on resize
  window.addEventListener('resize', function () {
    faqItems.forEach(function (item) {
      if (item.classList.contains('open')) {
        item.querySelector('.faq-a').style.maxHeight = item.querySelector('.faq-a').scrollHeight + 'px';
      }
    });
  });
})();

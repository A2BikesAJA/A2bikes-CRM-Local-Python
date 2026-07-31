/* A2 Bikes — "Why A2" landing page behaviour.
   Shared by all wa-* sections. Runs once (guarded), document-scoped so it
   works across separate sections. Vanilla, no dependencies. */
(function () {
  'use strict';
  if (window.__waInit) return;
  window.__waInit = true;

  function init() {
    var roots = [].slice.call(document.querySelectorAll('.whya2'));
    if (!roots.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) roots.forEach(function (r) { r.classList.add('wa-anim'); });

    var items = [].slice.call(document.querySelectorAll('.whya2 .reveal'));
    function reveal() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        if (el.classList.contains('is-in')) continue;
        if (el.getBoundingClientRect().top < vh * 0.88) el.classList.add('is-in');
      }
    }
    reveal();
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
    window.addEventListener('load', reveal);

    [].slice.call(document.querySelectorAll('.whya2 a[href^="#"]')).forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id.length > 1) {
          var target = document.querySelector(id);
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
        }
      });
    });

    var form = document.querySelector('.whya2 .wa-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = document.querySelector('.whya2 .wa-form-success');
        if (ok) { form.style.display = 'none'; ok.style.display = 'block'; }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

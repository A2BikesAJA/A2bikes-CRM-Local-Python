/* ============================================================================
   A2 Bikes — Financing page "cost example" widget (illustrative only)
   ----------------------------------------------------------------------------
   Lightweight, dependency-free. Lets a visitor pick a build/price and see an
   ESTIMATED monthly payment (Affirm-style amortization) and an ESTIMATED
   after-pre-tax cost (Truemed / HSA-FSA). All numbers are illustrative, NOT a
   quote or tax advice. Every rate/assumption is read from data-* attributes so
   marketing can keep them accurate from the Shopify theme editor — nothing is
   hardcoded here, and there are NO external/network calls.

   Markup contract (rendered by section a2-financing-lp):
     <div data-a2-calc
          data-apr="0.15"          // annual %, decimal (e.g. 0.15 = 15% APR)
          data-term="36"           // financing term in months
          data-tax-rate="0.30">    // assumed effective pre-tax savings rate
       <select data-a2-calc-price>
         <option value="3115">SP — Shimano 105 ($3,115)</option> ...
       </select>
       <span data-a2-calc-monthly></span>
       <span data-a2-calc-pretax></span>
     </div>
   ========================================================================== */
(function () {
  "use strict";

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  /* Standard fixed-rate amortization. If APR is 0, it's a simple split. */
  function monthlyPayment(principal, apr, term) {
    if (!term || term < 1) return principal;
    var r = (apr || 0) / 12;
    if (r === 0) return principal / term;
    return (principal * r) / (1 - Math.pow(1 + r, -term));
  }

  function initOne(root) {
    var select = root.querySelector("[data-a2-calc-price]");
    var monthlyOut = root.querySelector("[data-a2-calc-monthly]");
    var pretaxOut = root.querySelector("[data-a2-calc-pretax]");
    if (!select) return;

    var apr = parseFloat(root.getAttribute("data-apr")) || 0;
    var term = parseInt(root.getAttribute("data-term"), 10) || 36;
    var taxRate = parseFloat(root.getAttribute("data-tax-rate")) || 0;

    function update() {
      var price = parseFloat(select.value) || 0;
      if (monthlyOut) monthlyOut.textContent = money(monthlyPayment(price, apr, term)) + "/mo";
      if (pretaxOut) pretaxOut.textContent = money(price * (1 - taxRate));
      if (window.a2dl) {
        window.a2dl("financing_cost_example_change", {
          price: price, apr: apr, term: term, tax_rate: taxRate
        });
      }
    }

    select.addEventListener("change", update);
    update(); // initial paint
  }

  function init() {
    document.querySelectorAll("[data-a2-calc]").forEach(initOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

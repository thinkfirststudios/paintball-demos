/* BRIARWOOD PAINTBALL COMPANY — fictional demo. DEMO — ThinkFirst Studios · [Your name here]
   Motion character: things get set down. Rows fill top to bottom, stamps land once, nothing loops.
   Count-up runs only on the true-cost calculator output, never on a placeholder or a safety figure.
   No booking engine: the open-play path ends at waiver + hours + directions. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Status strip: two authored states by day of week. Open days are placeholders until confirmed: [PLAY DAYS — CONFIRM]
  var OPEN_DAYS = [0, 6];
  var today = new Date().getDay(), open = OPEN_DAYS.indexOf(today) > -1;
  document.querySelectorAll("[data-status]").forEach(function (s) {
    s.classList.toggle("is-closed", !open);
    s.querySelector("[data-open]").hidden = !open;
    s.querySelector("[data-closed]").hidden = open;
  });
  document.querySelectorAll('.sched:not(.sched--compact) tr[data-day="' + today + '"]').forEach(function (tr) { tr.classList.add("is-today"); });

  var head = document.querySelector("[data-head]"), btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (head) { var on = function () { head.classList.toggle("is-condensed", window.scrollY > 60); }; window.addEventListener("scroll", on, { passive: true }); on(); }
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.style.setProperty("--nav-top", head.getBoundingClientRect().bottom + "px");
      var o = nav.classList.toggle("is-open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); btn.textContent = o ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); } });
  }

  document.querySelectorAll(".rv-rows").forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); }); });
  var targets = ".rv, .rv-rows, .chips, .sched tr.is-today";
  if (root.classList.contains("js-motion")) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    document.querySelectorAll(targets).forEach(function (el) { io.observe(el); });
  } else { document.querySelectorAll(targets).forEach(function (el) { el.classList.add("is-in"); }); }

  // True-cost board: admission (rental $[45]+$[25] or own gear $[30]) + paint. [ESTIMATE — BASED ON PLACEHOLDER PRICING]
  document.querySelectorAll("[data-cost]").forEach(function (c) {
    var out = c.querySelector("[data-c-out]");
    function money(v) { return "$[" + Math.round(v) + "]"; }
    function run() {
      var gear = (c.querySelector("[data-c-gear]:checked") || {}).value, paint = parseFloat((c.querySelector("[data-c-paint]:checked") || {}).value || 0);
      var v = (gear === "own" ? 30 : 45 + 25) + paint;
      var from = parseFloat(out.getAttribute("data-v") || v); out.setAttribute("data-v", v);
      if (!root.classList.contains("js-motion") || from === v) { out.textContent = money(v); return; }
      var start = null;
      (function step(ts) { if (!start) start = ts; var p = Math.min(1, (ts - start) / 400); out.textContent = money(from + (v - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    c.addEventListener("change", run); run();
  });

  // Enquiry forms: validate, never send, never charge
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var id = f.id + "-err", err = document.getElementById(id);
        var bad = !String(f.value).trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) { ok = false; if (!err) { err = document.createElement("p"); err.className = "err"; err.id = id; err.textContent = f.type === "email" ? "Enter a valid email address." : "Please fill this in."; f.insertAdjacentElement("afterend", err); f.setAttribute("aria-describedby", id); } }
        else if (err) { err.remove(); f.removeAttribute("aria-describedby"); }
      });
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var s = form.querySelector(".form-status"); s.hidden = false;
      s.textContent = "Demo only. Nothing was sent. [FORM ENDPOINT — CONFIRM]"; s.focus();
    });
  });
})();

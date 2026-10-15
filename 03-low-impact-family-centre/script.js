/* LANTERN FIELDS LOW-IMPACT PAINTBALL — fictional demo. DEMO — ThinkFirst Studios · [Your name here]
   Motion character: the run sheet advances. Calm, soft, one pass, nothing bounces or loops.
   Count-up only on the booking estimate (headcount × per head, 340ms), never on a placeholder or a safety figure.
   Under prefers-reduced-motion the ruler renders full and every step renders in place. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var today = new Date().getDay();
  document.querySelectorAll('.stable tr[data-day="' + today + '"]').forEach(function (tr) { tr.classList.add("is-today"); });

  var head = document.querySelector("[data-head]"), btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.style.setProperty("--nav-top", head.getBoundingClientRect().bottom + "px");
      var o = nav.classList.toggle("is-open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); btn.textContent = o ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); } });
  }

  // The ruler fill: scroll-linked, one pass forward only (never un-fills)
  var rulers = document.querySelectorAll("[data-ruler]");
  function onScroll() {
    if (head) head.classList.toggle("is-condensed", window.scrollY > 60);
    rulers.forEach(function (r) {
      var b = r.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - b.top) / (b.height * 0.9)));
      var cur = parseFloat(r.dataset.p || 0); if (p < cur) p = cur; r.dataset.p = p;
      r.querySelector("[data-rfill]").parentNode.parentNode.style.setProperty("--fill", (p * 100) + "%");
      r.querySelector("[data-rfill]").style.setProperty("--fill", (p * 100) + "%");
      var steps = r.querySelectorAll(".rstep");
      steps.forEach(function (s, k) { s.classList.toggle("is-past", p >= (k + 0.5) / steps.length); });
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Ruler chips and package run sheets expand on height
  document.querySelectorAll(".chip, .sheet-btn").forEach(function (b) {
    b.addEventListener("click", function () { b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true"); });
  });

  // Reveals
  if (root.classList.contains("js-motion")) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  }

  // Five-step booking on the stepped ruler; terms sit on step 5, above the button
  document.querySelectorAll("[data-book]").forEach(function (f) {
    var steps = f.querySelectorAll(".bstep"), marks = f.querySelectorAll(".bruler li"), prev = f.querySelector("[data-prev]"), next = f.querySelector("[data-next]");
    var n = f.querySelector("[data-b-n]"), pk = f.querySelector("[data-b-pk]"), out = f.querySelector("[data-b-out]"), cur = 0;
    function show(i) {
      cur = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      marks.forEach(function (m, k) { m.classList.toggle("on", k <= i); });
      prev.disabled = i === 0; next.hidden = i === steps.length - 1;
      var first = steps[i].querySelector("input, select, button"); if (first && i > 0) first.focus();
    }
    prev.addEventListener("click", function () { show(Math.max(0, cur - 1)); });
    next.addEventListener("click", function () {
      var bad = false;
      steps[cur].querySelectorAll("[required]").forEach(function (r) { if (!String(r.value).trim()) { bad = true; r.setAttribute("aria-invalid", "true"); } else r.setAttribute("aria-invalid", "false"); });
      if (bad) { steps[cur].querySelector('[aria-invalid="true"]').focus(); return; }
      show(Math.min(steps.length - 1, cur + 1));
    });
    function est() {
      var v = Math.max(1, parseInt(n.value, 10) || 1) * parseFloat(pk.value);
      var from = parseFloat(out.getAttribute("data-v") || v); out.setAttribute("data-v", v);
      if (!root.classList.contains("js-motion") || from === v) { out.textContent = "$[" + v + "]"; return; }
      var st = null;
      (function step(ts) { if (!st) st = ts; var p = Math.min(1, (ts - st) / 340), e = 1 - Math.pow(1 - p, 3); out.textContent = "$[" + Math.round(from + (v - from) * e) + "]"; if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    n.addEventListener("input", est); pk.addEventListener("change", est); est(); show(0);
  });

  // Mock forms
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (fl) {
        var id = fl.id + "-err", err = document.getElementById(id);
        var bad = !String(fl.value).trim() || (fl.type === "email" && !/^\S+@\S+\.\S+$/.test(fl.value));
        fl.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) { ok = false; if (!err) { err = document.createElement("p"); err.className = "err"; err.id = id; err.textContent = fl.type === "email" ? "Enter a valid email address." : "Please fill this in."; fl.insertAdjacentElement("afterend", err); fl.setAttribute("aria-describedby", id); } }
        else if (err) { err.remove(); fl.removeAttribute("aria-describedby"); }
      });
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); var st = first && first.closest(".bstep"); if (st && st.hidden) { form.querySelectorAll(".bstep").forEach(function (s) { s.hidden = s !== st; }); } if (first) first.focus(); return; }
      var s = form.querySelector(".form-status"); s.hidden = false;
      s.textContent = "Demo only. Nothing was booked, sent or charged. [BOOKING / PAYMENT SYSTEM — CONFIRM]"; s.focus();
    });
  });
})();

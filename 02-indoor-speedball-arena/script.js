/* BREAKPOINT INDOOR SPEEDBALL — fictional demo. DEMO — ThinkFirst Studios · [Your name here]
   Motion character: the break. Accelerate off a line and stop dead; no bounce, no loop, no pulse.
   Availability is AUTHORED DEMO DATA (deterministic), labelled [DEMO AVAILABILITY — NOT LIVE DATA] on every frame.
   Count-up only on the derived booking total (slots × $[85]), never on a placeholder or a safety figure. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var today = new Date().getDay();
  document.querySelectorAll('.sched:not(.sched-wrap--c .sched) tr[data-day="' + today + '"]').forEach(function (tr) { if (!tr.closest(".sched-wrap--c")) tr.classList.add("is-today"); });

  var head = document.querySelector("[data-head]"), btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.style.setProperty("--nav-top", head.getBoundingClientRect().bottom + "px");
      var o = nav.classList.toggle("is-open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); btn.textContent = o ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); } });
  }

  // Progress snake: one segment per section, filled with a hard edge as the page scrolls
  var secs = document.querySelectorAll("[data-sec]"), ps = document.querySelector("[data-psnake]");
  if (ps) for (var i = 0; i < secs.length; i++) ps.appendChild(document.createElement("i"));
  function onScroll() {
    if (head) head.classList.toggle("is-condensed", window.scrollY > 60);
    if (!ps) return;
    var mid = window.innerHeight * 0.4, segs = ps.children;
    secs.forEach(function (s, k) { segs[k].classList.toggle("on", s.getBoundingClientRect().top < mid); });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Reveals
  var targets = ".rv, .bdiv, .schem";
  if (root.classList.contains("js-motion")) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    document.querySelectorAll(targets).forEach(function (el) { io.observe(el); });
  } else { document.querySelectorAll(targets).forEach(function (el) { el.classList.add("is-in"); }); }

  // Authored demo availability: deterministic pattern, never live
  var DAYN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var HOURS = ["[16:00]", "[17:00]", "[18:00]", "[19:00]", "[20:00]", "[21:00]"];
  function taken(d, h) { return ((d * 7 + h * 3) % 5) < 2; }
  function slotBtn(d, h, cls) {
    var b = document.createElement("button"); b.type = "button";
    var t = taken(d, h);
    b.className = "slot " + (t ? "slot--t" : "slot--a") + (cls ? " " + cls : "");
    b.textContent = HOURS[h]; b.disabled = t;
    b.setAttribute("aria-label", DAYN[(today + d) % 7] + " " + HOURS[h] + (t ? ", taken (demo data)" : ", available (demo data)"));
    if (!t) { b.setAttribute("aria-pressed", "false"); b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); document.dispatchEvent(new Event("slots")); }); }
    return b;
  }
  // Hero 7-day strip
  document.querySelectorAll("[data-strip-days]").forEach(function (wrap) {
    for (var d = 0; d < 7; d++) {
      var col = document.createElement("div"); col.className = "sday";
      var h3 = document.createElement("h3"); h3.textContent = DAYN[(today + d) % 7]; col.appendChild(h3);
      var ol = document.createElement("ol");
      for (var h = 0; h < HOURS.length; h++) { var li = document.createElement("li"); li.appendChild(slotBtn(d, h)); ol.appendChild(li); }
      col.appendChild(ol); wrap.appendChild(col);
    }
  });
  // Booking calendar: day tabs + the day's hour slots as a snake run
  document.querySelectorAll("[data-book]").forEach(function (f) {
    var days = f.querySelector("[data-cal-days]"), slots = f.querySelector("[data-cal-slots]");
    var nOut = f.querySelector("[data-b-n]"), tot = f.querySelector("[data-b-total]");
    function showDay(d) {
      days.querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-selected", k === d ? "true" : "false"); b.tabIndex = k === d ? 0 : -1; });
      slots.innerHTML = "";
      for (var h = 0; h < HOURS.length; h++) slots.appendChild(slotBtn(d, h));
      update();
    }
    for (var d = 0; d < 14; d++) {
      var b = document.createElement("button"); b.type = "button"; b.className = "cal-day"; b.setAttribute("role", "tab");
      b.textContent = DAYN[(today + d) % 7] + " +" + d; b.dataset.d = d;
      b.addEventListener("click", function (e) { showDay(+e.currentTarget.dataset.d); });
      days.appendChild(b);
    }
    function update() {
      var n = slots.querySelectorAll('[aria-pressed="true"]').length, v = n * 85;
      nOut.textContent = "[" + n + "]";
      var from = parseFloat(tot.getAttribute("data-v") || 0); tot.setAttribute("data-v", v);
      if (!root.classList.contains("js-motion") || from === v) { tot.textContent = "$[" + v + "]"; return; }
      var st = null;
      (function step(ts) { if (!st) st = ts; var p = Math.min(1, (ts - st) / 260); tot.textContent = "$[" + Math.round(from + (v - from) * p) + "]"; if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    document.addEventListener("slots", update);
    showDay(0);
  });

  // Field schematic: a position raises its card
  document.querySelectorAll("[data-schem]").forEach(function (sc) {
    var cards = sc.querySelectorAll("[data-card]"), hint = sc.querySelector(".schem-hint");
    function pick(kind) {
      sc.classList.add("is-active");
      sc.querySelectorAll("[data-pos]").forEach(function (p) { p.classList.toggle("on", p.dataset.pos === kind); });
      cards.forEach(function (c) { c.hidden = c.dataset.card !== kind; });
      if (hint) hint.hidden = true;
    }
    sc.querySelectorAll("[data-pos]").forEach(function (p) {
      p.addEventListener("click", function () { pick(p.dataset.pos); });
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(p.dataset.pos); } });
    });
  });

  // Mock forms
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
      s.textContent = "Demo only. Nothing was booked, sent or charged. [BOOKING SYSTEM / ENDPOINT — CONFIRM]"; s.focus();
    });
  });
})();

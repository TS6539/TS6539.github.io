/* ==========================================================================
   Homepage v4 motion layer for tianshihao.org (homepage only; the body-end
   hook emits these scripts only on the home page).
   Progressive enhancement throughout: if GSAP or a plugin fails to load,
   nothing is hidden and every feature degrades to its static state.
   Adapted from the v3 (C-plus) layer for the editorial homepage markup:
   network canvas + SplitText name reveal + marquee + trajectory draw +
   magnetic CV button, plus numbers-band count-up and gentle section
   reveals. All content is visible with JS disabled.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var hasSplit = hasGsap && typeof window.SplitText !== "undefined";
  if (hasGsap) {
    if (hasST) gsap.registerPlugin(ScrollTrigger);
    if (hasSplit) gsap.registerPlugin(SplitText);
  }

  var home = document.querySelector(".v4-home");
  if (!home) return;
  var masthead = home.querySelector(".v4-masthead");
  if (!masthead) return;

  /* ---------- ENA-style network motif behind the masthead ---------- */
  var canvas = document.createElement("canvas");
  canvas.id = "v4-hero-net";
  canvas.setAttribute("aria-hidden", "true");
  masthead.insertBefore(canvas, masthead.firstChild);
  initNetwork(reduced);

  function initNetwork(staticFrame) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, nodes = [], edges = [], t = 0;
    var seed = 1234567;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function accentRGB() {
      return document.documentElement.classList.contains("dark") ? "96,165,250" : "29,78,216";
    }
    var rgb = accentRGB();
    function build() {
      nodes = []; edges = [];
      for (var i = 0; i < 14; i++) {
        nodes.push({
          bx: 0.04 + rnd() * 0.92, by: 0.06 + rnd() * 0.88,
          r: 1.8 + rnd() * 2.4, ph: rnd() * Math.PI * 2,
          ax: 6 + rnd() * 10, ay: 5 + rnd() * 8,
          sx: 0.12 + rnd() * 0.20, sy: 0.10 + rnd() * 0.18
        });
      }
      var seen = {};
      nodes.forEach(function (n, i) {
        var near = nodes.map(function (m, j) {
          var dx = n.bx - m.bx, dy = n.by - m.by;
          return { j: j, d: dx * dx + dy * dy };
        }).filter(function (o) { return o.j !== i; })
          .sort(function (a, b) { return a.d - b.d; }).slice(0, 2);
        near.forEach(function (o) {
          var k = Math.min(i, o.j) + "-" + Math.max(i, o.j);
          if (!seen[k]) { seen[k] = 1; edges.push({ a: i, b: o.j, ph: rnd() * Math.PI * 2 }); }
        });
      });
    }
    function pos(n, tt) {
      return {
        x: n.bx * W + Math.sin(tt * n.sx + n.ph) * n.ax,
        y: n.by * H + Math.cos(tt * n.sy + n.ph * 1.3) * n.ay
      };
    }
    function draw() {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      var pts = nodes.map(function (n) { return pos(n, t); });
      edges.forEach(function (e) {
        var a = pts[e.a], b = pts[e.b];
        var alpha = 0.05 + 0.045 * (0.5 + 0.5 * Math.sin(t * 0.7 + e.ph));
        ctx.strokeStyle = "rgba(" + rgb + "," + alpha.toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      pts.forEach(function (p, i) {
        ctx.fillStyle = "rgba(" + rgb + ",0.40)";
        ctx.beginPath(); ctx.arc(p.x, p.y, nodes[i].r, 0, Math.PI * 2); ctx.fill();
      });
    }
    function resize() {
      var r = masthead.getBoundingClientRect();
      W = canvas.width = Math.max(1, Math.round(r.width));
      H = canvas.height = Math.max(1, Math.round(r.height));
      if (staticFrame) draw();
    }
    build();
    resize();
    window.addEventListener("resize", resize);
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        var c = accentRGB();
        if (c !== rgb) { rgb = c; if (staticFrame) draw(); }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }
    if (staticFrame) { draw(); return; }
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(masthead);
    }
    (function loop() {
      t += 0.016;
      if (visible && window.innerWidth >= 640) draw();
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- keyword marquee (inserted between masthead and band) ---- */
  (function buildMarquee() {
    var words = ["Generative AI", "Quantitative Ethnography", "Learning Analytics", "L2 Writing", "Evidence Synthesis"];
    var mq = document.createElement("div");
    mq.className = "v3-marquee";
    mq.setAttribute("aria-hidden", "true");
    var track = document.createElement("div");
    track.className = "v3-marquee-track";
    for (var g = 0; g < 2; g++) {
      var group = document.createElement("div");
      group.className = "v3-mq-group";
      words.forEach(function (w) {
        var s = document.createElement("span");
        s.textContent = w;
        group.appendChild(s);
        var d = document.createElement("i");
        d.className = "v3-mq-dot";
        group.appendChild(d);
      });
      track.appendChild(group);
    }
    mq.appendChild(track);
    masthead.insertAdjacentElement("afterend", mq);
  })();

  /* ---------- everything below needs GSAP and no reduced motion ------- */
  if (!hasGsap || reduced) return;

  /* ---------- masthead intro: masked line reveal for the name,
                blur-to-sharp reveal for the supporting items ---------- */
  (function heroReveal() {
    var h1 = masthead.querySelector(".v4-name");
    var items = masthead.querySelectorAll(".v4-hero-item");
    if (items.length) {
      gsap.fromTo(items,
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.05, ease: "expo.out",
          stagger: 0.09, delay: 0.1, overwrite: true, clearProps: "filter" });
    }
    if (h1 && hasSplit) {
      gsap.set(h1, { autoAlpha: 0 });
      var startSplit = function () {
        try {
          new SplitText(h1, {
            type: "lines", mask: "lines", autoSplit: true,
            onSplit: function (self) {
              gsap.set(h1, { autoAlpha: 1 });
              return gsap.fromTo(self.lines,
                { yPercent: 110 },
                { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.09, delay: 0.15 });
            }
          });
        } catch (err) {
          gsap.set(h1, { autoAlpha: 1, clearProps: "all" });
        }
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(startSplit);
      else startSplit();
    } else if (h1) {
      gsap.fromTo(h1,
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.05, ease: "expo.out",
          delay: 0.19, overwrite: true, clearProps: "filter" });
    }
  })();

  /* ---------- trajectory line draws itself shortly after load --------- */
  (function initPath() {
    var draw = masthead.querySelector(".v4-path-svg .path-draw");
    if (!draw) return;
    var dots = masthead.querySelectorAll(".v4-path-svg .path-dot");
    gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(dots, { opacity: 0 });
    var tl = gsap.timeline({ delay: 0.55 });
    tl.to(draw, { strokeDashoffset: 0, duration: 1.6, ease: "expo.out" })
      .to(dots, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.28 }, 0.2);
  })();

  /* ---------- numbers band: count up when it scrolls into view -------- */
  (function initCountUp() {
    var band = home.querySelector(".v4-band");
    if (!band || !("IntersectionObserver" in window)) return;
    var nums = band.querySelectorAll(".v4-num[data-count]");
    if (!nums.length) return;
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      if (done || !entries[0].isIntersecting) return;
      done = true;
      io.disconnect();
      nums.forEach(function (el, i) {
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.4, delay: i * 0.12, ease: "expo.out",
          onUpdate: function () { el.textContent = Math.round(obj.v); },
          onComplete: function () { el.textContent = target; }
        });
      });
    }, { threshold: 0.35 });
    io.observe(band);
  })();

  /* ---------- gentle reveals for sections below the masthead ---------- */
  (function initReveals() {
    if (!hasST) return;
    home.querySelectorAll(".v4-reveal").forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  })();

  /* ---------- magnetic primary button (Download CV), subtle ----------- */
  (function initMagnetic() {
    if (!finePointer) return;
    var btn = masthead.querySelector(".v4-cv-btn");
    if (!btn) return;
    btn.classList.add("v3-magnetic");
    function clamp(v, m) { return Math.max(-m, Math.min(m, v)); }
    var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
    var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
    btn.addEventListener("pointermove", function (e) {
      var r = btn.getBoundingClientRect();
      xTo(clamp((e.clientX - (r.left + r.width / 2)) * 0.25, 6));
      yTo(clamp((e.clientY - (r.top + r.height / 2)) * 0.25, 4));
    });
    btn.addEventListener("pointerleave", function () {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
    });
  })();
})();

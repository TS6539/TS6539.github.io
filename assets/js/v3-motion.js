/* ==========================================================================
   C-plus (v3) motion layer for tianshihao.org (homepage only; the body-end
   hook emits these scripts only on the home page).
   Progressive enhancement throughout: if GSAP or a plugin fails to load,
   nothing is hidden and every feature degrades to its static state.
   Ported from the approved C-plus mockup.
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

  var hero = document.getElementById("section-resume-biography-3");
  if (!hero) return;

  /* ---------- ENA-style network motif behind the hero ---------- */
  var bio = hero.querySelector(".resume-biography");
  var canvas = null;
  if (bio) {
    canvas = document.createElement("canvas");
    canvas.id = "v3-hero-net";
    canvas.setAttribute("aria-hidden", "true");
    bio.insertBefore(canvas, bio.firstChild);
    initNetwork(reduced);
  }

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
      var r = bio.getBoundingClientRect();
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
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(bio);
    }
    (function loop() {
      t += 0.016;
      if (visible && window.innerWidth >= 640) draw();
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- keyword marquee (inserted under the hero) ---------- */
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
    hero.insertAdjacentElement("afterend", mq);
  })();

  /* ---------- helpers ---------- */
  function findSectionByTitle(title) {
    var secs = document.querySelectorAll("section.hbb-section");
    for (var i = 0; i < secs.length; i++) {
      var divs = secs[i].querySelectorAll("div");
      for (var j = 0; j < divs.length; j++) {
        if (divs[j].children.length === 0 &&
            divs[j].textContent.trim() === title &&
            divs[j].className.indexOf("text-3xl") > -1) {
          return secs[i];
        }
      }
    }
    return null;
  }

  /* ---------- trajectory path strip (inserted after Research) ---------- */
  var pathSection = (function buildPath() {
    var sec = document.createElement("section");
    sec.className = "v3-path";
    sec.setAttribute("aria-label", "Path");
    sec.innerHTML =
      '<div class="v3-path-inner">' +
        '<p class="v3-path-kicker">Path</p>' +
        '<h2 class="v3-path-title">From Beijing to Hiroshima</h2>' +
        '<div class="v3-path-box">' +
          '<svg class="v3-path-svg" viewBox="0 0 1000 96" role="img" aria-label="Path from Beijing to Los Angeles to Hiroshima">' +
            '<line class="path-base" x1="70" y1="30" x2="930" y2="30"/>' +
            '<line class="path-draw" x1="70" y1="30" x2="930" y2="30" pathLength="1"/>' +
            '<g class="path-dot"><circle class="halo" cx="70" cy="30" r="13"/><circle class="core" cx="70" cy="30" r="6.5"/></g>' +
            '<g class="path-dot"><circle class="halo" cx="500" cy="30" r="13"/><circle class="core" cx="500" cy="30" r="6.5"/></g>' +
            '<g class="path-dot"><circle class="halo" cx="930" cy="30" r="13"/><circle class="core" cx="930" cy="30" r="6.5"/></g>' +
            '<text x="70" y="76" text-anchor="middle">Beijing</text>' +
            '<text x="500" y="76" text-anchor="middle">Los Angeles</text>' +
            '<text x="930" y="76" text-anchor="middle">Hiroshima</text>' +
          '</svg>' +
        '</div>' +
      '</div>';
    var research = findSectionByTitle("Research");
    if (research) research.insertAdjacentElement("afterend", sec);
    else hero.insertAdjacentElement("afterend", sec);
    return sec;
  })();

  /* ---------- spotlight cards: mark targets ---------- */
  document.querySelectorAll("#papers [role='article']").forEach(function (el) {
    el.classList.add("v3-glow");
  });
  var researchSec = findSectionByTitle("Research");
  if (researchSec) {
    var rc = researchSec.querySelector(":scope > div:not(.home-section-bg)");
    if (rc) rc.classList.add("v3-glow", "v3-research-card");
  }

  /* ---------- spotlight pointer tracking (fine pointers only) ---------- */
  if (finePointer && !reduced) {
    document.addEventListener("pointermove", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(".v3-glow") : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    }, { passive: true });
  }

  /* ---------- everything below needs GSAP and no reduced motion ---------- */
  if (!hasGsap || reduced) return;

  /* ---------- hero intro: masked line reveal for the name,
                blur-to-sharp reveal for the supporting items ---------- */
  (function heroReveal() {
    var h1 = hero.querySelector("h1");
    var grid = hero.querySelector(".grid");
    var items = [];
    if (grid && grid.children.length >= 2) {
      var left = grid.children[0];
      var avatar = left.querySelector(".avatar-wrapper");
      if (avatar) items.push(avatar);
      left.querySelectorAll(".space-y-3 > p").forEach(function (p) { items.push(p); });
      var social = left.querySelector(".space-y-3 + div");
      if (social) items.push(social);
      items.push(grid.children[1]);
    }
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

  /* ---------- path line draws itself on scroll ---------- */
  (function initPath() {
    if (!hasST) return;
    var draw = pathSection.querySelector(".path-draw");
    if (!draw) return;
    var dots = pathSection.querySelectorAll(".path-dot");
    gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(dots, { opacity: 0 });
    var tl = gsap.timeline({
      scrollTrigger: { trigger: pathSection, start: "top 78%", once: true }
    });
    tl.to(draw, { strokeDashoffset: 0, duration: 1.7, ease: "expo.out" })
      .to(dots, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.28 }, 0.25);
  })();

  /* ---------- magnetic primary button (Download CV), subtle ---------- */
  (function initMagnetic() {
    if (!finePointer) return;
    var btn = hero.querySelector('a[href$="uploads/resume.pdf"]');
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

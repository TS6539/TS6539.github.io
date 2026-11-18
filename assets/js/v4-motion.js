/* ==========================================================================
   Homepage motion layer for tianshihao.org (homepage only; the body-end
   hook emits these scripts only on the home page).
   Progressive enhancement throughout: if GSAP or a plugin fails to load,
   nothing is hidden and every feature degrades to its static state.
   v5 restraint pass: the decorative entities are gone (no network canvas,
   no keyword marquee, no magnetic button). What remains is content-bearing
   motion only: the SplitText masked reveal on the name, the trajectory
   line drawing itself, the numbers-band count-up, and gentle section
   reveals. All content is visible with JS disabled.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ease: "expo.out",
          stagger: 0.08, delay: 0.05, overwrite: true, clearProps: "filter" });
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
                { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.1 });
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
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ease: "expo.out",
          delay: 0.15, overwrite: true, clearProps: "filter" });
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
    var tweens = [];
    home.querySelectorAll(".v4-reveal").forEach(function (el) {
      tweens.push(gsap.fromTo(el,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    });
    /* Fail-safe (third review round): if a reveal trigger never fires
       (very fast scroll, a ScrollTrigger quirk), any reveal element that
       has already reached the viewport is forced to its final state, so
       no section can be left blank and no screenshot can catch a
       half-revealed page. Elements still below the fold keep their
       normal scroll animation. Reduced-motion visitors never get here:
       the script returns earlier and the static final state is shown. */
    function forceVisible() {
      tweens.forEach(function (tw) {
        var el = tw.scrollTrigger && tw.scrollTrigger.trigger;
        if (el && tw.progress() < 1 &&
            el.getBoundingClientRect().top < window.innerHeight) {
          tw.progress(1);
        }
      });
    }
    setTimeout(forceVisible, 3000);
    setTimeout(forceVisible, 8000);
  })();
})();

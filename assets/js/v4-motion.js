/* ==========================================================================
   Homepage motion layer for tianshihao.org (homepage only; the body-end
   hook emits these scripts only on the home page).
   Progressive enhancement throughout: if GSAP fails to load, nothing is
   hidden and every feature degrades to its static state.

   Motion rules (review brief, 2026-11-19):
   - The hero is visible on first paint. Nothing on the page is ever
     hidden waiting for animation: the intro is a quick, small fade/rise
     that starts from 40% opacity, and scroll reveals use the same
     language (400ms, 10px rise, from 40% opacity, triggered early,
     run once per element).
   - Homepage counters keep their final values in the HTML; the count-up
     is a sub-second flourish that starts only when the band is visible
     and lands exactly on the real numbers. No-JS and reduced-motion
     visitors simply see the real numbers.
   - The trajectory line still draws itself (its base rule is always
     visible underneath, so the strip is never blank).
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";

  var home = document.querySelector(".v4-home");
  if (!home) return;
  var masthead = home.querySelector(".v4-masthead");
  if (!masthead) return;

  /* Reduced motion: leave everything in its static final state. */
  if (reduced) return;

  /* ---------- gentle reveals for sections below the masthead ----------
     Vanilla IntersectionObserver + CSS transitions (.v4-reveal-init /
     .v4-reveal-in in custom.css). The initial state is applied by JS
     only, so no-JS rendering is the final state. rootMargin extends
     the trigger zone below the viewport, so elements start animating
     before they scroll in and fast scrollers never see a blank or
     half-faded section. Each element animates once. */
  (function initReveals() {
    if (!("IntersectionObserver" in window)) return;
    var els = home.querySelectorAll(".v4-reveal");
    if (!els.length) return;
    els.forEach(function (el) { el.classList.add("v4-reveal-init"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("v4-reveal-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px 15% 0px", threshold: 0 });
    els.forEach(function (el) { io.observe(el); });
    /* Fail-safe: anything already in the viewport after 2.5s is set to
       its final state even if its observer callback never fired. */
    setTimeout(function () {
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("v4-reveal-in");
        }
      });
    }, 2500);
  })();

  /* ---------- everything below needs GSAP ------------------------------ */
  if (!hasGsap) return;

  /* ---------- masthead intro: a quick, small fade/rise -----------------
     The name, role, buttons and portrait are in the HTML visible from
     the first paint; this tween only adds a 400ms settle from 40%
     opacity and a 10px rise. It never hides the name (the previous
     SplitText reveal kept the name blank until fonts and JS were
     ready, which is exactly what the brief forbids). */
  (function heroIntro() {
    var items = masthead.querySelectorAll(".v4-name, .v4-hero-item");
    if (!items.length) return;
    gsap.fromTo(items,
      { opacity: 0.4, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out",
        stagger: 0.05, overwrite: true });
  })();

  /* ---------- trajectory line draws itself shortly after load --------- */
  (function initPath() {
    var draw = masthead.querySelector(".v4-path-svg .path-draw");
    if (!draw) return;
    var dots = masthead.querySelectorAll(".v4-path-svg .path-dot");
    gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(dots, { opacity: 0 });
    var tl = gsap.timeline({ delay: 0.35 });
    tl.to(draw, { strokeDashoffset: 0, duration: 1.4, ease: "expo.out" })
      .to(dots, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.28 }, 0.2);
  })();

  /* ---------- numbers band: count up when it scrolls into view ---------
     The real numbers are already in the HTML; this runs only as a
     flourish, under a second in total, and lands exactly on the final
     values. */
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
          v: target, duration: 0.8, delay: i * 0.05, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(obj.v); },
          onComplete: function () { el.textContent = target; }
        });
      });
    }, { threshold: 0.35 });
    io.observe(band);
  })();
})();

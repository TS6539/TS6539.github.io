/* ==========================================================================
   Homepage motion layer for tianshihao.org (homepage only; the body-end
   hook emits these scripts only on the home page).
   Progressive enhancement throughout: nothing is hidden without JS, and
   every feature degrades to its static state.

   Motion rules (review brief, 2026-11-19; timing audit, fifth review):
   - The hero is visible on first paint. The intro is a quick, small
     fade/rise from 40% opacity whose TOTAL duration, stagger included,
     is under ~450ms, and it starts immediately: it is vanilla WAAPI in
     this local script, which the body-end hook now emits BEFORE the
     GSAP CDN tag. Audit finding: with both scripts deferred, this file
     previously queued behind the jsDelivr fetch, so on a phone the
     tween (0.4s + 5 x 0.05s stagger = 0.65s by itself) could still be
     mid-fade ~2s after load; the counters had the same late start,
     because their IntersectionObserver was not even registered until
     the CDN answered, and then ran 0.8s + up to 0.15s of stagger.
   - Homepage counters keep their final values in the HTML; the
     count-up is a 0.7s vanilla rAF flourish, all four numbers starting
     together the moment the band is visible, landing exactly on the
     real numbers. No-JS and reduced-motion visitors simply see the
     real numbers.
   - Scroll reveals use the same language (400ms, 10px rise, from 40%
     opacity, triggered early, run once per element).
   - The trajectory line still draws itself via GSAP (its base rule is
     always visible underneath, so the strip is never blank); it is
     decorative, so it alone waits for the CDN script, polling for it.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- masthead intro: a quick, small fade/rise -----------------
     The name, role, buttons and portrait are in the HTML visible from
     the first paint; this only adds a settle from 40% opacity and a
     10px rise. Vanilla WAAPI, no library: 400ms per element with an
     8ms stagger, so the last element (of six) is fully opaque at
     ~440ms from the moment this script runs — and this script now
     runs before the GSAP CDN script is even fetched (see the hook).
     It never hides the name (the previous SplitText reveal kept the
     name blank until fonts and JS were ready, which the brief
     forbids). */
  (function heroIntro() {
    var items = masthead.querySelectorAll(".v4-name, .v4-hero-item");
    if (!items.length) return;
    items.forEach(function (el, i) {
      if (typeof el.animate !== "function") return;
      var anim = el.animate(
        [
          { opacity: 0.4, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0px)" }
        ],
        {
          duration: 400,
          delay: i * 8,
          easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
          fill: "backwards"
        }
      );
      if (anim) {
        anim.onfinish = function () { anim.cancel(); };
      }
    });
  })();

  /* ---------- trajectory line draws itself shortly after load ---------
     The only GSAP consumer left. The base rule and the dots are
     visible in the static state, so if the CDN script is slow or
     blocked the strip simply stays undrawn rather than blank. Poll
     briefly for window.gsap (this script now runs before it). */
  (function initPath() {
    var draw = masthead.querySelector(".v4-path-svg .path-draw");
    if (!draw) return;
    var dots = masthead.querySelectorAll(".v4-path-svg .path-dot");
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (typeof window.gsap !== "undefined") {
        clearInterval(timer);
        gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(dots, { opacity: 0 });
        var tl = gsap.timeline({ delay: 0.35 });
        tl.to(draw, { strokeDashoffset: 0, duration: 1.4, ease: "expo.out" })
          .to(dots, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.28 }, 0.2);
      } else if (tries > 60) {
        clearInterval(timer);
      }
    }, 100);
  })();

  /* ---------- numbers band: count up when it scrolls into view ---------
     The real numbers are already in the HTML; this runs only as a
     flourish. Vanilla rAF: all four numbers start together when the
     band becomes visible and finish in 0.7s total (the audit found
     the GSAP version started late — its observer registered only
     after the CDN script ran — and then took up to 0.95s with
     stagger, so mid-count values were still showing ~2s after the
     band appeared). */
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
      var targets = [];
      nums.forEach(function (el) {
        targets.push(parseInt(el.getAttribute("data-count"), 10) || 0);
      });
      var start = null;
      var duration = 700;
      function frame(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (el, i) {
          el.textContent = p === 1 ? targets[i] : Math.round(targets[i] * eased);
        });
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, { threshold: 0.2 });
    io.observe(band);
  })();
})();

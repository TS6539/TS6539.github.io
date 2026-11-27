/* Book companion (cpx, 2026-11-26): opens an overlay from a publication
   cover. Data arrives as JSON in #cpx-data (rendered by the companion
   partial from data/companions.yaml). No network calls beyond the
   static companion images; no analytics. */
(function () {
function init() {
  var dataEl = document.getElementById('cpx-data');
  var overlay = document.getElementById('cpx-overlay');
  if (!dataEl || !overlay) return;
  var DATA;
  try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var panel = overlay.querySelector('.cpx-panel');
  var titleEl = overlay.querySelector('.cpx-title');
  var pageImg = overlay.querySelector('.cpx-page img');
  var tagsLabel = overlay.querySelector('.cpx-tags-label');
  var tagsEl = overlay.querySelector('.cpx-tags');
  var scrapsEl = overlay.querySelector('.cpx-scraps');
  var heroEl = overlay.querySelector('.cpx-hero');
  var heroHead = overlay.querySelector('.cpx-hero-head');
  var heroSub = overlay.querySelector('.cpx-hero-sub');
  var figsEl = overlay.querySelector('.cpx-figs');
  var lb = document.getElementById('cpx-lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.cpx-lb-cap');
  var lbLook = lb.querySelector('.cpx-lb-look');
  var lastFocus = null;

  /* Companion text follows the page language; the EN / 中文 / 日本語
     switch in the panel re-renders the open companion in place.
     Localized blocks (zh / ja in the data) carry text only; counts,
     tints and image files always come from the base entry. */
  var pageLang = (document.documentElement.lang || 'en').toLowerCase();
  var curLang = pageLang.indexOf('zh') === 0 ? 'zh' : pageLang.indexOf('ja') === 0 ? 'ja' : 'en';
  var curSlug = null;
  var langBtns = overlay.querySelectorAll('[data-cpx-lang]');

  function view(c) {
    if (curLang === 'en' || !c[curLang]) return c;
    var L = c[curLang];
    var v = { title: c.title, page1: c.page1 };
    v.tags_label = L.tags_label || c.tags_label;
    v.tags = (c.tags || []).map(function (t, i) {
      return { name: (L.tags && L.tags[i]) || t.name, count: t.count, tint: t.tint };
    });
    v.scraps = L.scraps || c.scraps;
    v.hero = L.hero || c.hero;
    v.figures = (c.figures || []).map(function (f, i) {
      var lf = (L.figures || [])[i] || {};
      return { img: f.img, caption: lf.caption || f.caption, look: lf.look || f.look };
    });
    return v;
  }

  function markLangs() {
    langBtns.forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-cpx-lang') === curLang);
    });
  }
  langBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      curLang = b.getAttribute('data-cpx-lang');
      markLangs();
      if (curSlug) fill(curSlug);
    });
  });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function fill(slug) {
    var raw = DATA[slug];
    if (!raw) return false;
    curSlug = slug;
    markLangs();
    var c = view(raw);
    var base = '/companions/' + slug + '/';
    titleEl.textContent = c.title || '';
    pageImg.src = base + c.page1;
    pageImg.alt = c.title || '';
    tagsLabel.textContent = c.tags_label || '';
    tagsEl.innerHTML = '';
    (c.tags || []).forEach(function (t) {
      var s = el('span', 'cpx-tag cpx-pop');
      s.style.background = t.tint || '#e8edf2';
      s.appendChild(document.createTextNode(t.name));
      var b = el('b', null, t.count);
      s.appendChild(b);
      tagsEl.appendChild(s);
    });
    scrapsEl.innerHTML = '';
    (c.scraps || []).forEach(function (col) {
      var colEl = el('div', 'cpx-col');
      col.forEach(function (s) {
        var isObj = typeof s === 'object';
        var sc = el('span', 'cpx-scrap cpx-pop' + (isObj && s.stat ? ' stat' : ''), isObj ? s.t : s);
        sc.style.setProperty('--rot', (Math.random() * 3 - 1.5).toFixed(2) + 'deg');
        colEl.appendChild(sc);
      });
      scrapsEl.appendChild(colEl);
    });
    if (c.hero) {
      heroEl.style.display = '';
      heroHead.textContent = c.hero.head || '';
      heroSub.textContent = c.hero.sub || '';
    } else { heroEl.style.display = 'none'; }
    figsEl.innerHTML = '';
    (c.figures || []).forEach(function (f) {
      var fig = el('figure', 'cpx-fig cpx-pop');
      var btn = el('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', f.caption);
      var img = el('img');
      img.src = base + f.img;
      img.alt = f.caption;
      img.loading = 'lazy';
      btn.appendChild(img);
      btn.addEventListener('click', function () { openLB(base + f.img, f); });
      fig.appendChild(btn);
      fig.appendChild(el('figcaption', null, f.caption));
      figsEl.appendChild(fig);
    });
    return true;
  }

  function armAnimation() {
    var pops = overlay.querySelectorAll('.cpx-pop');
    var pr = pageImg.getBoundingClientRect();
    var pcx = pr.left + pr.width / 2, pcy = pr.top + pr.height / 2;
    pops.forEach(function (n, i) {
      var r = n.getBoundingClientRect();
      n.style.setProperty('--dx', Math.round(pcx - (r.left + r.width / 2)) + 'px');
      n.style.setProperty('--dy', Math.round(pcy - (r.top + r.height / 2)) + 'px');
      n.style.setProperty('--d', Math.min(i * 55, 1400) + 'ms');
    });
    heroEl.classList.add('cpx-pop');
    var hr = heroEl.getBoundingClientRect();
    heroEl.style.setProperty('--dx', Math.round(pcx - (hr.left + hr.width / 2)) + 'px');
    heroEl.style.setProperty('--dy', Math.round(pcy - (hr.top + hr.height / 2)) + 'px');
    heroEl.style.setProperty('--d', '500ms');
  }

  function open(slug, trigger) {
    if (!fill(slug)) return;
    lastFocus = trigger || document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    overlay.classList.remove('play');
    // Wait for the page image so burst vectors start from its centre.
    var start = function () {
      armAnimation();
      requestAnimationFrame(function () { overlay.classList.add('play'); });
      overlay.querySelector('.cpx-close').focus();
    };
    if (pageImg.complete && pageImg.naturalWidth) start();
    else pageImg.addEventListener('load', start, { once: true });
    setTimeout(function () { if (!overlay.classList.contains('play')) start(); }, 600);
  }

  function close() {
    overlay.hidden = true;
    overlay.classList.remove('play');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openLB(src, f) {
    lbImg.src = src;
    lbImg.alt = f.caption;
    lbCap.textContent = f.caption;
    lbLook.textContent = f.look || '';
    lb.hidden = false;
    lb.querySelector('.cpx-close').focus();
  }
  function closeLB() { lb.hidden = true; }

  document.querySelectorAll('[data-cpx-open]').forEach(function (n) {
    n.setAttribute('tabindex', '0');
    n.setAttribute('role', 'button');
  });
  document.addEventListener('click', function (e) {
    var n = e.target.closest ? e.target.closest('[data-cpx-open]') : null;
    if (n) open(n.getAttribute('data-cpx-open'), n);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var n = e.target.closest ? e.target.closest('[data-cpx-open]') : null;
    if (n) { e.preventDefault(); open(n.getAttribute('data-cpx-open'), n); }
  });
  overlay.querySelectorAll('[data-cpx-close]').forEach(function (n) { n.addEventListener('click', close); });
  lb.querySelectorAll('[data-cpx-close]').forEach(function (n) { n.addEventListener('click', closeLB); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) closeLB();
    else if (!overlay.hidden) close();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();

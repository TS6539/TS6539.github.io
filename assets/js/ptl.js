/* Publication timeline (ptl). Reads <script type="application/json" id="ptl-data">, draws one mark per work by year and research area,
   plays once per browser session (about 5 seconds), then rests as a static summary. No libraries, no network calls. */
(function () {
  const root = document.getElementById('ptl');
  const src = document.getElementById('ptl-data');
  if (!root || !src) return;
  let data;
  try { data = JSON.parse(src.textContent).filter(d => d && d.y && d.title); } catch (e) { return; }
  if (!data.length) return;

  // Lane order: current focus first, collaborations last. Unknown groups are appended in data order.
  const ORDER = (root.dataset.order || '').split('|').map(s => s.trim()).filter(Boolean);
  const seen = [...new Set(data.map(d => d.g))];
  const groups = [...ORDER.filter(g => seen.includes(g)), ...seen.filter(g => !ORDER.includes(g))];
  const isOther = g => /other|collaborat/i.test(g);
  const kind = t => /journal/i.test(t) ? 'j' : /book|dissertation/i.test(t) ? 'b' : /accepted|forthcoming/i.test(t) ? 'a' : 'c';
  const RANK = { j: 0, b: 1, c: 2, a: 3 };

  const y0 = Math.min(...data.map(d => d.y)), y1 = Math.max(...data.map(d => d.y));
  const years = []; for (let y = y0; y <= y1; y++) years.push(y);
  const thisYear = new Date().getFullYear();
  const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
  const word = n => WORDS[n] || String(n);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  // ----- static text
  const span = Math.min(thisYear, y1) - y0;
  const areas = groups.filter(g => !isOther(g)).length;
  const n = { all: data.length, j: data.filter(d => kind(d.t) === 'j').length, c: data.filter(d => ['c','a'].includes(kind(d.t))).length,
    book: data.filter(d => /book/i.test(d.t)).length, diss: data.filter(d => /dissertation/i.test(d.t)).length, first: data.filter(d => d.first).length };
  root.innerHTML = `
    <p class="ptl-kicker">Since ${y0}</p>
    <div class="ptl-head"><h2 class="ptl-title">${cap(word(span))} years of research, ${word(areas)} lines of work</h2><span class="ptl-count" aria-hidden="true"><b data-c>0</b> works</span></div>
    <p class="ptl-lede">Each mark is one piece of work, placed by year and research area. Hover or tap a mark to see it, or scroll down for the full list. <span class="ptl-ctl"><button type="button" data-skip>Skip the animation</button><button type="button" data-replay hidden>Replay</button></span></p>
    <div class="ptl-stage"><div data-svg></div><div class="ptl-tip" role="status"></div></div>
    <div class="ptl-legend" aria-hidden="true">
      <span><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" style="fill:var(--ptl-accent)"/></svg>First author</span>
      <span><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" style="fill:var(--ptl-paper);stroke:var(--ptl-accent)" stroke-width="1.6"/></svg>Co-author</span>
    </div>
    <div class="ptl-sum">
      <div class="ptl-stat"><b>${n.all}</b><span>works since ${y0}</span></div>
      <div class="ptl-stat"><b>${n.j}</b><span>journal articles</span></div>
      <div class="ptl-stat"><b>${n.c}</b><span>conference papers, talks, and posters</span></div>
      ${n.book ? `<div class="ptl-stat"><b>${n.book}</b><span>${n.book === 1 ? 'book' : 'books'}</span></div>` : ''}
      <div class="ptl-stat"><b>${n.first}</b><span>as first author</span></div>
    </div>
    <div class="ptl-cta"><p>Working on something close to one of these lines? I am glad to hear about it.</p><a class="btn" href="${esc(root.dataset.cta || '/speaking/#research-collaboration')}">Discuss a research idea →</a></div>`;
  const svgHost = root.querySelector('[data-svg]'), tip = root.querySelector('.ptl-tip'), counter = root.querySelector('[data-c]');
  const skipBtn = root.querySelector('[data-skip]'), replayBtn = root.querySelector('[data-replay]');
  const sumEl = root.querySelector('.ptl-sum'), ctaEl = root.querySelector('.ptl-cta');

  // ----- layout + draw
  let marks = [], W = 0, timers = [], raf = 0, playing = false;
  function draw() {
    W = Math.round(svgHost.clientWidth) || 700;
    const padL = 0, colW = (W - padL) / years.length;
    const small = W < 520, step = small ? 9 : 11, r = small ? 3.3 : 4;
    const cols = Math.max(1, Math.min(4, Math.floor((colW - 10) / step)));
    const cell = {}; // group|year -> items
    data.forEach(d => { const k = d.g + '|' + d.y; (cell[k] = cell[k] || []).push(d); });
    Object.values(cell).forEach(a => a.sort((p, q) => RANK[kind(p.t)] - RANK[kind(q.t)]));
    let y = 0, out = '', laneSvg = '';
    const LABEL = 20, PADB = 12;
    marks = [];
    groups.forEach(g => {
      const rows = Math.max(1, ...years.map(yr => Math.ceil(((cell[g + '|' + yr] || []).length) / cols)));
      const top = y, h = LABEL + rows * step + PADB;
      laneSvg += `<text class="lane-label" x="${padL}" y="${top + 13}">${esc(g)}</text>`;
      laneSvg += `<line class="lane-rule" x1="${padL}" x2="${W}" y1="${top + h - 0.5}" y2="${top + h - 0.5}"/>`;
      years.forEach((yr, yi) => {
        const items = cell[g + '|' + yr] || [];
        const used = Math.min(cols, items.length), x0 = padL + yi * colW + (colW - used * step) / 2;
        items.forEach((d, k) => {
          const cx = x0 + (k % cols) * step + step / 2, cy = top + LABEL + Math.floor(k / cols) * step + step / 2;
          const shape = d.first ? `<circle cx="${cx}" cy="${cy}" r="${r + .3}" fill="var(--ptl-accent)"/>`
            : `<circle cx="${cx}" cy="${cy}" r="${r - .2}" fill="var(--ptl-paper)" stroke="var(--ptl-accent)" stroke-width="1.6"/>`;
          const i = marks.length;
          marks.push({ d, cx, cy });
          out += `<a class="mk" href="${esc(d.href || '#')}" data-i="${i}" tabindex="-1" aria-label="${esc(d.title)}">${shape}<circle cx="${cx}" cy="${cy}" r="${step / 2 + 1}" fill="transparent"/></a>`;
        });
      });
      y += h;
    });
    const H = y + 26;
    let axis = '';
    years.forEach((yr, yi) => {
      const x = padL + yi * colW + colW / 2, fut = yr > thisYear;
      axis += `<text class="yr${fut ? ' fut' : ''}" x="${x}" y="${y + 18}">${small ? "'" + String(yr).slice(2) : yr}</text>`;
    });
    svgHost.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${n.all} works from ${y0} to ${y1}, grouped by research area. The full list follows below.">${axis}${laneSvg}<g>${out}</g><line class="sweep" x1="0" x2="0" y1="0" y2="${y}" style="opacity:0"/></svg>`;
  }

  // ----- tooltip (hover on desktop, first tap on touch shows it, second tap opens)
  let tipFor = -1;
  function showTip(i) {
    const m = marks[i]; if (!m) return;
    const d = m.d;
    tip.innerHTML = `<b>${esc(d.title)}</b><span>${esc(d.venue || '')}${d.venue ? ' · ' : ''}${d.y} · ${esc(d.t)}</span><em>Open the details →</em>`;
    const box = svgHost.getBoundingClientRect(), sx = box.width / W;
    let left = m.cx * sx + 12, top = m.cy * sx - 10;
    tip.classList.add('show');
    const tw = tip.offsetWidth;
    if (left + tw > box.width) left = m.cx * sx - tw - 12;
    tip.style.left = Math.max(0, left) + 'px'; tip.style.top = Math.max(0, top) + 'px';
    tipFor = i;
  }
  function hideTip() { tip.classList.remove('show'); tipFor = -1; }
  svgHost.addEventListener('pointerover', e => { const a = e.target.closest('.mk'); if (a && e.pointerType === 'mouse') showTip(+a.dataset.i); });
  svgHost.addEventListener('pointerout', e => { const a = e.target.closest('.mk'); if (a && e.pointerType === 'mouse') hideTip(); });
  svgHost.addEventListener('click', e => {
    const a = e.target.closest('.mk'); if (!a) { hideTip(); return; }
    const i = +a.dataset.i;
    if (window.matchMedia('(hover: none)').matches && tipFor !== i) { e.preventDefault(); showTip(i); }
  });
  document.addEventListener('click', e => { if (!root.contains(e.target)) hideTip(); });

  // ----- play / final
  const D = 4200;
  function finalState() {
    playing = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = [];
    root.querySelectorAll('.mk').forEach(m => { m.style.transitionDelay = '0ms'; m.classList.add('on'); });
    const sw = root.querySelector('.sweep'); if (sw) sw.style.opacity = '0';
    counter.textContent = n.all; sumEl.classList.add('on'); ctaEl.classList.add('on');
    skipBtn.hidden = true; replayBtn.hidden = false;
  }
  function play() {
    draw(); hideTip(); playing = true; skipBtn.hidden = false; replayBtn.hidden = true;
    sumEl.classList.remove('on'); ctaEl.classList.remove('on'); counter.textContent = '0';
    const els = [...root.querySelectorAll('.mk')];
    els.forEach((el, i) => { const t = (marks[i].cx / W) * D + (i % 5) * 18; el.style.transitionDelay = t + 'ms'; });
    const sw = root.querySelector('.sweep');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      els.forEach(el => el.classList.add('on'));
    }));
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / D);
      const x = p * W;
      if (sw) { sw.setAttribute('x1', x); sw.setAttribute('x2', x); sw.style.opacity = p < 1 ? '.7' : '0'; }
      counter.textContent = marks.filter(m => m.cx <= x).length;
      if (p < 1 && playing) raf = requestAnimationFrame(tick); else if (playing) { timers.push(setTimeout(finalState, 450)); }
    };
    raf = requestAnimationFrame(tick);
    try { sessionStorage.setItem('ptl-played', '1'); } catch (e) {}
  }
  skipBtn.addEventListener('click', finalState);
  replayBtn.addEventListener('click', play);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false; try { played = sessionStorage.getItem('ptl-played') === '1'; } catch (e) {}
  if (reduce || played) { draw(); finalState(); }
  else {
    draw();
    // start when the block is on screen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .25 });
      io.observe(root);
    } else play();
  }
  let lastW = svgHost.clientWidth;
  window.addEventListener('resize', () => { const w = svgHost.clientWidth; if (Math.abs(w - lastW) > 30 && !playing) { lastW = w; draw(); finalState(); } });
})();
